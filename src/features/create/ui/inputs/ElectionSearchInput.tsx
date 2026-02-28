import { TypeAheadSelect } from '@/features/shared/ui/ui/type-ahead-select'
import { ElectionSelectCard } from '@/features/shared/ui/ui/entity-select-cards'
import { useAgendaState } from '@/zero/agendas/useAgendaState'
import { Label } from '@/features/shared/ui/ui/label'

interface ElectionSearchInputProps {
  value: string
  onChange: (electionId: string) => void
  label?: string
  placeholder?: string
}

export function ElectionSearchInput({
  value,
  onChange,
  label,
  placeholder = 'Search for an election...',
}: ElectionSearchInputProps) {
  const { pendingElections } = useAgendaState({ includeElectionsForSearch: true })

  return (
    <div>
      {label && <Label className="mb-2 block">{label}</Label>}
      <TypeAheadSelect
        items={pendingElections ?? []}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchKeys={['title', 'description']}
        renderItem={(election: any) => <ElectionSelectCard election={election} />}
        getItemId={(election: any) => election.id}
      />
    </div>
  )
}
