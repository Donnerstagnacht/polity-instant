import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useNavigate } from '@tanstack/react-router';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';

export function useAgendaItemMutations(agendaItemId: string, eventId: string) {
  const navigate = useNavigate();
  const { deleteAgendaItem, updateAgendaItem } = useAgendaActions();
  const { user } = useAuth();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setDeleteLoading(true);
    try {
      await deleteAgendaItem(agendaItemId);

      navigate({ to: `/event/${eventId}/agenda` });
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
      // Update agenda item to point to new event
      await updateAgendaItem({
        id: agendaItemId,
        event_id: params.targetEventId,
        ...(params.newOrder !== undefined ? { order: params.newOrder } : {}),
      });

      navigate({ to: `/event/${params.targetEventId}/agenda` });
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
