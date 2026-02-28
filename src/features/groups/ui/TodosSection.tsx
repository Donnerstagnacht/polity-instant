import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import { KanbanBoard } from '@/features/todos/ui/kanban-board.tsx';
import { TodoList } from '@/features/todos/ui/todo-list.tsx';
import { AddTodoDialog } from './AddTodoDialog';
import type { TodoViewMode } from '../types/group.types';

interface TodosSectionProps {
  todos: any[];
  viewMode: TodoViewMode;
  onViewModeChange: (mode: TodoViewMode) => void;
  dialogOpen: boolean;
  onDialogChange: (open: boolean) => void;
  onAddTodo: (data: { title: string; description: string; priority: string; dueDate: string }) => void;
  onToggleComplete: (todo: any) => void;
  onUpdateStatus: (todoId: string, status: string) => void;
}

export function TodosSection({
  todos,
  viewMode,
  onViewModeChange,
  dialogOpen,
  onDialogChange,
  onAddTodo,
  onToggleComplete,
  onUpdateStatus,
}: TodosSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Todos</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none border-0"
                onClick={() => onViewModeChange('kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none border-0"
                onClick={() => onViewModeChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <AddTodoDialog open={dialogOpen} onOpenChange={onDialogChange} onSubmit={onAddTodo} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {todos.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No tasks yet. Add the first task to get started.
          </p>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard todos={todos} />
        ) : (
          <TodoList
            todos={todos}
            onToggleComplete={onToggleComplete}
            onUpdateStatus={onUpdateStatus}
          />
        )}
      </CardContent>
    </Card>
  );
}
