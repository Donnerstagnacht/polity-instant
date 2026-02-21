import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  createStatementSchema,
  updateStatementSchema,
  deleteStatementSchema,
} from './schema'

export const statementMutators = {
  // Create a statement
  create: defineMutator(
    createStatementSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.statement.insert({
        ...args,
        user_id: userID,
        created_at: now,
      })
    }
  ),

  // Update a statement
  update: defineMutator(
    updateStatementSchema,
    async ({ tx, args }) => {
      await tx.mutate.statement.update(args)
    }
  ),

  // Delete a statement
  delete: defineMutator(
    deleteStatementSchema,
    async ({ tx, args }) => {
      await tx.mutate.statement.delete({ id: args.id })
    }
  ),
}
