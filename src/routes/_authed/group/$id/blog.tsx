import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/group/$id/blog')({
  component: () => <Outlet />,
})
