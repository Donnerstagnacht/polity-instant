import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

interface WorkflowStateOptions {
  groupId?: string
  workflowId?: string
}

/**
 * Reactive state hook for workflow data.
 * Returns query-derived state — no mutations.
 */
export function useWorkflowState(options: WorkflowStateOptions = {}) {
  const { groupId, workflowId } = options

  const [groupWorkflows, groupWorkflowsResult] = useQuery(
    groupId
      ? queries.network.workflowsByGroup({ groupId })
      : undefined
  )

  const [workflow, workflowResult] = useQuery(
    workflowId
      ? queries.network.workflowById({ id: workflowId })
      : undefined
  )

  const [allWorkflows, allWorkflowsResult] = useQuery(
    queries.network.allWorkflows({})
  )

  return {
    groupWorkflows: groupWorkflows ?? [],
    groupWorkflowsLoading: groupWorkflowsResult.type === 'unknown',
    workflow,
    workflowLoading: workflowResult.type === 'unknown',
    allWorkflows: allWorkflows ?? [],
    allWorkflowsLoading: allWorkflowsResult.type === 'unknown',
  }
}
