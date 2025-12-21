import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Tag, Users, Building2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Todo } from '../types/todo.types';
import { formatTodoDate, formatTodoDateTime, isOverdue } from '../utils/todoFormatters';
import { TodoStatusIcon } from './TodoStatusIcon';
import { TodoPriorityBadge, TodoPriorityIcon } from './TodoPriorityBadge';

interface TodoDetailViewProps {
  todo: Todo;
}

export function TodoDetailView({ todo }: TodoDetailViewProps) {
  const todoIsOverdue = isOverdue(todo.dueDate, todo.status);

  return (
    <div className="space-y-6">
      {/* Status and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <div className="flex items-center gap-2">
            <TodoStatusIcon status={todo.status} />
            <span className="capitalize">{todo.status.replace('_', ' ')}</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Priority</label>
          <div className="flex items-center gap-2">
            <TodoPriorityIcon priority={todo.priority} />
            <TodoPriorityBadge priority={todo.priority} />
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
        {todo.dueDate ? (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={todoIsOverdue ? 'font-medium text-destructive' : ''}>
              {formatTodoDate(todo.dueDate)}
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
            href={`/user/${todo.creator.id}`}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={todo.creator.avatar} />
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
                href={`/user/${assignment.user?.id}`}
                className="flex items-center gap-2 text-sm hover:underline"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={assignment.user?.avatar} />
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
            href={`/group/${todo.group.id}`}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={todo.group.imageURL} />
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
          <div>Created: {todo.createdAt ? formatTodoDateTime(todo.createdAt) : 'N/A'}</div>
          <div>Updated: {todo.updatedAt ? formatTodoDateTime(todo.updatedAt) : 'N/A'}</div>
          {todo.completedAt && (
            <div className="col-span-2">Completed: {formatTodoDateTime(todo.completedAt)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
