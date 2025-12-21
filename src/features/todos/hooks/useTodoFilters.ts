import { useState, useMemo } from 'react';
import { Todo, TodoStatus, TodoPriority } from '../types/todo.types';

export type SortBy = 'dueDate' | 'priority' | 'createdAt' | 'title';

export function useTodoFilters(todos: Todo[] | undefined, userId: string | undefined) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | TodoStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [filterPriority, setFilterPriority] = useState<'all' | TodoPriority>('all');

  const filteredTodos = useMemo(() => {
    if (!todos) return [];

    let result = todos;

    // Filter by user's todos (created by or assigned to)
    result = result.filter(
      todo =>
        todo.creator?.id === userId || todo.assignments?.some((a: any) => a.user?.id === userId)
    );

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (todo: any) =>
          todo.title?.toLowerCase().includes(query) ||
          todo.description?.toLowerCase().includes(query) ||
          todo.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by status tab
    if (selectedTab !== 'all') {
      result = result.filter((todo: any) => todo.status === selectedTab);
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      result = result.filter((todo: any) => todo.priority === filterPriority);
    }

    // Sort todos
    result = [...result].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate - b.dueDate;
        case 'priority': {
          const priorityOrder: Record<TodoPriority, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          return (
            priorityOrder[b.priority as TodoPriority] - priorityOrder[a.priority as TodoPriority]
          );
        }
        case 'createdAt':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return result;
  }, [todos, userId, searchQuery, selectedTab, sortBy, filterPriority]);

  return {
    searchQuery,
    setSearchQuery,
    selectedTab,
    setSelectedTab,
    sortBy,
    setSortBy,
    filterPriority,
    setFilterPriority,
    filteredTodos,
  };
}
