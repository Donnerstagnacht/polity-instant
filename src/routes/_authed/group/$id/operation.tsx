import { createFileRoute } from '@tanstack/react-router'
import { useGroupOperationPage } from '@/features/groups/hooks/useGroupOperationPage'
import { LinksSection } from '@/features/network/ui/LinksSection'
import { AddLinkDialog } from '@/features/network/ui/AddLinkDialog'
import { PaymentsSection } from '@/features/groups/ui/PaymentsSection'
import { TodosSection } from '@/features/groups/ui/TodosSection'
import { GroupDocumentsList } from '@/features/documents/ui/GroupDocumentsList'
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card'

export const Route = createFileRoute('/_authed/group/$id/operation')({
  component: GroupOperationPage,
})

function GroupOperationPage() {
  const { id } = Route.useParams()
  const {
    userId,
    groupName,
    links,
    linkDialogOpen,
    setLinkDialogOpen,
    handleAddLink,
    summary,
    incomeData,
    expenditureData,
    incomeDialogOpen,
    setIncomeDialogOpen,
    expenseDialogOpen,
    setExpenseDialogOpen,
    handleAddIncome,
    handleAddExpense,
    todos,
    todoViewMode,
    setTodoViewMode,
    todoDialogOpen,
    setTodoDialogOpen,
    handleAddTodo,
    updateTodoStatus,
    toggleTodoComplete,
  } = useGroupOperationPage(id)

  return (
    <div className="space-y-8">
      {/* 1. Links */}
      <LinksSection
        links={links}
        addLinkButton={
          <AddLinkDialog
            isOpen={linkDialogOpen}
            onOpenChange={setLinkDialogOpen}
            onSubmit={handleAddLink}
          />
        }
      />

      {/* 2. Payments */}
      <PaymentsSection
        groupId={id}
        summary={summary}
        incomeData={incomeData}
        expenditureData={expenditureData}
        incomeDialogOpen={incomeDialogOpen}
        onIncomeDialogChange={setIncomeDialogOpen}
        expenditureDialogOpen={expenseDialogOpen}
        onExpenditureDialogChange={setExpenseDialogOpen}
        onAddIncome={handleAddIncome}
        onAddExpense={handleAddExpense}
      />

      {/* 3. Todos */}
      <TodosSection
        todos={todos as import('@/features/todos/types/todo.types').Todo[]}
        viewMode={todoViewMode}
        onViewModeChange={setTodoViewMode}
        dialogOpen={todoDialogOpen}
        onDialogChange={setTodoDialogOpen}
        onAddTodo={handleAddTodo}
        onToggleComplete={toggleTodoComplete}
        onUpdateStatus={updateTodoStatus}
      />

      {/* 4. Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupDocumentsList groupId={id} groupName={groupName} userId={userId} />
        </CardContent>
      </Card>
    </div>
  )
}
