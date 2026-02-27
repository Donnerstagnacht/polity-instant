import { createFileRoute } from '@tanstack/react-router'
import { CreateFormShell } from '@/features/create/ui/CreateFormShell'
import { useCreateBlogForm } from '@/features/create/hooks/useCreateBlogForm'

export const Route = createFileRoute('/_authed/create/blog-entry')({
  component: CreateBlogEntryPage,
})

function CreateBlogEntryPage() {
  const config = useCreateBlogForm()
  return <CreateFormShell config={config} />
}
