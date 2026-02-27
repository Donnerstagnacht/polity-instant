import { createFileRoute } from '@tanstack/react-router'
import { CreateFormShell } from '@/features/create/ui/CreateFormShell'
import { useCreatePositionForm } from '@/features/create/hooks/useCreatePositionForm'

export const Route = createFileRoute('/_authed/create/position')({
  component: CreatePositionPage,
})

function CreatePositionPage() {
  const config = useCreatePositionForm()
  return <CreateFormShell config={config} />
}
