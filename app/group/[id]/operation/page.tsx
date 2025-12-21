'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/features/auth/auth';
import { useGroupLinks } from '@/features/groups/hooks/useGroupLinks';
import { useGroupPayments } from '@/features/groups/hooks/useGroupPayments';
import { useGroupTodos } from '@/features/groups/hooks/useGroupTodos';
import { useFinancialData } from '@/features/groups/hooks/useFinancialData';
import { LinksSection } from '@/features/groups/ui/LinksSection';
import { AddLinkDialog } from '@/features/groups/ui/AddLinkDialog';
import { AddPaymentDialog } from '@/features/groups/ui/AddPaymentDialog';
import { AddTodoDialog } from '@/features/groups/ui/AddTodoDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutList, LayoutGrid } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { KanbanBoard } from '@/components/todos/kanban-board';
import { TodoList } from '@/components/todos/todo-list';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';

export default function GroupOperationPage() {
  const params = useParams();
  const groupId = params.id as string;
  const user = useAuthStore((state) => state.user);

  // State
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  // Data hooks
  const { links, addLink } = useGroupLinks(groupId);
  const { payments, addPayment } = useGroupPayments(groupId);
  const { todos, addTodo, toggleTodoComplete, updateTodoStatus } = useGroupTodos(groupId, user?.id);
  const { summary, incomeData, expenditureData, colors } = useFinancialData(payments, groupId);

  // Handlers
  const handleAddLink = async (data: { label: string; url: string }) => {
    const result = await addLink(data.label, data.url);
    if (result.success) {
      setIsAddLinkOpen(false);
    }
  };

  const handleAddPayment = async (data: any) => {
    const result = await addPayment(data);
    if (result.success) {
      setIsAddPaymentOpen(false);
      setIsAddExpenseOpen(false);
    }
  };

  const handleAddTodo = async (data: { title: string; description: string; priority: string; dueDate: string }) => {
    const result = await addTodo(data);
    if (result.success) {
      setIsAddTodoOpen(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="view"
        resource="groups"
        context={{ groupId }}
      >
        <div className="container mx-auto space-y-6 p-6">
      {/* Links Section */}
      <LinksSection
        links={links}
        addLinkButton={
          <AddLinkDialog
            isOpen={isAddLinkOpen}
            onOpenChange={setIsAddLinkOpen}
            onSubmit={handleAddLink}
          />
        }
      />

      {/* Financial Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Income Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Income: ${summary.income.toLocaleString()}</CardTitle>
              <AddPaymentDialog
                open={isAddPaymentOpen}
                onOpenChange={setIsAddPaymentOpen}
                onSubmit={handleAddPayment}
                direction="income"
                groupId={groupId}
              />
            </div>
          </CardHeader>
          <CardContent>
            {incomeData.length === 0 ? (
              <p className="text-muted-foreground">No income data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300} key={`income-${payments.length}`}>
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: $${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Expenditure Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expenditure: ${summary.expenditure.toLocaleString()}</CardTitle>
              <AddPaymentDialog
                open={isAddExpenseOpen}
                onOpenChange={setIsAddExpenseOpen}
                onSubmit={handleAddPayment}
                direction="expense"
                groupId={groupId}
              />
            </div>
          </CardHeader>
          <CardContent>
            {expenditureData.length === 0 ? (
              <p className="text-muted-foreground">No expenditure data</p>
            ) : (
              <ResponsiveContainer width="100%" height={300} key={`expenditure-${payments.length}`}>
                <PieChart>
                  <Pie
                    data={expenditureData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: $${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenditureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Todos Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            <div className="flex gap-2">
              <div className="flex gap-1 rounded-lg border p-1">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
              <AddTodoDialog
                open={isAddTodoOpen}
                onOpenChange={setIsAddTodoOpen}
                onSubmit={handleAddTodo}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {todos.length === 0 ? (
            <p className="text-muted-foreground">No tasks for this group</p>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard todos={todos as any} />
          ) : (
            <TodoList
              todos={todos}
              onToggleComplete={toggleTodoComplete}
              onUpdateStatus={updateTodoStatus}
            />
          )}
        </CardContent>
      </Card>
    </div>
      </PermissionGuard>
    </AuthGuard>
  );
}
