import type { WorkflowWithStepsRow, WorkflowStepRow } from '@/zero/network/queries'

/**
 * Sort workflow steps by order_index.
 */
export function sortWorkflowSteps(steps: readonly WorkflowStepRow[]): WorkflowStepRow[] {
  return [...steps].sort((a, b) => a.order_index - b.order_index)
}

/**
 * Validate that a workflow has at least 2 steps (minimum for a circular path).
 */
export function isWorkflowValid(workflow: WorkflowWithStepsRow): boolean {
  return workflow.steps.length >= 2
}

/**
 * Get the ordered group IDs from a workflow's steps.
 */
export function getWorkflowGroupIds(workflow: WorkflowWithStepsRow): string[] {
  return sortWorkflowSteps(workflow.steps).map(step => step.group_id)
}

/**
 * Check if a workflow is circular (first and last step reference the same group).
 */
export function isWorkflowCircular(workflow: WorkflowWithStepsRow): boolean {
  const sorted = sortWorkflowSteps(workflow.steps)
  if (sorted.length < 2) return false
  return sorted[0].group_id === sorted[sorted.length - 1].group_id
}

/**
 * Get the next order_index for adding a new step to a workflow.
 */
export function getNextStepOrderIndex(steps: readonly WorkflowStepRow[]): number {
  if (steps.length === 0) return 0
  return Math.max(...steps.map(s => s.order_index)) + 1
}

/**
 * Reorder steps after a removal or reorder, returning new order_index values.
 */
export function reindexSteps(steps: readonly WorkflowStepRow[]): Array<{ id: string; order_index: number }> {
  return sortWorkflowSteps(steps).map((step, index) => ({
    id: step.id,
    order_index: index,
  }))
}

/**
 * Build a human-readable summary of a workflow's step sequence.
 * e.g. "Plenum → Committee → Plenum → Committee → Plenum"
 */
export function formatWorkflowStepSequence(workflow: WorkflowWithStepsRow): string {
  const sorted = sortWorkflowSteps(workflow.steps)
  return sorted
    .map(step => step.group?.name ?? step.label ?? `Step ${step.order_index + 1}`)
    .join(' → ')
}
