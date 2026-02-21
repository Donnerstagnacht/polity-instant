import { createFileRoute } from '@tanstack/react-router'
import { UserWiki } from '@/features/users/wiki'

export const Route = createFileRoute('/_authed/user/$id/')({
  component: UserWikiPage,
})

function UserWikiPage() {
  const { id } = Route.useParams()
  return <UserWiki userId={id} />
}
