import { Label } from '@/features/shared/ui/ui/label'
import { Input } from '@/features/shared/ui/ui/input'
import { useTranslation } from '@/features/shared/hooks/use-translation'

interface DeadlineEntry {
  date: string
  time: string
}

interface DeadlinesInputProps {
  delegateNomination: DeadlineEntry
  proposalSubmission: DeadlineEntry
  amendmentCutoff: DeadlineEntry
  onChange: (
    deadline: 'delegateNomination' | 'proposalSubmission' | 'amendmentCutoff',
    field: 'date' | 'time',
    value: string,
  ) => void
}

export function DeadlinesInput({ delegateNomination, proposalSubmission, amendmentCutoff, onChange }: DeadlinesInputProps) {
  const { t } = useTranslation()

  const deadlines: {
    key: 'delegateNomination' | 'proposalSubmission' | 'amendmentCutoff'
    label: string
    description: string
    value: DeadlineEntry
  }[] = [
    {
      key: 'delegateNomination',
      label: t('pages.create.event.delegateNominationDeadline'),
      description: t('pages.create.event.delegateNominationDeadlineDesc'),
      value: delegateNomination,
    },
    {
      key: 'proposalSubmission',
      label: t('pages.create.event.proposalSubmissionDeadline'),
      description: t('pages.create.event.proposalSubmissionDeadlineDesc'),
      value: proposalSubmission,
    },
    {
      key: 'amendmentCutoff',
      label: t('pages.create.event.amendmentCutoffDeadline'),
      description: t('pages.create.event.amendmentCutoffDeadlineDesc'),
      value: amendmentCutoff,
    },
  ]

  return (
    <div className="space-y-4">
      <Label>{t('pages.create.event.deadlines')}</Label>
      {deadlines.map((d) => (
        <div key={d.key} className="rounded-lg border p-3">
          <Label className="text-sm font-medium">{d.label}</Label>
          <p className="text-muted-foreground mb-2 text-xs">{d.description}</p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={d.value.date}
              onChange={(e) => onChange(d.key, 'date', e.target.value)}
            />
            <Input
              type="time"
              value={d.value.time}
              onChange={(e) => onChange(d.key, 'time', e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
