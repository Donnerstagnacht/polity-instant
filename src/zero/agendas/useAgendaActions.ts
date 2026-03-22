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
  }
}
