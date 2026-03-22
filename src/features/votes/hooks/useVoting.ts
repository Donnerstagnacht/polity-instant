import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useElectionActions } from '@/zero/elections/useElectionActions';
import { useVoteActions } from '@/zero/votes/useVoteActions';

export function useVoting() {
  const { user } = useAuth();
  const { castIndicativeVote: castElectionIndicative, castFinalVote: castElectionFinal, createElector } = useElectionActions();
  const { castIndicativeVote: castVoteIndicative, castFinalVote: castVoteFinal, createVoter } = useVoteActions();
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  const handleElectionVote = async (
    electionId: string,
    candidateId: string,
    options?: { isIndicative?: boolean; electorId?: string }
  ) => {
    if (!user) return;

    setVotingLoading(electionId);
    try {
      const electorId = options?.electorId ?? crypto.randomUUID();
      const participationId = crypto.randomUUID();
      const participationArgs = {
        id: participationId,
        election_id: electionId,
        elector_id: electorId,
      };
      const selections = [{
        id: crypto.randomUUID(),
        election_id: electionId,
        candidate_id: candidateId,
        elector_participation_id: participationId,
      }];

      if (options?.isIndicative !== false) {
        await castElectionIndicative(participationArgs, selections);
      } else {
        await castElectionFinal(participationArgs, selections);
      }
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    } finally {
      setVotingLoading(null);
    }
  };

  const handleAmendmentVote = async (
    voteId: string,
    choiceId: string,
    options?: { isIndicative?: boolean; voterId?: string }
  ) => {
    if (!user) return;

    setVotingLoading(voteId);
    try {
      const voterId = options?.voterId ?? crypto.randomUUID();
      const participationId = crypto.randomUUID();
      const participationArgs = {
        id: participationId,
        vote_id: voteId,
        voter_id: voterId,
      };
      const decisions = [{
        id: crypto.randomUUID(),
        vote_id: voteId,
        choice_id: choiceId,
        voter_participation_id: participationId,
      }];

      if (options?.isIndicative !== false) {
        await castVoteIndicative(participationArgs, decisions);
      } else {
        await castVoteFinal(participationArgs, decisions);
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
