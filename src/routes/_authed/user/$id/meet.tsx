import { createFileRoute } from '@tanstack/react-router'
import { UserMeetingScheduler } from '@/features/users/ui/UserMeetingScheduler'

export const Route = createFileRoute('/_authed/user/$id/meet')({
  component: UserMeetPage,
})

function UserMeetPage() {
  const { id } = Route.useParams()
  return <UserMeetingScheduler userId={id} />
}
