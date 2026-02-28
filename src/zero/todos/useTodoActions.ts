import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'

/**
 * Action hook for todo mutations.
 * Every function is a thin wrapper around a custom mutator + sonner toast.
 */
export function useTodoActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── CRUD ───────────────────────────────────────────────────────────
  const createTodo = useCallback(
    async (args: Parameters<typeof mutators.todos.create>[0]) => {
      try {
        await zero.mutate(mutators.todos.create(args))
        toast.success(t('features.todos.toasts.created'))
      } catch (error) {
        console.error('Failed to create todo:', error)
        toast.error(t('features.todos.toasts.createFailed', 'Failed to create todo'))
        throw error
      }
    },
    [zero]
  )

  const updateTodo = useCallback(
    async (args: Parameters<typeof mutators.todos.update>[0]) => {
      try {
        await zero.mutate(mutators.todos.update(args))
      } catch (error) {
        console.error('Failed to update todo:', error)
        toast.error(t('features.todos.toasts.updateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteTodo = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.todos.delete({ id }))
        toast.success(t('features.todos.toasts.deleted'))
      } catch (error) {
        console.error('Failed to delete todo:', error)
        toast.error(t('features.todos.toasts.deleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Toggle Complete ────────────────────────────────────────────────
  const toggleComplete = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.todos.toggleComplete({ id }))
      } catch (error) {
        console.error('Failed to toggle todo completion:', error)
        toast.error(t('features.todos.toasts.toggleFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Assignments ────────────────────────────────────────────────────
  const assignUser = useCallback(
    async (args: Parameters<typeof mutators.todos.assign>[0]) => {
      try {
        await zero.mutate(mutators.todos.assign(args))
        toast.success(t('features.todos.toasts.userAssigned'))
      } catch (error) {
        console.error('Failed to assign user:', error)
        toast.error(t('features.todos.toasts.assignFailed'))
        throw error
      }
    },
    [zero]
  )

  const unassignUser = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.todos.unassign({ id }))
        toast.success(t('features.todos.toasts.userUnassigned'))
      } catch (error) {
        console.error('Failed to unassign user:', error)
        toast.error(t('features.todos.toasts.unassignFailed'))
        throw error
      }
    },
    [zero]
  )

  return {
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    assignUser,
    unassignUser,
  }
}
