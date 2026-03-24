import { createFileRoute } from '@tanstack/react-router'
import { useAmendmentState } from '@/zero/amendments/useAmendmentState'
import { useAuth } from '@/providers/auth-provider'
import { AmendmentEditContent } from '@/features/amendments/ui/AmendmentEditContent'
import { NotFound } from '@/features/shared/ui/ui/not-found'

export const Route = createFileRoute('/_authed/amendment/$id/settings')({
  component: AmendmentSettingsPage,
})

function AmendmentSettingsPage() {
  const { id } = Route.useParams()
  const { user } = useAuth()
  const { amendment, amendmentProcess, isLoading } = useAmendmentState({
    amendmentId: id,
    includeProcessData: true,
  })

  if (!isLoading && !amendment) {
    return <NotFound />
  }

  const collaborators = amendment?.collaborators ? [...amendment.collaborators] : []
  const agendaItemId = amendmentProcess?.agenda_items?.[0]?.id

  return (
    <AmendmentEditContent
      amendmentId={id}
      amendment={amendment}
      collaborators={collaborators}
      currentUserId={user?.id || ''}
      isLoading={isLoading}
      mode="edit"
      agendaItemId={agendaItemId}
    />
  )
}
