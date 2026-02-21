import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { EnsureUser } from '@/features/auth/EnsureUser'
import { useZeroReady } from '@/providers/zero-provider'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  const zeroReady = useZeroReady()

  if (!zeroReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <EnsureUser>
      <Outlet />
    </EnsureUser>
  )
}
