import { Circle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { TodoStatus } from '../types/todo.types';

interface TodoStatusIconProps {
  status: TodoStatus;
}

export function TodoStatusIcon({ status }: TodoStatusIconProps) {
  switch (status) {
    case 'pending':
      return <Circle className="h-4 w-4 text-muted-foreground" />;
    case 'in_progress':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
}
