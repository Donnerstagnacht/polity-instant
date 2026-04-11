import { createFileRoute } from '@tanstack/react-router'
import { SignInForm } from '@/features/auth/ui/SignInForm'

export const Route = createFileRoute('/auth/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  return <SignInForm />
}
