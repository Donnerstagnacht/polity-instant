import { useState } from 'react';
import { db, id, tx } from '../../../../db/db';

export function useVoting() {
  const { user } = db.useAuth();
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  const handleElectionVote = async (electionId: string, candidateId: string, existingVote?: any) => {
    if (!user) return;

    setVotingLoading(electionId);
    try {
      if (existingVote) {
        if (existingVote.candidate?.id === candidateId) {
          await db.transact([tx.electionVotes[existingVote.id].delete()]);
        } else {
          const newVoteId = id();
          await db.transact([
            tx.electionVotes[existingVote.id].delete(),
            tx.electionVotes[newVoteId]
              .update({
                createdAt: Date.now(),
              })
              .link({
                voter: user.id,
                election: electionId,
                candidate: candidateId,
              }),
          ]);
        }
      } else {
        const voteId = id();
        await db.transact([
          tx.electionVotes[voteId]
            .update({
              createdAt: Date.now(),
            })
            .link({
              voter: user.id,
              election: electionId,
              candidate: candidateId,
            }),
        ]);
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

    setVotingLoading(amendmentVoteId);
    try {
      if (existingVote) {
        await db.transact([
          tx.amendmentVoteEntries[existingVote.id].update({
            vote: voteValue,
            updatedAt: Date.now(),
          }),
        ]);
      } else {
        const entryId = id();
        await db.transact([
          tx.amendmentVoteEntries[entryId]
            .update({
              vote: voteValue,
              createdAt: Date.now(),
            })
            .link({
              voter: user.id,
              amendmentVote: amendmentVoteId,
            }),
        ]);
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
