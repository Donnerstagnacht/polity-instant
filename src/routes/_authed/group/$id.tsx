import { createFileRoute } from '@tanstack/react-router'
import { GroupWiki } from '@/features/groups/GroupWiki'

export const Route = createFileRoute('/_authed/group/$id')({
  component: GroupWikiPage,
})

function GroupWikiPage() {
  const { id } = Route.useParams()
  return <GroupWiki groupId={id} />
}
