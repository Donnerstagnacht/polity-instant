import { createFileRoute } from '@tanstack/react-router'
import { CreateFormShell } from '@/features/create/ui/CreateFormShell'
import { useCreateTodoForm } from '@/features/create/hooks/useCreateTodoForm'

export const Route = createFileRoute('/_authed/create/todo')({
  component: CreateTodoPage,
})

function CreateTodoPage() {
  const config = useCreateTodoForm()
  return <CreateFormShell config={config} />
}
