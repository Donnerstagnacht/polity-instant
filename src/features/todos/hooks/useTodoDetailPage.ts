import { useState, useEffect } from 'react';
import { useTodoState } from '@/zero/todos/useTodoState';
import { useTodoMutations } from './useTodoMutations';
import { TodoFormData, TodoStatus, TodoPriority } from '../types/todo.types';

export function useTodoDetailPage(todoId: string) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { updateTodo } = useTodoMutations();

  const { todo } = useTodoState({ todoId });

  const [formData, setFormData] = useState<TodoFormData>({
    title: todo?.title || '',
    description: todo?.description || '',
    status: (todo?.status || 'pending') as TodoStatus,
    priority: (todo?.priority || 'medium') as TodoPriority,
    dueDate: todo?.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : '',
  });

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        status: (todo.status || 'pending') as TodoStatus,
        priority: (todo.priority || 'medium') as TodoPriority,
        dueDate: todo.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : '',
      });
    }
  }, [todo]);

  const handleSave = async () => {
    if (!todo) return;

    setIsSaving(true);
    const updates: Parameters<typeof updateTodo>[1] = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.dueDate ? new Date(formData.dueDate).getTime() : null,
    };

    if (formData.status === 'completed' && todo.status !== 'completed') {
      updates.completed_at = Date.now();
    } else if (formData.status !== 'completed' && todo.status === 'completed') {
      updates.completed_at = null;
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
      status: (todo.status || 'pending') as TodoStatus,
      priority: (todo.priority || 'medium') as TodoPriority,
      dueDate: todo.due_date ? new Date(todo.due_date).toISOString().split('T')[0] : '',
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
