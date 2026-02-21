import { createFileRoute } from '@tanstack/react-router'
import { GroupDocumentsList } from '@/features/documents/ui/GroupDocumentsList'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute('/_authed/group/$id/editor')({
  component: GroupEditorPage,
})

function GroupEditorPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  return <GroupDocumentsList groupId={id} userId={user?.id} />
}
