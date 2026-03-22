import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createGroupWorkflowSchema,
  updateGroupWorkflowSchema,
  deleteGroupWorkflowSchema,
  createGroupWorkflowStepSchema,
  updateGroupWorkflowStepSchema,
  deleteGroupWorkflowStepSchema,
} from './schema'

export const networkSharedMutators = {
  // ── Workflow mutators ─────────────────────────────────────────────

  createWorkflow: defineMutator(createGroupWorkflowSchema, async ({ tx, args }) => {
    const now = Date.now()
    await tx.mutate.group_workflow.insert({ ...args, created_at: now, updated_at: now })
  }),

  updateWorkflow: defineMutator(updateGroupWorkflowSchema, async ({ tx, args }) => {
    const now = Date.now()
    await tx.mutate.group_workflow.update({ ...args, updated_at: now })
  }),

  deleteWorkflow: defineMutator(deleteGroupWorkflowSchema, async ({ tx, args }) => {
    // Delete all steps first
    const steps = await tx.run(zql.group_workflow_step.where('workflow_id', args.id))
    for (const step of steps) {
      await tx.mutate.group_workflow_step.delete({ id: step.id })
    }
    await tx.mutate.group_workflow.delete({ id: args.id })
  }),

  // ── Workflow Step mutators ────────────────────────────────────────

  createWorkflowStep: defineMutator(createGroupWorkflowStepSchema, async ({ tx, args }) => {
    const now = Date.now()
    await tx.mutate.group_workflow_step.insert({ ...args, created_at: now })
  }),

  updateWorkflowStep: defineMutator(updateGroupWorkflowStepSchema, async ({ tx, args }) => {
    await tx.mutate.group_workflow_step.update(args)
  }),

  deleteWorkflowStep: defineMutator(deleteGroupWorkflowStepSchema, async ({ tx, args }) => {
    await tx.mutate.group_workflow_step.delete({ id: args.id })
  }),
}
