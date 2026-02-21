import { createFileRoute } from '@tanstack/react-router'
import { NotificationsPage } from '@/features/notifications/NotificationsPage'

export const Route = createFileRoute('/_authed/notifications')({
  component: NotificationsPage,
})
