import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch'
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems'
import { useAgendaState } from '@/zero/agendas/useAgendaState'
import { Label } from '@/features/shared/ui/ui/label'
import { useMemo } from 'react'
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers'

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

  const items = useMemo(
    () =>
      toTypeaheadItems(
        pendingElections ?? [],
        'election',
        (e) => e.title || 'Election',
        (e) => e.description?.substring(0, 60),
      ),
    [pendingElections],
  )

  const handleChange = (item: TypeaheadItem | null) => {
    onChange(item?.id ?? '')
  }

  return (
    <div>
      {label && <Label className="mb-2 block">{label}</Label>}
      <TypeaheadSearch
        items={items}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  )
}
