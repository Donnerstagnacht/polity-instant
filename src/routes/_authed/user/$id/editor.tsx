import { createFileRoute } from '@tanstack/react-router'
import { EditorView } from '@/features/editor/ui/EditorView'

export const Route = createFileRoute('/_authed/user/$id/editor')({
  component: UserEditorPage,
})

function UserEditorPage() {
  const { id } = Route.useParams()
  return <EditorView entityType="document" entityId={id} userId={id} />
}
