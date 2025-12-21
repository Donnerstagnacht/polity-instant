import { Badge } from '@/components/ui/badge';
import { Flag, AlertCircle } from 'lucide-react';
import { TodoPriority } from '../types/todo.types';

interface TodoPriorityBadgeProps {
  priority: TodoPriority;
  showIcon?: boolean;
}

export function TodoPriorityBadge({ priority, showIcon = false }: TodoPriorityBadgeProps) {
  const colors = {
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <Badge variant="outline" className={`${colors[priority]} capitalize`}>
      {showIcon && <TodoPriorityIcon priority={priority} />}
      {priority}
    </Badge>
  );
}

export function TodoPriorityIcon({ priority }: { priority: TodoPriority }) {
  switch (priority) {
    case 'urgent':
      return <AlertCircle className="mr-1 h-3.5 w-3.5 text-red-500" />;
    case 'high':
      return <Flag className="mr-1 h-3.5 w-3.5 text-orange-500" />;
    case 'medium':
      return <Flag className="mr-1 h-3.5 w-3.5 text-yellow-500" />;
    case 'low':
      return <Flag className="mr-1 h-3.5 w-3.5 text-blue-500" />;
  }
}
