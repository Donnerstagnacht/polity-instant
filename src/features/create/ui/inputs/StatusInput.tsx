import { Label } from '@/features/shared/ui/ui/label'
import { Button } from '@/features/shared/ui/ui/button'
import { useTranslation } from '@/features/shared/hooks/use-translation'

type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

interface StatusInputProps {
  value: TodoStatus
  onChange: (status: TodoStatus) => void
}

export function StatusInput({ value, onChange }: StatusInputProps) {
  const { t } = useTranslation()

  const options: { value: TodoStatus; label: string }[] = [
    { value: 'pending', label: t('pages.create.todo.status.todo') },
    { value: 'in_progress', label: t('pages.create.todo.status.inProgress') },
    { value: 'completed', label: t('pages.create.todo.status.completed') },
  ]

  return (
    <div className="space-y-2">
      <Label>{t('pages.create.todo.statusLabel')}</Label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant={value === opt.value ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
