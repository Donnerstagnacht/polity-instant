import { createFileRoute } from '@tanstack/react-router'
import { EventStream } from '@/features/events/ui/EventStream'

export const Route = createFileRoute('/_authed/event/$id/stream')({
  component: EventStreamPage,
})

function EventStreamPage() {
  const { id } = Route.useParams()
  return <EventStream eventId={id} />
}
