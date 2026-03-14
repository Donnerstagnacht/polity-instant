import { defineQuery, type QueryRowType } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const todoQueries = {
  // Todos created by or assigned to the current user
  byUser: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.todo
        .where('creator_id', userID)
        .orderBy('created_at', 'desc')
  ),

  // Todos for a specific group
  byGroup: defineQuery(
    z.object({ group_id: z.string() }),
    ({ args: { group_id } }) =>
      zql.todo
        .where('group_id', group_id)
        .orderBy('created_at', 'desc')
  ),

  // Single todo by ID
  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.todo.where('id', id).one()
  ),

  // Assignments for a todo
  assignments: defineQuery(
    z.object({ todo_id: z.string() }),
    ({ args: { todo_id } }) =>
      zql.todo_assignment
        .where('todo_id', todo_id)
        .related('user')
  ),

  // Single todo by ID with full relations
  byIdWithRelations: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.todo
        .where('id', id)
        .related('creator')
        .related('assignments', q => q.related('user'))
        .related('group')
        .related('event')
        .related('amendment')
        .one()
  ),

  // All todos with full relations (for client-side user filtering)
  allWithRelations: defineQuery(
    z.object({}),
    () =>
      zql.todo
        .related('creator')
        .related('assignments', q => q.related('user'))
        .related('group')
        .related('event')
        .related('amendment')
        .orderBy('created_at', 'desc')
  ),

  // Todos by group with full relations
  byGroupWithRelations: defineQuery(
    z.object({ group_id: z.string() }),
    ({ args: { group_id } }) =>
      zql.todo
        .where('group_id', group_id)
        .related('creator')
        .related('assignments', q => q.related('user'))
        .related('group')
        .related('event')
        .related('amendment')
        .orderBy('created_at', 'desc')
  ),

  byGroupWithAssignments: defineQuery(
    z.object({ group_id: z.string() }),
    ({ args: { group_id } }) =>
      zql.todo
        .where('group_id', group_id)
        .related('assignments', q => q.related('user'))
  ),
}

// ── Query Row Types ─────────────────────────────────────────────────
export type TodoRow = QueryRowType<typeof todoQueries.byId>
export type TodoWithRelationsRow = QueryRowType<typeof todoQueries.allWithRelations>
export type TodoByIdWithRelationsRow = QueryRowType<typeof todoQueries.byIdWithRelations>
export type TodoByGroupWithRelationsRow = QueryRowType<typeof todoQueries.byGroupWithRelations>
export type TodoByGroupWithAssignmentsRow = QueryRowType<typeof todoQueries.byGroupWithAssignments>
export type TodoAssignmentRow = QueryRowType<typeof todoQueries.assignments>
