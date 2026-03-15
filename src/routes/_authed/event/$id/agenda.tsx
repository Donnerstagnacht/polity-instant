import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/event/$id/agenda')({
  component: () => <Outlet />,
})
