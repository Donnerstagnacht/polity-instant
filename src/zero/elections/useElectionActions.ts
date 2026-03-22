import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

/**
 * Action hook for election mutations.
 * Every function is a thin wrapper around a custom mutator + sonner toast.
 */
export function useElectionActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── Elections ──────────────────────────────────────────────────────

  const createElection = useCallback(
    async (args: Parameters<typeof mutators.elections.createElection>[0]) => {
      try {
        const result = zero.mutate(mutators.elections.createElection(args))
        await serverConfirmed(result)
        toast.success(t('common.agendaToasts.electionCreated'))
      } catch (error) {
        console.error('Failed to create election:', error)
        toast.error(t('common.agendaToasts.electionCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateElection = useCallback(
    async (args: Parameters<typeof mutators.elections.updateElection>[0]) => {
      try {
        const result = zero.mutate(mutators.elections.updateElection(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update election:', error)
        toast.error(t('common.agendaToasts.electionUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteElection = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.elections.deleteElection({ id }))
        await serverConfirmed(result)
        toast.success(t('common.agendaToasts.electionDeleted'))
      } catch (error) {
        console.error('Failed to delete election:', error)
        toast.error(t('common.agendaToasts.electionDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Candidates ─────────────────────────────────────────────────────

  const addCandidate = useCallback(
    async (args: Parameters<typeof mutators.elections.addCandidate>[0]) => {
      try {
        const result = zero.mutate(mutators.elections.addCandidate(args))
        await serverConfirmed(result)
        toast.success(t('common.agendaToasts.candidateAdded'))
      } catch (error) {
        console.error('Failed to add candidate:', error)
        toast.error(t('common.agendaToasts.candidateAddFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateCandidate = useCallback(
    async (args: Parameters<typeof mutators.elections.updateCandidate>[0]) => {
      try {
        const result = zero.mutate(mutators.elections.updateCandidate(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update candidate:', error)
        toast.error(t('common.agendaToasts.candidateUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteCandidate = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.elections.deleteCandidate({ id }))
        await serverConfirmed(result)
        toast.success(t('common.agendaToasts.candidateRemoved'))
      } catch (error) {
        console.error('Failed to delete candidate:', error)
        toast.error(t('common.agendaToasts.candidateRemoveFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Electors ───────────────────────────────────────────────────────

  const createElector = useCallback(
    async (args: Parameters<typeof mutators.elections.createElector>[0]) => {
      try {
        const result = zero.mutate(mutators.elections.createElector(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to create elector:', error)
        throw error
      }
    },
    [zero]
  )

  const deleteElector = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.elections.deleteElector({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete elector:', error)
        throw error
      }
    },
    [zero]
  )

  // ── Indicative Voting ──────────────────────────────────────────────

  const castIndicativeVote = useCallback(
    async (
      participationArgs: Parameters<typeof mutators.elections.castIndicativeElectionVote>[0],
      selections: Parameters<typeof mutators.elections.createIndicativeCandidateSelection>[0][]
    ) => {
      try {
        const participationResult = zero.mutate(
          mutators.elections.castIndicativeElectionVote(participationArgs)
        )
        await serverConfirmed(participationResult)

        for (const selection of selections) {
          const selectionResult = zero.mutate(
            mutators.elections.createIndicativeCandidateSelection(selection)
          )
          await serverConfirmed(selectionResult)
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
      participationArgs: Parameters<typeof mutators.elections.castFinalElectionVote>[0],
      selections: Parameters<typeof mutators.elections.createFinalCandidateSelection>[0][]
    ) => {
      try {
        const participationResult = zero.mutate(
          mutators.elections.castFinalElectionVote(participationArgs)
        )
        await serverConfirmed(participationResult)

        for (const selection of selections) {
          const selectionResult = zero.mutate(
            mutators.elections.createFinalCandidateSelection(selection)
          )
          await serverConfirmed(selectionResult)
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
    // Elections
    createElection,
    updateElection,
    deleteElection,

    // Candidates
    addCandidate,
    updateCandidate,
    deleteCandidate,

    // Electors
    createElector,
    deleteElector,

    // Voting
    castIndicativeVote,
    castFinalVote,
  }
}
