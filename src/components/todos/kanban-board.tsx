'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { db, tx } from '../../../db/db';
import { toast } from 'sonner';
import { TodoDetailDialog } from './todo-detail-dialog';
import { useTranslation } from '@/hooks/use-translation';

type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: number;
  tags?: string[];
  creator?: any;
  assignments?: any[];
  group?: any;
}

interface KanbanBoardProps {
  todos: Todo[];
}

export function KanbanBoard({ todos }: KanbanBoardProps) {
  const { t } = useTranslation();
  const [draggedTodoId, setDraggedTodoId] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const COLUMNS: { id: TodoStatus; titleKey: string; color: string }[] = [
    { id: 'pending', titleKey: 'features.todos.kanban.toDo', color: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'in_progress', titleKey: 'features.todos.kanban.inProgress', color: 'bg-blue-50 dark:bg-blue-950' },
    { id: 'completed', titleKey: 'features.todos.kanban.completed', color: 'bg-green-50 dark:bg-green-950' },
    { id: 'cancelled', titleKey: 'features.todos.kanban.cancelled', color: 'bg-red-50 dark:bg-red-950' },
  ];

  const handleDragStart = (todoId: string) => {
    setDraggedTodoId(todoId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: TodoStatus) => {
    if (!draggedTodoId) return;

    try {
      const updates: any = {
        status,
        updatedAt: Date.now(),
      };

      if (status === 'completed') {
        updates.completedAt = Date.now();
      } else {
        updates.completedAt = null;
      }

      await db.transact([tx.todos[draggedTodoId].update(updates)]);
      toast.success(t('features.todos.kanban.statusUpdated'));
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error(t('features.todos.kanban.updateFailed'));
    } finally {
      setDraggedTodoId(null);
    }
  };

  const getTodosByStatus = (status: TodoStatus) => {
    return todos.filter(todo => todo.status === status);
  };

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDetailDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map(column => {
          const columnTodos = getTodosByStatus(column.id);

          return (
            <div
              key={column.id}
              className={`rounded-lg ${column.color} min-h-[500px] p-4`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{t(column.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{columnTodos.length} {t('features.todos.kanban.tasks')}</p>
              </div>

              <div className="space-y-3">
                {columnTodos.map(todo => (
                  <TodoKanbanCard
                    key={todo.id}
                    todo={todo}
                    onDragStart={handleDragStart}
                    onClick={handleTodoClick}
                    isDragging={draggedTodoId === todo.id}
                    t={t}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

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

interface TodoKanbanCardProps {
  todo: Todo;
  onDragStart: (todoId: string) => void;
  onClick: (todo: Todo) => void;
  isDragging: boolean;
  t: (key: string, options?: any) => string;
}

function TodoKanbanCard({ todo, onDragStart, onClick, isDragging, t }: TodoKanbanCardProps) {
  const isOverdue = todo.dueDate && todo.status !== 'completed' && todo.dueDate < Date.now();
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  const handleMouseDown = () => {
    setIsDraggingCard(false);
  };

  const handleDragStart = () => {
    setIsDraggingCard(true);
    onDragStart(todo.id);
  };

  const handleClick = () => {
    // Only trigger click if we didn't drag
    if (!isDraggingCard) {
      onClick(todo);
    }
    setIsDraggingCard(false);
  };

  return (
    <Card
      draggable
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDraggingCard(false)}
      onClick={handleClick}
      className={`cursor-pointer transition-opacity hover:shadow-md ${isDragging ? 'opacity-50' : ''}`}
    >
      <CardContent className="p-3">
        <div className="mb-2">
          <h4 className="line-clamp-2 text-sm font-medium">{todo.title}</h4>
          {todo.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{todo.description}</p>
          )}
        </div>

        <div className="space-y-2">
          {/* Priority */}
          <div className="flex items-center justify-between">
            <PriorityBadge priority={todo.priority} t={t} />
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                {t('features.todos.status.overdue')}
              </Badge>
            )}
          </div>

          {/* Due date */}
          {todo.dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(todo.dueDate)}</span>
            </div>
          )}

          {/* Assignees */}
          {todo.assignments && todo.assignments.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {todo.assignments.slice(0, 3).map((assignment: any, idx: number) => (
                  <Avatar key={idx} className="h-5 w-5 border-2 border-background">
                    <AvatarImage src={assignment.user?.avatar} />
                    <AvatarFallback className="text-xs">
                      {assignment.user?.email?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {todo.assignments.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{todo.assignments.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {todo.tags.slice(0, 2).map((tag: string, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {todo.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{todo.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityBadge({ priority, t }: { priority: TodoPriority; t: (key: string) => string }) {
  const colors = {
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <Badge variant="outline" className={`${colors[priority]} text-xs capitalize`}>
      {t(`features.todos.priority.${priority}`)}
    </Badge>
  );
}

function formatDate(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'number' ? timestamp : parseInt(timestamp));
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
