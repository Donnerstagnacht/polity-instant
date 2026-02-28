import { Label } from '@/features/shared/ui/ui/label'
import { Input } from '@/features/shared/ui/ui/input'
import { Switch } from '@/features/shared/ui/ui/switch'
import { Card } from '@/features/shared/ui/ui/card'
import { Calendar } from 'lucide-react'
import { useTranslation } from '@/features/shared/hooks/use-translation'

export interface ConstitutionalEventData {
  enabled: boolean
  eventName: string
  eventLocation: string
  eventStartDate: string
  eventStartTime: string
}

interface ConstitutionalEventInputProps {
  value: ConstitutionalEventData
  onChange: (data: ConstitutionalEventData) => void
}

export function ConstitutionalEventInput({ value, onChange }: ConstitutionalEventInputProps) {
  const { t } = useTranslation()

  const update = (patch: Partial<ConstitutionalEventData>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="create-event" className="cursor-pointer">
          {t('pages.create.group.createConstitutionalEvent')}
        </Label>
        <Switch
          id="create-event"
          checked={value.enabled}
          onCheckedChange={(checked) => update({ enabled: checked })}
        />
      </div>
      <p className="text-muted-foreground text-sm">
        {t('pages.create.group.optionalGeneralAssembly')}
      </p>

      {value.enabled && (
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>{t('pages.create.group.eventName')}</Label>
            <Input
              placeholder={t('pages.create.group.eventNamePlaceholder')}
              value={value.eventName}
              onChange={(e) => update({ eventName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('pages.create.group.eventLocation')}</Label>
            <Input
              placeholder={t('pages.create.group.eventLocationPlaceholder')}
              value={value.eventLocation}
              onChange={(e) => update({ eventLocation: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('pages.create.group.eventStartDate')}</Label>
              <Input
                type="date"
                value={value.eventStartDate}
                onChange={(e) => update({ eventStartDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('pages.create.group.eventStartTime')}</Label>
              <Input
                type="time"
                value={value.eventStartTime}
                onChange={(e) => update({ eventStartTime: e.target.value })}
              />
            </div>
          </div>

          <Card className="bg-muted/50 p-3">
            <div className="flex items-start gap-2">
              <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="text-muted-foreground flex-1 text-sm">
                <p className="mb-1 font-medium">{t('pages.create.group.eventTypeGeneralAssembly')}</p>
                <p>{t('pages.create.group.eventTypeDescription')}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
