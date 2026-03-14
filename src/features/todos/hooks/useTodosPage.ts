import { useState, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useTodoState } from '@/zero/todos/useTodoState';
import { useTodoMutations } from '@/features/todos/hooks/useTodoMutations';
import { useTodoFilters } from '@/features/todos/hooks/useTodoFilters';
import { computeTodoStats } from '../logic/computeTodoStats';
import type { Todo, TodoStatus } from '../types/todo.types';
import type { ViewMode } from '../ui/TodosHeader';

export function useTodosPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { updateTodo } = useTodoMutations();
  const { allTodos } = useTodoState({});

  const todosTyped = allTodos;

  const {
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    sortBy,
    setSortBy,
    filterPriority,
    setFilterPriority,
    filteredTodos,
  } = useTodoFilters(todosTyped, user?.id);

  const statusCounts = useMemo(
    () => computeTodoStats(todosTyped, user?.id),
    [todosTyped, user?.id]
  );

  // ── Business logic ────────────────────────────────────────────────

  const handleToggleComplete = async (todo: Todo) => {
    const isCompleting = todo.status !== 'completed';
    await updateTodo(todo.id, {
      status: isCompleting ? 'completed' : 'pending',
      completed_at: isCompleting ? Date.now() : null,
    });
  };

  const handleUpdateStatus = async (todoId: string, newStatus: TodoStatus) => {
    const isCompleting = newStatus === 'completed';
    await updateTodo(todoId, {
      status: newStatus,
      completed_at: isCompleting ? Date.now() : null,
    });
  };

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDetailDialogOpen(true);
  };

  return {
    // Auth
    user,

    // View mode
    viewMode,
    setViewMode,

    // Detail dialog
    selectedTodo,
    isDetailDialogOpen,
    setIsDetailDialogOpen,

    // Filters (pass-through from useTodoFilters)
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    sortBy,
    setSortBy,
    filterPriority,
    setFilterPriority,
    filteredTodos,

    // Derived data
    statusCounts,

    // Handlers
    handleToggleComplete,
    handleUpdateStatus,
    handleTodoClick,
  };
}
