import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/hooks/use-translation'

type RecurringPattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'four-yearly'

interface RecurringPatternInputProps {
  value: RecurringPattern
  onChange: (pattern: RecurringPattern) => void
  endDate?: string
  onEndDateChange?: (date: string) => void
}

export function RecurringPatternInput({
  value,
  onChange,
  endDate,
  onEndDateChange,
}: RecurringPatternInputProps) {
  const { t } = useTranslation()

  const options: { value: RecurringPattern; label: string; description: string }[] = [
    { value: 'none', label: t('pages.create.event.recurringPatterns.none'), description: t('pages.create.event.recurringPatterns.noneDesc') },
    { value: 'daily', label: t('pages.create.event.recurringPatterns.daily'), description: t('pages.create.event.recurringPatterns.dailyDesc') },
    { value: 'weekly', label: t('pages.create.event.recurringPatterns.weekly'), description: t('pages.create.event.recurringPatterns.weeklyDesc') },
    { value: 'monthly', label: t('pages.create.event.recurringPatterns.monthly'), description: t('pages.create.event.recurringPatterns.monthlyDesc') },
    { value: 'yearly', label: t('pages.create.event.recurringPatterns.yearly'), description: t('pages.create.event.recurringPatterns.yearlyDesc') },
    { value: 'four-yearly', label: t('pages.create.event.recurringPatterns.fourYearly'), description: t('pages.create.event.recurringPatterns.fourYearlyDesc') },
  ]

  return (
    <div className="space-y-4">
      <Label>{t('pages.create.event.recurring')}</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as RecurringPattern)}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.map((opt) => (
            <Label
              key={opt.value}
              htmlFor={`recurring-${opt.value}`}
              className={`flex cursor-pointer flex-col rounded-lg border p-3 transition-colors ${
                value === opt.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value={opt.value} id={`recurring-${opt.value}`} />
                <span className="text-sm font-medium">{opt.label}</span>
              </div>
              <span className="text-muted-foreground mt-1 text-xs">{opt.description}</span>
            </Label>
          ))}
        </div>
      </RadioGroup>

      {value !== 'none' && onEndDateChange && (
        <div>
          <Label>{t('pages.create.event.recurringEnds')}</Label>
          <Input
            type="date"
            value={endDate ?? ''}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="mt-1"
          />
        </div>
      )}
    </div>
  )
}
