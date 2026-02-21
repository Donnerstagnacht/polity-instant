import { createFileRoute } from '@tanstack/react-router'
import { TodoDetailPage } from '@/features/todos/TodoDetailPage'

export const Route = createFileRoute('/_authed/todos/$id')({
  component: TodoDetailRoute,
})

function TodoDetailRoute() {
  const { id } = Route.useParams()
  return <TodoDetailPage todoId={id} />
}
