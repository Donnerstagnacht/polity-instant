import { createFileRoute } from '@tanstack/react-router'
import { EntityNotifications } from '@/features/notifications/ui/EntityNotifications.tsx'
import { useEventById } from '@/zero/events/useEventState'

export const Route = createFileRoute('/_authed/event/$id/notifications')({
  component: EventNotificationsPage,
})

function EventNotificationsPage() {
  const { id } = Route.useParams()
  const { event } = useEventById(id)

  return (
    <EntityNotifications
      entityId={id}
      entityType="event"
      entityName={event?.title ?? ''}
    />
  )
}
