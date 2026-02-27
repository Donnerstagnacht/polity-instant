import { createFileRoute } from '@tanstack/react-router'
import { CreateFormShell } from '@/features/create/ui/CreateFormShell'
import { useCreatePaymentForm } from '@/features/create/hooks/useCreatePaymentForm'

export const Route = createFileRoute('/_authed/create/payment')({
  component: CreatePaymentPage,
})

function CreatePaymentPage() {
  const config = useCreatePaymentForm()
  return <CreateFormShell config={config} />
}
