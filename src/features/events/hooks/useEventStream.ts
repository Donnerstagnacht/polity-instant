import { useState, useEffect } from 'react';
import db, { id, tx } from '../../../../db/db';

export function useEventStream(eventId: string) {
  const { user } = db.useAuth();
  const [addingSpeaker, setAddingSpeaker] = useState(false);
  const [removingSpeaker, setRemovingSpeaker] = useState<string | null>(null);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  // Query event and agenda items
  const { data, isLoading } = db.useQuery({
    events: {
      $: {
        where: {
          id: eventId,
        },
      },
      organizer: {},
      agendaItems: {
        creator: {},
        speakerList: {
          user: {},
        },
        election: {
          candidates: {},
          votes: {},
        },
        amendmentVote: {
          changeRequests: {},
          voteEntries: {},
        },
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

  const event = data?.events?.[0];

  // Get current agenda item (in-progress or first pending)
  const agendaItems = event?.agendaItems || [];
  const currentAgendaItem =
    agendaItems.find((item: any) => item.status === 'in-progress') ||
    agendaItems.find((item: any) => item.status === 'pending') ||
    agendaItems.sort((a: any, b: any) => a.order - b.order)[0];

  // Get speaker list for current agenda item, sorted by order
  const speakerList = currentAgendaItem?.speakerList
    ? [...currentAgendaItem.speakerList].sort((a: any, b: any) => a.order - b.order)
    : [];

  // Calculate current time and speaker times
  const getCurrentTime = () => new Date();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const calculateSpeakerTime = (index: number) => {
    const startTime = currentAgendaItem?.startTime
      ? new Date(currentAgendaItem.startTime)
      : currentTime;

    let accumulatedMinutes = 0;
    for (let i = 0; i < index; i++) {
      accumulatedMinutes += speakerList[i]?.time || 0;
    }

    const speakerTime = new Date(startTime.getTime() + accumulatedMinutes * 60000);
    return speakerTime;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Handle adding yourself to speakers list
  const handleAddToSpeakerList = async () => {
    if (!user?.id || !currentAgendaItem?.id) return;

    setAddingSpeaker(true);
    try {
      // Find the maximum order value
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
          agendaItem: currentAgendaItem.id,
        }),
      ]);
    } catch (error) {
      console.error('Error adding to speaker list:', error);
    } finally {
      setAddingSpeaker(false);
    }
  };

  // Handle removing yourself from speakers list
  const handleRemoveFromSpeakerList = async (speakerId: string) => {
    if (!user?.id) return;

    setRemovingSpeaker(speakerId);
    try {
      await db.transact([tx.speakerList[speakerId].delete()]);
    } catch (error) {
      console.error('Error removing from speaker list:', error);
    } finally {
      setRemovingSpeaker(null);
    }
  };

  // Check if user is already in speaker list
  const userSpeaker = speakerList.find((speaker: any) => speaker.user?.id === user?.id);

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

  return {
    event,
    currentAgendaItem,
    speakerList,
    user,
    isLoading,
    addingSpeaker,
    removingSpeaker,
    votingLoading,
    userSpeaker,
    userElectionVotes,
    userAmendmentVotes,
    data,
    handleAddToSpeakerList,
    handleRemoveFromSpeakerList,
    handleElectionVote,
    handleAmendmentVote,
    calculateSpeakerTime,
    formatTime,
  };
}
