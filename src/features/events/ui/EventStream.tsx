import { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/features/shared/ui/ui/collapsible';
import {
  Clock,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
  FileText,
  Users,
  Vote,
  UserCheck,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { useEventStream } from '../hooks/useEventStream';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { AgendaNavigationControls } from '@/features/agendas/ui/AgendaNavigationControls';
import { AgendaElectionSection } from '@/features/agendas/ui/AgendaElectionSection';
import { AgendaVoteSection } from '@/features/agendas/ui/AgendaVoteSection';
import type { CandidatesByElectionRow } from '@/zero/elections/queries';
import type { ChoicesByVoteRow } from '@/zero/votes/queries';

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function EventStream({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeContentRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const previousAgendaItemIdRef = useRef<string | null>(null);

  const {
    event,
    currentAgendaItem,
    speakerList,
    user,
    isLoading,
    addingSpeaker,
    removingSpeaker,
    votingLoading,
    userSpeaker,
    handleAddToSpeakerList,
    handleRemoveFromSpeakerList,
    handleElectionVote,
    handleAmendmentVote,
    calculateSpeakerTime,
    formatTime,
  } = useEventStream(eventId);

  const [speakersExpanded, setSpeakersExpanded] = useState(true);

  // Map agenda status to component status
  const mapAgendaStatus = (status: string): 'planned' | 'active' | 'completed' => {
    if (status === 'completed' || status === 'done') return 'completed';
    if (status === 'active' || status === 'in-progress') return 'active';
    return 'planned';
  };

  const agendaStatus = mapAgendaStatus(currentAgendaItem?.status || '');

  // Prepare election data for AgendaElectionSection
  const election = currentAgendaItem?.election?.[0];

  const indicativeSelections = useMemo(() => {
    if (!election) return [];
    return election.indicative_selections || [];
  }, [election]);

  const finalSelections = useMemo(() => {
    if (!election) return [];
    return election.final_selections || [];
  }, [election]);

  const userHasElectionVoted = useMemo(() => {
    if (!user?.id || !election) return false;
    const userElector = election.electors?.find(
      (e: { user_id: string }) => e.user_id === user.id
    );
    if (!userElector) return false;
    // Check if user has any selections in indicative or final
    return (
      indicativeSelections.some(
        (s: { elector_participation_id?: string | null }) => s.elector_participation_id != null
      ) ||
      finalSelections.some(
        (s: { elector_participation_id?: string | null }) => s.elector_participation_id != null
      )
    );
  }, [user?.id, election, indicativeSelections, finalSelections]);

  const userSelectedCandidateIds = useMemo(() => {
    if (!user?.id || !election) return [];
    const selections = election.status === 'indicative' ? indicativeSelections : finalSelections;
    return selections
      .filter((s: { candidate_id: string }) => s.candidate_id)
      .map((s: { candidate_id: string }) => s.candidate_id);
  }, [user?.id, election, indicativeSelections, finalSelections]);

  const isUserCandidate = useMemo(() => {
    if (!user?.id || !election?.candidates) return false;
    return election.candidates.some(
      (c: { user_id: string }) => c.user_id === user.id
    );
  }, [user?.id, election?.candidates]);

  // Prepare vote data for AgendaVoteSection
  const voteEntity = currentAgendaItem?.votes?.[0];

  const indicativeDecisions = useMemo(() => {
    if (!voteEntity) return [];
    return voteEntity.indicative_decisions || [];
  }, [voteEntity]);

  const finalDecisions = useMemo(() => {
    if (!voteEntity) return [];
    return voteEntity.final_decisions || [];
  }, [voteEntity]);

  const userHasVoteVoted = useMemo(() => {
    if (!user?.id || !voteEntity) return false;
    const userVoter = voteEntity.voters?.find(
      (v: { user_id: string }) => v.user_id === user.id
    );
    return !!userVoter;
  }, [user?.id, voteEntity]);

  const userSelectedChoiceIds = useMemo(() => {
    if (!user?.id || !voteEntity) return [];
    const decisions = voteEntity.status === 'indicative' ? indicativeDecisions : finalDecisions;
    return decisions
      .filter((d: { choice_id: string }) => d.choice_id)
      .map((d: { choice_id: string }) => d.choice_id);
  }, [user?.id, voteEntity, indicativeDecisions, finalDecisions]);

  // Show toast notification when agenda item changes
  useEffect(() => {
    const currentId = currentAgendaItem?.id;
    if (currentId && currentId !== previousAgendaItemIdRef.current) {
      if (previousAgendaItemIdRef.current !== null) {
        // Show toast notification for agenda item change
        toast(t('features.events.agenda.itemActivated'), {
          description: currentAgendaItem.title,
        });
        // Auto-scroll to active content
        setTimeout(() => {
          activeContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      previousAgendaItemIdRef.current = currentId;
    }
  }, [currentAgendaItem?.id, currentAgendaItem?.title, toast, t]);

  // Carousel scroll handlers
  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', updateScrollButtons);
      return () => carousel.removeEventListener('scroll', updateScrollButtons);
    }
  }, [speakerList]);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === 'left'
          ? carouselRef.current.scrollLeft - scrollAmount
          : carouselRef.current.scrollLeft + scrollAmount;

      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  const getAgendaItemIcon = (type: string) => {
    switch (type) {
      case 'election':
        return <UserCheck className="h-5 w-5" />;
      case 'vote':
        return <Vote className="h-5 w-5" />;
      case 'speech':
        return <Users className="h-5 w-5" />;
      case 'discussion':
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'election':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'vote':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'speech':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'discussion':
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading.general')}</p>
      </div>
    );
  }

  if (!event || !currentAgendaItem) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">{t('features.events.stream.noActiveItem')}</p>
        <Button onClick={() => navigate({ to: `/event/${eventId}` })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('features.events.backToEvent')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Stream Video */}
      {event.stream_url &&
        (() => {
          const videoId = getYouTubeVideoId(event.stream_url);
          return videoId ? (
            <div className="relative w-full overflow-hidden rounded-lg bg-black shadow-xl">
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
                  title={t('features.events.stream.liveStream')}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ) : null;
        })()}

      {/* Current Agenda Item - Prominent Display */}
      <div ref={activeContentRef}>
        <Card className="border-2 border-primary shadow-lg ring-2 ring-primary/20">
          <CardHeader className="bg-primary/5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                  {getAgendaItemIcon(currentAgendaItem.type ?? 'discussion')}
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-green-500 text-white">
                    <Play className="h-3 w-3 fill-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="animate-pulse">
                      {t('features.events.stream.live')}
                    </Badge>
                    <CardTitle className="text-2xl">{currentAgendaItem.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(currentAgendaItem.type ?? 'discussion')}>
                      <span className="capitalize">{currentAgendaItem.type}</span>
                    </Badge>
                    <Badge className={getStatusColor(currentAgendaItem.status ?? 'pending')}>
                      {currentAgendaItem.status}
                    </Badge>
                    {currentAgendaItem.duration && (
                      <Badge variant="outline">
                        <Clock className="mr-1 h-3 w-3" />
                        {currentAgendaItem.duration} {t('common.minutes')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link to="/event/$id/agenda/$agendaItemId" params={{ id: eventId, agendaItemId: currentAgendaItem.id }}>
                  {t('features.events.stream.viewDetails')}
                </Link>
              </Button>
            </div>
          </CardHeader>
          {currentAgendaItem.description && (
            <CardContent>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {currentAgendaItem.description}
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Agenda Navigation Controls for organizers */}
        <AgendaNavigationControls eventId={eventId} />
      </div>

      {/* Election Section */}
      {election && election.candidates && election.candidates.length > 0 && (
        <AgendaElectionSection
          positionName={election.title ?? t('features.events.agenda.position')}
          candidates={[...election.candidates] as CandidatesByElectionRow[]}
          indicativeSelections={indicativeSelections}
          finalSelections={finalSelections}
          userHasVoted={userHasElectionVoted}
          userSelectedCandidateIds={userSelectedCandidateIds}
          electionStatus={election.status ?? 'indicative'}
          canVote={!!user}
          canBeCandidate={false}
          isUserCandidate={isUserCandidate}
          onBecomeCandidate={() => {}}
          onWithdrawCandidacy={() => {}}
        />
      )}

      {/* Vote Section */}
      {voteEntity && voteEntity.choices && voteEntity.choices.length > 0 && (
        <AgendaVoteSection
          voteTitle={voteEntity.title || 'Vote'}
          choices={[...voteEntity.choices] as ChoicesByVoteRow[]}
          indicativeDecisions={indicativeDecisions}
          finalDecisions={finalDecisions}
          userHasVoted={userHasVoteVoted}
          userSelectedChoiceIds={userSelectedChoiceIds}
          voteStatus={voteEntity.status ?? 'indicative'}
          majorityType={voteEntity.majority_type}
          totalEligibleVoters={voteEntity.voters?.length}
        />
      )}

      {/* Speaker List Section */}
      <Collapsible open={speakersExpanded} onOpenChange={setSpeakersExpanded}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-0 hover:bg-transparent">
                  <CardTitle className="text-2xl">
                    {t('features.events.stream.speakersList')} ({speakerList.length})
                  </CardTitle>
                  {speakersExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              {userSpeaker ? (
                <Button
                  onClick={() => handleRemoveFromSpeakerList(userSpeaker.id)}
                  disabled={removingSpeaker === userSpeaker.id}
                  variant="outline"
                  size="lg"
                >
                  <X className="mr-2 h-5 w-5" />
                  {removingSpeaker === userSpeaker.id ? 'Removing...' : 'Remove Yourself'}
                </Button>
              ) : (
                <Button onClick={handleAddToSpeakerList} disabled={addingSpeaker || !user} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  {addingSpeaker ? 'Adding...' : 'Add Yourself'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
          {speakerList.length === 0 ? (
            <div className="py-12 text-center">
              <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No speakers yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Be the first to add yourself to the speakers list
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Navigation Buttons */}
              {canScrollLeft && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg"
                  onClick={() => scroll('left')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}
              {canScrollRight && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg"
                  onClick={() => scroll('right')}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* Carousel */}
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto scroll-smooth px-12 pb-4"
                style={{ scrollbarWidth: 'thin' }}
              >
                {speakerList.map((speaker, index) => {
                  const speakerTime = calculateSpeakerTime(index);
                  const speakerName = `${speaker.user?.first_name ?? ''} ${speaker.user?.last_name ?? ''}`.trim() || speaker.user?.email || 'Unknown';
                  const speakerAvatar = speaker.user?.avatar ?? undefined;
                  const isCurrentUser = speaker.user?.id === user?.id;

                  return (
                    <Card
                      key={speaker.id}
                      className={`relative w-64 flex-shrink-0 ${
                        speaker.completed
                          ? 'border-muted opacity-60'
                          : isCurrentUser
                            ? 'border-2 border-primary'
                            : 'border-primary'
                      }`}
                    >
                      {isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 z-10 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleRemoveFromSpeakerList(speaker.id)}
                          disabled={removingSpeaker === speaker.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <CardContent className="space-y-4 p-6">
                        {/* Speaker Avatar */}
                        <div className="flex justify-center">
                          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                            <AvatarImage src={speakerAvatar} />
                            <AvatarFallback className="text-2xl">
                              {speakerName[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Speaker Name */}
                        <div className="text-center">
                          <h3 className="truncate text-lg font-semibold" title={speakerName}>
                            {speakerName}
                          </h3>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="mt-1">
                              You
                            </Badge>
                          )}
                        </div>

                        {/* Speaker Title */}
                        <div className="text-center">
                          <p
                            className="truncate text-sm text-muted-foreground"
                            title={speaker.title ?? undefined}
                          >
                            {speaker.title}
                          </p>
                        </div>

                        {/* Time Badge */}
                        <div className="flex justify-center">
                          <Badge variant="secondary" className="px-4 py-2 text-base">
                            <Clock className="mr-2 h-4 w-4" />
                            {formatTime(speakerTime)} ({speaker.time} min)
                          </Badge>
                        </div>

                        {/* Completed Badge */}
                        {speaker.completed && (
                          <div className="flex justify-center">
                            <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                              Completed
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
