/**
 * Hook for managing group todos
 */

import { useState } from 'react';
import { useGroupTodos as useFacadeGroupTodos } from '@/zero/groups/useGroupState';
import { useTodoActions } from '@/zero/todos/useTodoActions';
import { toast } from 'sonner';
import { notifyTodoAssigned, notifyTodoUpdated, notifyTodoCompleted } from '@/features/notifications/utils/notification-helpers.ts';

export function useGroupTodos(groupId: string, userId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { todos: todosData, isLoading: isQuerying } = useFacadeGroupTodos(groupId);
  const { createTodo: createTodoAction, updateTodo: updateTodoAction, deleteTodo: deleteTodoAction, assignUser: assignUserAction } = useTodoActions();

  const todos = todosData;

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
      const todoId = crypto.randomUUID();
      const now = Date.now();

      await createTodoAction({
        id: todoId,
        title: todoData.title,
        description: todoData.description,
        priority: todoData.priority,
        status: 'pending',
        due_date: todoData.dueDate ? new Date(todoData.dueDate).getTime() : 0,
        completed_at: 0,
        tags: [],
        visibility: 'group',
        group_id: groupId,
        event_id: null,
        amendment_id: null,
      });

      // Create assignment for creator
      const assignmentId = crypto.randomUUID();
      await assignUserAction({
        id: assignmentId,
        role: 'assignee',
        todo_id: todoId,
        user_id: userId,
      });

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
      await updateTodoAction({
        id: todoId,
        status: newStatus,
        completed_at: newStatus === 'completed' ? Date.now() : undefined,
      });

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

  const toggleTodoComplete = async (todo: { id: string; status: string | null }) => {
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
      await deleteTodoAction(todoId);

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
