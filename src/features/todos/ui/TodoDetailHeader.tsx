import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Save, X } from 'lucide-react';

interface TodoDetailHeaderProps {
  isEditing: boolean;
  isSaving: boolean;
  title: string;
  formTitle?: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTitleChange?: (title: string) => void;
}

export function TodoDetailHeader({
  isEditing,
  isSaving,
  title,
  formTitle,
  onEdit,
  onSave,
  onCancel,
  onTitleChange,
}: TodoDetailHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        {isEditing ? (
          <Input
            value={formTitle}
            onChange={e => onTitleChange?.(e.target.value)}
            className="text-2xl font-bold"
            placeholder="Todo title"
          />
        ) : (
          <h1 className="text-3xl font-bold">{title}</h1>
        )}
      </div>
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button onClick={onSave} disabled={isSaving} size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button onClick={onCancel} variant="outline" size="sm" disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={onEdit} variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
