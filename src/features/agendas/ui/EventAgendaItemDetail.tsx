import { Link, useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useEventAgendaItem } from '../hooks/useEventAgendaItem';
import type { CandidatesByElectionRow } from '@/zero/elections/queries';
import type { ChoicesByVoteRow } from '@/zero/votes/queries';
import { TransferAgendaItemDialog } from './TransferAgendaItemDialog';
import { AgendaItemContextCard } from './AgendaItemContextCard';
import {
  AgendaRelatedAmendmentCard,
} from './AgendaRelatedEntityCard';
import { AgendaSpeakerListSection } from './AgendaSpeakerListSection';
import { AgendaVoteSection } from './AgendaVoteSection';
import { AgendaElectionSection } from './AgendaElectionSection';
import { AgendaActionBar } from './AgendaActionBar';
import { EditElectionVoteDialog } from './EditElectionVoteDialog';
import { useAgendaActionBar } from '../hooks/useAgendaActionBar';
import { useAgendaNavigation } from '../hooks/useAgendaNavigation';
import { VoteCastDialog } from '@/features/vote-cast/ui/VoteCastDialog';
import { ChangeRequestCardsList } from './ChangeRequestCardsList';
import { AccreditationSection } from './AccreditationSection';
import { usePermissions } from '@/zero/rbac';
import { useVotingPasswordActions } from '@/zero/voting-password/useVotingPasswordActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { toast } from 'sonner';
import type { Value } from 'platejs';
import type { TDiscussion } from '@/features/editor/types';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAgendaItemCRVoting, getVotePhase } from '../hooks/useAgendaItemCRVoting';
import { extractAmendmentCRSummaries } from '../logic/extractAmendmentCRSummaries';
import { createMockCRTimelineItems } from '../logic/createMockCRTimelineItems';
import { buildFinalVoteFromAgendaVote } from '../logic/buildFinalVoteFromAgendaVote';
import type { ChangeRequestTimelineRow } from '@/zero/agendas/queries';
import { extractSuggestionContent } from '@/features/change-requests/utils/suggestion-extraction';
import type { ChangeRequestDiffData } from './ChangeRequestTimelineCard';

function getEffectiveVotingPhase(
  status?: string | null,
  fallback?: string | null,
): string | null {
  if (status === 'final' || status === 'final_vote') return 'final_vote';
  if (status === 'closed') return 'closed';
  if (status === 'indicative') return 'indication';
  return fallback ?? null;
}

function getEffectiveCRVotingPhase(
  item?: {
    status?: string | null;
    vote?: { status?: string | null } | null;
  } | null,
): string | null {
  if (!item) return null;
  if (item.status === 'pending') return 'pending';

  const phase = getVotePhase(item as Parameters<typeof getVotePhase>[0]);
  if (phase === 'final_vote') return 'final_vote';
  if (phase === 'closed') return 'closed';
  return 'indication';
}

export function EventAgendaItemDetail({
  eventId,
  agendaItemId,
}: {
  eventId: string;
  agendaItemId: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateSpeaker } = useAgendaActions();
  const {
    agendaItem,
    event,
    user,
    isLoading,
    votingLoading,
    addingSpeaker,
    election,
    candidates,
    electors,
    vote,
    choices,
    userElector,
    userVoter,
    estimatedStartTime,
    handleElectionVote,
    handleAmendmentVote,
    handleDelete,
    handleAddToSpeakerList,
  } = useEventAgendaItem(eventId, agendaItemId);

  const { can, canVote, canBeCandidate } = usePermissions({ eventId });
  const canManageAgenda = can('manage', 'agendaItems');
  const hasVotingRight = canVote();
  const hasCandidateRight = canBeCandidate();

  // Agenda navigation (Previous / Complete / Next)
  const agendaNav = useAgendaNavigation(eventId);

  const { verifyVotingPassword } = useVotingPasswordActions();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordVerifying, setIsPasswordVerifying] = useState(false);
  const effectiveVotingPhase = getEffectiveVotingPhase(
    election?.status ?? vote?.status,
    agendaItem?.voting_phase ?? null,
  );

  const {
    crTimeline,
    currentItem: currentCRItem,
    completedItems,
    progress,
    isTimelineComplete,
    allCRsProcessed,
    hasUserVoted: hasUserVotedOnCR,
    getUserSelectedChoiceIds,
    startIndicativePhase,
    startFinalPhase,
    closeVoting,
    castCRVote,
  } = useAgendaItemCRVoting(agendaItemId, user?.id);

  // Action bar hook — pass election/vote data for phase management
  const actionBarHook = useAgendaActionBar({
    eventId,
    currentAgendaItem: agendaItem ? {
      id: agendaItem.id,
      type: agendaItem.type,
      status: agendaItem.status,
      voting_phase: effectiveVotingPhase,
      speaker_list: agendaItem.speaker_list ?? undefined,
    } : null,
    eventTitle: event?.title ?? undefined,
    election: election ?? undefined,
    vote: vote ?? undefined,
    electorId: userElector?.id,
    voterId: userVoter?.id,
  });

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [markingSpeakerComplete, setMarkingSpeakerComplete] = useState<string | null>(null);
  const [selectedCRToolbarItemId, setSelectedCRToolbarItemId] = useState<string | null>(null);

  // Build mock CR items for pre-voting display
  const mockCRItems = useMemo(() => {
    if (!agendaItem?.amendment_id) return [];
    if (crTimeline.length > 0) return [];

    const amendment = agendaItem.amendment;
    if (!amendment) return [];

    const summaries = extractAmendmentCRSummaries(
      amendment.discussions as readonly unknown[] | null | undefined,
      amendment.change_requests as readonly { id: string; title?: string | null; description?: string | null; status?: string | null }[] | null | undefined,
    );

    return createMockCRTimelineItems(summaries);
  }, [agendaItem?.amendment_id, agendaItem?.amendment, crTimeline.length]);

  // Extract document content for editor preview
  const documentContent = agendaItem?.amendment?.document?.content as Value | undefined;

  // Build TDiscussion array from amendment discussions for SuggestionViewToggle mapping
  const amendmentDiscussions = useMemo<TDiscussion[]>(() => {
    const rawDiscussions = agendaItem?.amendment?.discussions;
    if (!rawDiscussions || !Array.isArray(rawDiscussions)) return [];
    return (rawDiscussions as Record<string, unknown>[]).map((d) => ({
      id: (d.id as string) ?? '',
      crId: (d.crId as string) ?? null,
      title: (d.title as string) ?? '',
      userId: (d.userId as string) ?? '',
      comments: (d.comments as TDiscussion['comments']) ?? [],
      createdAt: (d.createdAt as number) ?? 0,
      isResolved: (d.isResolved as boolean) ?? false,
    }));
  }, [agendaItem?.amendment?.discussions]);

  // Build diffMap from document content for each discussion
  const crDiffMap = useMemo<Record<string, ChangeRequestDiffData>>(() => {
    if (!documentContent || !amendmentDiscussions.length) return {};
    const map: Record<string, ChangeRequestDiffData> = {};
    for (const d of amendmentDiscussions) {
      if (!d.id) continue;
      const content = extractSuggestionContent(d.id, documentContent);
      if (content.type === 'unknown' && !content.text && !content.newText) continue;
      map[d.id] = {
        changeType: content.type,
        originalText: content.text || undefined,
        newText: content.newText || undefined,
        properties: content.properties as Record<string, string> | undefined,
        newProperties: content.newProperties as Record<string, string> | undefined,
      };
    }
    return map;
  }, [documentContent, amendmentDiscussions]);

  const hasAmendmentCRs = crTimeline.length > 0 || mockCRItems.length > 0;
  const crDisplayItemsBase = crTimeline.length > 0
    ? crTimeline
    : mockCRItems as unknown as ChangeRequestTimelineRow[];
  const isCRVotingActive = crTimeline.length > 0;

  // Synthesize a final vote item from the agenda item's own vote.
  // If the timeline already includes a final vote (legacy data), prefer that.
  const timelineHasFinalVote = crDisplayItemsBase.some(i => i.is_final_vote);
  const synthesizedFinalVoteItem = useMemo(() => {
    if (timelineHasFinalVote) return null;
    if (!vote || !hasAmendmentCRs) return null;
    const orderIndex = crDisplayItemsBase.length;
    return buildFinalVoteFromAgendaVote(vote, orderIndex) as unknown as ChangeRequestTimelineRow;
  }, [timelineHasFinalVote, vote, hasAmendmentCRs, crDisplayItemsBase.length]);

  // Combine CR items + synthesized final vote
  const crDisplayItems = useMemo(() => {
    if (!synthesizedFinalVoteItem) return crDisplayItemsBase;
    return [...crDisplayItemsBase, synthesizedFinalVoteItem];
  }, [crDisplayItemsBase, synthesizedFinalVoteItem]);

  // Derive the effective final vote item (from timeline or synthesized)
  const effectiveFinalVoteItem = useMemo(
    () => crDisplayItems.find(i => i.is_final_vote) ?? null,
    [crDisplayItems],
  );

  // Whether the vote is embedded in the CR list (so we can hide standalone AgendaVoteSection)
  const isVoteInCRList = hasAmendmentCRs && !!effectiveFinalVoteItem && !!vote;

  const nonFinalCRItems = useMemo(
    () => crTimeline.filter(item => !item.is_final_vote),
    [crTimeline]
  );

  const fallbackSelectedCRItemId = useMemo(() => {
    if (currentCRItem?.id) return currentCRItem.id;

    const nextPendingCR = nonFinalCRItems.find(item => item.status !== 'completed');
    if (nextPendingCR) return nextPendingCR.id;

    return effectiveFinalVoteItem?.id ?? null;
  }, [currentCRItem?.id, nonFinalCRItems, effectiveFinalVoteItem?.id]);

  useEffect(() => {
    if (currentCRItem?.id && currentCRItem.id !== selectedCRToolbarItemId) {
      setSelectedCRToolbarItemId(currentCRItem.id);
      return;
    }

    const selectedItemStillExists = selectedCRToolbarItemId
      ? crTimeline.some(item => item.id === selectedCRToolbarItemId)
        || effectiveFinalVoteItem?.id === selectedCRToolbarItemId
      : false;

    if (!selectedItemStillExists && fallbackSelectedCRItemId) {
      setSelectedCRToolbarItemId(fallbackSelectedCRItemId);
    }
  }, [
    crTimeline,
    currentCRItem?.id,
    effectiveFinalVoteItem?.id,
    fallbackSelectedCRItemId,
    selectedCRToolbarItemId,
  ]);

  const selectedCRToolbarItem = useMemo(
    () =>
      crTimeline.find(item => item.id === selectedCRToolbarItemId)
      ?? (effectiveFinalVoteItem?.id === selectedCRToolbarItemId ? effectiveFinalVoteItem : null)
      ?? crTimeline.find(item => item.id === fallbackSelectedCRItemId)
      ?? (effectiveFinalVoteItem?.id === fallbackSelectedCRItemId ? effectiveFinalVoteItem : null)
      ?? null,
    [crTimeline, effectiveFinalVoteItem, fallbackSelectedCRItemId, selectedCRToolbarItemId]
  );

  const isCRToolbarActive = !!agendaItem?.amendment_id && crTimeline.length > 0 && !!selectedCRToolbarItem;
  const selectedCRPhase = getEffectiveCRVotingPhase(selectedCRToolbarItem);
  const isSelectedCRFinalVote = !!selectedCRToolbarItem?.is_final_vote;
  const hasUserVotedOnSelectedCR = useMemo(
    () => (selectedCRToolbarItem ? hasUserVotedOnCR(selectedCRToolbarItem) : false),
    [hasUserVotedOnCR, selectedCRToolbarItem]
  );

  const selectedCRToolbarIndex = useMemo(() => {
    if (!selectedCRToolbarItem) return -1;
    if (selectedCRToolbarItem.is_final_vote) return nonFinalCRItems.length;
    return nonFinalCRItems.findIndex(item => item.id === selectedCRToolbarItem.id);
  }, [selectedCRToolbarItem, nonFinalCRItems]);

  const hasPreviousChangeRequest = useMemo(() => {
    if (!selectedCRToolbarItem) return false;
    if (selectedCRToolbarItem.is_final_vote) return nonFinalCRItems.length > 0;
    return selectedCRToolbarIndex > 0;
  }, [selectedCRToolbarItem, nonFinalCRItems.length, selectedCRToolbarIndex]);

  const hasNextChangeRequest = useMemo(() => {
    if (!selectedCRToolbarItem || selectedCRToolbarItem.is_final_vote) return false;
    if (selectedCRToolbarIndex < nonFinalCRItems.length - 1) return true;
    return !!effectiveFinalVoteItem && allCRsProcessed;
  }, [selectedCRToolbarItem, selectedCRToolbarIndex, nonFinalCRItems.length, effectiveFinalVoteItem, allCRsProcessed]);

  const handlePreviousChangeRequest = useCallback(() => {
    if (!selectedCRToolbarItem) return;

    if (selectedCRToolbarItem.is_final_vote) {
      const lastCRItem = nonFinalCRItems[nonFinalCRItems.length - 1];
      if (lastCRItem) setSelectedCRToolbarItemId(lastCRItem.id);
      return;
    }

    const previousItem = nonFinalCRItems[selectedCRToolbarIndex - 1];
    if (previousItem) setSelectedCRToolbarItemId(previousItem.id);
  }, [selectedCRToolbarItem, nonFinalCRItems, selectedCRToolbarIndex]);

  const handleNextChangeRequest = useCallback(() => {
    if (!selectedCRToolbarItem || selectedCRToolbarItem.is_final_vote) return;

    const nextItem = nonFinalCRItems[selectedCRToolbarIndex + 1];
    if (nextItem) {
      setSelectedCRToolbarItemId(nextItem.id);
      return;
    }

    if (effectiveFinalVoteItem && allCRsProcessed) {
      setSelectedCRToolbarItemId(effectiveFinalVoteItem.id);
    }
  }, [selectedCRToolbarItem, nonFinalCRItems, selectedCRToolbarIndex, effectiveFinalVoteItem, allCRsProcessed]);

  const handleToolbarStartVote = useCallback(() => {
    if (!selectedCRToolbarItem) return;
    void startIndicativePhase(selectedCRToolbarItem.id);
  }, [selectedCRToolbarItem, startIndicativePhase]);

  const handleToolbarStartFinalVote = useCallback(() => {
    if (isCRToolbarActive) {
      if (!selectedCRToolbarItem) return;
      void startFinalPhase(selectedCRToolbarItem.id);
      return;
    }

    void actionBarHook.handleStartFinalVote();
  }, [isCRToolbarActive, selectedCRToolbarItem, startFinalPhase, actionBarHook]);

  const handleToolbarCloseVote = useCallback(() => {
    if (isCRToolbarActive) {
      if (!selectedCRToolbarItem) return;
      void closeVoting(selectedCRToolbarItem.id);
      return;
    }

    void actionBarHook.handleCloseFinalVote();
  }, [isCRToolbarActive, selectedCRToolbarItem, closeVoting, actionBarHook]);

  const handleCastCRVoteFromDialog = useCallback(
    async (choiceId: string) => {
      if (!selectedCRToolbarItem) return;
      await castCRVote(selectedCRToolbarItem, choiceId);
    },
    [selectedCRToolbarItem, castCRVote]
  );

  const selectedCRTitle = useMemo(() => {
    if (!selectedCRToolbarItem) return agendaItem?.title ?? undefined;
    if (selectedCRToolbarItem.is_final_vote) {
      return t('features.agendas.crTimeline.acceptAmendment', 'Accept amendment as modified');
    }

    return (
      selectedCRToolbarItem.change_request?.title ||
      `${t('features.agendas.crTimeline.changeRequest', 'Change Request')} ${selectedCRToolbarIndex + 1}`
    );
  }, [agendaItem?.title, selectedCRToolbarItem, selectedCRToolbarIndex, t]);

  const selectedCRChoices = useMemo(
    () =>
      (selectedCRToolbarItem?.vote?.choices ?? []).map(choice => ({
        id: choice.id,
        label: choice.label || 'Choice',
      })),
    [selectedCRToolbarItem?.vote?.choices]
  );

  const selectedCRDialogPhase = useMemo(() => {
    if (selectedCRPhase === 'final_vote') return 'final_vote' as const;
    if (selectedCRPhase === 'closed') return 'closed' as const;
    return 'indication' as const;
  }, [selectedCRPhase]);

  const toolbarVotingPhase = isCRToolbarActive
    ? selectedCRPhase
    : effectiveVotingPhase;

  const startVoteTooltip = isCRToolbarActive
    ? isSelectedCRFinalVote
      ? t('features.events.agenda.actions.startFinalVote', 'Start Final Vote')
      : t('features.agendas.crTimeline.startVote', 'Start Change Request Vote')
    : undefined;

  const startFinalVoteTooltip = isCRToolbarActive
    ? isSelectedCRFinalVote
      ? t('features.events.agenda.actions.startFinalVote', 'Start Final Vote')
      : t('features.agendas.crTimeline.startFinal', 'Start Change Request Final Vote')
    : undefined;

  const closeVoteTooltip = isCRToolbarActive
    ? isSelectedCRFinalVote
      ? t('features.events.agenda.actions.closeFinalVote', 'Close Final Vote')
      : t('features.agendas.crTimeline.closeVoting', 'Close Change Request Vote')
    : undefined;

  const castIndicativeVoteTooltip = isCRToolbarActive
    ? isSelectedCRFinalVote
      ? t('features.events.agenda.actions.castIndicativeVote', 'Cast Indication')
      : t('features.agendas.crTimeline.castIndicative', 'Cast Change Request Indication')
    : undefined;

  const castFinalVoteTooltip = isCRToolbarActive
    ? isSelectedCRFinalVote
      ? t('features.events.agenda.actions.castFinalVote', 'Cast Final Vote')
      : t('features.agendas.crTimeline.castFinal', 'Cast Change Request Final Vote')
    : undefined;

  // Handler: Mark speaker as completed
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

      // Set start_time on the next active speaker (if any)
      const sorted = [...speakerListData].sort((a, b) => a.order - b.order);
      const activeAfter = sorted.filter(s => !s.completed && s.id !== speakerId);
      if (activeAfter.length > 0) {
        const next = activeAfter[0];
        await updateSpeaker({
          id: next.id,
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

  // Prepare speaker list data
  const speakerListData = useMemo(() => {
    return (agendaItem?.speaker_list || []).map((speaker) => ({
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
            name: `${speaker.user.first_name ?? ''} ${speaker.user.last_name ?? ''}`.trim() || undefined,
            email: speaker.user.email ?? undefined,
            avatar: speaker.user.avatar ?? undefined,
          }
        : undefined,
    }));
  }, [agendaItem?.speaker_list]);

  const isUserInSpeakerList = speakerListData.some(speaker => speaker.user?.id === user?.id && !speaker.completed);

  // Derive election/vote data for section components
  const indicativeSelections = useMemo(
    () => election?.indicative_selections ?? [],
    [election?.indicative_selections],
  );
  const finalSelections = useMemo(
    () => election?.final_selections ?? [],
    [election?.final_selections],
  );
  const userHasElectionVoted = useMemo(() => {
    if (!userElector) return false;
    const phase = election?.status;
    if (phase === 'final' || phase === 'final_vote') {
      return (election?.final_participations ?? []).some(
        (p: { elector_id?: string | null }) => p.elector_id === userElector.id,
      );
    }
    return (election?.indicative_participations ?? []).some(
      (p: { elector_id?: string | null }) => p.elector_id === userElector.id,
    );
  }, [userElector, election]);

  const userSelectedCandidateIds = useMemo(() => {
    if (!userElector) return [];
    const phase = election?.status;
    const participations = phase === 'final' || phase === 'final_vote'
      ? election?.final_participations ?? []
      : election?.indicative_participations ?? [];
    const userPart = participations.find(
      (p: { elector_id?: string | null }) => p.elector_id === userElector.id,
    );
    if (!userPart) return [];
    return (userPart.selections ?? []).map(
      (s: { candidate_id?: string | null; candidate?: { id: string } | null }) =>
        s.candidate?.id ?? s.candidate_id ?? '',
    ).filter(Boolean);
  }, [userElector, election]);

  const indicativeDecisions = useMemo(
    () => vote?.indicative_decisions ?? [],
    [vote?.indicative_decisions],
  );
  const finalDecisions = useMemo(
    () => vote?.final_decisions ?? [],
    [vote?.final_decisions],
  );
  const userHasVoteVoted = useMemo(() => {
    if (!userVoter) return false;
    const phase = vote?.status;
    if (phase === 'final' || phase === 'final_vote') {
      return (vote?.final_participations ?? []).some(
        (p: { voter_id?: string | null }) => p.voter_id === userVoter.id,
      );
    }
    return (vote?.indicative_participations ?? []).some(
      (p: { voter_id?: string | null }) => p.voter_id === userVoter.id,
    );
  }, [userVoter, vote]);

  const userSelectedChoiceIds = useMemo(() => {
    if (!userVoter) return [];
    const phase = vote?.status;
    const participations = phase === 'final' || phase === 'final_vote'
      ? vote?.final_participations ?? []
      : vote?.indicative_participations ?? [];
    const userPart = participations.find(
      (p: { voter_id?: string | null }) => p.voter_id === userVoter.id,
    );
    if (!userPart) return [];
    return (userPart.decisions ?? []).map(
      (d: { choice_id?: string | null; choice?: { id: string } | null }) =>
        d.choice?.id ?? d.choice_id ?? '',
    ).filter(Boolean);
  }, [userVoter, vote]);

  const voteAmendment = vote?.amendment ?? agendaItem?.amendment ?? null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 animate-pulse rounded bg-muted"></div>
        <div className="h-64 animate-pulse rounded bg-muted"></div>
      </div>
    );
  }

  if (!agendaItem || !event) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Tagesordnungspunkt nicht gefunden</h2>
          <p className="mb-4 text-muted-foreground">
            Der gesuchte Tagesordnungspunkt existiert nicht oder wurde gelöscht.
          </p>
          <Button asChild>
            <Link to="/event/$id/agenda" params={{ id: eventId }}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Tagesordnung
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fixed Action Bar */}
      <AgendaActionBar
        eventId={eventId}
        currentAgendaItem={{
          id: agendaItem.id,
          type: agendaItem.type,
          status: agendaItem.status,
          voting_phase: toolbarVotingPhase,
          election: election ? { id: election.id } : null,
          vote: isCRToolbarActive
            ? (selectedCRToolbarItem?.vote ? { id: selectedCRToolbarItem.vote.id } : null)
            : (vote ? { id: vote.id } : null),
        }}
        canManageAgenda={actionBarHook.canManageAgenda}
        canVote={actionBarHook.hasVotingRight}
        canBeCandidate={actionBarHook.hasCandidateRight}
        isEventStarted={event?.status === 'active' || event?.status === 'in-progress'}
        isUserInSpeakerList={actionBarHook.isUserInSpeakerList}
        isUserCandidate={actionBarHook.isUserCandidate}
        hasPreviousItem={agendaNav.hasPreviousItem}
        hasNextItem={agendaNav.hasNextItem}
        onPreviousItem={agendaNav.moveToPreviousItem}
        onNextItem={agendaNav.moveToNextItem}
        onCompleteItem={agendaNav.completeCurrentItem}
        hasPreviousChangeRequest={isCRToolbarActive ? hasPreviousChangeRequest : undefined}
        hasNextChangeRequest={isCRToolbarActive ? hasNextChangeRequest : undefined}
        onPreviousChangeRequest={isCRToolbarActive ? handlePreviousChangeRequest : undefined}
        onNextChangeRequest={isCRToolbarActive ? handleNextChangeRequest : undefined}
        navigationLoading={agendaNav.isLoading}
        speakerLoading={actionBarHook.speakerLoading}
        candidateLoading={actionBarHook.candidateLoading}
        onBackToAgenda={() => navigate({ to: '/event/$id/agenda', params: { id: eventId } })}
        onMoveToEvent={() => setTransferDialogOpen(true)}
        onEditItem={actionBarHook.handleEditClick}
        onDeleteItem={handleDelete}
        onJoinSpeakerList={actionBarHook.handleJoinSpeakerList}
        onLeaveSpeakerList={actionBarHook.handleLeaveSpeakerList}
        onBecomeCandidate={actionBarHook.handleBecomeCandidate}
        onWithdrawCandidacy={actionBarHook.handleWithdrawCandidacy}
        onStartVote={isCRToolbarActive && toolbarVotingPhase === 'pending' ? handleToolbarStartVote : undefined}
        onStartFinalVote={
          isCRToolbarActive
            ? (toolbarVotingPhase === 'indication' ? handleToolbarStartFinalVote : undefined)
            : handleToolbarStartFinalVote
        }
        onCloseFinalVote={
          isCRToolbarActive
            ? (toolbarVotingPhase === 'final_vote' ? handleToolbarCloseVote : undefined)
            : handleToolbarCloseVote
        }
        onVoteClick={
          isCRToolbarActive
            ? (toolbarVotingPhase !== 'pending' && toolbarVotingPhase !== 'closed' && !hasUserVotedOnSelectedCR
              ? actionBarHook.handleVoteClick
              : undefined)
            : actionBarHook.handleVoteClick
        }
        startVoteTooltip={startVoteTooltip}
        startFinalVoteTooltip={startFinalVoteTooltip}
        closeVoteTooltip={closeVoteTooltip}
        castIndicativeVoteTooltip={castIndicativeVoteTooltip}
        castFinalVoteTooltip={castFinalVoteTooltip}
      />
      {/* Spacer for fixed toolbar */}
      <div className="h-10" />

      {/* Vote Cast Dialog (with password support) */}
      <VoteCastDialog
        open={actionBarHook.voteDialogOpen}
        onOpenChange={actionBarHook.setVoteDialogOpen}
        phase={isCRToolbarActive ? selectedCRDialogPhase : actionBarHook.voteCasting.phase}
        title={isCRToolbarActive ? selectedCRTitle : agendaItem.title ?? undefined}
        candidates={isCRToolbarActive ? undefined : election ? candidates.map(c => ({
          id: c.id,
          name: c.user ? `${c.user.first_name ?? ''} ${c.user.last_name ?? ''}`.trim() || c.user.email || 'Candidate' : c.name || 'Candidate',
          avatar: c.user?.avatar ?? undefined,
        })) : undefined}
        maxVotes={election?.max_votes ?? 1}
        choices={isCRToolbarActive ? selectedCRChoices : vote ? choices.map(c => ({
          id: c.id,
          label: c.label || 'Choice',
        })) : undefined}
        requirePassword
        passwordError={passwordError}
        isPasswordVerifying={isPasswordVerifying}
        onPasswordSubmit={async (password: string) => {
          setPasswordError(null);
          setIsPasswordVerifying(true);
          try {
            await verifyVotingPassword(password);
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Verification failed';
            setPasswordError(message);
            throw err;
          } finally {
            setIsPasswordVerifying(false);
          }
        }}
        onCastVote={isCRToolbarActive ? handleCastCRVoteFromDialog : actionBarHook.voteCasting.castAmendmentVote}
        onCastElectionVote={isCRToolbarActive ? undefined : actionBarHook.voteCasting.castElectionVote}
        isLoading={isCRToolbarActive ? false : actionBarHook.voteCasting.isLoading}
      />

      {/* Edit Election/Vote Dialog */}
      <EditElectionVoteDialog
        open={actionBarHook.editDialogOpen}
        onOpenChange={actionBarHook.setEditDialogOpen}
        agendaItemId={agendaItem.id}
        agendaItemTitle={agendaItem.title ?? null}
        agendaItemDescription={agendaItem.description ?? null}
        election={election ?? undefined}
        vote={vote ?? undefined}
        choices={choices.map(c => ({
          id: c.id,
          label: c.label,
          order_index: c.order_index,
        }))}
      />

      {/* Section 1: Context Card */}
      <AgendaItemContextCard
        agendaItem={{
          id: agendaItem.id,
          title: agendaItem.title || '',
          description: agendaItem.description ?? undefined,
          type: agendaItem.type || '',
          status: agendaItem.status || '',
          duration: agendaItem.duration ?? undefined,
          scheduledTime: estimatedStartTime?.toISOString() ?? agendaItem.scheduled_time ?? undefined,
          startTime: agendaItem.start_time ? new Date(agendaItem.start_time) : undefined,
          endTime: agendaItem.end_time ? new Date(agendaItem.end_time) : undefined,
          activatedAt: agendaItem.activated_at ? new Date(agendaItem.activated_at) : undefined,
          completedAt: agendaItem.completed_at ? new Date(agendaItem.completed_at) : undefined,
        }}
        amendment={agendaItem.amendment ?? undefined}
        election={election ?? undefined}
        votingStartTime={agendaItem.start_time ? new Date(agendaItem.start_time) : undefined}
        votingEndTime={
          (election?.closing_end_time ?? vote?.closing_end_time)
            ? new Date(election?.closing_end_time ?? vote?.closing_end_time ?? 0)
            : undefined
        }
      />

      {/* Section 2: Speaker List */}
      <AgendaSpeakerListSection
        speakers={speakerListData}
        isUserInSpeakerList={isUserInSpeakerList}
        canManageSpeakers={canManageAgenda}
        isAddingSpeaker={addingSpeaker}
        isRemovingSpeaker={actionBarHook.speakerLoading}
        userId={user?.id}
        agendaStartTime={agendaItem.start_time ?? undefined}
        onAddToSpeakerList={handleAddToSpeakerList}
        onRemoveFromSpeakerList={actionBarHook.handleLeaveSpeakerList}
        onMarkCompleted={handleMarkSpeakerCompleted}
      />

      {/* Accreditation Section */}
      {agendaItem.type === 'accreditation' && (
        <AccreditationSection eventId={eventId} agendaItemId={agendaItemId} />
      )}

      {/* Change Request Cards — always shown for amendment agenda items */}
      {agendaItem.amendment_id && hasAmendmentCRs && (
        <ChangeRequestCardsList
          items={crDisplayItems}
          editingMode={agendaItem.amendment?.editing_mode}
          isVotingActive={isCRVotingActive}
          userId={user?.id}
          canManage={canManageAgenda}
          canVote={hasVotingRight}
          currentItemId={isCRVotingActive ? currentCRItem?.id : null}
          progress={isCRVotingActive ? progress : undefined}
          completedCount={isCRVotingActive ? completedItems.length : undefined}
          allCRsProcessed={isCRVotingActive ? allCRsProcessed : undefined}
          isTimelineComplete={isCRVotingActive ? isTimelineComplete : undefined}
          diffMap={crDiffMap}
          documentContent={documentContent}
          discussions={amendmentDiscussions}
          amendmentId={agendaItem.amendment_id ?? undefined}
          agendaItemId={agendaItemId}
          hasUserVoted={isCRVotingActive ? hasUserVotedOnCR : undefined}
          getUserSelectedChoiceIds={isCRVotingActive ? getUserSelectedChoiceIds : undefined}
          onCastVote={isCRVotingActive ? castCRVote : undefined}
          onStartIndicative={isCRVotingActive ? startIndicativePhase : undefined}
          onStartFinal={isCRVotingActive ? startFinalPhase : undefined}
          onCloseVoting={isCRVotingActive ? closeVoting : undefined}
        />
      )}

      {/* Section 3: Election */}
      {election && (
        <div className="space-y-4">
          <AgendaElectionSection
            positionName={
              election.title ??
              t('features.events.agenda.position')
            }
            candidates={[...candidates] as CandidatesByElectionRow[]}
            indicativeSelections={indicativeSelections}
            finalSelections={finalSelections}
            userHasVoted={userHasElectionVoted}
            userSelectedCandidateIds={userSelectedCandidateIds}
            electionStatus={election.status}
            canVote={hasVotingRight}
            canBeCandidate={hasCandidateRight}
            isUserCandidate={actionBarHook.isUserCandidate}
            isVotingLoading={votingLoading === election.id}
            isCandidateLoading={actionBarHook.candidateLoading}
            onBecomeCandidate={actionBarHook.handleBecomeCandidate}
            onWithdrawCandidacy={actionBarHook.handleWithdrawCandidacy}
          />
        </div>
      )}

      {/* Section 3: Vote — hidden when vote is embedded in the CR list */}
      {vote && !isVoteInCRList && (
        <div className="space-y-4">
          <AgendaVoteSection
            voteTitle={vote.title || agendaItem.title || 'Vote'}
            choices={[...choices] as ChoicesByVoteRow[]}
            indicativeDecisions={indicativeDecisions}
            finalDecisions={finalDecisions}
            userHasVoted={userHasVoteVoted}
            userSelectedChoiceIds={userSelectedChoiceIds}
            voteStatus={vote.status}
            majorityType={vote.majority_type}
            totalEligibleVoters={vote.voters?.length}
          />
          {voteAmendment && (
            <AgendaRelatedAmendmentCard amendment={voteAmendment} />
          )}
        </div>
      )}

      {/* Transfer Dialog */}
      <TransferAgendaItemDialog
        agendaItemId={agendaItemId}
        agendaItemTitle={agendaItem.title || ''}
        currentEventId={eventId}
        currentEventTitle={event?.title || 'Event'}
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onTransferComplete={() => {
          setTransferDialogOpen(false);
        }}
      />
    </div>
  );
}
