import { TypeAheadSelect } from '@/components/ui/type-ahead-select'
import { EventSelectCard } from '@/components/ui/entity-select-cards'
import { useAllEvents } from '@/zero/events/useEventState'
import { Label } from '@/components/ui/label'
import { useMemo } from 'react'

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

  const filteredEvents = useMemo(() => {
    if (!filterByGroupId) return events
    return events.filter((e: any) => e.group_id === filterByGroupId)
  }, [events, filterByGroupId])

  return (
    <div>
      {label && <Label className="mb-2 block">{label}</Label>}
      <TypeAheadSelect
        items={filteredEvents}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchKeys={['title', 'description']}
        renderItem={(event) => <EventSelectCard event={event} />}
        getItemId={(event) => event.id}
      />
    </div>
  )
}
