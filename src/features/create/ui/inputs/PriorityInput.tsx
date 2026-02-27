import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/use-translation'

type Priority = 'low' | 'medium' | 'high'

interface PriorityInputProps {
  value: Priority
  onChange: (priority: Priority) => void
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export function PriorityInput({ value, onChange }: PriorityInputProps) {
  const { t } = useTranslation()

  const options: { value: Priority; label: string }[] = [
    { value: 'low', label: t('pages.create.todo.priority.low') },
    { value: 'medium', label: t('pages.create.todo.priority.medium') },
    { value: 'high', label: t('pages.create.todo.priority.high') },
  ]

  return (
    <div className="space-y-2">
      <Label>{t('pages.create.todo.priorityLabel')}</Label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <Button
            key={opt.value}
            type="button"
            variant="outline"
            className={`flex-1 ${value === opt.value ? PRIORITY_COLORS[opt.value] + ' border-current' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
