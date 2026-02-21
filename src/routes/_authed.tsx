import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { EnsureUser } from '@/features/auth/EnsureUser'

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  return (
    <EnsureUser>
      <Outlet />
    </EnsureUser>
  )
}
