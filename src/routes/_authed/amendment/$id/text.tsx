import { createFileRoute } from '@tanstack/react-router'
import { DocumentEditorView } from '@/features/documents/amendment-editor/ui/DocumentEditorView'
import { useAuth } from '@/providers/auth-provider'
import { useUserState } from '@/zero/users/useUserState'
import { generateUserColor } from '@/features/editor'

export const Route = createFileRoute('/_authed/amendment/$id/text')({
  component: AmendmentTextPage,
})

function AmendmentTextPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  const { user: userRecord } = useUserState({ userId: user?.id })
  const userColor = user?.id ? generateUserColor(user.id) : '#888888'
  return (
    <DocumentEditorView
      amendmentId={id}
      userId={user?.id}
      userRecord={userRecord}
      userColor={userColor}
    />
  )
}
