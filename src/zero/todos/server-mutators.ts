import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { groupName } from '../server-helpers'
import {
  createTodoSchema,
  updateTodoSchema,
  deleteTodoSchema,
} from './schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const todoServerMutators = {
  create: defineMutator(createTodoSchema, async ({ tx, ctx, args }) => {
    await mutators.todos.create.fn({ tx, ctx, args })

    if (args.group_id) {
      const gName = await groupName(tx, args.group_id)
      fireNotification('notifyTodoAssigned', {
        senderId: ctx.userID, groupId: args.group_id, groupName: gName,
      })
    }
  }),

  update: defineMutator(updateTodoSchema, async ({ tx, ctx, args }) => {
    const oldTodo = await tx.run(zql.todo.where('id', args.id).one())

    await mutators.todos.update.fn({ tx, ctx, args })

    if (oldTodo?.group_id) {
      const gName = await groupName(tx, oldTodo.group_id)
      fireNotification('notifyTodoUpdated', {
        senderId: ctx.userID, groupId: oldTodo.group_id, groupName: gName,
      })
    }
  }),

  delete: defineMutator(deleteTodoSchema, async ({ tx, ctx, args }) => {
    const oldTodo = await tx.run(zql.todo.where('id', args.id).one())

    await mutators.todos.delete.fn({ tx, ctx, args })

    if (oldTodo?.group_id) {
      const gName = await groupName(tx, oldTodo.group_id)
      fireNotification('notifyTodoDeleted', {
        senderId: ctx.userID, groupId: oldTodo.group_id, groupName: gName,
      })
    }
  }),
}
