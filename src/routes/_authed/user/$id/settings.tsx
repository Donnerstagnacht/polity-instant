import { createFileRoute } from '@tanstack/react-router'
import { UserEdit } from '@/features/users/ui/UserEdit'

export const Route = createFileRoute('/_authed/user/$id/settings')({
  component: UserSettingsPage,
})

function UserSettingsPage() {
  const { id } = Route.useParams()
  return <UserEdit userId={id} />
}
