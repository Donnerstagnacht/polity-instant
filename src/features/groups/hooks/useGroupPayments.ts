/**
 * Hook for managing group payments and financial calculations
 */

import { useState, useMemo } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';
import type { GroupPayment, FinancialSummary, ChartData } from '../types/group.types';

export function useGroupPayments(groupId: string) {
  const [isLoading, setIsLoading] = useState(false);

  // Query payments
  const { data, isLoading: isQuerying } = db.useQuery({
    payments: {
      $: {
        where: {
          or: [{ 'receiverGroup.id': groupId }, { 'payerGroup.id': groupId }],
        },
      },
      receiverGroup: {},
      payerGroup: {},
      receiverUser: {},
      payerUser: {},
    },
  });

  const payments = (data?.payments || []) as any as GroupPayment[];

  const addPayment = async (paymentData: {
    label: string;
    type: string;
    amount: number;
    direction: 'income' | 'expense';
    payerUserId?: string;
    payerGroupId?: string;
    receiverUserId?: string;
    receiverGroupId?: string;
  }) => {
    setIsLoading(true);
    try {
      const paymentId = id();

      let transaction = tx.payments[paymentId].update({
        label: paymentData.label,
        type: paymentData.type,
        amount: paymentData.amount,
        createdAt: Date.now(),
      });

      const links: any = {};
      if (paymentData.payerUserId) links.payerUser = paymentData.payerUserId;
      if (paymentData.payerGroupId) links.payerGroup = paymentData.payerGroupId;
      if (paymentData.receiverUserId) links.receiverUser = paymentData.receiverUserId;
      if (paymentData.receiverGroupId) links.receiverGroup = paymentData.receiverGroupId;

      if (Object.keys(links).length > 0) {
        transaction = transaction.link(links);
      } else {
        toast.error('Payment must have a payer and receiver');
        return { success: false };
      }

      await db.transact([transaction]);
      toast.success('Payment added successfully!');
      return { success: true, paymentId };
    } catch (error) {
      console.error('Failed to add payment:', error);
      toast.error('Failed to add payment');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePayment = async (paymentId: string) => {
    setIsLoading(true);
    try {
      await db.transact([tx.payments[paymentId].delete()]);
      toast.success('Payment deleted successfully!');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete payment:', error);
      toast.error('Failed to delete payment');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    payments,
    addPayment,
    deletePayment,
    isLoading: isLoading || isQuerying,
  };
}
