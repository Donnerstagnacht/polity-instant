import { createFileRoute } from '@tanstack/react-router'
import { UserBlogsAndStatementsPage } from '@/features/users/ui/UserBlogsAndStatementsPage'

export const Route = createFileRoute('/_authed/user/$id/blogs-and-statements')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <UserBlogsAndStatementsPage userId={id} />
}
