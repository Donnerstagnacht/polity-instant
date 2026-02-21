import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/providers/auth-provider';
import { useTodoMutations } from '@/features/todos/hooks/useTodoMutations';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authed/create/todo')({
  component: CreateTodoPage,
});

function CreateTodoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTodo, isLoading } = useTodoMutations();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user?.id) return;

    try {
      await createTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        ownerId: user.id,
        assigneeId: user.id,
        priority,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        visibility: 'private',
      });
      toast.success('Todo created');
      navigate({ to: '/user/$id', params: { id: user.id } });
    } catch {
      toast.error('Failed to create todo');
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Create Todo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            rows={4}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="priority" className="mb-1 block text-sm font-medium">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="dueDate" className="mb-1 block text-sm font-medium">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Todo'}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: '/create' })}
            className="rounded-md border px-4 py-2 hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
