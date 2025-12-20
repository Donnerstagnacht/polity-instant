import { useState, useMemo } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';

/**
 * Hook to query todo data
 */
export function useTodoData(todoId?: string) {
  const { data, isLoading, error } = db.useQuery(
    todoId
      ? {
          todos: {
            $: { where: { id: todoId } },
            creator: {},
            assignments: {
              user: {},
            },
            group: {},
            event: {},
            amendment: {},
          },
        }
      : null
  );

  const todo = useMemo(() => data?.todos?.[0] || null, [data]);

  return {
    todo,
    isLoading,
    error,
  };
}

/**
 * Hook to query todos for a user
 */
export function useUserTodos(userId?: string) {
  const { data, isLoading } = db.useQuery(
    userId
      ? {
          todos: {
            $: {
              where: {
                or: [{ 'creator.id': userId }, { 'assignments.user.id': userId }],
              },
            },
            creator: {},
            assignments: {
              user: {},
            },
            group: {},
            event: {},
            amendment: {},
          },
        }
      : null
  );

  const todos = useMemo(() => data?.todos || [], [data]);

  const { openTodos, completedTodos, inProgressTodos } = useMemo(() => {
    const open: any[] = [];
    const completed: any[] = [];
    const inProgress: any[] = [];

    todos.forEach((todo: any) => {
      if (todo.status === 'completed') {
        completed.push(todo);
      } else if (todo.status === 'in_progress') {
        inProgress.push(todo);
      } else {
        open.push(todo);
      }
    });

    return {
      openTodos: open,
      completedTodos: completed,
      inProgressTodos: inProgress,
    };
  }, [todos]);

  return {
    todos,
    openTodos,
    completedTodos,
    inProgressTodos,
    isLoading,
  };
}

/**
 * Hook for todo mutations
 */
export function useTodoMutations() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Create a new todo
   */
  const createTodo = async (todoData: {
    title: string;
    description?: string;
    ownerId: string;
    assigneeId?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    groupId?: string;
    eventId?: string;
    amendmentId?: string;
  }) => {
    setIsLoading(true);
    try {
      const todoId = id();
      const todoTx = tx.todos[todoId].update({
        title: todoData.title,
        description: todoData.description,
        status: todoData.status || 'open',
        priority: todoData.priority || 'medium',
        dueDate: todoData.dueDate,
        createdAt: new Date().toISOString(),
      });

      todoTx.link({ owner: todoData.ownerId });
      if (todoData.assigneeId) todoTx.link({ assignee: todoData.assigneeId });
      if (todoData.groupId) todoTx.link({ group: todoData.groupId });
      if (todoData.eventId) todoTx.link({ event: todoData.eventId });
      if (todoData.amendmentId) todoTx.link({ amendment: todoData.amendmentId });

      await db.transact([todoTx]);
      toast.success('Todo created successfully');
      return { success: true, todoId };
    } catch (error) {
      console.error('Failed to create todo:', error);
      toast.error('Failed to create todo');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update a todo
   */
  const updateTodo = async (todoId: string, updates: any) => {
    setIsLoading(true);
    try {
      await db.transact([
        tx.todos[todoId].update({
          ...updates,
          updatedAt: new Date().toISOString(),
        }),
      ]);
      toast.success('Todo updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error('Failed to update todo');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a todo
   */
  const deleteTodo = async (todoId: string) => {
    setIsLoading(true);
    try {
      await db.transact([tx.todos[todoId].delete()]);
      toast.success('Todo deleted successfully');
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
    createTodo,
    updateTodo,
    deleteTodo,
    isLoading,
  };
}
