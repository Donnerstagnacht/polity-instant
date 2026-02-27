import { createFileRoute } from '@tanstack/react-router'
import { NotificationSettingsPage } from '@/features/notifications/ui/NotificationSettingsPage'

export const Route = createFileRoute('/_authed/user/$id/notification-settings')({
  component: UserNotificationSettingsPage,
})

function UserNotificationSettingsPage() {
  const { id } = Route.useParams()
  return <NotificationSettingsPage userId={id} />
}
