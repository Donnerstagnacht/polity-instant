import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useEventStreamData } from '@/zero/events/useEventState';
import {
  calculateSpeakerTime as calcSpeakerTime,
  formatTime,
} from '../logic/eventStreamHelpers';

export function useEventStream(eventId: string) {
  const { user } = useAuth();
  const { addSpeaker, removeSpeaker, castElectionVote, deleteElectionVote } = useAgendaActions();
  const { createVoteEntry, updateVoteEntry } = useAmendmentActions();
  const [addingSpeaker, setAddingSpeaker] = useState(false);
  const [removingSpeaker, setRemovingSpeaker] = useState<string | null>(null);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  // Query event and agenda items
  const { event: eventRaw, electionVotes: electionVotesData, amendmentVoteEntries: amendmentVoteEntriesData, isLoading } = useEventStreamData(eventId);

  const data = {
    electionVotes: electionVotesData,
    amendmentVoteEntries: amendmentVoteEntriesData,
  };

  const event = eventRaw as any;

  // Get current agenda item (in-progress or first pending)
  const agendaItems = event?.agenda_items || [];
  const currentAgendaItem =
    agendaItems.find((item: any) => item.status === 'in-progress') ||
    agendaItems.find((item: any) => item.status === 'pending') ||
    agendaItems.sort((a: any, b: any) => a.order - b.order)[0];

  // Get speaker list for current agenda item, sorted by order
  const speakerList = currentAgendaItem?.speaker_list
    ? [...currentAgendaItem.speaker_list].sort((a: any, b: any) => a.order - b.order)
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
    return calcSpeakerTime(index, speakerList, startTime);
  };

  // Handle adding yourself to speakers list
  const handleAddToSpeakerList = async () => {
    if (!user?.id || !currentAgendaItem?.id) return;

    setAddingSpeaker(true);
    try {
      // Find the maximum order value
      const maxOrder =
        speakerList.length > 0 ? Math.max(...speakerList.map((s: any) => s.order || 0)) : 0;

      const speakerId = crypto.randomUUID();
      await addSpeaker({
        id: speakerId,
        title: 'Speaker',
        time: 3,
        completed: false,
        order_index: maxOrder + 1,
        user_id: user.id,
        agenda_item_id: currentAgendaItem.id,
      });
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
      await removeSpeaker(speakerId);
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
    } finally {
      setVotingLoading(null);
    }
  };

  // Handle amendment vote
  const handleAmendmentVote = async (
    amendmentId: string,
    voteValue: 'yes' | 'no' | 'abstain'
  ) => {
    if (!user) return;

    const voteMap = { yes: 1, no: -1, abstain: 0 } as const;
    setVotingLoading(amendmentId);
    try {
      const existingVote = userAmendmentVotes.find(
        (entry: any) => entry.amendment?.id === amendmentId
      );

      if (existingVote) {
        await updateVoteEntry({
          id: existingVote.id,
          vote: voteMap[voteValue],
        });
      } else {
        const entryId = crypto.randomUUID();
        await createVoteEntry({
          id: entryId,
          vote: voteMap[voteValue],
          amendment_id: amendmentId,
        });
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
