import { createFileRoute } from '@tanstack/react-router'
import { EditorView } from '@/features/editor/ui/EditorView'
import { useAuth } from '@/providers/auth-provider'
import { useUserState } from '@/zero/users/useUserState'

export const Route = createFileRoute('/_authed/amendment/$id/text')({
  component: AmendmentTextPage,
})

function AmendmentTextPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  const { user: userRecord } = useUserState({ userId: user?.id })

  const mappedUserRecord = userRecord
    ? {
        id: userRecord.id,
        name: `${userRecord.first_name ?? ''} ${userRecord.last_name ?? ''}`.trim() || undefined,
        email: userRecord.email ?? undefined,
        avatar: userRecord.avatar ?? undefined,
      }
    : undefined

  return (
    <EditorView
      entityType="amendment"
      entityId={id}
      userId={user?.id}
      userRecord={mappedUserRecord}
    />
  )
}
