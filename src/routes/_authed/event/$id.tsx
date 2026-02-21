import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/event/$id')({
  component: EventLayout,
})

function EventLayout() {
  return <Outlet />
}
