import { useState, useEffect } from 'react';
import { useTodoState } from '@/zero/todos/useTodoState';
import { useTodoMutations } from './useTodoMutations';
import { TodoFormData, Todo } from '../types/todo.types';

export function useTodoDetailPage(todoId: string) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { updateTodo } = useTodoMutations();

  const { todo: rawTodo } = useTodoState({ todoId });
  const todo = rawTodo as unknown as Todo | undefined;

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
    const updates: Record<string, unknown> = {
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

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({ ...prev, title }));
  };

  const handleFormUpdate = (updates: Partial<TodoFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    todo,
    isEditing,
    isSaving,
    formData,
    setIsEditing,
    handleSave,
    handleCancel,
    handleTitleChange,
    handleFormUpdate,
  };
}
