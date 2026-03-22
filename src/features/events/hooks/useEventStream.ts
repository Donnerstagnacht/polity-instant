import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useElectionActions } from '@/zero/elections/useElectionActions';
import { useVoteActions } from '@/zero/votes/useVoteActions';
import { useEventStreamData } from '@/zero/events/useEventState';
import {
  calculateSpeakerTime as calcSpeakerTime,
  formatTime,
} from '../logic/eventStreamHelpers';

export function useEventStream(eventId: string) {
  const { user } = useAuth();
  const { addSpeaker, removeSpeaker } = useAgendaActions();
  const electionActions = useElectionActions();
  const voteActionsHook = useVoteActions();
  const [addingSpeaker, setAddingSpeaker] = useState(false);
  const [removingSpeaker, setRemovingSpeaker] = useState<string | null>(null);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);

  // Query event and agenda items
  const { event: eventRaw, isLoading } = useEventStreamData(eventId);

  const event = eventRaw;

  // Get current agenda item (in-progress or first pending)
  const agendaItems = event?.agenda_items || [];
  const currentAgendaItem =
    agendaItems.find((item) => item.status === 'in-progress') ||
    agendaItems.find((item) => item.status === 'pending') ||
    [...agendaItems].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))[0];

  // Get speaker list for current agenda item, sorted by order
  const speakerList = currentAgendaItem?.speaker_list
    ? [...currentAgendaItem.speaker_list].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
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
    const startTime = currentAgendaItem?.start_time
      ? new Date(currentAgendaItem.start_time)
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
        speakerList.length > 0 ? Math.max(...speakerList.map((s) => s.order_index ?? 0)) : 0;

      const speakerId = crypto.randomUUID();
      await addSpeaker({
        id: speakerId,
        title: 'Speaker',
        time: 3,
        completed: false,
        order_index: maxOrder + 1,
        user_id: user.id,
        agenda_item_id: currentAgendaItem.id,
        start_time: null,
        end_time: null,
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
  const userSpeaker = speakerList.find((speaker) => speaker.user?.id === user?.id);

  // Handle election vote via new election actions
  const handleElectionVote = async (electionId: string, candidateId: string) => {
    if (!user) return;

    setVotingLoading(electionId);
    try {
      // Get the election from current agenda item
      const election = currentAgendaItem?.election?.find(
        (e: { id: string }) => e.id === electionId
      );
      if (!election) return;

      // Find or create elector record
      const existingElector = election.electors?.find(
        (e: { user_id: string }) => e.user_id === user.id
      );
      let electorId = existingElector?.id;
      if (!electorId) {
        electorId = crypto.randomUUID();
        await electionActions.createElector({
          id: electorId,
          election_id: electionId,
          user_id: user.id,
        });
      }

      // Determine phase based on election status
      const isIndicative = election.status === 'indicative';
      const participationId = crypto.randomUUID();
      const selectionId = crypto.randomUUID();

      if (isIndicative) {
        await electionActions.castIndicativeVote(
          { id: participationId, election_id: electionId, elector_id: electorId },
          [{ id: selectionId, election_id: electionId, candidate_id: candidateId, elector_participation_id: participationId }]
        );
      } else {
        await electionActions.castFinalVote(
          { id: participationId, election_id: electionId, elector_id: electorId },
          [{ id: selectionId, election_id: electionId, candidate_id: candidateId, elector_participation_id: participationId }]
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVotingLoading(null);
    }
  };

  // Handle vote (amendment/choice) via new vote actions
  const handleAmendmentVote = async (
    voteId: string,
    choiceId: string
  ) => {
    if (!user) return;

    setVotingLoading(voteId);
    try {
      // Get the vote from current agenda item
      const voteEntity = currentAgendaItem?.votes?.find(
        (v: { id: string }) => v.id === voteId
      );
      if (!voteEntity) return;

      // Find or create voter record
      const existingVoter = voteEntity.voters?.find(
        (v: { user_id: string }) => v.user_id === user.id
      );
      let voterId = existingVoter?.id;
      if (!voterId) {
        voterId = crypto.randomUUID();
        await voteActionsHook.createVoter({
          id: voterId,
          vote_id: voteId,
          user_id: user.id,
        });
      }

      // Determine phase based on vote status
      const isIndicative = voteEntity.status === 'indicative';
      const participationId = crypto.randomUUID();
      const decisionId = crypto.randomUUID();

      if (isIndicative) {
        await voteActionsHook.castIndicativeVote(
          { id: participationId, vote_id: voteId, voter_id: voterId },
          [{ id: decisionId, vote_id: voteId, choice_id: choiceId, voter_participation_id: participationId }]
        );
      } else {
        await voteActionsHook.castFinalVote(
          { id: participationId, vote_id: voteId, voter_id: voterId },
          [{ id: decisionId, vote_id: voteId, choice_id: choiceId, voter_participation_id: participationId }]
        );
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
    handleAddToSpeakerList,
    handleRemoveFromSpeakerList,
    handleElectionVote,
    handleAmendmentVote,
    calculateSpeakerTime,
    formatTime,
  };
}
