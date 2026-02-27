import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/group/$id/editor')({
  component: GroupEditorLayout,
})

function GroupEditorLayout() {
  return <Outlet />
}
