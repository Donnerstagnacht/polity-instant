import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/features/auth/ui/LoginForm'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

function AuthPage() {
  return <LoginForm />
}
