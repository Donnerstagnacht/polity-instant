import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/providers/auth-provider'
import { useAgendaState } from '@/zero/agendas/useAgendaState'
import { useAgendaActions } from '@/zero/agendas/useAgendaActions'
import { useElectionState } from '@/zero/elections/useElectionState'
import { useElectionActions } from '@/zero/elections/useElectionActions'
import { useVoteState } from '@/zero/votes/useVoteState'
import { useVoteActions } from '@/zero/votes/useVoteActions'
import { useAgendaItemDetail } from '@/zero/events/useEventState'

export function useEventAgendaItem(eventId: string, agendaItemId: string) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { deleteAgendaItem, addSpeaker } = useAgendaActions()
  const electionActions = useElectionActions()
  const voteActionsHook = useVoteActions()
  const [votingLoading, setVotingLoading] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [addingSpeaker, setAddingSpeaker] = useState(false)

  // Query agenda item with all related data
  const { agendaItem: agendaItemRaw, isLoading: agendaItemLoading } = useAgendaItemDetail(agendaItemId)
  const agendaItem = agendaItemRaw
  const event = agendaItem?.event
  const { agendaItems, isLoading: agendaLoading } = useAgendaState({ eventId })

  // Election state for this agenda item
  const { election, candidates, electors, isLoading: electionLoading } = useElectionState({
    agendaItemId,
  })

  // Vote state for this agenda item
  const { vote, choices, isLoading: voteLoading } = useVoteState({
    agendaItemId,
  })

  // Find user's elector/voter record
  const userElector = electors.find((e) => e.user_id === user?.id)
  const userVoter = vote?.voters?.find((v: { user_id: string }) => v.user_id === user?.id)
  const calculatedAgendaItem = agendaItems.find((item) => item.id === agendaItemId)

  const isLoading = agendaItemLoading || electionLoading || voteLoading || agendaLoading
  const estimatedStartTime = calculatedAgendaItem?.calculated_start_time
    ? new Date(calculatedAgendaItem.calculated_start_time)
    : undefined

  // Handle election vote — cast participation + candidate selection(s)
  const handleElectionVote = async (candidateIds: string[]) => {
    if (!user || !election || !userElector) return

    setVotingLoading(election.id)
    try {
      const isIndicative = election.status === 'indicative'
      const participationId = crypto.randomUUID()
      const participationArgs = {
        id: participationId,
        election_id: election.id,
        elector_id: userElector.id,
      }

      const selections = candidateIds.map((candidateId) => ({
        id: crypto.randomUUID(),
        election_id: election.id,
        candidate_id: candidateId,
        elector_participation_id: election.visibility === 'public' ? participationId : null,
      }))

      if (isIndicative) {
        await electionActions.castIndicativeVote(participationArgs, selections)
      } else {
        await electionActions.castFinalVote(participationArgs, selections)
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVotingLoading(null)
    }
  }

  // Handle amendment/discussion vote — cast participation + choice decision
  const handleAmendmentVote = async (choiceId: string) => {
    if (!user || !vote || !userVoter) return

    setVotingLoading(vote.id)
    try {
      const isIndicative = vote.status === 'indicative'
      const participationId = crypto.randomUUID()
      const participationArgs = {
        id: participationId,
        vote_id: vote.id,
        voter_id: userVoter.id,
      }

      const decisions = [{
        id: crypto.randomUUID(),
        vote_id: vote.id,
        choice_id: choiceId,
        voter_participation_id: vote.visibility === 'public' ? participationId : null,
      }]

      if (isIndicative) {
        await voteActionsHook.castIndicativeVote(participationArgs, decisions)
      } else {
        await voteActionsHook.castFinalVote(participationArgs, decisions)
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVotingLoading(null)
    }
  }

  // Handle delete agenda item
  const handleDelete = async () => {
    if (!user || !agendaItem) return

    setDeleteLoading(true)
    try {
      await deleteAgendaItem(agendaItemId)
      navigate({ to: `/event/${eventId}/agenda` })
    } catch (error) {
      console.error('Error deleting agenda item:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  // Handle adding yourself to speakers list
  const handleAddToSpeakerList = async () => {
    if (!user?.id || !agendaItemId) return

    setAddingSpeaker(true)
    try {
      const speakers = agendaItem?.speaker_list || []
      const maxOrder =
        speakers.length > 0 ? Math.max(...speakers.map((s) => s.order_index ?? 0)) : 0

      const speakerId = crypto.randomUUID()
      await addSpeaker({
        id: speakerId,
        title: 'Speaker',
        time: 3,
        completed: false,
        order_index: maxOrder + 1,
        user_id: user.id,
        agenda_item_id: agendaItemId,
        start_time: null,
        end_time: null,
      })
    } catch (error) {
      console.error('Error adding to speaker list:', error)
    } finally {
      setAddingSpeaker(false)
    }
  }

  return {
    agendaItem,
    event,
    user,
    isLoading,
    votingLoading,
    deleteLoading,
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
  }
}
