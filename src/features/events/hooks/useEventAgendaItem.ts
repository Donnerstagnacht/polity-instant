import { useState } from 'react';
import { useRouter } from 'next/navigation';
import db, { id, tx } from '../../../../db/db';

export function useEventAgendaItem(eventId: string, agendaItemId: string) {
  const router = useRouter();
  const { user } = db.useAuth();
  const [votingLoading, setVotingLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addingSpeaker, setAddingSpeaker] = useState(false);

  // Query agenda item with all related data
  const { data, isLoading } = db.useQuery({
    agendaItems: {
      $: {
        where: {
          id: agendaItemId,
        },
      },
      creator: {},
      event: {
        organizer: {},
      },
      election: {
        candidates: {},
        votes: {},
      },
      amendmentVote: {
        changeRequests: {},
        voteEntries: {},
      },
      speakerList: {
        user: {},
      },
    },
    electionVotes: {
      voter: {},
      candidate: {},
      election: {},
    },
    amendmentVoteEntries: {
      voter: {},
      amendmentVote: {},
    },
  });

  const agendaItem = data?.agendaItems?.[0];
  const event = agendaItem?.event;

  // Get user's existing votes
  const userElectionVotes = (data?.electionVotes || []).filter(
    (vote: any) => vote.voter?.id === user?.id
  );
  const userAmendmentVotes = (data?.amendmentVoteEntries || []).filter(
    (entry: any) => entry.voter?.id === user?.id
  );

  // Handle election vote
  const handleElectionVote = async (electionId: string, candidateId: string) => {
    if (!user) return;

    setVotingLoading(electionId);
    try {
      const existingVote = userElectionVotes.find((vote: any) => vote.election?.id === electionId);

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
    } finally {
      setVotingLoading(null);
    }
  };

  // Handle amendment vote
  const handleAmendmentVote = async (
    amendmentVoteId: string,
    voteValue: 'yes' | 'no' | 'abstain'
  ) => {
    if (!user) return;

    setVotingLoading(amendmentVoteId);
    try {
      const existingVote = userAmendmentVotes.find(
        (entry: any) => entry.amendmentVote?.id === amendmentVoteId
      );

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
    } finally {
      setVotingLoading(null);
    }
  };

  // Handle delete agenda item
  const handleDelete = async () => {
    if (!user || !agendaItem) return;

    setDeleteLoading(true);
    try {
      await db.transact([tx.agendaItems[agendaItemId].delete()]);
      router.push(`/event/${eventId}/agenda`);
    } catch (error) {
      console.error('Error deleting agenda item:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle adding yourself to speakers list
  const handleAddToSpeakerList = async () => {
    if (!user?.id || !agendaItemId) return;

    setAddingSpeaker(true);
    try {
      // Find the maximum order value
      const speakerList = agendaItem?.speakerList || [];
      const maxOrder =
        speakerList.length > 0 ? Math.max(...speakerList.map((s: any) => s.order || 0)) : 0;

      const speakerId = id();
      await db.transact([
        tx.speakerList[speakerId].update({
          title: 'Speaker',
          time: 3, // Default 3 minutes
          completed: false,
          order: maxOrder + 1,
          createdAt: new Date(),
        }),
        tx.speakerList[speakerId].link({
          user: user.id,
          agendaItem: agendaItemId,
        }),
      ]);
    } catch (error) {
      console.error('Error adding to speaker list:', error);
    } finally {
      setAddingSpeaker(false);
    }
  };

  return {
    agendaItem,
    event,
    user,
    isLoading,
    votingLoading,
    deleteLoading,
    addingSpeaker,
    userElectionVotes,
    userAmendmentVotes,
    data,
    handleElectionVote,
    handleAmendmentVote,
    handleDelete,
    handleAddToSpeakerList,
  };
}
