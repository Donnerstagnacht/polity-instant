import { useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { usePermissions } from '@/zero/rbac'
import { useAgendaActions } from '@/zero/agendas/useAgendaActions'
import { useElectionActions } from '@/zero/elections/useElectionActions'
import { useVoteActions } from '@/zero/votes/useVoteActions'
import { useVoteCasting } from '@/features/vote-cast/hooks/useVoteCasting'
import { notifyCandidateAdded } from '@/features/notifications/utils/notification-helpers'
import type { ElectionByAgendaItemRow } from '@/zero/elections/queries'
import type { VoteByAgendaItemRow } from '@/zero/votes/queries'

interface AgendaItem {
  id: string
  type: string | null
  status: string | null
  voting_phase?: string | null
  speaker_list?: ReadonlyArray<{
    readonly id: string
    readonly user_id?: string | null
    readonly user?: { readonly id: string } | null
    readonly completed?: boolean | null
  }>
}

interface UseAgendaActionBarOptions {
  eventId: string
  currentAgendaItem?: AgendaItem | null
  eventTitle?: string
  /** Election data from useElectionState */
  election?: ElectionByAgendaItemRow | null
  /** Vote data from useVoteState */
  vote?: VoteByAgendaItemRow | null
  /** User's elector record id */
  electorId?: string
  /** User's voter record id */
  voterId?: string
}

export function useAgendaActionBar(options: UseAgendaActionBarOptions) {
  const { eventId, currentAgendaItem, eventTitle, election, vote, electorId, voterId } = options
  const { user } = useAuth()
  const { can, canVote, canBeCandidate } = usePermissions({ eventId })

  const canManageAgenda = can('manage', 'agendaItems')
  const hasVotingRight = canVote()
  const hasCandidateRight = canBeCandidate()

  const { addSpeaker, removeSpeaker, updateAgendaItem } = useAgendaActions()
  const electionActions = useElectionActions()
  const voteActionsHook = useVoteActions()

  const [speakerLoading, setSpeakerLoading] = useState(false)
  const [candidateLoading, setCandidateLoading] = useState(false)
  const [voteDialogOpen, setVoteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Vote casting hook
  const voteCasting = useVoteCasting({
    agendaItemId: currentAgendaItem?.id ?? '',
    electionId: election?.id,
    voteId: vote?.id,
    eventId,
    status: currentAgendaItem?.voting_phase ?? election?.status ?? vote?.status,
    electorId,
    voterId,
    isPublic: election?.is_public ?? vote?.is_public ?? true,
  })

  // Speaker list membership (only active / not-completed entries block rejoining)
  const isUserInSpeakerList = useMemo(() => {
    if (!user?.id || !currentAgendaItem?.speaker_list) return false
    return currentAgendaItem.speaker_list.some(
      (s) => (s.user?.id === user.id || s.user_id === user.id) && !s.completed,
    )
  }, [user?.id, currentAgendaItem?.speaker_list])

  // Candidate status
  const isUserCandidate = useMemo(() => {
    if (!user?.id || !election?.candidates) return false
    return election.candidates.some(
      (c: { user_id?: string | null; user?: { id: string } | null }) =>
        c.user?.id === user.id || c.user_id === user.id,
    )
  }, [user?.id, election?.candidates])

  // Handlers
  const handleJoinSpeakerList = useCallback(async () => {
    if (!user?.id || !currentAgendaItem?.id) return
    setSpeakerLoading(true)
    try {
      await addSpeaker({
        id: crypto.randomUUID(),
        agenda_item_id: currentAgendaItem.id,
        user_id: user.id,
        title: null,
        order_index: (currentAgendaItem.speaker_list?.length ?? 0) + 1,
        time: 3,
        completed: false,
        start_time: null,
        end_time: null,
      })
    } catch {
      // toast handled in useAgendaActions
    } finally {
      setSpeakerLoading(false)
    }
  }, [user?.id, currentAgendaItem?.id, currentAgendaItem?.speaker_list?.length, addSpeaker])

  const handleLeaveSpeakerList = useCallback(async () => {
    if (!user?.id || !currentAgendaItem?.speaker_list) return
    const userSpeaker = currentAgendaItem.speaker_list.find(
      (s) => (s.user?.id === user.id || s.user_id === user.id) && !s.completed,
    )
    if (!userSpeaker) return
    setSpeakerLoading(true)
    try {
      await removeSpeaker(userSpeaker.id)
    } catch {
      // toast handled in useAgendaActions
    } finally {
      setSpeakerLoading(false)
    }
  }, [user?.id, currentAgendaItem?.speaker_list, removeSpeaker])

  const handleBecomeCandidate = useCallback(async () => {
    if (!user?.id || !election?.id || !hasCandidateRight) return
    setCandidateLoading(true)
    try {
      const candidateOrder = (election.candidates?.length ?? 0) + 1
      await electionActions.addCandidate({
        id: crypto.randomUUID(),
        name: user.email || 'Candidate',
        description: '',
        image_url: '',
        order_index: candidateOrder,
        status: 'nominated',
        user_id: user.id,
        election_id: election.id,
      })
      await notifyCandidateAdded({
        senderId: user.id,
        eventId,
        eventTitle: eventTitle || 'Event',
        candidateName: user.email || 'Candidate',
      })
    } catch {
      // toast handled in useElectionActions
    } finally {
      setCandidateLoading(false)
    }
  }, [user?.id, user?.email, election?.id, election?.candidates?.length, hasCandidateRight, eventTitle, eventId, electionActions])

  const handleWithdrawCandidacy = useCallback(async () => {
    if (!user?.id || !election?.candidates) return
    const userCandidate = election.candidates.find(
      (c: { user_id?: string | null; user?: { id: string } | null }) =>
        c.user?.id === user.id || c.user_id === user.id,
    )
    if (!userCandidate) return
    setCandidateLoading(true)
    try {
      await electionActions.deleteCandidate(userCandidate.id)
    } catch {
      // toast handled in useElectionActions
    } finally {
      setCandidateLoading(false)
    }
  }, [user?.id, election?.candidates, electionActions])

  const handleStartFinalVote = useCallback(async () => {
    if (!canManageAgenda) return
    if (election?.id) {
      await electionActions.updateElection({
        id: election.id,
        status: 'final',
        closing_end_time: election.closing_duration_seconds
          ? Date.now() + election.closing_duration_seconds * 1000
          : null,
      })
    } else if (vote?.id) {
      await voteActionsHook.updateVote({
        id: vote.id,
        status: 'final',
        closing_end_time: vote.closing_duration_seconds
          ? Date.now() + vote.closing_duration_seconds * 1000
          : null,
      })
    }

    if (currentAgendaItem?.id) {
      await updateAgendaItem({
        id: currentAgendaItem.id,
        voting_phase: 'final_vote',
      })
    }
  }, [canManageAgenda, currentAgendaItem?.id, election, vote, electionActions, voteActionsHook, updateAgendaItem])

  const handleCloseFinalVote = useCallback(async () => {
    if (!canManageAgenda) return
    if (election?.id) {
      await electionActions.updateElection({ id: election.id, status: 'closed' })
    } else if (vote?.id) {
      await voteActionsHook.updateVote({ id: vote.id, status: 'closed' })
    }

    if (currentAgendaItem?.id) {
      await updateAgendaItem({
        id: currentAgendaItem.id,
        voting_phase: 'closed',
      })
    }
  }, [canManageAgenda, currentAgendaItem?.id, election, vote, electionActions, voteActionsHook, updateAgendaItem])

  const handleVoteClick = useCallback(() => {
    setVoteDialogOpen(true)
  }, [])

  const handleEditClick = useCallback(() => {
    setEditDialogOpen(true)
  }, [])

  return {
    // Permissions
    canManageAgenda,
    hasVotingRight,
    hasCandidateRight,

    // State
    isUserInSpeakerList,
    isUserCandidate,
    speakerLoading,
    candidateLoading,
    voteDialogOpen,
    setVoteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,

    // Vote casting (for dialog)
    voteCasting,

    // Handlers
    handleJoinSpeakerList,
    handleLeaveSpeakerList,
    handleBecomeCandidate,
    handleWithdrawCandidacy,
    handleStartFinalVote,
    handleCloseFinalVote,
    handleVoteClick,
    handleEditClick,
  }
}
