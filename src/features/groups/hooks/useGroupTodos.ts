/**
 * Hook for managing group todos
 */

import { useState } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';
import type { GroupTodo } from '../types/group.types';
import { notifyTodoAssigned, notifyTodoUpdated, notifyTodoCompleted } from '@/utils/notification-helpers';

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
    assigneeUserIds?: string[];
    groupName?: string;
  }) => {
    if (!userId) {
      toast.error('You must be logged in');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const todoId = id();
      const now = Date.now();

      const transactions: any[] = [
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
      ];

      // Create assignment for creator
      const assignmentId = id();
      transactions.push(
        tx.todoAssignments[assignmentId].update({
          assignedAt: now,
          role: 'assignee',
        }),
        tx.todoAssignments[assignmentId].link({ todo: todoId, user: userId })
      );

      // Send notifications to assignees
      if (todoData.assigneeUserIds && todoData.groupName) {
        todoData.assigneeUserIds.forEach(assigneeId => {
          if (assigneeId !== userId) {
            const notificationTxs = notifyTodoAssigned({
              senderId: userId,
              recipientUserId: assigneeId,
              groupId,
              groupName: todoData.groupName!,
              todoTitle: todoData.title,
            });
            transactions.push(...notificationTxs);
          }
        });
      }

      await db.transact(transactions);

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

  const updateTodoStatus = async (
    todoId: string,
    newStatus: string,
    senderId?: string,
    groupName?: string,
    assigneeUserIds?: string[]
  ) => {
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

      const transactions: any[] = [tx.todos[todoId].update(updates)];

      // Send notifications to assignees about status change
      if (senderId && groupName && assigneeUserIds) {
        assigneeUserIds.forEach(assigneeId => {
          if (assigneeId !== senderId) {
            const notificationTxs = newStatus === 'completed'
              ? notifyTodoCompleted({
                  senderId,
                  senderName: '', // Will be filled by the caller
                  recipientUserId: assigneeId,
                  todoTitle: '', // Will be filled by the caller
                })
              : notifyTodoUpdated({
                  senderId,
                  recipientUserId: assigneeId,
                  groupId,
                  groupName,
                  todoTitle: '',
                });
            transactions.push(...notificationTxs);
          }
        });
      }

      await db.transact(transactions);
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

  const deleteTodo = async (
    todoId: string,
    todoTitle?: string,
    senderId?: string,
    groupName?: string,
    assigneeUserIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      const transactions: any[] = [tx.todos[todoId].delete()];

      // Send notifications to assignees about deletion
      if (senderId && todoTitle && groupName && assigneeUserIds) {
        assigneeUserIds.forEach(assigneeId => {
          if (assigneeId !== senderId) {
            const notificationTxs = notifyTodoUpdated({
              senderId,
              recipientUserId: assigneeId,
              groupId,
              groupName,
              todoTitle,
            });
            transactions.push(...notificationTxs);
          }
        });
      }

      await db.transact(transactions);
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
