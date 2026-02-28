import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'

/**
 * Action hook for statement mutations.
 * Every function wraps a custom mutator + sonner toast.
 */
export function useStatementActions() {
  const zero = useZero()
  const { t } = useTranslation()

  const createStatement = useCallback(
    async (args: Parameters<typeof mutators.statements.create>[0]) => {
      try {
        await zero.mutate(mutators.statements.create(args))
        toast.success(t('features.statements.toasts.created'))
      } catch (error) {
        console.error('Failed to create statement:', error)
        toast.error(t('features.statements.toasts.createFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateStatement = useCallback(
    async (args: Parameters<typeof mutators.statements.update>[0]) => {
      try {
        await zero.mutate(mutators.statements.update(args))
      } catch (error) {
        console.error('Failed to update statement:', error)
        toast.error(t('features.statements.toasts.updateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteStatement = useCallback(
    async (id: string) => {
      try {
        await zero.mutate(mutators.statements.delete({ id }))
        toast.success(t('features.statements.toasts.deleted'))
      } catch (error) {
        console.error('Failed to delete statement:', error)
        toast.error(t('features.statements.toasts.deleteFailed'))
        throw error
      }
    },
    [zero]
  )

  return {
    createStatement,
    updateStatement,
    deleteStatement,
  }
}
