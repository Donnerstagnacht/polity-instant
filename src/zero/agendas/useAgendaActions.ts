import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'

/**
 * Action hook for agenda mutations.
 * Every function is a thin wrapper around a custom mutator + sonner toast.
 */
export function useAgendaActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── Agenda Items ───────────────────────────────────────────────────
  const createAgendaItem = useCallback(
    async (args: Parameters<typeof mutators.agendas.createAgendaItem>[0]) => {
      try {
        await zero.mutate(mutators.agendas.createAgendaItem(args))
        toast.success(t('common.agendaToasts.itemCreated'))
      } catch (error) {
        console.error('Failed to create agenda item:', error)
        toast.error(t('common.agendaToasts.itemCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateAgendaItem = useCallback(
    async (args: Parameters<typeof mutators.agendas.updateAgendaItem>[0]) => {
      try {
        await zero.mutate(mutators.agendas.updateAgendaItem(args))
      } catch (error) {
        console.error('Failed to update agenda item:', error)
        toast.error(t('common.agendaToasts.itemUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteAgendaItem = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.agendas.deleteAgendaItem({ id }))
        toast.success(t('common.agendaToasts.itemDeleted'))
      } catch (error) {
        console.error('Failed to delete agenda item:', error)
        toast.error(t('common.agendaToasts.itemDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  const reorderAgendaItems = useCallback(
    async (args: Parameters<typeof mutators.agendas.reorderAgendaItems>[0]) => {
      try {
        await zero.mutate(mutators.agendas.reorderAgendaItems(args))
      } catch (error) {
        console.error('Failed to reorder agenda items:', error)
        toast.error(t('common.agendaToasts.reorderFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Speaker List ───────────────────────────────────────────────────
  const addSpeaker = useCallback(
    async (args: Parameters<typeof mutators.agendas.addSpeaker>[0]) => {
      try {
        await zero.mutate(mutators.agendas.addSpeaker(args))
        toast.success(t('common.agendaToasts.speakerAdded'))
      } catch (error) {
        console.error('Failed to add speaker:', error)
        toast.error(t('common.agendaToasts.speakerAddFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateSpeaker = useCallback(
    async (args: Parameters<typeof mutators.agendas.updateSpeaker>[0]) => {
      try {
        await zero.mutate(mutators.agendas.updateSpeaker(args))
      } catch (error) {
        console.error('Failed to update speaker:', error)
        toast.error(t('common.agendaToasts.speakerUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const removeSpeaker = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.agendas.removeSpeaker({ id }))
        toast.success(t('common.agendaToasts.speakerRemoved'))
      } catch (error) {
        console.error('Failed to remove speaker:', error)
        toast.error(t('common.agendaToasts.speakerRemoveFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Elections ──────────────────────────────────────────────────────
  const createElection = useCallback(
    async (args: Parameters<typeof mutators.agendas.createElection>[0]) => {
      try {
        await zero.mutate(mutators.agendas.createElection(args))
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
    async (args: Parameters<typeof mutators.agendas.updateElection>[0]) => {
      try {
        await zero.mutate(mutators.agendas.updateElection(args))
      } catch (error) {
        console.error('Failed to update election:', error)
        toast.error(t('common.agendaToasts.electionUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Election Candidates ────────────────────────────────────────────
  const addCandidate = useCallback(
    async (args: Parameters<typeof mutators.agendas.addCandidate>[0]) => {
      try {
        await zero.mutate(mutators.agendas.addCandidate(args))
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
    async (args: Parameters<typeof mutators.agendas.updateCandidate>[0]) => {
      try {
        await zero.mutate(mutators.agendas.updateCandidate(args))
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
        await zero.mutate(mutators.agendas.deleteCandidate({ id }))
        toast.success(t('common.agendaToasts.candidateRemoved'))
      } catch (error) {
        console.error('Failed to delete candidate:', error)
        toast.error(t('common.agendaToasts.candidateRemoveFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Election Votes ─────────────────────────────────────────────────
  const castElectionVote = useCallback(
    async (args: Parameters<typeof mutators.agendas.castElectionVote>[0]) => {
      try {
        await zero.mutate(mutators.agendas.castElectionVote(args))
        toast.success(t('common.agendaToasts.voteCast'))
      } catch (error) {
        console.error('Failed to cast vote:', error)
        toast.error(t('common.agendaToasts.voteCastFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateElectionVote = useCallback(
    async (args: Parameters<typeof mutators.agendas.updateElectionVote>[0]) => {
      try {
        await zero.mutate(mutators.agendas.updateElectionVote(args))
      } catch (error) {
        console.error('Failed to update vote:', error)
        toast.error(t('common.agendaToasts.voteUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteElectionVote = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.agendas.deleteElectionVote({ id }))
      } catch (error) {
        console.error('Failed to delete vote:', error)
        toast.error(t('common.agendaToasts.voteRemoveFailed'))
        throw error
      }
    },
    [zero]
  )

  return {
    // Agenda items
    createAgendaItem,
    updateAgendaItem,
    deleteAgendaItem,
    reorderAgendaItems,

    // Speaker list
    addSpeaker,
    updateSpeaker,
    removeSpeaker,

    // Elections
    createElection,
    updateElection,

    // Election candidates
    addCandidate,
    updateCandidate,
    deleteCandidate,

    // Election votes
    castElectionVote,
    updateElectionVote,
    deleteElectionVote,
  }
}
