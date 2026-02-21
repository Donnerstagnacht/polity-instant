import { createFileRoute } from '@tanstack/react-router'
import { GroupNetworkFlow } from '@/features/network/ui/GroupNetworkFlow'

export const Route = createFileRoute('/_authed/group/$id/network')({
  component: GroupNetworkPage,
})

function GroupNetworkPage() {
  const { id } = Route.useParams()

  return (
    <div>
      <GroupNetworkFlow groupId={id} />
    </div>
  )
}
