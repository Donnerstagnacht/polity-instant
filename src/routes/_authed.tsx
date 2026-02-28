import { createFileRoute, Outlet } from '@tanstack/react-router'
import { EnsureUser } from '@/features/auth/EnsureUser'
import { useZeroReady } from '@/providers/zero-provider'
import { GlobalLoadingAnimation } from '@/features/shared/ui/ui/global-loading-animation'

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  const zeroReady = useZeroReady()

  if (!zeroReady) {
    return <GlobalLoadingAnimation connectionStatus="connecting" />
  }

  return (
    <EnsureUser>
      <Outlet />
    </EnsureUser>
  )
}
