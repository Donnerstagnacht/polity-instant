'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/auth.ts';
import db from 'db/db';
import { useTodoMutations } from '@/features/todos/hooks/useTodoData';
import { useTodoFilters } from '@/features/todos/hooks/useTodoFilters';
import { useTodoStats } from '@/features/todos/hooks/useTodoStats';
import { TodosHeader, ViewMode } from '@/features/todos/ui/TodosHeader';
import { TodosFilters } from '@/features/todos/ui/TodosFilters';
import { TodosTabs } from '@/features/todos/ui/TodosTabs';
import { KanbanBoard } from '@/components/todos/kanban-board';
import { TodoList } from '@/components/todos/todo-list';
import { TodoDetailDialog } from '@/components/todos/todo-detail-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckSquare, Plus } from 'lucide-react';
import { Todo, TodoStatus } from './types/todo.types';
import { useTranslation } from '@/hooks/use-translation';

export function TodosPage() {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedTodo, setSelectedTodo] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const { updateTodo } = useTodoMutations();

  // Query todos with assignments and creator
  const { data, isLoading } = db.useQuery({
    todos: {
      creator: {},
      assignments: {
        user: {},
      },
      group: {},
    },
  });

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
  } = useTodoFilters(data?.todos as unknown as Todo[], user?.id);

  const statusCounts = useTodoStats(data?.todos as unknown as Todo[], user?.id);

  const handleToggleComplete = async (todo: any) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    const updates: any = {
      status: newStatus,
      updatedAt: Date.now(),
    };

    if (newStatus === 'completed') {
      updates.completedAt = Date.now();
    } else {
      updates.completedAt = null;
    }

    await updateTodo(todo.id, updates);
  };

  const handleUpdateStatus = async (todoId: string, newStatus: TodoStatus) => {
    const updates: any = {
      status: newStatus,
      updatedAt: Date.now(),
    };

    if (newStatus === 'completed') {
      updates.completedAt = Date.now();
    } else {
      updates.completedAt = null;
    }

    await updateTodo(todoId, updates);
  };

  const handleTodoClick = (todo: any) => {
    setSelectedTodo(todo);
    setIsDetailDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t('features.todos.loading')}</p>
      </div>
    );
  }

  return (
    <>
      <TodosHeader viewMode={viewMode} setViewMode={setViewMode} />

      <TodosFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filterPriority={filterPriority}
        setFilterPriority={setFilterPriority}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <TodosTabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        statusCounts={statusCounts}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">{t('features.todos.loadingTodos')}</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckSquare className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">{t('features.todos.list.empty')}</h3>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                {searchQuery
                  ? t('features.todos.list.noMatchingTodos')
                  : selectedTab === 'all'
                    ? t('features.todos.list.noTodosYet')
                    : t('features.todos.list.noStatusTodos', { status: t(`features.todos.status.${selectedTab}`) })}
              </p>
              <Link href="/create/todo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('features.todos.create.createFirstTodo')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard todos={filteredTodos as any} />
        ) : (
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <TodoList
              todos={filteredTodos}
              onToggleComplete={handleToggleComplete}
              onUpdateStatus={handleUpdateStatus}
              onTodoClick={handleTodoClick}
            />
          </ScrollArea>
        )}
      </TodosTabs>

      {selectedTodo && (
        <TodoDetailDialog
          todo={selectedTodo}
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
        />
      )}
    </>
  );
}
