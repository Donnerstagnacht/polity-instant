import { createFileRoute } from '@tanstack/react-router'
import { SignUpForm } from '@/features/auth/ui/SignUpForm'

export const Route = createFileRoute('/auth/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return <SignUpForm />
}
