import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

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
        const result = zero.mutate(mutators.agendas.createAgendaItem(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.agendas.updateAgendaItem(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.agendas.deleteAgendaItem({ id }))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.agendas.reorderAgendaItems(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.agendas.addSpeaker(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.agendas.updateSpeaker(args))
        await serverConfirmed(result)
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
        const result = zero.mutate(mutators.agendas.removeSpeaker({ id }))
        await serverConfirmed(result)
        toast.success(t('common.agendaToasts.speakerRemoved'))
      } catch (error) {
        console.error('Failed to remove speaker:', error)
        toast.error(t('common.agendaToasts.speakerRemoveFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Agenda Item Change Requests ────────────────────────────────────

  const createAgendaItemChangeRequest = useCallback(
    async (args: Parameters<typeof mutators.agendas.createAgendaItemChangeRequest>[0]) => {
      try {
        const result = zero.mutate(mutators.agendas.createAgendaItemChangeRequest(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to create agenda item change request:', error)
        toast.error(t('common.agendaToasts.crCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateAgendaItemChangeRequest = useCallback(
    async (args: Parameters<typeof mutators.agendas.updateAgendaItemChangeRequest>[0]) => {
      try {
        const result = zero.mutate(mutators.agendas.updateAgendaItemChangeRequest(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update agenda item change request:', error)
        toast.error(t('common.agendaToasts.crUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const reorderAgendaItemChangeRequests = useCallback(
    async (args: Parameters<typeof mutators.agendas.reorderAgendaItemChangeRequests>[0]) => {
      try {
        const result = zero.mutate(mutators.agendas.reorderAgendaItemChangeRequests(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to reorder change requests:', error)
        toast.error(t('common.agendaToasts.crReorderFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteAgendaItemChangeRequest = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.agendas.deleteAgendaItemChangeRequest({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete agenda item change request:', error)
        toast.error(t('common.agendaToasts.crDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  const initializeChangeRequestVoting = useCallback(
    async (args: { amendment_id: string; agenda_item_id: string; voting_context?: 'event' | 'internal'; group_id?: string }) => {
      try {
        const result = zero.mutate(mutators.agendas.initializeChangeRequestVoting(args))
        await serverConfirmed(result)
        toast.success(t('common.agendaToasts.crVotingInitialized'))
      } catch (error) {
        console.error('Failed to initialize change request voting:', error)
        toast.error(t('common.agendaToasts.crVotingInitFailed'))
        throw error
      }
    },
    [zero]
  )

  const processCRVoteResult = useCallback(
    async (args: { agenda_item_change_request_id: string; vote_result: 'passed' | 'rejected' | 'tie' }) => {
      try {
        const result = zero.mutate(mutators.agendas.processCRVoteResult(args))
        await serverConfirmed(result)
        toast.success(t('common.agendaToasts.crVoteProcessed'))
      } catch (error) {
        console.error('Failed to process CR vote result:', error)
        toast.error(t('common.agendaToasts.crVoteProcessFailed'))
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

    // Agenda item change requests
    createAgendaItemChangeRequest,
    updateAgendaItemChangeRequest,
    reorderAgendaItemChangeRequests,
    deleteAgendaItemChangeRequest,
    initializeChangeRequestVoting,
    processCRVoteResult,
  }
}
