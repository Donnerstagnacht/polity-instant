import { createFileRoute } from '@tanstack/react-router'
import { EntityNotifications } from '@/components/notifications/EntityNotifications'
import { useAmendmentState } from '@/zero/amendments/useAmendmentState'

export const Route = createFileRoute('/_authed/amendment/$id/notifications')({
  component: AmendmentNotificationsPage,
})

function AmendmentNotificationsPage() {
  const { id } = Route.useParams()
  const { amendment } = useAmendmentState({ amendmentId: id })

  return (
    <EntityNotifications
      entityId={id}
      entityType="amendment"
      entityName={amendment?.title ?? ''}
    />
  )
}
