import { createFileRoute } from '@tanstack/react-router'
import { BlogEditorView } from '@/features/blogs/ui/BlogEditorView'
import { useAuth } from '@/providers/auth-provider'
import { useUserState } from '@/zero/users/useUserState'

export const Route = createFileRoute('/_authed/user/$id/blog/$entryId/editor')({
  component: UserBlogEditorPage,
})

function UserBlogEditorPage() {
  const { entryId } = Route.useParams()
  const { user } = useAuth()
  const { currentUser } = useUserState()

  const userRecord = currentUser
    ? {
        name: [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.handle || '',
        email: user?.email,
        avatar: currentUser.avatar,
      }
    : undefined

  return (
    <BlogEditorView
      blogId={entryId}
      userId={user?.id}
      userRecord={userRecord}
      userColor="#4f46e5"
    />
  )
}
