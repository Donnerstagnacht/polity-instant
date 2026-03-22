import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

/**
 * Action hook for vote mutations.
 * Every function is a thin wrapper around a custom mutator + sonner toast.
 */
export function useVoteActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── Votes ──────────────────────────────────────────────────────────

  const createVote = useCallback(
    async (args: Parameters<typeof mutators.votes.createVote>[0]) => {
      try {
        const result = zero.mutate(mutators.votes.createVote(args))
        await serverConfirmed(result)
        toast.success(t('common.agendaToasts.voteCreated'))
      } catch (error) {
        console.error('Failed to create vote:', error)
        toast.error(t('common.agendaToasts.voteCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateVote = useCallback(
    async (args: Parameters<typeof mutators.votes.updateVote>[0]) => {
      try {
        const result = zero.mutate(mutators.votes.updateVote(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update vote:', error)
        toast.error(t('common.agendaToasts.voteUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteVote = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.votes.deleteVote({ id }))
        await serverConfirmed(result)
        toast.success(t('common.agendaToasts.voteDeleted'))
      } catch (error) {
        console.error('Failed to delete vote:', error)
        toast.error(t('common.agendaToasts.voteDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Vote Choices ───────────────────────────────────────────────────

  const createVoteChoice = useCallback(
    async (args: Parameters<typeof mutators.votes.createVoteChoice>[0]) => {
      try {
        const result = zero.mutate(mutators.votes.createVoteChoice(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to create vote choice:', error)
        throw error
      }
    },
    [zero]
  )

  const updateVoteChoice = useCallback(
    async (args: Parameters<typeof mutators.votes.updateVoteChoice>[0]) => {
      try {
        const result = zero.mutate(mutators.votes.updateVoteChoice(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update vote choice:', error)
        throw error
      }
    },
    [zero]
  )

  const deleteVoteChoice = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.votes.deleteVoteChoice({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete vote choice:', error)
        throw error
      }
    },
    [zero]
  )

  // ── Voters ─────────────────────────────────────────────────────────

  const createVoter = useCallback(
    async (args: Parameters<typeof mutators.votes.createVoter>[0]) => {
      try {
        const result = zero.mutate(mutators.votes.createVoter(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to create voter:', error)
        throw error
      }
    },
    [zero]
  )

  const deleteVoter = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.votes.deleteVoter({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete voter:', error)
        throw error
      }
    },
    [zero]
  )

  // ── Indicative Voting ──────────────────────────────────────────────

  const castIndicativeVote = useCallback(
    async (
      participationArgs: Parameters<typeof mutators.votes.castIndicativeVote>[0],
      decisions: Parameters<typeof mutators.votes.createIndicativeChoiceDecision>[0][]
    ) => {
      try {
        const participationResult = zero.mutate(
          mutators.votes.castIndicativeVote(participationArgs)
        )
        await serverConfirmed(participationResult)

        for (const decision of decisions) {
          const decisionResult = zero.mutate(
            mutators.votes.createIndicativeChoiceDecision(decision)
          )
          await serverConfirmed(decisionResult)
        }

        toast.success(t('common.agendaToasts.voteCast'))
      } catch (error) {
        console.error('Failed to cast indicative vote:', error)
        toast.error(t('common.agendaToasts.voteCastFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Final Voting ───────────────────────────────────────────────────

  const castFinalVote = useCallback(
    async (
      participationArgs: Parameters<typeof mutators.votes.castFinalVote>[0],
      decisions: Parameters<typeof mutators.votes.createFinalChoiceDecision>[0][]
    ) => {
      try {
        const participationResult = zero.mutate(
          mutators.votes.castFinalVote(participationArgs)
        )
        await serverConfirmed(participationResult)

        for (const decision of decisions) {
          const decisionResult = zero.mutate(
            mutators.votes.createFinalChoiceDecision(decision)
          )
          await serverConfirmed(decisionResult)
        }

        toast.success(t('common.agendaToasts.voteCast'))
      } catch (error) {
        console.error('Failed to cast final vote:', error)
        toast.error(t('common.agendaToasts.voteCastFailed'))
        throw error
      }
    },
    [zero]
  )

  return {
    // Votes
    createVote,
    updateVote,
    deleteVote,

    // Choices
    createVoteChoice,
    updateVoteChoice,
    deleteVoteChoice,

    // Voters
    createVoter,
    deleteVoter,

    // Voting
    castIndicativeVote,
    castFinalVote,
  }
}
