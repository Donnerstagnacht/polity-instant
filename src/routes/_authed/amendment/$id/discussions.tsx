import { createFileRoute } from '@tanstack/react-router'
import { DiscussionsView } from '@/features/discussions/ui/DiscussionsView'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/_authed/amendment/$id/discussions')({
  component: AmendmentDiscussionsPage,
})

function AmendmentDiscussionsPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  return <DiscussionsView amendmentId={id} userId={user?.id ?? ''} />
}
