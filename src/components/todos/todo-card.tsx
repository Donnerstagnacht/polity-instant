import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Circle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  Flag,
  Calendar,
  Tag,
  User,
} from 'lucide-react';

type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

interface TodoCardProps {
  todo: any;
  onToggleComplete: (todo: any) => void;
  onUpdateStatus: (todoId: string, status: TodoStatus) => void;
  onClick?: (todo: any) => void;
}

export function TodoCard({ todo, onToggleComplete, onUpdateStatus, onClick }: TodoCardProps) {
  const isCompleted = todo.status === 'completed';
  const isOverdue = todo.dueDate && todo.status !== 'completed' && todo.dueDate < Date.now();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="combobox"]') ||
      target.closest('select')
    ) {
      return;
    }
    onClick?.(todo);
  };

  return (
    <Card
      className={`cursor-pointer transition-opacity ${isCompleted ? 'opacity-60' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => onToggleComplete(todo)}
            className="mt-1 flex-shrink-0"
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
            )}
          </button>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  className={`mb-1 font-semibold ${isCompleted ? 'text-muted-foreground line-through' : ''}`}
                >
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {todo.description}
                  </p>
                )}

                {/* Meta information */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {/* Priority */}
                  <div className="flex items-center gap-1">
                    <PriorityIcon priority={todo.priority} />
                    <span className="capitalize">{todo.priority}</span>
                  </div>

                  {/* Due date */}
                  {todo.dueDate && (
                    <div
                      className={`flex items-center gap-1 ${isOverdue ? 'font-medium text-destructive' : ''}`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(todo.dueDate)}</span>
                      {isOverdue && <AlertTriangle className="h-3.5 w-3.5" />}
                    </div>
                  )}

                  {/* Creator */}
                  {todo.creator && (
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>{todo.creator.email?.split('@')[0] || 'Unknown'}</span>
                    </div>
                  )}

                  {/* Assignees count */}
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
                        <span className="text-xs">+{todo.assignments.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {todo.tags && todo.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {todo.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Status badge and actions */}
              <div className="flex flex-col items-end gap-2">
                <Select
                  value={todo.status}
                  onValueChange={(v: TodoStatus) => onUpdateStatus(todo.id, v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Circle className="h-4 w-4" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Cancelled
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <PriorityBadge priority={todo.priority} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityIcon({ priority }: { priority: TodoPriority }) {
  switch (priority) {
    case 'urgent':
      return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
    case 'high':
      return <Flag className="h-3.5 w-3.5 text-orange-500" />;
    case 'medium':
      return <Flag className="h-3.5 w-3.5 text-yellow-500" />;
    case 'low':
      return <Flag className="h-3.5 w-3.5 text-blue-500" />;
  }
}

function PriorityBadge({ priority }: { priority: TodoPriority }) {
  const colors = {
    urgent: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  };

  return (
    <Badge variant="secondary" className={`${colors[priority]} border-0 text-xs capitalize`}>
      {priority}
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

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
