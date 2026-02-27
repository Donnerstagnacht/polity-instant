import { createFileRoute } from '@tanstack/react-router'
import { CreateFormShell } from '@/features/create/ui/CreateFormShell'
import { useCreateStatementForm } from '@/features/create/hooks/useCreateStatementForm'

export const Route = createFileRoute('/_authed/create/statement')({
  component: CreateStatementPage,
})

function CreateStatementPage() {
  const config = useCreateStatementForm()
  return <CreateFormShell config={config} />
}
