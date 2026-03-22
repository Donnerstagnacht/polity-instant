import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/features/shared/ui/ui/collapsible';
import {
  Clock,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Users,
  Vote,
  UserCheck,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { AgendaNavigationControls } from './AgendaNavigationControls';
import { AgendaElectionSection } from './AgendaElectionSection';
import { AgendaVoteSection } from './AgendaVoteSection';
import { AccreditationSection } from './AccreditationSection';
import type { CandidatesByElectionRow } from '@/zero/elections/queries';
import type { ChoicesByVoteRow } from '@/zero/votes/queries';

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface Speaker {
  id: string;
  title?: string | null;
  time?: number | null;
  completed?: boolean | null;
  order_index?: number | null;
  user?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    avatar?: string | null;
  } | null;
}

interface CandidateSelection {
  candidate_id: string;
}

interface ChoiceDecision {
  choice_id: string;
}

interface CurrentAgendaItem {
  id: string;
  title?: string | null;
  description?: string | null;
  type?: string | null;
  status?: string | null;
  duration?: number | null;
  voting_phase?: string | null;
  election?: Array<{
    id: string;
    title?: string | null;
    candidates?: CandidatesByElectionRow[];
    indicative_selections?: ReadonlyArray<CandidateSelection>;
    final_selections?: ReadonlyArray<CandidateSelection>;
    electors?: Array<{ user_id?: string | null }>;
  }>;
  votes?: Array<{
    id: string;
    title?: string | null;
    choices?: ChoicesByVoteRow[];
    indicative_decisions?: ReadonlyArray<ChoiceDecision>;
    final_decisions?: ReadonlyArray<ChoiceDecision>;
    voters?: Array<{ user_id?: string | null }>;
  }>;
  speaker_list?: Speaker[];
}

interface EventStreamSectionProps {
  eventId: string;
  streamUrl?: string | null;
  currentAgendaItem: CurrentAgendaItem | null;
  speakerList: Speaker[];
  userId?: string;
  isUserCandidate: boolean;
  addingSpeaker: boolean;
  removingSpeaker: string | null;
  votingLoading: string | null;
  userSpeaker?: { id: string };
  onAddToSpeakerList: () => void;
  onRemoveFromSpeakerList: (speakerId: string) => void;
  onBecomeCandidate?: () => void;
  onWithdrawCandidacy?: () => void;
  calculateSpeakerTime: (index: number) => Date;
  formatTime: (date: Date) => string;
}

export function EventStreamSection({
  eventId,
  streamUrl,
  currentAgendaItem,
  speakerList,
  userId,
  isUserCandidate,
  addingSpeaker,
  removingSpeaker,
  votingLoading,
  userSpeaker,
  onAddToSpeakerList,
  onRemoveFromSpeakerList,
  onBecomeCandidate,
  onWithdrawCandidacy,
  calculateSpeakerTime,
  formatTime,
}: EventStreamSectionProps) {
  const { t } = useTranslation();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [speakersExpanded, setSpeakersExpanded] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const mapAgendaStatus = (status: string): 'planned' | 'active' | 'completed' => {
    if (status === 'completed' || status === 'done') return 'completed';
    if (status === 'active' || status === 'in-progress') return 'active';
    return 'planned';
  };

  const agendaStatus = mapAgendaStatus(currentAgendaItem?.status || '');
  const election = currentAgendaItem?.election?.[0];
  const voteEntity = currentAgendaItem?.votes?.[0];

  // Derive election data
  const candidates = election?.candidates ?? [];
  const indicativeSelections = election?.indicative_selections ?? [];
  const finalSelections = election?.final_selections ?? [];
  const userHasVotedElection = election?.electors?.some(e => e.user_id === userId) ?? false;
  const userSelectedCandidateIds = finalSelections
    .filter(s => election?.electors?.some(e => e.user_id === userId) ?? false)
    .map(s => s.candidate_id);
  const electionStatus = currentAgendaItem?.voting_phase ?? null;

  // Derive vote data
  const choices = voteEntity?.choices ?? [];
  const indicativeDecisions = voteEntity?.indicative_decisions ?? [];
  const finalDecisions = voteEntity?.final_decisions ?? [];
  const userHasVotedVote = voteEntity?.voters?.some(v => v.user_id === userId) ?? false;
  const userSelectedChoiceIds = finalDecisions
    .filter(() => voteEntity?.voters?.some(v => v.user_id === userId) ?? false)
    .map(d => d.choice_id);
  const voteStatus = currentAgendaItem?.voting_phase ?? null;

  const getAgendaItemIcon = (type: string) => {
    switch (type) {
      case 'election':
        return <UserCheck className="h-5 w-5" />;
      case 'vote':
        return <Vote className="h-5 w-5" />;
      case 'speech':
        return <Users className="h-5 w-5" />;
      case 'accreditation':
        return <ShieldCheck className="h-5 w-5" />;
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
      case 'accreditation':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

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
      carouselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  if (!currentAgendaItem) {
    return null;
  }

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Card className="border-2 border-primary/50">
        <CardHeader className="bg-primary/5">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full items-center justify-between p-0 hover:bg-transparent">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                  {getAgendaItemIcon(currentAgendaItem.type ?? 'discussion')}
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full bg-green-500 text-white">
                    <Play className="h-2 w-2 fill-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="animate-pulse">
                    {t('features.events.stream.live')}
                  </Badge>
                  <CardTitle className="text-lg">{currentAgendaItem.title}</CardTitle>
                </div>
              </div>
              {expanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <div className="mt-2 flex items-center gap-2">
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
            <Button asChild variant="outline" size="sm" className="ml-auto">
              <Link to="/event/$id/agenda/$agendaItemId" params={{ id: eventId, agendaItemId: currentAgendaItem.id }}>
                {t('features.events.stream.viewDetails')}
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-4">
            {/* Live Stream Video */}
            {streamUrl &&
              (() => {
                const videoId = getYouTubeVideoId(streamUrl);
                return videoId ? (
                  <div className="relative w-full overflow-hidden rounded-lg bg-black shadow-xl">
                    <div className="aspect-video">
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
                        title={t('features.events.stream.liveStream')}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : null;
              })()}

            {/* Description */}
            {currentAgendaItem.description && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {currentAgendaItem.description}
                </p>
              </div>
            )}

            {/* Agenda Navigation Controls */}
            <AgendaNavigationControls eventId={eventId} />

            {/* Election Section */}
            {election && candidates.length > 0 && (
              <AgendaElectionSection
                positionName={election.title ?? t('features.events.agenda.position')}
                candidates={candidates}
                indicativeSelections={indicativeSelections}
                finalSelections={finalSelections}
                userHasVoted={userHasVotedElection}
                userSelectedCandidateIds={userSelectedCandidateIds}
                electionStatus={electionStatus}
                canVote={!!userId}
                canBeCandidate={false}
                isUserCandidate={isUserCandidate}
                isVotingLoading={votingLoading === election.id}
                onBecomeCandidate={onBecomeCandidate ?? (() => {})}
                onWithdrawCandidacy={onWithdrawCandidacy}
              />
            )}

            {/* Accreditation Section */}
            {currentAgendaItem.type === 'accreditation' && (
              <AccreditationSection eventId={eventId} agendaItemId={currentAgendaItem.id} />
            )}

            {/* Vote Section */}
            {voteEntity && choices.length > 0 && (
              <AgendaVoteSection
                voteTitle={voteEntity.title || 'Vote'}
                choices={choices}
                indicativeDecisions={indicativeDecisions}
                finalDecisions={finalDecisions}
                userHasVoted={userHasVotedVote}
                userSelectedChoiceIds={userSelectedChoiceIds}
                voteStatus={voteStatus}
                majorityType={voteEntity.majority_type}
                totalEligibleVoters={voteEntity.voters?.length}
              />
            )}

            {/* Speaker List */}
            <Collapsible open={speakersExpanded} onOpenChange={setSpeakersExpanded}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 p-0 hover:bg-transparent">
                      <h3 className="text-lg font-semibold">
                        {t('features.events.stream.speakersList')} ({speakerList.length})
                      </h3>
                      {speakersExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  {userSpeaker ? (
                    <Button
                      onClick={() => onRemoveFromSpeakerList(userSpeaker.id)}
                      disabled={removingSpeaker === userSpeaker.id}
                      variant="outline"
                      size="sm"
                    >
                      <X className="mr-2 h-4 w-4" />
                      {removingSpeaker === userSpeaker.id ? 'Removing...' : 'Remove Yourself'}
                    </Button>
                  ) : (
                    <Button onClick={onAddToSpeakerList} disabled={addingSpeaker || !userId} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {addingSpeaker ? 'Adding...' : 'Add Yourself'}
                    </Button>
                  )}
                </div>

                <CollapsibleContent>
                  {speakerList.length === 0 ? (
                    <div className="py-8 text-center">
                      <User className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No speakers yet</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {canScrollLeft && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg"
                          onClick={() => scroll('left')}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                      )}
                      {canScrollRight && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg"
                          onClick={() => scroll('right')}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      )}
                      <div
                        ref={carouselRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth px-10 pb-3"
                        style={{ scrollbarWidth: 'thin' }}
                      >
                        {speakerList.map((speaker, index) => {
                          const speakerTime = calculateSpeakerTime(index);
                          const speakerName =
                            `${speaker.user?.first_name ?? ''} ${speaker.user?.last_name ?? ''}`.trim() ||
                            speaker.user?.email ||
                            'Unknown';
                          const speakerAvatar = speaker.user?.avatar ?? undefined;
                          const isCurrentUser = speaker.user?.id === userId;

                          return (
                            <Card
                              key={speaker.id}
                              className={`relative w-56 flex-shrink-0 ${
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
                                  onClick={() => onRemoveFromSpeakerList(speaker.id)}
                                  disabled={removingSpeaker === speaker.id}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                              <CardContent className="space-y-3 p-4">
                                <div className="flex justify-center">
                                  <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                                    <AvatarImage src={speakerAvatar} />
                                    <AvatarFallback className="text-xl">
                                      {speakerName[0]?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                <div className="text-center">
                                  <h4 className="truncate text-sm font-semibold" title={speakerName}>
                                    {speakerName}
                                  </h4>
                                  {isCurrentUser && (
                                    <Badge variant="secondary" className="mt-1">
                                      You
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex justify-center">
                                  <Badge variant="secondary" className="px-3 py-1 text-sm">
                                    <Clock className="mr-1.5 h-3 w-3" />
                                    {formatTime(speakerTime)} ({speaker.time} min)
                                  </Badge>
                                </div>
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
                </CollapsibleContent>
              </div>
            </Collapsible>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
