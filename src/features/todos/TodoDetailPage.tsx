import { Button } from '@/features/shared/ui/ui/button';
import { Card, CardContent, CardHeader } from '@/features/shared/ui/ui/card';
import { ShareButton } from '@/features/shared/ui/action-buttons/ShareButton.tsx';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useTodoDetailPage } from './hooks/useTodoDetailPage';
import { TodoDetailHeader } from './ui/TodoDetailHeader';
import { TodoDetailView } from './ui/TodoDetailView';
import { TodoDetailEdit } from './ui/TodoDetailEdit';

interface TodoDetailPageProps {
  todoId: string;
}

export function TodoDetailPage({ todoId }: TodoDetailPageProps) {
  const { t } = useTranslation();
  const {
    todo,
    isEditing,
    isSaving,
    formData,
    setIsEditing,
    handleSave,
    handleCancel,
    handleTitleChange,
    handleFormUpdate,
  } = useTodoDetailPage(todoId);

  if (!todo) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">{t('features.todos.detail.notFound')}</h2>
        <p className="mb-4 text-muted-foreground">
          {t('features.todos.detail.noAccessDescription')}
        </p>
        <Link to="/todos">
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
        <Link to="/todos">
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
            onTitleChange={handleTitleChange}
          />
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <TodoDetailEdit formData={formData} onUpdate={handleFormUpdate} />
          ) : (
            <TodoDetailView todo={todo} />
          )}
        </CardContent>
      </Card>
    </>
  );
}
