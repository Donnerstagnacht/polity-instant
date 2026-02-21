import { createFileRoute } from '@tanstack/react-router'
import { EventEdit } from '@/features/events/ui/EventEdit'

export const Route = createFileRoute('/_authed/event/$id/settings')({
  component: EventSettingsPage,
})

function EventSettingsPage() {
  const { id } = Route.useParams()
  return <EventEdit eventId={id} />
}
