import { createFileRoute } from '@tanstack/react-router'
import { useTodoState } from '@/zero/todos/useTodoState'
import { useGroupState } from '@/zero/groups/useGroupState'

export const Route = createFileRoute('/_authed/group/$id/operation')({
  component: GroupOperationPage,
})

function GroupOperationPage() {
  const { id } = Route.useParams()
  const { groupTodos: todos = [] } = useTodoState({ groupId: id })
  const { positions = [] } = useGroupState({ groupId: id })

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Group Operations</h1>
      <section>
        <h2 className="text-xl font-semibold mb-4">Todos ({todos.length})</h2>
        <ul className="space-y-2">
          {todos.map((todo: any) => (
            <li key={todo.id} className="p-3 border rounded">
              <span className={todo.completed ? 'line-through text-muted-foreground' : ''}>
                {todo.title}
              </span>
              {todo.assignments?.length > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  — {todo.assignments.map((a: any) => a.user?.display_name).filter(Boolean).join(', ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">Positions ({positions.length})</h2>
        <ul className="space-y-2">
          {positions.map((position: any) => (
            <li key={position.id} className="p-3 border rounded">
              {position.title}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
