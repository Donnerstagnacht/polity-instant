import { Badge } from '@/features/shared/ui/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Calendar, Tag, Users, Building2, AlertTriangle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Todo, TodoStatus, TodoPriority } from '../types/todo.types';
import { formatTodoDate, formatTodoDateTime, isOverdue } from '../utils/todoFormatters';
import { TodoStatusIcon } from './TodoStatusIcon';
import { TodoPriorityBadge, TodoPriorityIcon } from './TodoPriorityBadge';

interface TodoDetailViewProps {
  todo: Todo;
}

export function TodoDetailView({ todo }: TodoDetailViewProps) {
  const todoIsOverdue = isOverdue(todo.due_date ?? undefined, todo.status ?? '');

  return (
    <div className="space-y-6">
      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <div className="flex items-center gap-2">
            <TodoStatusIcon status={(todo.status ?? 'pending') as TodoStatus} />
            <span className="capitalize">{(todo.status ?? '').replace('_', ' ')}</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Priority</label>
          <div className="flex items-center gap-2">
            <TodoPriorityIcon priority={(todo.priority ?? 'medium') as TodoPriority} />
            <TodoPriorityBadge priority={(todo.priority ?? 'medium') as TodoPriority} />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <p className="text-sm text-muted-foreground">
          {todo.description || 'No description provided'}
        </p>
      </div>

      {/* Due Date */}
      <div>
        <label className="mb-2 block text-sm font-medium">Due Date</label>
        {todo.due_date ? (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={todoIsOverdue ? 'font-medium text-destructive' : ''}>
              {formatTodoDate(todo.due_date)}
            </span>
            {todoIsOverdue && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Overdue
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No due date set</p>
        )}
      </div>

      {/* Creator */}
      {todo.creator && (
        <div>
          <label className="mb-2 block text-sm font-medium">Created By</label>
          <Link
            to="/user/$id"
            params={{ id: todo.creator.id }}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={todo.creator.avatar ?? undefined} />
              <AvatarFallback>{todo.creator.email?.[0]?.toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            <span>{todo.creator.email?.split('@')[0] || 'Unknown'}</span>
          </Link>
        </div>
      )}

      {/* Assigned Users */}
      {todo.assignments && todo.assignments.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            <Users className="mr-2 inline h-4 w-4" />
            Assigned To
          </label>
          <div className="space-y-2">
            {todo.assignments.map((assignment, idx) => (
              <Link
                key={idx}
                to="/user/$id"
                params={{ id: assignment.user?.id ?? '' }}
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={assignment.user?.avatar ?? undefined} />
                  <AvatarFallback>
                    {assignment.user?.email?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span>{assignment.user?.email?.split('@')[0] || 'Unknown'}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Group */}
      {todo.group && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            <Building2 className="mr-2 inline h-4 w-4" />
            Group
          </label>
          <Link
            to="/group/$id"
            params={{ id: todo.group.id }}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={todo.group.image_url ?? undefined} />
              <AvatarFallback>{todo.group.name?.[0]?.toUpperCase() || 'G'}</AvatarFallback>
            </Avatar>
            <span>{todo.group.name}</span>
          </Link>
        </div>
      )}

      {/* Tags */}
      {todo.tags && todo.tags.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium">
            <Tag className="mr-2 inline h-4 w-4" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {todo.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="border-t pt-4 text-xs text-muted-foreground">
        <div className="grid grid-cols-2 gap-2">
          <div>Created: {todo.created_at ? formatTodoDateTime(todo.created_at) : 'N/A'}</div>
          <div>Updated: {todo.updated_at ? formatTodoDateTime(todo.updated_at) : 'N/A'}</div>
          {todo.completed_at && (
            <div className="col-span-2">Completed: {formatTodoDateTime(todo.completed_at)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
