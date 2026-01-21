import { useState } from 'react';
import { db, tx } from '../../../../db/db';
import { useRouter } from 'next/navigation';
import { notifyAgendaItemDeleted, notifyAgendaItemTransferred } from '@/utils/notification-helpers';

export function useAgendaItemMutations(agendaItemId: string, eventId: string) {
  const router = useRouter();
  const { user } = db.useAuth();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  const handleDelete = async (params?: { agendaItemTitle?: string; eventTitle?: string }) => {
    if (!user) return;

    setDeleteLoading(true);
    try {
      const transactions: any[] = [tx.agendaItems[agendaItemId].delete()];

      // Send notification to event participants
      if (params?.agendaItemTitle) {
        const notificationTxs = notifyAgendaItemDeleted({
          senderId: user.id,
          eventId,
          eventTitle: params.eventTitle || 'Event',
          agendaItemTitle: params.agendaItemTitle,
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
      router.push(`/event/${eventId}/agenda`);
    } catch (error) {
      console.error('Error deleting agenda item:', error);
      throw error;
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTransfer = async (params: {
    targetEventId: string;
    agendaItemTitle: string;
    sourceEventTitle: string;
    targetEventTitle: string;
    newOrder?: number;
  }) => {
    if (!user) return;

    setTransferLoading(true);
    try {
      const transactions: any[] = [];

      // Unlink from current event and link to target event
      transactions.push(
        tx.agendaItems[agendaItemId].unlink({ event: eventId }),
        tx.agendaItems[agendaItemId].link({ event: params.targetEventId })
      );

      // Update order if provided
      if (params.newOrder !== undefined) {
        transactions.push(tx.agendaItems[agendaItemId].update({ order: params.newOrder }));
      }

      // Send notifications to both events
      const notificationTxs = notifyAgendaItemTransferred({
        senderId: user.id,
        sourceEventId: eventId,
        sourceEventTitle: params.sourceEventTitle,
        targetEventId: params.targetEventId,
        targetEventTitle: params.targetEventTitle,
        agendaItemTitle: params.agendaItemTitle,
      });
      transactions.push(...notificationTxs);

      await db.transact(transactions);
      router.push(`/event/${params.targetEventId}/agenda`);
    } catch (error) {
      console.error('Error transferring agenda item:', error);
      throw error;
    } finally {
      setTransferLoading(false);
    }
  };

  return {
    handleDelete,
    deleteLoading,
    handleTransfer,
    transferLoading,
  };
}
