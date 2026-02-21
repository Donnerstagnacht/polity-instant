import { createFileRoute } from '@tanstack/react-router'
import { EventWiki } from '@/features/events/EventWiki'

export const Route = createFileRoute('/_authed/event/$id')({
  component: EventWikiPage,
})

function EventWikiPage() {
  const { id } = Route.useParams()
  return <EventWiki eventId={id} />
}
