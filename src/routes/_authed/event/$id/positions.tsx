import { createFileRoute } from '@tanstack/react-router'
import { EventPositions } from '@/features/positions/ui/EventPositions'

export const Route = createFileRoute('/_authed/event/$id/positions')({
  component: EventPositionsPage,
})

function EventPositionsPage() {
  const { id } = Route.useParams()
  return <EventPositions eventId={id} />
}
