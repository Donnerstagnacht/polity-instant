import { TodoCard } from './todo-card';

type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface TodoListProps {
  todos: any[];
  onToggleComplete: (todo: any) => void;
  onUpdateStatus: (todoId: string, status: TodoStatus) => void;
}

export function TodoList({ todos, onToggleComplete, onUpdateStatus }: TodoListProps) {
  return (
    <div className="space-y-3">
      {todos.map((todo: any) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}
