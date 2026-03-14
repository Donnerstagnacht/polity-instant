import { Label } from '@/features/shared/ui/ui/label'
import { RadioGroup, RadioGroupItem } from '@/features/shared/ui/ui/radio-group'
import { useTranslation } from '@/features/shared/hooks/use-translation'

type EventType = 'delegate_assembly' | 'general_assembly' | 'open' | 'on_invite'

interface EventTypeInputProps {
  value: EventType
  onChange: (eventType: EventType) => void
}

export function EventTypeInput({ value, onChange }: EventTypeInputProps) {
  const { t } = useTranslation()

  const options: { value: EventType; label: string; description: string }[] = [
    { value: 'delegate_assembly', label: t('pages.create.event.eventTypes.delegateAssembly'), description: t('pages.create.event.eventTypes.delegateAssemblyDesc') },
    { value: 'general_assembly', label: t('pages.create.event.eventTypes.generalAssembly'), description: t('pages.create.event.eventTypes.generalAssemblyDesc') },
    { value: 'open', label: t('pages.create.event.eventTypes.open'), description: t('pages.create.event.eventTypes.openDesc') },
    { value: 'on_invite', label: t('pages.create.event.eventTypes.onInvite'), description: t('pages.create.event.eventTypes.onInviteDesc') },
  ]

  return (
    <div className="space-y-3">
      <Label>{t('pages.create.event.eventType')}</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as EventType)}>
        <div className="space-y-2">
          {options.map((opt) => (
            <Label
              key={opt.value}
              htmlFor={`event-type-${opt.value}`}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                value === opt.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
            >
              <RadioGroupItem value={opt.value} id={`event-type-${opt.value}`} className="mt-0.5" />
              <div>
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-muted-foreground text-xs">{opt.description}</div>
              </div>
            </Label>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}
