import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/providers/auth-provider';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useAgendaItemDetail } from '@/zero/events/useEventState';

export function useEventAgendaItem(eventId: string, agendaItemId: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteElectionVote, castElectionVote, deleteAgendaItem, addSpeaker } = useAgendaActions();
  const { createVoteEntry, updateVoteEntry } = useAmendmentActions();
  const [votingLoading, setVotingLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addingSpeaker, setAddingSpeaker] = useState(false);

  // Query agenda item with all related data
  const { agendaItem: agendaItemRaw, electionVotes, amendmentVoteEntries, isLoading } = useAgendaItemDetail(agendaItemId);
  const data = {
    agendaItems: agendaItemRaw ? [agendaItemRaw] : [],
    electionVotes,
    amendmentVoteEntries,
  };

  const agendaItem = agendaItemRaw;
  const event = agendaItem?.event;

  // Get user's existing votes
  const userElectionVotes = (data?.electionVotes || []).filter(
    (vote) => vote.voter?.id === user?.id
  );
  const userAmendmentVotes = (data?.amendmentVoteEntries || []).filter(
    (entry) => entry.user?.id === user?.id
  );

  // Handle election vote
  const handleElectionVote = async (electionId: string, candidateId: string) => {
    if (!user) return;

    setVotingLoading(electionId);
    try {
      const existingVote = userElectionVotes.find((vote) => vote.election?.id === electionId);

      // Determine if this is an indication vote based on agenda item status
      const isIndicationVote = agendaItem?.status === 'planned';

      if (existingVote) {
        if (existingVote.candidate?.id === candidateId) {
          await deleteElectionVote(existingVote.id);
        } else {
          const newVoteId = crypto.randomUUID();
          await deleteElectionVote(existingVote.id);
          await castElectionVote({
            id: newVoteId,
            is_indication: isIndicationVote,
            indicated_at: isIndicationVote ? Date.now() : 0,
            election_id: electionId,
            candidate_id: candidateId,
          });
        }
      } else {
        const voteId = crypto.randomUUID();
        await castElectionVote({
          id: voteId,
          is_indication: isIndicationVote,
          indicated_at: isIndicationVote ? Date.now() : 0,
          election_id: electionId,
          candidate_id: candidateId,
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
    amendmentVoteId: string,
    voteValue: 'yes' | 'no' | 'abstain'
  ) => {
    if (!user) return;

    setVotingLoading(amendmentVoteId);
    try {
      const existingVote = userAmendmentVotes.find(
        (entry) => entry.amendment?.id === amendmentVoteId
      );

      const voteMap = { yes: 1, no: -1, abstain: 0 } as const;
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
          amendment_id: amendmentVoteId,
        });
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
      await deleteAgendaItem(agendaItemId);
      navigate({ to: `/event/${eventId}/agenda` });
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
      const speakers = agendaItem?.speaker_list || [];
      const maxOrder =
        speakers.length > 0 ? Math.max(...speakers.map((s) => s.order_index || 0)) : 0;

      const speakerId = crypto.randomUUID();
      await addSpeaker({
        id: speakerId,
        title: 'Speaker',
        time: 3,
        completed: false,
        order_index: maxOrder + 1,
        user_id: user.id,
        agenda_item_id: agendaItemId,
      });
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
