import { createFileRoute } from '@tanstack/react-router'
import { AmendmentProcessFlow } from '@/features/amendments/ui/AmendmentProcessFlow'

export const Route = createFileRoute('/_authed/amendment/$id/process')({
  component: AmendmentProcessPage,
})

function AmendmentProcessPage() {
  const { id } = Route.useParams()
  return <AmendmentProcessFlow amendmentId={id} />
}
