import { createFileRoute, Link } from '@tanstack/react-router'
import { useEventState } from '@/zero/events/useEventState'

export const Route = createFileRoute('/_authed/group/$id/events')({
  component: GroupEventsPage,
})

function GroupEventsPage() {
  const { id } = Route.useParams()
  const { eventsByGroup: events } = useEventState({ groupId: id })

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Group Events</h1>
      {(!events || events.length === 0) ? (
        <p className="text-muted-foreground">No events found for this group.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event: any) => (
            <li key={event.id} className="rounded-lg border p-4">
              <Link to={`/event/${event.id}`} className="text-lg font-semibold hover:underline">
                {event.title || 'Untitled Event'}
              </Link>
              {event.date && <p className="text-sm text-muted-foreground">{event.date}</p>}
              {event.status && <span className="text-xs text-muted-foreground">Status: {event.status}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
