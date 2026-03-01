import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/user/$id/blog')({
  component: () => <Outlet />,
})
