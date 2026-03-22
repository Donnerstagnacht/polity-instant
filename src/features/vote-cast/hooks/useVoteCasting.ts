/**
 * useVoteCasting Hook
 *
 * Composition hook that wraps the correct data-layer action hooks
 * and handles the 3-phase voting flow: indicative → final → closed.
 *
 * For elections: uses castIndicativeVote / castFinalVote from useElectionActions.
 * For amendment votes: uses castIndicativeVote / castFinalVote from useVoteActions.
 */

import { useCallback, useMemo } from 'react'
import { useElectionActions } from '@/zero/elections/useElectionActions'
import { useVoteActions } from '@/zero/votes/useVoteActions'
import { usePermissions } from '@/zero/rbac'
import { useAuth } from '@/providers/auth-provider'
import { canUserVote, canUserBeCandidate, type VotingPhase } from '../logic/votePhaseHelpers'

interface UseVoteCastingOptions {
  agendaItemId: string
  electionId?: string
  voteId?: string
  eventId?: string
  /** Election or vote status — drives phase derivation */
  status?: string | null
  /** User's elector record id (for elections) */
  electorId?: string
  /** User's voter record id (for votes) */
  voterId?: string
  /** Whether the election/vote is public */
  isPublic?: boolean
}

export function useVoteCasting(options: UseVoteCastingOptions) {
  const {
    electionId,
    voteId,
    eventId,
    status,
    electorId,
    voterId,
    isPublic = true,
  } = options
  const { user } = useAuth()
  const userId = user?.id

  const { can } = usePermissions({ eventId })

  const electionActions = useElectionActions()
  const voteActions = useVoteActions()

  // Derive phase from election/vote status
  const phase: VotingPhase = useMemo(() => {
    if (status === 'final' || status === 'final_vote') return 'final_vote'
    if (status === 'closed') return 'closed'
    return 'indication'
  }, [status])

  const isIndicationPhase = phase === 'indication'
  const isFinalVotePhase = phase === 'final_vote'
  const isClosed = phase === 'closed'

  // Permissions
  const userCanVote = canUserVote({ can }, phase)
  const userCanBeCandidate = canUserBeCandidate({ can })
  const canManageVoting = can('manage', 'agendaItems')

  // Cast an election vote (creates participation + selection(s))
  const castElectionVote = useCallback(
    async (candidateIds: string[]) => {
      if (!userId || !userCanVote || !electionId) return

      let resolvedElectorId = electorId
      if (!resolvedElectorId) {
        resolvedElectorId = crypto.randomUUID()
        await electionActions.createElector({
          id: resolvedElectorId,
          election_id: electionId,
          user_id: userId,
        })
      }

      const participationId = crypto.randomUUID()
      const participationArgs = {
        id: participationId,
        election_id: electionId,
        elector_id: resolvedElectorId,
      }

      const selections = candidateIds.map((candidateId) => ({
        id: crypto.randomUUID(),
        election_id: electionId,
        candidate_id: candidateId,
        elector_participation_id: isPublic ? participationId : null,
      }))

      if (isIndicationPhase) {
        await electionActions.castIndicativeVote(participationArgs, selections)
      } else {
        await electionActions.castFinalVote(participationArgs, selections)
      }
    },
    [userId, userCanVote, electionId, electorId, isPublic, isIndicationPhase, electionActions],
  )

  // Cast an amendment/discussion vote (creates participation + decision)
  const castAmendmentVote = useCallback(
    async (choiceId: string) => {
      if (!userId || !userCanVote || !voteId) return

      let resolvedVoterId = voterId
      if (!resolvedVoterId) {
        resolvedVoterId = crypto.randomUUID()
        await voteActions.createVoter({
          id: resolvedVoterId,
          vote_id: voteId,
          user_id: userId,
        })
      }

      const participationId = crypto.randomUUID()
      const participationArgs = {
        id: participationId,
        vote_id: voteId,
        voter_id: resolvedVoterId,
      }

      const decisions = [{
        id: crypto.randomUUID(),
        vote_id: voteId,
        choice_id: choiceId,
        voter_participation_id: isPublic ? participationId : null,
      }]

      if (isIndicationPhase) {
        await voteActions.castIndicativeVote(participationArgs, decisions)
      } else {
        await voteActions.castFinalVote(participationArgs, decisions)
      }
    },
    [userId, userCanVote, voteId, voterId, isPublic, isIndicationPhase, voteActions],
  )

  // Advance election/vote phase via status update
  const advanceElectionPhase = useCallback(
    async (newStatus: string) => {
      if (!canManageVoting || !electionId) return
      await electionActions.updateElection({ id: electionId, status: newStatus })
    },
    [canManageVoting, electionId, electionActions],
  )

  const advanceVotePhase = useCallback(
    async (newStatus: string) => {
      if (!canManageVoting || !voteId) return
      await voteActions.updateVote({ id: voteId, status: newStatus })
    },
    [canManageVoting, voteId, voteActions],
  )

  return {
    // Phase
    phase,
    isIndicationPhase,
    isFinalVotePhase,
    isClosed,

    // Permissions
    userCanVote,
    userCanBeCandidate,
    canManageVoting,

    // Loading
    isLoading: false,

    // Actions
    castAmendmentVote,
    castElectionVote,
    advanceElectionPhase,
    advanceVotePhase,
  }
}
