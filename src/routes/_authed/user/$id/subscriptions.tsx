import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUserSubscriptions } from '@/features/payments/hooks/useUserSubscriptions'
import { SubscriptionsTable } from '@/features/payments/ui/SubscriptionsTable'

export const Route = createFileRoute('/_authed/user/$id/subscriptions')({
  component: UserSubscriptionsPage,
})

function UserSubscriptionsPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { subscriptions, unsubscribe } = useUserSubscriptions(id)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Subscriptions</h1>
      <SubscriptionsTable
        subscriptions={subscriptions}
        onUnsubscribe={unsubscribe}
        onNavigateToUser={(uid: string) => navigate({ to: '/user/$id', params: { id: uid } })}
        onNavigateToGroup={(gid: string) => navigate({ to: '/group/$id', params: { id: gid } })}
        onNavigateToAmendment={(aid: string) => navigate({ to: '/amendment/$id', params: { id: aid } })}
        onNavigateToEvent={(eid: string) => navigate({ to: '/event/$id', params: { id: eid } })}
        onNavigateToBlog={(bid: string) => navigate({ to: '/blog/$id', params: { id: bid } })}
      />
    </div>
  )
}
