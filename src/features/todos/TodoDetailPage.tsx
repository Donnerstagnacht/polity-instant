import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ShareButton } from '@/components/shared/ShareButton';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import db from '../../../db/db';
import { useTodoMutations } from './hooks/useTodoData';
import { TodoDetailHeader } from './ui/TodoDetailHeader';
import { TodoDetailView } from './ui/TodoDetailView';
import { TodoDetailEdit } from './ui/TodoDetailEdit';
import { TodoFormData, Todo } from './types/todo.types';

interface TodoDetailPageProps {
  todoId: string;
}

export function TodoDetailPage({ todoId }: TodoDetailPageProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { updateTodo } = useTodoMutations();

  const { data, isLoading } = db.useQuery({
    todos: {
      $: {
        where: {
          id: todoId,
        },
      },
      creator: {},
      assignments: {
        user: {},
      },
      group: {},
    },
  });

  const todo = data?.todos?.[0] as Todo | undefined;

  const [formData, setFormData] = useState<TodoFormData>({
    title: todo?.title || '',
    description: todo?.description || '',
    status: todo?.status || 'pending',
    priority: todo?.priority || 'medium',
    dueDate: todo?.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
  });

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        status: todo.status || 'pending',
        priority: todo.priority || 'medium',
        dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [todo]);

  const handleSave = async () => {
    if (!todo) return;

    setIsSaving(true);
    const updates: any = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : null,
      updatedAt: Date.now(),
    };

    if (formData.status === 'completed' && todo.status !== 'completed') {
      updates.completedAt = Date.now();
    } else if (formData.status !== 'completed' && todo.status === 'completed') {
      updates.completedAt = null;
    }

    const result = await updateTodo(todo.id, updates);
    if (result.success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    if (!todo) return;
    setFormData({
      title: todo.title || '',
      description: todo.description || '',
      status: todo.status || 'pending',
      priority: todo.priority || 'medium',
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t('features.todos.detail.loading')}</p>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">{t('features.todos.detail.notFound')}</h2>
        <p className="mb-4 text-muted-foreground">
          {t('features.todos.detail.noAccessDescription')}
        </p>
        <Link href="/todos">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('features.todos.detail.backToTodos')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/todos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('features.todos.detail.backToTodos')}
          </Button>
        </Link>
        <ShareButton
          url={`/todos/${todoId}`}
          title={todo.title || 'Todo'}
          variant="outline"
          size="sm"
        />
      </div>

      <Card>
        <CardHeader>
          <TodoDetailHeader
            isEditing={isEditing}
            isSaving={isSaving}
            title={todo.title}
            formTitle={formData.title}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
            onTitleChange={title => setFormData({ ...formData, title })}
          />
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <TodoDetailEdit
              formData={formData}
              onUpdate={updates => setFormData({ ...formData, ...updates })}
            />
          ) : (
            <TodoDetailView todo={todo} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
