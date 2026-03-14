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
  const mappedUserRecord = userRecord
    ? {
        id: userRecord.id,
        name: `${userRecord.first_name ?? ''} ${userRecord.last_name ?? ''}`.trim() || undefined,
        email: userRecord.email ?? undefined,
        avatar: userRecord.avatar ?? undefined,
      }
    : undefined
  return (
    <DocumentEditorView
      amendmentId={id}
      userId={user?.id}
      userRecord={mappedUserRecord}
      userColor={userColor}
    />
  )
}
