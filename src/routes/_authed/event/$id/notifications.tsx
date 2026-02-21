import { createFileRoute } from '@tanstack/react-router'
import { useNotificationState } from '@/zero/notifications/useNotificationState'

export const Route = createFileRoute('/_authed/event/$id/notifications')({
  component: EventNotificationsPage,
})

function EventNotificationsPage() {
  const { id } = Route.useParams()
  const { entityByIdNotifications: notifications } = useNotificationState({ entityId: id })

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Event Notifications</h1>
      {(!notifications || notifications.length === 0) ? (
        <p className="text-muted-foreground">No notifications.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n: any) => (
            <li key={n.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{n.title || 'Notification'}</p>
                  {n.message && <p className="text-sm text-muted-foreground">{n.message}</p>}
                  {n.sender?.[0] && <p className="text-xs text-muted-foreground">From: {n.sender[0].name || n.sender[0].email}</p>}
                </div>
                {n.created_at && <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
