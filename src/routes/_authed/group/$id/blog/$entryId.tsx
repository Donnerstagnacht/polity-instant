import { createFileRoute } from '@tanstack/react-router'
import { BlogDetail } from '@/features/blogs/ui/BlogDetail'

export const Route = createFileRoute('/_authed/group/$id/blog/$entryId')({
  component: GroupBlogEntryPage,
})

function GroupBlogEntryPage() {
  const { entryId } = Route.useParams()
  return <BlogDetail blogId={entryId} />
}
