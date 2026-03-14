import { TodoCard } from './todo-card.tsx';
import type { Todo } from '../types/todo.types';

type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (todo: Todo) => void;
  onUpdateStatus: (todoId: string, status: TodoStatus) => void;
  onTodoClick?: (todo: Todo) => void;
}

export function TodoList({ todos, onToggleComplete, onUpdateStatus, onTodoClick }: TodoListProps) {
  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onUpdateStatus={onUpdateStatus}
          onClick={onTodoClick}
        />
      ))}
    </div>
  );
}
