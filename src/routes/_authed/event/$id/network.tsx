import { createFileRoute } from '@tanstack/react-router'
import { EventNetworkFlow } from '@/features/network/ui/EventNetworkFlow'

export const Route = createFileRoute('/_authed/event/$id/network')({
  component: EventNetworkPage,
})

function EventNetworkPage() {
  const { id } = Route.useParams()
  return <EventNetworkFlow eventId={id} />
}
