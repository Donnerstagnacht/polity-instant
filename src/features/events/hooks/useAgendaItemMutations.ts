import { useState } from 'react';
import { db, tx } from '../../../../db/db';
import { useRouter } from 'next/navigation';
import { notifyAgendaItemDeleted } from '@/utils/notification-helpers';

export function useAgendaItemMutations(agendaItemId: string, eventId: string) {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (params?: {
    agendaItemTitle?: string;
    eventTitle?: string;
  }) => {
    const { user } = db.useAuth();
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

  return {
    handleDelete,
    deleteLoading,
  };
}
