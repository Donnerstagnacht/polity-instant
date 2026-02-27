import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useGroupById } from '@/zero/groups/useGroupState';
import { useGroupLinks } from '@/features/network/hooks/useGroupLinks';
import { useGroupPayments } from './useGroupPayments';
import { useFinancialData } from './useFinancialData';
import { useGroupTodos } from './useGroupTodos';
import type { TodoViewMode } from '../types/group.types';

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
  const { summary, incomeData, expenditureData } = useFinancialData(payments, groupId);
  const { todos, addTodo, updateTodoStatus, toggleTodoComplete } = useGroupTodos(groupId, user?.id);

  const groupName = (group as any)?.name ?? '';

  const handleAddLink = async (data: { label: string; url: string }) => {
    await addLink(data.label, data.url, user?.id, groupName);
    setLinkDialogOpen(false);
  };

  const handleAddIncome = async (data: any) => {
    await addPayment({ ...data, senderId: user?.id, groupName });
    setIncomeDialogOpen(false);
  };

  const handleAddExpense = async (data: any) => {
    await addPayment({ ...data, senderId: user?.id, groupName });
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
