import { Label } from '@/features/shared/ui/ui/label'
import { RadioGroup, RadioGroupItem } from '@/features/shared/ui/ui/radio-group'
import { Input } from '@/features/shared/ui/ui/input'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { cn } from '@/features/shared/utils/utils'

type RecurringPattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'four-yearly'

interface RecurringPatternInputProps {
  value: RecurringPattern
  onChange: (pattern: RecurringPattern) => void
  endDate?: string
  onEndDateChange?: (date: string) => void
  interval?: number
  onIntervalChange?: (interval: number) => void
  /** Selected weekdays when pattern is 'weekly'. 0=Mon..6=Sun */
  weekdays?: number[]
  onWeekdaysChange?: (weekdays: number[]) => void
}

const WEEKDAY_INDICES = [0, 1, 2, 3, 4, 5, 6] as const

export function RecurringPatternInput({
  value,
  onChange,
  endDate,
  onEndDateChange,
  interval = 1,
  onIntervalChange,
  weekdays = [],
  onWeekdaysChange,
}: RecurringPatternInputProps) {
  const { t } = useTranslation()

  const dayLabels = [
    t('common.days.mondayShort'),
    t('common.days.tuesdayShort'),
    t('common.days.wednesdayShort'),
    t('common.days.thursdayShort'),
    t('common.days.fridayShort'),
    t('common.days.saturdayShort'),
    t('common.days.sundayShort'),
  ]

  const options: { value: RecurringPattern; label: string; description: string }[] = [
    { value: 'none', label: t('pages.create.event.recurringPatterns.none'), description: t('pages.create.event.recurringPatterns.noneDesc') },
    { value: 'daily', label: t('pages.create.event.recurringPatterns.daily'), description: t('pages.create.event.recurringPatterns.dailyDesc') },
    { value: 'weekly', label: t('pages.create.event.recurringPatterns.weekly'), description: t('pages.create.event.recurringPatterns.weeklyDesc') },
    { value: 'monthly', label: t('pages.create.event.recurringPatterns.monthly'), description: t('pages.create.event.recurringPatterns.monthlyDesc') },
    { value: 'yearly', label: t('pages.create.event.recurringPatterns.yearly'), description: t('pages.create.event.recurringPatterns.yearlyDesc') },
    { value: 'four-yearly', label: t('pages.create.event.recurringPatterns.fourYearly'), description: t('pages.create.event.recurringPatterns.fourYearlyDesc') },
  ]

  const toggleWeekday = (day: number) => {
    if (!onWeekdaysChange) return
    const next = weekdays.includes(day)
      ? weekdays.filter(d => d !== day)
      : [...weekdays, day]
    onWeekdaysChange(next)
  }

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

      {value !== 'none' && (
        <div className="space-y-4 rounded-lg border p-4">
          {/* Interval */}
          {onIntervalChange && (
            <div className="space-y-2">
              <Label>{t('pages.create.event.recurringInterval')}</Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={interval}
                onChange={e => onIntervalChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-24"
              />
            </div>
          )}

          {/* Weekly day picker */}
          {value === 'weekly' && onWeekdaysChange && (
            <div className="space-y-2">
              <Label>{t('pages.create.event.recurringWeekdays')}</Label>
              <div className="flex gap-1">
                {WEEKDAY_INDICES.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWeekday(day)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors',
                      weekdays.includes(day)
                        ? 'bg-primary text-primary-foreground'
                        : 'border hover:bg-muted'
                    )}
                  >
                    {dayLabels[day]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* End date */}
          {onEndDateChange && (
            <div className="space-y-2">
              <Label>{t('pages.create.event.recurringEnds')}</Label>
              <Input
                type="date"
                value={endDate ?? ''}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
