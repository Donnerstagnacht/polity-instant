/**
 * Hook for managing group payments and financial calculations
 */

import { useState } from 'react';
import type { GroupPayment } from '../types/group.types';
import { useGroupPaymentsData } from '@/zero/groups/useGroupState';
import { usePaymentActions } from '@/zero/payments/usePaymentActions';

export function useGroupPayments(groupId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { payments: rawPayments, isLoading: isQuerying } = useGroupPaymentsData(groupId);
  const { createPayment, deletePayment: deletePaymentAction } = usePaymentActions();

  const payments = rawPayments as any as GroupPayment[];

  const addPayment = async (paymentData: {
    label: string;
    type: string;
    amount: number;
    direction: 'income' | 'expense';
    payerUserId?: string;
    payerGroupId?: string;
    receiverUserId?: string;
    receiverGroupId?: string;
    senderId?: string;
    groupName?: string;
    adminUserIds?: string[];
  }) => {
    setIsLoading(true);
    try {
      const paymentId = crypto.randomUUID();

      await createPayment({
        id: paymentId,
        label: paymentData.label,
        type: paymentData.type,
        amount: paymentData.amount,
        payer_user_id: paymentData.payerUserId ?? null,
        payer_group_id: paymentData.payerGroupId ?? null,
        receiver_user_id: paymentData.receiverUserId ?? null,
        receiver_group_id: paymentData.receiverGroupId ?? null,
      });

      return { success: true, paymentId };
    } catch (error) {
      console.error('Failed to add payment:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePayment = async (
    paymentId: string,
    paymentLabel?: string,
    senderId?: string,
    groupName?: string,
    adminUserIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      await deletePaymentAction({ id: paymentId });

      return { success: true };
    } catch (error) {
      console.error('Failed to delete payment:', error);
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
