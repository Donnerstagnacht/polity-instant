import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/event/$id/stream')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/event/$id/agenda', params: { id: params.id } })
  },
  component: () => null,
})
