import { createFileRoute } from '@tanstack/react-router'
import { AmendmentWiki } from '@/features/amendments/AmendmentWiki'

export const Route = createFileRoute('/_authed/amendment/$id/')({
  component: AmendmentWikiPage,
})

function AmendmentWikiPage() {
  const { id } = Route.useParams()
  return <AmendmentWiki amendmentId={id} />
}
