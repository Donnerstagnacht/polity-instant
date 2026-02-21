import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';

export function useVoting() {
  const { user } = useAuth();
  const { castElectionVote, deleteElectionVote } = useAgendaActions();
  const { createVoteEntry, updateVoteEntry } = useAmendmentActions();
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  const handleElectionVote = async (electionId: string, candidateId: string, existingVote?: any) => {
    if (!user) return;

    setVotingLoading(electionId);
    try {
      if (existingVote) {
        if (existingVote.candidate?.id === candidateId) {
          await deleteElectionVote(existingVote.id);
        } else {
          const newVoteId = crypto.randomUUID();
          await deleteElectionVote(existingVote.id);
          await castElectionVote({
            id: newVoteId,
            election_id: electionId,
            candidate_id: candidateId,
            is_indication: false,
            indicated_at: 0,
          });
        }
      } else {
        const voteId = crypto.randomUUID();
        await castElectionVote({
          id: voteId,
          election_id: electionId,
          candidate_id: candidateId,
          is_indication: false,
          indicated_at: 0,
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    } finally {
      setVotingLoading(null);
    }
  };

  const handleAmendmentVote = async (
    amendmentVoteId: string,
    voteValue: 'yes' | 'no' | 'abstain',
    existingVote?: any
  ) => {
    if (!user) return;

    const voteMap: Record<string, number> = { yes: 1, no: -1, abstain: 0 };
    const numericVote = voteMap[voteValue] ?? 0;

    setVotingLoading(amendmentVoteId);
    try {
      if (existingVote) {
        await updateVoteEntry({
          id: existingVote.id,
          vote: numericVote,
        });
      } else {
        const entryId = crypto.randomUUID();
        await createVoteEntry({
          id: entryId,
          vote: numericVote,
          amendment_id: amendmentVoteId,
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    } finally {
      setVotingLoading(null);
    }
  };

  return {
    handleElectionVote,
    handleAmendmentVote,
    votingLoading,
  };
}
