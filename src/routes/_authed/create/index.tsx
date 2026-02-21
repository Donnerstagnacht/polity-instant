import { createFileRoute } from '@tanstack/react-router'
import { CreateDashboard } from '@/features/create/ui/CreateDashboard'

export const Route = createFileRoute('/_authed/create/')({
  component: CreateIndexPage,
})

function CreateIndexPage() {
  return <CreateDashboard />
}
