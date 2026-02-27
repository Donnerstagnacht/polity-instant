import { createFileRoute } from '@tanstack/react-router'
import { CreateFormShell } from '@/features/create/ui/CreateFormShell'
import { useCreateAmendmentForm } from '@/features/create/hooks/useCreateAmendmentForm'

export const Route = createFileRoute('/_authed/create/amendment')({
  component: CreateAmendmentPage,
})

function CreateAmendmentPage() {
  const config = useCreateAmendmentForm()
  return <CreateFormShell config={config} />
}
