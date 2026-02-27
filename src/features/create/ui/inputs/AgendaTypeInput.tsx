import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Mic, Vote, Speech, MessageSquare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type AgendaType = 'election' | 'vote' | 'speech' | 'discussion'

interface AgendaTypeInputProps {
  value: AgendaType
  onChange: (type: AgendaType) => void
  label?: string
}

const AGENDA_TYPE_OPTIONS: { value: AgendaType; icon: LucideIcon }[] = [
  { value: 'election', icon: Vote },
  { value: 'vote', icon: Vote },
  { value: 'speech', icon: Mic },
  { value: 'discussion', icon: MessageSquare },
]

export function AgendaTypeInput({ value, onChange, label = 'Type' }: AgendaTypeInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as AgendaType)}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {AGENDA_TYPE_OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <Label
                key={opt.value}
                htmlFor={`agenda-type-${opt.value}`}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 capitalize transition-colors ${
                  value === opt.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value={opt.value} id={`agenda-type-${opt.value}`} />
                <Icon className="h-4 w-4" />
                <span className="text-sm">{opt.value}</span>
              </Label>
            )
          })}
        </div>
      </RadioGroup>
    </div>
  )
}
