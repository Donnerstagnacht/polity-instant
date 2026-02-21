import { createFileRoute } from '@tanstack/react-router'
import { ChangeRequestsView } from '@/features/change-requests/ui/ChangeRequestsView'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/_authed/amendment/$id/change-requests')({
  component: AmendmentChangeRequestsPage,
})

function AmendmentChangeRequestsPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  return <ChangeRequestsView amendmentId={id} userId={user?.id ?? ''} />
}
