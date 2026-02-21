import { createFileRoute } from '@tanstack/react-router'
import { GroupEdit } from '@/features/groups/ui/GroupEdit'

export const Route = createFileRoute('/_authed/group/$id/settings')({
  component: GroupSettingsPage,
})

function GroupSettingsPage() {
  const { id } = Route.useParams()
  return <GroupEdit groupId={id} />
}
