import { createFileRoute } from '@tanstack/react-router'
import { GroupBlogsAndStatementsPage } from '@/features/groups/ui/GroupBlogsAndStatementsPage'

export const Route = createFileRoute('/_authed/group/$id/blogs-and-statements')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  const { id } = Route.useParams()
  return <GroupBlogsAndStatementsPage groupId={id} />
}
