import { createFileRoute } from '@tanstack/react-router'
import { useAmendmentState } from '@/zero/amendments/useAmendmentState'
import { useAuth } from '@/providers/auth-provider'
import { AmendmentEditContent } from '@/features/amendments/ui/AmendmentEditContent'

export const Route = createFileRoute('/_authed/amendment/$id/settings')({
  component: AmendmentSettingsPage,
})

function AmendmentSettingsPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  const { amendment, isLoading } = useAmendmentState({ amendmentId: id })
  const collaborators = amendment?.collaborators ? [...amendment.collaborators] : []

  return (
    <AmendmentEditContent
      amendmentId={id}
      amendment={amendment}
      collaborators={collaborators}
      currentUserId={user?.id || ''}
      isLoading={isLoading}
    />
  )
}
