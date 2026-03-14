import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch'
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems'
import { usePositionsWithGroups } from '@/zero/events/useEventState'
import { Label } from '@/features/shared/ui/ui/label'
import { useMemo } from 'react'
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers'

interface PositionSearchInputProps {
  value: string
  onChange: (positionId: string) => void
  label?: string
  placeholder?: string
}

export function PositionSearchInput({
  value,
  onChange,
  label,
  placeholder = 'Search for a position...',
}: PositionSearchInputProps) {
  const { positions } = usePositionsWithGroups()

  const items = useMemo(
    () =>
      toTypeaheadItems(
        positions ?? [],
        'position',
        (p: any) => p.title || 'Position',
        (p: any) => p.description?.substring(0, 60),
      ),
    [positions],
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
