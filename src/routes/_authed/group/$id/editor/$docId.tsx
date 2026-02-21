import { createFileRoute } from '@tanstack/react-router'
import { DocumentEditor } from '@/features/documents/ui/DocumentEditor'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/_authed/group/$id/editor/$docId')({
  component: GroupEditorDocPage,
})

function GroupEditorDocPage() {
  const { id, docId } = Route.useParams()
  const { user } = useAuth()
  return (
    <DocumentEditor
      documentId={docId}
      groupId={id}
      userId={user?.id}
      userEmail={user?.email}
    />
  )
}
