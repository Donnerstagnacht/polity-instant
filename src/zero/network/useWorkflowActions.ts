import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'

/**
 * Action hook for workflow mutations.
 * Every function wraps a custom mutator + sonner toast.
 */
export function useWorkflowActions() {
  const zero = useZero()
  const { t } = useTranslation()

  const createWorkflow = useCallback(
    async (args: Parameters<typeof mutators.network.createWorkflow>[0]) => {
      try {
        const result = zero.mutate(mutators.network.createWorkflow(args))
        await serverConfirmed(result)
        toast.success(t('features.network.toasts.workflowCreated', 'Workflow created'))
      } catch (error) {
        console.error('Failed to create workflow:', error)
        toast.error(t('features.network.toasts.workflowCreateFailed', 'Failed to create workflow'))
        throw error
      }
    },
    [zero, t]
  )

  const updateWorkflow = useCallback(
    async (args: Parameters<typeof mutators.network.updateWorkflow>[0]) => {
      try {
        const result = zero.mutate(mutators.network.updateWorkflow(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update workflow:', error)
        toast.error(t('features.network.toasts.workflowUpdateFailed', 'Failed to update workflow'))
        throw error
      }
    },
    [zero, t]
  )

  const deleteWorkflow = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.network.deleteWorkflow({ id }))
        await serverConfirmed(result)
        toast.success(t('features.network.toasts.workflowDeleted', 'Workflow deleted'))
      } catch (error) {
        console.error('Failed to delete workflow:', error)
        toast.error(t('features.network.toasts.workflowDeleteFailed', 'Failed to delete workflow'))
        throw error
      }
    },
    [zero, t]
  )

  const createWorkflowStep = useCallback(
    async (args: Parameters<typeof mutators.network.createWorkflowStep>[0]) => {
      try {
        const result = zero.mutate(mutators.network.createWorkflowStep(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to create workflow step:', error)
        toast.error(t('features.network.toasts.stepCreateFailed', 'Failed to add step'))
        throw error
      }
    },
    [zero, t]
  )

  const updateWorkflowStep = useCallback(
    async (args: Parameters<typeof mutators.network.updateWorkflowStep>[0]) => {
      try {
        const result = zero.mutate(mutators.network.updateWorkflowStep(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update workflow step:', error)
        toast.error(t('features.network.toasts.stepUpdateFailed', 'Failed to update step'))
        throw error
      }
    },
    [zero, t]
  )

  const deleteWorkflowStep = useCallback(
    async (id: string) => {
      try {
        const result = zero.mutate(mutators.network.deleteWorkflowStep({ id }))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to delete workflow step:', error)
        toast.error(t('features.network.toasts.stepDeleteFailed', 'Failed to remove step'))
        throw error
      }
    },
    [zero, t]
  )

  return {
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    createWorkflowStep,
    updateWorkflowStep,
    deleteWorkflowStep,
  }
}
