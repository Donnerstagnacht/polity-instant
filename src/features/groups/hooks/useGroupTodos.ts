/**
 * Hook for managing group todos
 */

import { useState } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';
import type { GroupTodo } from '../types/group.types';

export function useGroupTodos(groupId: string, userId?: string) {
  const [isLoading, setIsLoading] = useState(false);

  // Query todos
  const { data, isLoading: isQuerying } = db.useQuery({
    todos: {
      $: {
        where: {
          'group.id': groupId,
        },
      },
      creator: {},
      assignments: {
        user: {},
      },
      group: {},
    },
  });

  const todos = (data?.todos || []) as unknown as GroupTodo[];

  const addTodo = async (todoData: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
  }) => {
    if (!userId) {
      toast.error('You must be logged in');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const todoId = id();
      const assignmentId = id();
      const now = Date.now();

      await db.transact([
        tx.todos[todoId].update({
          title: todoData.title,
          description: todoData.description,
          priority: todoData.priority as any,
          status: 'pending',
          dueDate: todoData.dueDate ? new Date(todoData.dueDate).getTime() : null,
          createdAt: now,
          updatedAt: now,
        }),
        tx.todos[todoId].link({ creator: userId, group: groupId }),
        tx.todoAssignments[assignmentId].update({
          assignedAt: now,
          role: 'assignee',
        }),
        tx.todoAssignments[assignmentId].link({ todo: todoId, user: userId }),
      ]);

      toast.success('Todo added successfully!');
      return { success: true, todoId };
    } catch (error) {
      console.error('Failed to add todo:', error);
      toast.error('Failed to add todo');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const updateTodoStatus = async (todoId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      const updates: any = {
        status: newStatus,
        updatedAt: Date.now(),
      };

      if (newStatus === 'completed') {
        updates.completedAt = Date.now();
      } else {
        updates.completedAt = null;
      }

      await db.transact([tx.todos[todoId].update(updates)]);
      toast.success('Status updated!');
      return { success: true };
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodoComplete = async (todo: any) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    return updateTodoStatus(todo.id, newStatus);
  };

  const deleteTodo = async (todoId: string) => {
    setIsLoading(true);
    try {
      await db.transact([tx.todos[todoId].delete()]);
      toast.success('Todo deleted successfully!');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast.error('Failed to delete todo');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    todos,
    addTodo,
    updateTodoStatus,
    toggleTodoComplete,
    deleteTodo,
    isLoading: isLoading || isQuerying,
  };
}
