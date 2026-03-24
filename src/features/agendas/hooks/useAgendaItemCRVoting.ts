import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useAgendaItemCRTimeline } from '@/zero/agendas/useAgendaState';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useVoteActions } from '@/zero/votes/useVoteActions';
import type { ChangeRequestTimelineRow } from '@/zero/agendas/queries';
import type { VoteResult } from '@/features/votes/logic/computeVoteResult';

export type CRVotePhase = 'indicative' | 'final_vote' | 'closed';

export function useAgendaItemCRVoting(agendaItemId: string, userId?: string) {
  const {
    crTimeline,
    currentItem,
    pendingItems,
    completedItems,
    finalVoteItem,
    progress,
    isLoading,
  } = useAgendaItemCRTimeline(agendaItemId);

  const { updateAgendaItemChangeRequest, processCRVoteResult } = useAgendaActions();
  const { updateVote, castIndicativeVote, castFinalVote, createVoter } = useVoteActions();

  // Determine if the current user has voted on a given CR vote (for the current phase)
  const hasUserVoted = useCallback(
    (item: ChangeRequestTimelineRow) => {
      if (!userId || !item.vote) return false;
      const voters = item.vote.voters ?? [];
      const voter = voters.find((v: { user_id: string }) => v.user_id === userId);
      if (!voter) return false;

      const phase = getVotePhase(item);
      if (phase === 'final_vote') {
        return (item.vote.final_participations ?? []).some(
          (p: { voter_id: string }) => p.voter_id === voter.id
        );
      }
      return (item.vote.indicative_participations ?? []).some(
        (p: { voter_id: string }) => p.voter_id === voter.id
      );
    },
    [userId]
  );

  // Get voter record for current user on a given vote
  const getUserVoter = useCallback(
    (item: ChangeRequestTimelineRow) => {
      if (!userId || !item.vote) return null;
      const voters = item.vote.voters ?? [];
      return voters.find((v: { user_id: string }) => v.user_id === userId) ?? null;
    },
    [userId]
  );

  const getUserSelectedChoiceIds = useCallback(
    (item: ChangeRequestTimelineRow) => {
      if (!userId || !item.vote) return [];

      const voter = getUserVoter(item);
      if (!voter) return [];

      const phase = getVotePhase(item);
      const participations = phase === 'final_vote' || phase === 'closed'
        ? item.vote.final_participations ?? []
        : item.vote.indicative_participations ?? [];

      const userParticipation = participations.find(
        (p: { voter_id?: string | null }) => p.voter_id === voter.id
      );

      if (!userParticipation) return [];

      return (userParticipation.decisions ?? [])
        .map((d: { choice_id?: string | null; choice?: { id: string } | null }) =>
          d.choice?.id ?? d.choice_id ?? ''
        )
        .filter(Boolean);
    },
    [userId, getUserVoter]
  );

  // Start indicative phase for a CR vote
  const startIndicativePhase = useCallback(
    async (itemId: string) => {
      const item = crTimeline.find(i => i.id === itemId);
      if (!item?.vote) return;
      await updateVote({ id: item.vote.id, status: 'indicative' });
      await updateAgendaItemChangeRequest({ id: itemId, status: 'voting' });
    },
    [crTimeline, updateVote, updateAgendaItemChangeRequest]
  );

  // Transition a CR vote to final phase
  const startFinalPhase = useCallback(
    async (itemId: string) => {
      const item = crTimeline.find(i => i.id === itemId);
      if (!item?.vote) return;
      await updateVote({ id: item.vote.id, status: 'final_vote' });
    },
    [crTimeline, updateVote]
  );

  // Close voting on a CR: compute result, process suggestion, save version, advance timeline
  const closeVoting = useCallback(
    async (itemId: string) => {
      const item = crTimeline.find(i => i.id === itemId);
      if (!item?.vote) return;

      // Compute result from final decisions
      const result = getVoteResult(item);

      // Close the vote
      await updateVote({ id: item.vote.id, status: 'closed' });

      // Process the CR vote result server-side (accept/reject suggestion, save version, advance)
      await processCRVoteResult({
        agenda_item_change_request_id: itemId,
        vote_result: result,
      });

      return result;
    },
    [crTimeline, updateVote, processCRVoteResult]
  );

  // Cast a vote on a CR item (handles indicative vs final based on current phase)
  const castCRVote = useCallback(
    async (item: ChangeRequestTimelineRow, choiceId: string) => {
      if (!userId || !item.vote) {
        console.warn('[castCRVote] Missing userId or vote on item', { userId, voteId: item.vote?.id });
        toast.error('Cannot cast vote: missing user or vote data');
        return;
      }
      let voterId = getUserVoter(item)?.id;
      if (!voterId) {
        voterId = crypto.randomUUID();
        await createVoter({
          id: voterId,
          vote_id: item.vote.id,
          user_id: userId,
        });
      }

      const phase = getVotePhase(item);
      const participationId = crypto.randomUUID();
      const participationArgs = {
        id: participationId,
        vote_id: item.vote.id,
        voter_id: voterId,
      };
      const decisions = [{
        id: crypto.randomUUID(),
        vote_id: item.vote.id,
        choice_id: choiceId,
        voter_participation_id: item.vote.visibility === 'public' ? participationId : null,
      }];

      if (phase === 'final_vote') {
        await castFinalVote(participationArgs, decisions);
      } else {
        await castIndicativeVote(participationArgs, decisions);
      }
    },
    [userId, getUserVoter, castIndicativeVote, castFinalVote, createVoter]
  );

  // Check if all CR votes (non-final) are completed
  const allCRsProcessed = useMemo(() => {
    const crItems = crTimeline.filter(item => !item.is_final_vote);
    return crItems.length > 0 && crItems.every(item => item.status === 'completed');
  }, [crTimeline]);

  // Check if timeline is complete (all items including final vote are completed)
  const isTimelineComplete = useMemo(
    () => crTimeline.length > 0 && crTimeline.every(item => item.status === 'completed'),
    [crTimeline]
  );

  return {
    crTimeline,
    currentItem,
    pendingItems,
    completedItems,
    finalVoteItem,
    progress,
    isLoading,
    hasUserVoted,
    getUserVoter,
    getUserSelectedChoiceIds,
    startIndicativePhase,
    startFinalPhase,
    closeVoting,
    castCRVote,
    allCRsProcessed,
    isTimelineComplete,
  };
}

/** Derive the current voting phase from a CR timeline item's vote status. */
export function getVotePhase(item: ChangeRequestTimelineRow): CRVotePhase {
  const status = item.vote?.status;
  if (status === 'final_vote' || status === 'final') return 'final_vote';
  if (status === 'closed') return 'closed';
  return 'indicative';
}

/** Compute the vote result for a CR item using simple majority on final decisions. */
export function getVoteResult(item: ChangeRequestTimelineRow): VoteResult {
  if (!item.vote) return 'tie';

  const choices = item.vote.choices ?? [];
  const finalDecisions = item.vote.final_decisions ?? [];

  const yesChoice = choices.find((c: { label: string | null }) => c.label === 'yes');
  const noChoice = choices.find((c: { label: string | null }) => c.label === 'no');

  const yesCount = yesChoice
    ? finalDecisions.filter((d: { choice_id: string }) => d.choice_id === yesChoice.id).length
    : 0;
  const noCount = noChoice
    ? finalDecisions.filter((d: { choice_id: string }) => d.choice_id === noChoice.id).length
    : 0;

  // Simple majority: yes > no (abstentions ignored)
  if (yesCount > noCount) return 'passed';
  if (noCount > yesCount) return 'rejected';
  return 'tie';
}
