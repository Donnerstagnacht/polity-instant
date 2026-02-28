import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/group/$id/blog/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/group/$id/blog/"!</div>
}
