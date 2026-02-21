import { createFileRoute } from '@tanstack/react-router'
import { BlogDetail } from '@/features/blogs/ui/BlogDetail'

export const Route = createFileRoute('/_authed/user/$id/blog/$entryId')({
  component: UserBlogEntryPage,
})

function UserBlogEntryPage() {
  const { entryId } = Route.useParams()
  return <BlogDetail blogId={entryId} />
}
