import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/amendment/$id')({
  component: AmendmentLayout,
})

function AmendmentLayout() {
  return <Outlet />
}
