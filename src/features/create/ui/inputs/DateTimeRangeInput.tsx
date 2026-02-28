import { Label } from '@/features/shared/ui/ui/label'
import { Input } from '@/features/shared/ui/ui/input'
import { useTranslation } from '@/features/shared/hooks/use-translation'

interface DateTimeRangeInputProps {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  onChange: (field: 'startDate' | 'startTime' | 'endDate' | 'endTime', value: string) => void
}

export function DateTimeRangeInput({
  startDate,
  startTime,
  endDate,
  endTime,
  onChange,
}: DateTimeRangeInputProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <Label>{t('pages.create.event.dateTime')}</Label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-muted-foreground text-xs">{t('pages.create.event.startDate')}</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">{t('pages.create.event.startTime')}</Label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => onChange('startTime', e.target.value)}
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">{t('pages.create.event.endDate')}</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">{t('pages.create.event.endTime')}</Label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => onChange('endTime', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
