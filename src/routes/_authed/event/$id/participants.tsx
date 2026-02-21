import { createFileRoute } from '@tanstack/react-router'
import { EventParticipants } from '@/features/events/ui/EventParticipants'

export const Route = createFileRoute('/_authed/event/$id/participants')({
  component: EventParticipantsPage,
})

function EventParticipantsPage() {
  const { id } = Route.useParams()
  return <EventParticipants eventId={id} />
}
