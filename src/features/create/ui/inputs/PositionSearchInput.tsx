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
  /** Filter positions to only these groups */
  groupIds?: string[]
  /** Filter positions to this event's groups */
  eventId?: string
}

export function PositionSearchInput({
  value,
  onChange,
  label,
  placeholder = 'Search for a position...',
  groupIds,
}: PositionSearchInputProps) {
  const { positions } = usePositionsWithGroups()

  const filteredPositions = useMemo(() => {
    if (!positions) return []
    if (!groupIds || groupIds.length === 0) return positions
    return positions.filter(
      (p) => p.group_id && groupIds.includes(p.group_id),
    )
  }, [positions, groupIds])

  const items = useMemo(
    () =>
      toTypeaheadItems(
        filteredPositions,
        'position',
        (p) => p.title || 'Position',
        (p) => p.description?.substring(0, 60),
      ),
    [filteredPositions],
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
