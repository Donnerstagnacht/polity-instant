import { createFileRoute } from '@tanstack/react-router'
import { EntityNotifications } from '@/components/notifications/EntityNotifications'
import { useGroupById } from '@/zero/groups/useGroupState'

export const Route = createFileRoute('/_authed/group/$id/notifications')({
  component: GroupNotificationsPage,
})

function GroupNotificationsPage() {
  const { id } = Route.useParams()
  const { group } = useGroupById(id)

  return (
    <EntityNotifications
      entityId={id}
      entityType="group"
      entityName={group?.name ?? ''}
    />
  )
}
