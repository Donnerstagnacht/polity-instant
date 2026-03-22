import { defineQuery, type QueryRowType } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const networkQueries = {
  // ── Workflow queries ──────────────────────────────────────────────

  workflowsByGroup: defineQuery(z.object({ groupId: z.string() }), ({ args: { groupId } }) =>
    zql.group_workflow
      .where('group_id', groupId)
      .related('steps', q => q.related('group').orderBy('order_index', 'asc'))
      .related('group')
      .related('created_by')
      .orderBy('created_at', 'desc')
  ),

  workflowById: defineQuery(z.object({ id: z.string() }), ({ args: { id } }) =>
    zql.group_workflow
      .where('id', id)
      .related('steps', q => q.related('group').orderBy('order_index', 'asc'))
      .related('group')
      .related('created_by')
      .one()
  ),

  allWorkflows: defineQuery(z.object({}), () =>
    zql.group_workflow
      .related('steps', q => q.related('group').orderBy('order_index', 'asc'))
      .related('group')
      .orderBy('created_at', 'desc')
  ),
}

// ── Row types ─────────────────────────────────────────────────────
export type WorkflowWithStepsRow = NonNullable<QueryRowType<typeof networkQueries.workflowById>>
export type WorkflowStepRow = WorkflowWithStepsRow['steps'][number]
