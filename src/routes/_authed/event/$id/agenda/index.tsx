import { createFileRoute } from '@tanstack/react-router'
import { EventAgenda } from '@/features/agendas/ui/EventAgenda'

export const Route = createFileRoute('/_authed/event/$id/agenda/')({
  component: EventAgendaIndexPage,
})

function EventAgendaIndexPage() {
  const { id } = Route.useParams()
  return <EventAgenda eventId={id} />
}
