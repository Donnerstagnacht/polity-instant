import { createFileRoute } from '@tanstack/react-router'
import { StatementDetail } from '@/features/statements/ui/StatementDetail'

export const Route = createFileRoute('/_authed/statement/$id')({
  component: StatementPage,
})

function StatementPage() {
  const { id } = Route.useParams()
  return <StatementDetail statementId={id} />
}
