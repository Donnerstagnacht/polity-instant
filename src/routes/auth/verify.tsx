import { createFileRoute } from '@tanstack/react-router'
import { VerifyForm } from '@/features/auth/ui/VerifyForm'

export const Route = createFileRoute('/auth/verify')({
  component: AuthVerifyPage,
})

function AuthVerifyPage() {
  return <VerifyForm />
}
