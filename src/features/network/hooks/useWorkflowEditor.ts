import { useState, useCallback } from 'react'
import { useWorkflowState } from '@/zero/network/useWorkflowState'
import { useWorkflowActions } from '@/zero/network/useWorkflowActions'
import { getNextStepOrderIndex } from '../logic/workflowHelpers'
import type { WorkflowWithStepsRow } from '@/zero/network/queries'

interface DraftStep {
  group_id: string
  label: string | null
}

export function useWorkflowEditor(groupId: string) {
  const { groupWorkflows, groupWorkflowsLoading } = useWorkflowState({ groupId })
  const actions = useWorkflowActions()

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowWithStepsRow | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftSteps, setDraftSteps] = useState<DraftStep[]>([])

  const openNewWorkflow = useCallback(() => {
    setEditingWorkflow(null)
    setDraftName('')
    setDraftDescription('')
    setDraftSteps([])
    setIsEditorOpen(true)
  }, [])

  const openEditWorkflow = useCallback((workflow: WorkflowWithStepsRow) => {
    setEditingWorkflow(workflow)
    setDraftName(workflow.name ?? '')
    setDraftDescription(workflow.description ?? '')
    setDraftSteps(
      [...workflow.steps]
        .sort((a, b) => a.order_index - b.order_index)
        .map(s => ({ group_id: s.group_id, label: s.label }))
    )
    setIsEditorOpen(true)
  }, [])

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false)
    setEditingWorkflow(null)
  }, [])

  const addDraftStep = useCallback((groupId: string, label: string | null = null) => {
    setDraftSteps(prev => [...prev, { group_id: groupId, label }])
  }, [])

  const removeDraftStep = useCallback((index: number) => {
    setDraftSteps(prev => prev.filter((_, i) => i !== index))
  }, [])

  const moveDraftStep = useCallback((fromIndex: number, toIndex: number) => {
    setDraftSteps(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }, [])

  const saveWorkflow = useCallback(async (createdById: string) => {
    if (editingWorkflow) {
      // Update existing workflow
      await actions.updateWorkflow({
        id: editingWorkflow.id,
        name: draftName || null,
        description: draftDescription || null,
      })

      // Delete old steps and recreate
      for (const step of editingWorkflow.steps) {
        await actions.deleteWorkflowStep(step.id)
      }

      for (let i = 0; i < draftSteps.length; i++) {
        await actions.createWorkflowStep({
          id: crypto.randomUUID(),
          workflow_id: editingWorkflow.id,
          group_id: draftSteps[i].group_id,
          order_index: i,
          label: draftSteps[i].label,
        })
      }
    } else {
      // Create new workflow
      const workflowId = crypto.randomUUID()
      await actions.createWorkflow({
        id: workflowId,
        group_id: groupId,
        name: draftName || null,
        description: draftDescription || null,
        status: 'active',
        created_by_id: createdById,
      })

      for (let i = 0; i < draftSteps.length; i++) {
        await actions.createWorkflowStep({
          id: crypto.randomUUID(),
          workflow_id: workflowId,
          group_id: draftSteps[i].group_id,
          order_index: i,
          label: draftSteps[i].label,
        })
      }
    }

    closeEditor()
  }, [editingWorkflow, draftName, draftDescription, draftSteps, groupId, actions, closeEditor])

  const deleteWorkflow = useCallback(async (workflowId: string) => {
    await actions.deleteWorkflow(workflowId)
  }, [actions])

  return {
    // Data
    workflows: groupWorkflows,
    isLoading: groupWorkflowsLoading,
    // Editor state
    isEditorOpen,
    editingWorkflow,
    draftName,
    setDraftName,
    draftDescription,
    setDraftDescription,
    draftSteps,
    // Editor actions
    openNewWorkflow,
    openEditWorkflow,
    closeEditor,
    addDraftStep,
    removeDraftStep,
    moveDraftStep,
    saveWorkflow,
    deleteWorkflow,
  }
}
