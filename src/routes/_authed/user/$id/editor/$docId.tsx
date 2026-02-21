import { createFileRoute } from '@tanstack/react-router'
import { EditorView } from '@/features/editor/ui/EditorView'

export const Route = createFileRoute('/_authed/user/$id/editor/$docId')({
  component: UserEditorDocPage,
})

function UserEditorDocPage() {
  const { id, docId } = Route.useParams()
  return <EditorView entityType="document" entityId={docId} userId={id} />
}
