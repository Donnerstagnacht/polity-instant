import type { Todo } from '../types/todo.types';

export interface TodoStatusCounts {
  all: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

/**
 * Pure function that computes status counts from a list of todos,
 * filtered to those owned by or assigned to the given user.
 *
 * Extracted from the former `useTodoStats` hook so it can be called
 * inside a `useMemo` (or anywhere else) without carrying a React dependency.
 */
export function computeTodoStats(
  todos: Todo[] | undefined,
  userId: string | undefined,
): TodoStatusCounts {
  if (!todos) return { all: 0, pending: 0, in_progress: 0, completed: 0, cancelled: 0 };

  const userTodos = todos.filter(
    (todo) =>
      todo.creator?.id === userId || todo.assignments?.some((a) => a.user?.id === userId),
  );

  return {
    all: userTodos.length,
    pending: userTodos.filter((t) => t.status === 'pending').length,
    in_progress: userTodos.filter((t) => t.status === 'in_progress').length,
    completed: userTodos.filter((t) => t.status === 'completed').length,
    cancelled: userTodos.filter((t) => t.status === 'cancelled').length,
  };
}
