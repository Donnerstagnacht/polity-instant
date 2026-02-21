import { createFileRoute } from '@tanstack/react-router'
import { AmendmentWiki } from '@/features/amendments/AmendmentWiki'

export const Route = createFileRoute('/_authed/amendment/$id')({
  component: AmendmentPage,
})

function AmendmentPage() {
  const { id } = Route.useParams()
  return <AmendmentWiki amendmentId={id} />
}
