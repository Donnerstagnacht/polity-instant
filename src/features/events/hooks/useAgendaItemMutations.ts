import { useState } from 'react';
import { db, tx } from '../../../../db/db';
import { useRouter } from 'next/navigation';

export function useAgendaItemMutations(agendaItemId: string, eventId: string) {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    const { user } = db.useAuth();
    if (!user) return;

    setDeleteLoading(true);
    try {
      await db.transact([tx.agendaItems[agendaItemId].delete()]);
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
