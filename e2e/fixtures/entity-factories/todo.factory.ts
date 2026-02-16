/**
 * Todo Factory
 *
 * Creates todos and assignments for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminTransact, tx } from '../admin-db';

export interface CreateTodoOptions {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  visibility?: string;
  groupId?: string;
}

export interface CreatedTodo {
  id: string;
  title: string;
}

export class TodoFactory extends FactoryBase {
  private _counter = 0;

  /**
   * Create a todo linked to a creator and optionally a group.
   */
  async createTodo(creatorId: string, overrides: CreateTodoOptions = {}): Promise<CreatedTodo> {
    this._counter++;
    const todoId = overrides.id ?? this.generateId();
    const title = overrides.title ?? `E2E Todo ${this._counter}`;
    const now = new Date();

    const todoTx = tx.todos[todoId].update({
      title,
      description: overrides.description ?? '',
      status: overrides.status ?? 'pending',
      priority: overrides.priority ?? 'medium',
      dueDate: overrides.dueDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      visibility: overrides.visibility ?? 'public',
      createdAt: now,
      updatedAt: now,
    });

    if (overrides.groupId) {
      await adminTransact([todoTx.link({ creator: creatorId, group: overrides.groupId })]);
      this.trackLink('todos', todoId, 'group', overrides.groupId);
    } else {
      await adminTransact([todoTx.link({ creator: creatorId })]);
    }

    this.trackEntity('todos', todoId);
    this.trackLink('todos', todoId, 'creator', creatorId);

    return { id: todoId, title };
  }

  /**
   * Assign a user to a todo.
   */
  async assignTodo(todoId: string, userId: string, role: string = 'assignee'): Promise<string> {
    const assignmentId = this.generateId();
    await adminTransact([
      tx.todoAssignments[assignmentId]
        .update({ assignedAt: new Date(), role })
        .link({ todo: todoId, user: userId }),
    ]);
    this.trackEntity('todoAssignments', assignmentId);
    return assignmentId;
  }
}
