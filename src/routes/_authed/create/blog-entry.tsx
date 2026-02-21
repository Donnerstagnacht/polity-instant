import { createFileRoute } from '@tanstack/react-router'
import { CreateBlogForm } from '@/features/blogs/ui/CreateBlogForm'

export const Route = createFileRoute('/_authed/create/blog-entry')({
  component: CreateBlogEntryPage,
})

function CreateBlogEntryPage() {
  return <CreateBlogForm />
}
