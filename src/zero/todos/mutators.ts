import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createTodoSchema,
  updateTodoSchema,
  deleteTodoSchema,
  toggleCompleteTodoSchema,
  createTodoAssignmentSchema,
  deleteTodoAssignmentSchema,
} from './schema'

export const todoMutators = {
  // Create a todo
  create: defineMutator(
    createTodoSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.todo.insert({
        ...args,
        creator_id: userID,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  // Update a todo
  update: defineMutator(
    updateTodoSchema,
    async ({ tx, args }) => {
      const { id, ...fields } = args
      await tx.mutate.todo.update({
        id,
        ...fields,
        updated_at: Date.now(),
      })
    }
  ),

  // Delete a todo
  delete: defineMutator(
    deleteTodoSchema,
    async ({ tx, args }) => {
      await tx.mutate.todo.delete({ id: args.id })
    }
  ),

  // Assign a user to a todo
  assign: defineMutator(
    createTodoAssignmentSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.todo_assignment.insert({
        ...args,
        assigned_at: now,
      })
    }
  ),

  // Unassign a user from a todo
  unassign: defineMutator(
    deleteTodoAssignmentSchema,
    async ({ tx, args }) => {
      await tx.mutate.todo_assignment.delete({ id: args.id })
    }
  ),

  // Toggle todo completion
  toggleComplete: defineMutator(
    toggleCompleteTodoSchema,
    async ({ tx, args }) => {
      const existing = await tx.run(
        zql.todo.where('id', args.id).one()
      )

      if (!existing) {
        throw new Error('Todo not found')
      }

      const now = Date.now()
      const isCompleting = existing.status !== 'completed'

      await tx.mutate.todo.update({
        id: args.id,
        status: isCompleting ? 'completed' : 'open',
        completed_at: isCompleting ? now : 0,
        updated_at: now,
      })
    }
  ),
}
