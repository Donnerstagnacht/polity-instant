import { createFileRoute } from '@tanstack/react-router'
import { AuthCallbackPage } from '@/features/auth/ui/AuthCallbackPage'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackRoute,
})

function AuthCallbackRoute() {
  return <AuthCallbackPage />
}