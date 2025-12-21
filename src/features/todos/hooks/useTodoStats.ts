import { useMemo } from 'react';
import { Todo } from '../types/todo.types';

export function useTodoStats(todos: Todo[] | undefined, userId: string | undefined) {
  return useMemo(() => {
    if (!todos) return { all: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 };

    const userTodos = todos.filter(
      (todo: any) =>
        todo.creator?.id === userId || todo.assignments?.some((a: any) => a.user?.id === userId)
    );

    return {
      all: userTodos.length,
      pending: userTodos.filter((t: any) => t.status === 'pending').length,
      in_progress: userTodos.filter((t: any) => t.status === 'in_progress').length,
      completed: userTodos.filter((t: any) => t.status === 'completed').length,
      cancelled: userTodos.filter((t: any) => t.status === 'cancelled').length,
    };
  }, [todos, userId]);
}
