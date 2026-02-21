import { createFileRoute } from '@tanstack/react-router'
import { CreateAgendaItemForm } from '@/features/agendas/ui/CreateAgendaItemForm'

export const Route = createFileRoute('/_authed/create/agenda-item')({
  component: CreateAgendaItemPage,
})

function CreateAgendaItemPage() {
  return <CreateAgendaItemForm />
}
