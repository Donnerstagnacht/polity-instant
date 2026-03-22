import { createFileRoute } from '@tanstack/react-router'
import { EditorView } from '@/features/editor/ui/EditorView'
import { useAuth } from '@/providers/auth-provider'
import { useUserState } from '@/zero/users/useUserState'

export const Route = createFileRoute('/_authed/group/$id/blog/$entryId/editor')({
  component: GroupBlogEditorPage,
})

function GroupBlogEditorPage() {
  const { entryId } = Route.useParams()
  const { user } = useAuth()
  const { currentUser } = useUserState()

  const userRecord = currentUser
    ? {
        id: currentUser.id,
        name: [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.handle || '',
        email: user?.email,
        avatar: currentUser.avatar ?? undefined,
      }
    : undefined

  return (
    <EditorView
      entityType="blog"
      entityId={entryId}
      userId={user?.id}
      userRecord={userRecord}
    />
  )
}
