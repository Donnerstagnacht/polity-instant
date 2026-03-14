import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch'
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems'
import { useAllEvents } from '@/zero/events/useEventState'
import { Label } from '@/features/shared/ui/ui/label'
import { useMemo } from 'react'
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers'

interface EventSearchInputProps {
  value: string
  onChange: (eventId: string) => void
  label?: string
  placeholder?: string
  /** Only show events belonging to this group */
  filterByGroupId?: string
}

export function EventSearchInput({
  value,
  onChange,
  label,
  placeholder = 'Search for an event...',
  filterByGroupId,
}: EventSearchInputProps) {
  const { events } = useAllEvents()

  const items = useMemo(() => {
    const filtered = filterByGroupId
      ? events.filter((e) => e.group_id === filterByGroupId)
      : events
    return toTypeaheadItems(
      filtered,
      'event',
      (e) => e.title || 'Event',
      (e) => e.description?.substring(0, 60),
    )
  }, [events, filterByGroupId])

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
