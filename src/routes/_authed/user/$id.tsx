import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/user/$id')({
  component: UserLayout,
})

function UserLayout() {
  return <Outlet />
}
