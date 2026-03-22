'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useEventData } from '@/features/events/hooks/useEventData';
import { useAgendaItems } from '../hooks/useAgendaItems';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/zero/rbac';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { TransferAgendaItemDialog } from './TransferAgendaItemDialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/features/shared/ui/ui/collapsible';
import { Badge } from '@/features/shared/ui/ui/badge';
import {
  Calendar,
  Vote,
  Gavel,
  Plus,
  FileText,
  Search as SearchIcon,
  Filter,
  Play,
  Check,
  ChevronDown,
  ChevronUp,
  Radio,
  Clock,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { TimelineItem } from '@/features/agendas/ui/TimelineItem.tsx';
import { AgendaItemContextCard } from './AgendaItemContextCard';
import {
  AgendaRelatedAmendmentCard,
  AgendaRelatedPositionCard,
} from './AgendaRelatedEntityCard';
import { AgendaSpeakerListSection } from './AgendaSpeakerListSection';
import { AgendaElectionSection } from './AgendaElectionSection';
import { AgendaVoteSection } from './AgendaVoteSection';
import {
  AgendaCard,
  type AgendaItemType,
  type AgendaItemStatus,
} from '@/features/agendas/ui/AgendaCard.tsx';
import {
  AgendaCountdownPill,
  AgendaEndedPill,
  AgendaStatusBadge,
  AgendaTypeBadge,
} from './AgendaBadges';
import { AgendaActionBar } from './AgendaActionBar';
import { useAgendaNavigation } from '../hooks/useAgendaNavigation';
import type { CandidatesByElectionRow } from '@/zero/elections/queries';
import type { ChoicesByVoteRow } from '@/zero/votes/queries';

interface EventAgendaProps {
  eventId: string;
}

function getYouTubeVideoId(url: string | null | undefined): string | null {
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

export function EventAgenda({ eventId }: EventAgendaProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { event, isLoading: eventLoading } = useEventData(eventId);
  const { agendaItems, isLoading } = useAgendaItems(eventId);
  const { can } = usePermissions({ eventId });
  const { addSpeaker, updateSpeaker, removeSpeaker } = useAgendaActions();
  const agendaNav = useAgendaNavigation(eventId);

  // Track current agenda item changes for toast notifications
  const previousAgendaItemIdRef = useRef<string | null>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const currentAgendaItemId = event?.current_agenda_item_id ?? undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [streamOpen, setStreamOpen] = useState(true);
  const [addingSpeaker, setAddingSpeaker] = useState(false);
  const [removingSpeaker, setRemovingSpeaker] = useState(false);
  const [markingSpeakerComplete, setMarkingSpeakerComplete] = useState<string | null>(null);
  const [transferDialogItem, setTransferDialogItem] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Show toast and auto-scroll when current agenda item changes
  useEffect(() => {
    if (currentAgendaItemId && currentAgendaItemId !== previousAgendaItemIdRef.current) {
      const currentItem = agendaItems.find(item => item.id === currentAgendaItemId);
      if (currentItem && previousAgendaItemIdRef.current !== null) {
        // Only show toast if this is not the initial load
        toast(t('features.events.agenda.itemActivated'), {
          description: currentItem.title,
        });
      }
      previousAgendaItemIdRef.current = currentAgendaItemId;

      // Auto-scroll to active item after a short delay
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [currentAgendaItemId, agendaItems, toast, t]);

  // Check if user can manage agenda items
  const canManageAgenda = can('manage', 'agendaItems');

  // Event status
  const isEventStarted = event?.status === 'active' || event?.status === 'in-progress';
  const eventStartTimestamp = typeof event?.start_date === 'number' ? event.start_date : null;

  // Current active agenda item (for stream section)
  const currentAgendaItem = agendaItems.find(item => item.id === currentAgendaItemId) ??
    agendaItems.find(item => item.status === 'in-progress') ??
    null;

  const streamAgendaItem = useMemo(() => {
    if (agendaItems.length === 0) return null;

    if (!isEventStarted) {
      return agendaItems[0] ?? null;
    }

    if (!currentAgendaItem?.id) {
      return null;
    }

    return agendaItems.find(item => item.id === currentAgendaItem.id) ?? null;
  }, [agendaItems, currentAgendaItem?.id, isEventStarted]);

  const streamSpeakerListData = useMemo(() => {
    return (streamAgendaItem?.speaker_list || []).map((speaker) => ({
      id: speaker.id,
      order: speaker.order_index || 0,
      time: speaker.time || 3,
      completed: speaker.completed || false,
      title: speaker.title ?? undefined,
      startTime: speaker.start_time ?? undefined,
      endTime: speaker.end_time ?? undefined,
      user: speaker.user
        ? {
            id: speaker.user.id,
            name:
              `${speaker.user.first_name ?? ''} ${speaker.user.last_name ?? ''}`.trim() ||
              undefined,
            email: speaker.user.email ?? undefined,
            avatar: speaker.user.avatar ?? undefined,
          }
        : undefined,
    }));
  }, [streamAgendaItem?.speaker_list]);

  const isUserInSpeakerList = useMemo(() => {
    return streamSpeakerListData.some(
      speaker => speaker.user?.id === user?.id && !speaker.completed,
    );
  }, [streamSpeakerListData, user?.id]);

  const streamElection = streamAgendaItem?.election?.[0] ?? null;
  const streamVote = streamAgendaItem?.votes?.[0] ?? null;
  const streamVoteAmendment = streamAgendaItem?.amendment ?? null;

  const indicativeSelections = useMemo(
    () => streamElection?.indicative_selections ?? [],
    [streamElection?.indicative_selections],
  );
  const finalSelections = useMemo(
    () => streamElection?.final_selections ?? [],
    [streamElection?.final_selections],
  );
  const userElector = useMemo(() => {
    return streamElection?.electors?.find(
      (elector: { user_id?: string | null }) => elector.user_id === user?.id,
    );
  }, [streamElection?.electors, user?.id]);
  const userHasElectionVoted = useMemo(() => {
    if (!userElector) return false;
    const phase = streamElection?.status;
    if (phase === 'final' || phase === 'final_vote') {
      return (streamElection?.final_participations ?? []).some(
        (participation: { elector_id?: string | null }) =>
          participation.elector_id === userElector.id,
      );
    }
    return (streamElection?.indicative_participations ?? []).some(
      (participation: { elector_id?: string | null }) =>
        participation.elector_id === userElector.id,
    );
  }, [streamElection, userElector]);
  const userSelectedCandidateIds = useMemo(() => {
    if (!userElector) return [];
    const phase = streamElection?.status;
    const participations =
      phase === 'final' || phase === 'final_vote'
        ? streamElection?.final_participations ?? []
        : streamElection?.indicative_participations ?? [];
    const userParticipation = participations.find(
      (participation: { elector_id?: string | null }) =>
        participation.elector_id === userElector.id,
    );
    if (!userParticipation) return [];

    return (userParticipation.selections ?? [])
      .map(
        (selection: { candidate_id?: string | null; candidate?: { id: string } | null }) =>
          selection.candidate?.id ?? selection.candidate_id ?? '',
      )
      .filter(Boolean);
  }, [streamElection, userElector]);

  const indicativeDecisions = useMemo(
    () => streamVote?.indicative_decisions ?? [],
    [streamVote?.indicative_decisions],
  );
  const finalDecisions = useMemo(
    () => streamVote?.final_decisions ?? [],
    [streamVote?.final_decisions],
  );
  const userVoter = useMemo(() => {
    return streamVote?.voters?.find(
      (voter: { user_id?: string | null }) => voter.user_id === user?.id,
    );
  }, [streamVote?.voters, user?.id]);
  const userHasVoteVoted = useMemo(() => {
    if (!userVoter) return false;
    const phase = streamVote?.status;
    if (phase === 'final' || phase === 'final_vote') {
      return (streamVote?.final_participations ?? []).some(
        (participation: { voter_id?: string | null }) =>
          participation.voter_id === userVoter.id,
      );
    }
    return (streamVote?.indicative_participations ?? []).some(
      (participation: { voter_id?: string | null }) =>
        participation.voter_id === userVoter.id,
    );
  }, [streamVote, userVoter]);
  const userSelectedChoiceIds = useMemo(() => {
    if (!userVoter) return [];
    const phase = streamVote?.status;
    const participations =
      phase === 'final' || phase === 'final_vote'
        ? streamVote?.final_participations ?? []
        : streamVote?.indicative_participations ?? [];
    const userParticipation = participations.find(
      (participation: { voter_id?: string | null }) => participation.voter_id === userVoter.id,
    );
    if (!userParticipation) return [];

    return (userParticipation.decisions ?? [])
      .map((decision: { choice_id?: string | null; choice?: { id: string } | null }) => {
        return decision.choice?.id ?? decision.choice_id ?? '';
      })
      .filter(Boolean);
  }, [streamVote, userVoter]);

  const handleAddToSpeakerList = async () => {
    if (!user?.id || !streamAgendaItem?.id) return;

    setAddingSpeaker(true);
    try {
      const maxOrder =
        streamSpeakerListData.length > 0
          ? Math.max(...streamSpeakerListData.map(speaker => speaker.order || 0))
          : 0;

      await addSpeaker({
        id: crypto.randomUUID(),
        title: 'Speaker',
        time: 3,
        completed: false,
        order_index: maxOrder + 1,
        user_id: user.id,
        agenda_item_id: streamAgendaItem.id,
        start_time: null,
        end_time: null,
      });
    } catch (error) {
      console.error('Error adding to speaker list:', error);
    } finally {
      setAddingSpeaker(false);
    }
  };

  const handleMarkSpeakerCompleted = async (speakerId: string) => {
    if (!user || !canManageAgenda) return;

    setMarkingSpeakerComplete(speakerId);
    try {
      const now = Date.now();
      await updateSpeaker({
        id: speakerId,
        completed: true,
        end_time: now,
      });

      const sorted = [...streamSpeakerListData].sort((a, b) => a.order - b.order);
      const activeAfter = sorted.filter(speaker => !speaker.completed && speaker.id !== speakerId);
      if (activeAfter.length > 0) {
        await updateSpeaker({
          id: activeAfter[0].id,
          start_time: now,
        });
      }

      toast.success(t('features.events.agenda.markCompleted'));
    } catch (error) {
      console.error('Error marking speaker completed:', error);
      toast.error('Fehler beim Markieren');
    } finally {
      setMarkingSpeakerComplete(null);
    }
  };

  const handleRemoveFromSpeakerList = async () => {
    if (!user?.id) return;

    const userSpeaker = streamSpeakerListData.find(
      speaker => speaker.user?.id === user.id && !speaker.completed,
    );

    if (!userSpeaker) return;

    setRemovingSpeaker(true);
    try {
      await removeSpeaker(userSpeaker.id);
    } catch (error) {
      console.error('Error removing from speaker list:', error);
    } finally {
      setRemovingSpeaker(false);
    }
  };

  // Apply filters
  const filteredAgendaItems = agendaItems.filter(item => {
    const matchesSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatTime = (value?: number | Date | null) => {
    if (!value) {
      return '--:--';
    }

    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAgendaTimer = (agendaItem: {
    status?: string | null;
    calculated_start_time?: number;
    calculated_end_time?: number;
    end_time?: number | null;
    completed_at?: number | null;
  }) => {
    const completedAt =
      agendaItem.completed_at ?? agendaItem.end_time ?? agendaItem.calculated_end_time;
    const isCompleted =
      agendaItem.status === 'completed' || typeof agendaItem.completed_at === 'number';
    const isOngoing = agendaItem.status === 'in-progress' || agendaItem.status === 'active';

    if (isCompleted && completedAt) {
      return <AgendaEndedPill endedAt={new Date(completedAt)} />;
    }

    if (isOngoing && agendaItem.calculated_end_time) {
      return (
        <AgendaCountdownPill
          label={t('features.events.agenda.endsIn', 'Ends in')}
          endsAt={new Date(agendaItem.calculated_end_time)}
          tone="active"
        />
      );
    }

    if (agendaItem.calculated_start_time && agendaItem.calculated_start_time > Date.now()) {
      return (
        <AgendaCountdownPill
          label={t('features.events.stream.startsIn', 'Starts in')}
          endsAt={new Date(agendaItem.calculated_start_time)}
          tone="start"
        />
      );
    }

    return null;
  };

  if (isLoading || eventLoading) {
    return (
      <div>
        <div className="space-y-6">
          <div className="bg-muted h-8 animate-pulse rounded"></div>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-muted h-32 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div>
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="mb-2 text-2xl font-bold">{t('features.events.wiki.notFound')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('features.events.wiki.notFoundDescription')}
            </p>
            <Button asChild>
              <Link to="/calendar">{t('features.events.backToCalendar')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fixed Action Bar (positioned outside page layout) */}
      <AgendaActionBar
        eventId={eventId}
        canManageAgenda={canManageAgenda}
        canVote={false}
        canBeCandidate={false}
        isEventStarted={isEventStarted}
        isUserInSpeakerList={false}
        isUserCandidate={false}
        hasPreviousItem={agendaNav.hasPreviousItem}
        hasNextItem={agendaNav.hasNextItem}
        onPreviousItem={agendaNav.moveToPreviousItem}
        onNextItem={agendaNav.moveToNextItem}
        onCompleteItem={agendaNav.completeCurrentItem}
        navigationLoading={agendaNav.isLoading}
      />
      {/* Spacer for fixed toolbar */}
      <div className="h-10" />

      {/* Stream Section */}
      <Collapsible open={streamOpen} onOpenChange={setStreamOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full items-center justify-between p-0 hover:bg-transparent">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-lg">{t('features.events.stream.liveStream', 'Live Stream')}</CardTitle>
                  {isEventStarted && currentAgendaItem && (
                    <Badge variant="default" className="animate-pulse">
                      {t('features.events.stream.live', 'LIVE')}
                    </Badge>
                  )}
                </div>
                {streamOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              {!streamAgendaItem ? (
                <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-muted-foreground">
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">
                    {t('features.events.stream.noActiveItem', 'No active agenda item')}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
                    <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Play className="h-4 w-4 fill-current" />
                      {isEventStarted ? (
                        <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-green-500" />
                      ) : (
                        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{streamAgendaItem.title}</p>
                        <AgendaStatusBadge status={isEventStarted ? 'active' : 'planned'} />
                        {!isEventStarted && eventStartTimestamp != null ? (
                          <AgendaCountdownPill
                            label={t('features.events.stream.startsIn', 'Starts in')}
                            endsAt={new Date(eventStartTimestamp)}
                            tone="start"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <AgendaTypeBadge type={(streamAgendaItem.type ?? 'discussion') as AgendaItemType} />
                        {streamAgendaItem.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {streamAgendaItem.duration} min
                          </span>
                        )}
                        {!isEventStarted && eventStartTimestamp != null && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatTime(eventStartTimestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/event/$id/agenda/$agendaItemId" params={{ id: eventId, agendaItemId: streamAgendaItem.id }}>
                        {t('features.events.stream.viewDetails', 'Details')}
                      </Link>
                    </Button>
                  </div>

                  {/* Stream Video */}
                  {isEventStarted && event.stream_url && (() => {
                    const videoId = getYouTubeVideoId(event.stream_url);
                    return videoId ? (
                      <div className="relative w-full overflow-hidden rounded-lg bg-black">
                        <div className="aspect-video">
                          <iframe
                            className="h-full w-full"
                            src={`https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=0&rel=0&modestbranding=1`}
                            title={t('features.events.stream.liveStream', 'Live Stream')}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <AgendaItemContextCard
                    agendaItem={{
                      id: streamAgendaItem.id,
                      title: streamAgendaItem.title || '',
                      description: streamAgendaItem.description ?? undefined,
                      type: streamAgendaItem.type || 'discussion',
                      status: streamAgendaItem.status || 'planned',
                      duration: streamAgendaItem.duration ?? undefined,
                      scheduledTime:
                        streamAgendaItem.scheduled_time ??
                        (typeof streamAgendaItem.calculated_start_time === 'number'
                          ? new Date(streamAgendaItem.calculated_start_time).toISOString()
                          : undefined),
                      startTime: streamAgendaItem.start_time
                        ? new Date(streamAgendaItem.start_time)
                        : undefined,
                      endTime: streamAgendaItem.end_time
                        ? new Date(streamAgendaItem.end_time)
                        : undefined,
                      activatedAt: streamAgendaItem.activated_at
                        ? new Date(streamAgendaItem.activated_at)
                        : undefined,
                      completedAt: streamAgendaItem.completed_at
                        ? new Date(streamAgendaItem.completed_at)
                        : undefined,
                    }}
                  />

                  {(streamAgendaItem.type === 'speech' || streamSpeakerListData.length > 0) && (
                    <AgendaSpeakerListSection
                      speakers={streamSpeakerListData}
                      isUserInSpeakerList={isUserInSpeakerList}
                      canManageSpeakers={canManageAgenda}
                      isAddingSpeaker={addingSpeaker}
                      isRemovingSpeaker={removingSpeaker}
                      userId={user?.id}
                      agendaStartTime={streamAgendaItem.start_time ?? undefined}
                      onAddToSpeakerList={handleAddToSpeakerList}
                      onRemoveFromSpeakerList={handleRemoveFromSpeakerList}
                      onMarkCompleted={canManageAgenda ? handleMarkSpeakerCompleted : undefined}
                    />
                  )}

                  {streamElection && (
                    <div className="space-y-4">
                      <AgendaElectionSection
                        positionName={streamElection.title ?? t('features.events.agenda.position')}
                        candidates={streamElection.candidates as CandidatesByElectionRow[]}
                        indicativeSelections={indicativeSelections}
                        finalSelections={finalSelections}
                        userHasVoted={userHasElectionVoted}
                        userSelectedCandidateIds={userSelectedCandidateIds}
                        electionStatus={streamElection.status}
                        canVote={false}
                        canBeCandidate={false}
                        isUserCandidate={false}
                        onBecomeCandidate={() => {}}
                      />
                      {streamElection.position && (
                        <AgendaRelatedPositionCard
                          position={streamElection.position}
                        />
                      )}
                    </div>
                  )}

                  {streamVote && (
                    <div className="space-y-4">
                      <AgendaVoteSection
                        voteTitle={streamVote.title || streamAgendaItem.title || 'Vote'}
                        choices={streamVote.choices as ChoicesByVoteRow[]}
                        indicativeDecisions={indicativeDecisions}
                        finalDecisions={finalDecisions}
                        userHasVoted={userHasVoteVoted}
                        userSelectedChoiceIds={userSelectedChoiceIds}
                        voteStatus={streamVote.status}
                        majorityType={streamVote.majority_type}
                        totalEligibleVoters={streamVote.voters?.length}
                      />
                      {streamVoteAmendment && (
                        <AgendaRelatedAmendmentCard
                          amendment={streamVoteAmendment}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Agenda Statistics */}
      <Collapsible open={statsOpen} onOpenChange={setStatsOpen}>
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full items-center justify-between p-0 hover:bg-transparent">
                <CardTitle className="text-lg">{t('features.events.agenda.statistics')}</CardTitle>
                {statsOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="flex items-center gap-1.5 rounded-lg border p-2 md:gap-3 md:p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 md:h-10 md:w-10 dark:bg-purple-900">
                    <Vote className="h-4 w-4 text-purple-600 md:h-5 md:w-5 dark:text-purple-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold md:text-2xl">
                      {agendaItems.filter(item => item.election).length}
                    </p>
                    <p className="text-muted-foreground truncate text-xs md:text-sm">
                      {agendaItems.filter(item => item.election).length === 1
                        ? t('features.events.agenda.election')
                        : t('features.events.agenda.elections')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border p-2 md:gap-3 md:p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 md:h-10 md:w-10 dark:bg-orange-900">
                    <Gavel className="h-4 w-4 text-orange-600 md:h-5 md:w-5 dark:text-orange-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold md:text-2xl">
                      {agendaItems.filter(item => item.amendment).length}
                    </p>
                    <p className="text-muted-foreground truncate text-xs md:text-sm">
                      {agendaItems.filter(item => item.amendment).length === 1
                        ? t('features.events.agenda.amendment')
                        : t('features.events.agenda.amendments')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-lg border p-2 md:gap-3 md:p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 md:h-10 md:w-10 dark:bg-blue-900">
                    <FileText className="h-4 w-4 text-blue-600 md:h-5 md:w-5 dark:text-blue-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold md:text-2xl">
                      {agendaItems.reduce(
                        (count: number, item) =>
                          count +
                          (item.amendment?.change_requests?.filter(
                            cr => cr.status === 'open' || !cr.status
                          ).length || 0),
                        0
                      )}
                    </p>
                    <p className="text-muted-foreground truncate text-xs md:text-sm">
                      {t('features.events.agenda.openChangeRequests')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {t('features.events.agenda.itemsCount', { count: filteredAgendaItems.length })}
          </h2>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t('features.events.agenda.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle>{t('features.events.agenda.filters')}</CardTitle>
              <CardDescription>{t('features.events.agenda.filtersDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type-filter">{t('features.events.agenda.type')}</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger id="type-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('features.events.agenda.allTypes')}</SelectItem>
                      <SelectItem value="election">
                        {t('features.events.agenda.typeElection')}
                      </SelectItem>
                      <SelectItem value="vote">{t('features.events.agenda.typeVote')}</SelectItem>
                      <SelectItem value="speech">
                        {t('features.events.agenda.typeSpeech')}
                      </SelectItem>
                      <SelectItem value="discussion">
                        {t('features.events.agenda.typeDiscussion')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">{t('features.events.agenda.statusLabel')}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger id="status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('features.events.agenda.allStatus')}</SelectItem>
                      <SelectItem value="pending">
                        {t('features.events.agenda.statusPending')}
                      </SelectItem>
                      <SelectItem value="in-progress">
                        {t('features.events.agenda.statusInProgress')}
                      </SelectItem>
                      <SelectItem value="completed">
                        {t('features.events.agenda.statusCompleted')}
                      </SelectItem>
                      <SelectItem value="planned">
                        {t('features.events.agenda.statusPlanned')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Agenda Items List */}
      {filteredAgendaItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">{t('features.events.agenda.noItems')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('features.events.agenda.noItemsDescription')}
            </p>
            <Button asChild>
              <Link to="/create/agenda-item" search={{ eventId }}>
                <Plus className="mr-2 h-4 w-4" />
                {t('features.events.agenda.createFirstItem')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredAgendaItems.map(item => {
            const isActive = item.status === 'in-progress';

            // Determine if we need an action button
            let actionButton = null;
            if (isActive) {
              if (item.election) {
                actionButton = (
                  <Button size="sm" variant="default">
                    <Vote className="mr-2 h-4 w-4" />
                    {t('features.events.agenda.vote')}
                  </Button>
                );
              } else if (item.amendment) {
                actionButton = (
                  <Button size="sm" variant="default">
                    <Gavel className="mr-2 h-4 w-4" />
                    {t('features.events.agenda.vote')}
                  </Button>
                );
              }
            }

            // Check if this is the currently active item from event
            const isCurrentItem = currentAgendaItemId === item.id;
            const isCompleted = item.status === 'completed' || !!item.completed_at;

            return (
              <div
                key={item.id}
                ref={isCurrentItem ? activeItemRef : undefined}
                className={isCurrentItem ? 'relative' : ''}
              >
                {/* Active item indicator */}
                {isCurrentItem && (
                  <div className="absolute top-1/2 -left-4 flex -translate-y-1/2 items-center gap-2">
                    <div className="animate-pulse">
                      <Play className="fill-primary text-primary h-5 w-5" />
                    </div>
                  </div>
                )}
                <TimelineItem
                  order={item.order_index ?? 0}
                  startTime={formatTime(item.calculated_start_time)}
                  endTime={formatTime(item.calculated_end_time)}
                  duration={item.duration || 30}
                >
                  <div
                    className={`relative ${isCurrentItem ? 'animate-pulse-subtle ring-primary rounded-lg ring-2 ring-offset-2' : ''} ${isCompleted ? 'opacity-70' : ''}`}
                  >
                    {/* Completion checkmark overlay */}
                    {isCompleted && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                    <AgendaCard
                      id={item.id}
                      title={item.title ?? ''}
                      description={item.description ?? undefined}
                      type={(item.type ?? 'discussion') as AgendaItemType}
                      status={(item.status ?? 'pending') as AgendaItemStatus}
                      creatorName={
                        [item.creator?.first_name, item.creator?.last_name]
                          .filter(Boolean)
                          .join(' ') ||
                        (item.creator?.email ?? undefined)
                      }
                      detailsLink={`/event/${eventId}/agenda/${item.id}`}
                      isActive={isActive}
                      actionButton={actionButton}
                      footerRight={renderAgendaTimer(item)}
                      showMoveButton={canManageAgenda}
                      onMoveClick={() =>
                        setTransferDialogItem({ id: item.id, title: item.title ?? '' })
                      }
                    />
                  </div>
                </TimelineItem>
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer Dialog */}
      {transferDialogItem && (
        <TransferAgendaItemDialog
          agendaItemId={transferDialogItem.id}
          agendaItemTitle={transferDialogItem.title}
          currentEventId={eventId}
          currentEventTitle={event?.title || 'Event'}
          open={!!transferDialogItem}
          onOpenChange={isOpen => {
            if (!isOpen) setTransferDialogItem(null);
          }}
          onTransferComplete={() => {
            setTransferDialogItem(null);
            // Zero's reactive queries auto-refresh when data changes
          }}
        />
      )}
    </div>
  );
}
