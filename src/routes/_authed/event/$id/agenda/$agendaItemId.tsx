import { createFileRoute } from '@tanstack/react-router'
import { EventAgendaItemDetail } from '@/features/agendas/ui/EventAgendaItemDetail'

export const Route = createFileRoute('/_authed/event/$id/agenda/$agendaItemId')({
  component: EventAgendaItemPage,
})

function EventAgendaItemPage() {
  const { id, agendaItemId } = Route.useParams()
  return <EventAgendaItemDetail eventId={id} agendaItemId={agendaItemId} />
}
