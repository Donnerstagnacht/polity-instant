import { createFileRoute } from '@tanstack/react-router'
import { GroupNetworkFlow } from '@/features/network/ui/GroupNetworkFlow'

export const Route = createFileRoute('/_authed/group/$id/network')({
  component: GroupNetworkPage,
})

function GroupNetworkPage() {
  const { id } = Route.useParams()

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <GroupNetworkFlow groupId={id} />
    </div>
  )
}
