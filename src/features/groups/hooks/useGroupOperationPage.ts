import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useGroupById } from '@/zero/groups/useGroupState';
import { useGroupLinks } from '@/features/network/hooks/useGroupLinks';
import { useGroupPayments } from './useGroupPayments';
import { useFinancialData } from './useFinancialData';
import { useGroupTodos } from './useGroupTodos';
import type { TodoViewMode, GroupPayment } from '../types/group.types';

export function useGroupOperationPage(groupId: string) {
  const { user } = useAuth();
  const { group } = useGroupById(groupId);

  // Dialog open states
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [todoDialogOpen, setTodoDialogOpen] = useState(false);

  // Todo view mode
  const [todoViewMode, setTodoViewMode] = useState<TodoViewMode>('kanban');

  // Data
  const { links, addLink } = useGroupLinks(groupId);
  const { payments, addPayment } = useGroupPayments(groupId);
  const { summary, incomeData, expenditureData } = useFinancialData(payments as GroupPayment[], groupId);
  const { todos, addTodo, updateTodoStatus, toggleTodoComplete } = useGroupTodos(groupId, user?.id);

  const groupName = group?.name ?? '';

  const handleAddLink = async (data: { label: string; url: string }) => {
    await addLink(data.label, data.url, user?.id);
    setLinkDialogOpen(false);
  };

  const handleAddIncome = async (data: { amount: number; type: string; description?: string; date?: number; payer_user_id?: string | null; receiver_group_id?: string | null; payer_group_id?: string | null; receiver_user_id?: string | null }) => {
    await addPayment({ label: data.type, type: data.type, amount: data.amount, direction: 'income' as const, senderId: user?.id, groupName, payerUserId: data.payer_user_id ?? undefined, payerGroupId: data.payer_group_id ?? undefined, receiverUserId: data.receiver_user_id ?? undefined, receiverGroupId: data.receiver_group_id ?? undefined });
    setIncomeDialogOpen(false);
  };

  const handleAddExpense = async (data: { amount: number; type: string; description?: string; date?: number; payer_user_id?: string | null; receiver_group_id?: string | null; payer_group_id?: string | null; receiver_user_id?: string | null }) => {
    await addPayment({ label: data.type, type: data.type, amount: data.amount, direction: 'expense' as const, senderId: user?.id, groupName, payerUserId: data.payer_user_id ?? undefined, payerGroupId: data.payer_group_id ?? undefined, receiverUserId: data.receiver_user_id ?? undefined, receiverGroupId: data.receiver_group_id ?? undefined });
    setExpenseDialogOpen(false);
  };

  const handleAddTodo = async (data: { title: string; description: string; priority: string; dueDate: string }) => {
    await addTodo({ ...data, groupName });
    setTodoDialogOpen(false);
  };

  return {
    userId: user?.id,
    groupName,
    // Links
    links,
    linkDialogOpen,
    setLinkDialogOpen,
    handleAddLink,
    // Payments
    summary,
    incomeData,
    expenditureData,
    incomeDialogOpen,
    setIncomeDialogOpen,
    expenseDialogOpen,
    setExpenseDialogOpen,
    handleAddIncome,
    handleAddExpense,
    // Todos
    todos,
    todoViewMode,
    setTodoViewMode,
    todoDialogOpen,
    setTodoDialogOpen,
    handleAddTodo,
    updateTodoStatus,
    toggleTodoComplete,
  };
}
