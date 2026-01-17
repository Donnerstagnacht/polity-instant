import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/auth';
import { db } from '../../../../db/db';
import { tx, id } from '@instantdb/react';
import { notifyEventPositionCreated, notifyEventPositionDeleted } from '@/utils/notification-helpers';

export function useEventPositions(eventId: string) {
  const { user: authUser } = useAuthStore();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [createElection, setCreateElection] = useState(false);

  // Query event and positions
  const { data: eventData, isLoading } = db.useQuery({
    events: {
      $: {
        where: {
          id: eventId,
        },
      },
      creator: {},
      group: {},
    },
    eventPositions: {
      $: {
        where: {
          'event.id': eventId,
        },
      },
      holders: {
        user: {},
      },
      election: {},
    },
  });

  const event = eventData?.events?.[0];
  const positions = eventData?.eventPositions || [];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCapacity('1');
    setCreateElection(false);
  };

  const handleAddPosition = async () => {
    if (!title.trim()) {
      toast.error('Position title is required');
      return;
    }

    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum < 1) {
      toast.error('Capacity must be at least 1');
      return;
    }

    // Optimistic update: close dialog and show success immediately
    resetForm();
    setAddDialogOpen(false);
    toast.success('Position created successfully');

    try {
      const positionId = id();
      const now = Date.now();
      const positionTitle = title.trim();

      const transactions: any[] = [
        tx.eventPositions[positionId]
          .create({
            title: positionTitle,
            description: description.trim() || null,
            capacity: capacityNum,
            createElectionOnAgenda: createElection,
            createdAt: now,
            updatedAt: now,
          })
          .link({ event: eventId }),
      ];

      // Send notification to event participants
      if (authUser?.id) {
        const notificationTxs = notifyEventPositionCreated({
          senderId: authUser.id,
          eventId,
          eventTitle: event?.title || 'Event',
          positionTitle,
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
    } catch (error) {
      console.error('Failed to create position:', error);
      toast.error('Failed to create position. Please try again.');
    }
  };

  const handleEditPosition = async () => {
    if (!editingPosition || !title.trim()) {
      toast.error('Position title is required');
      return;
    }

    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum < 1) {
      toast.error('Capacity must be at least 1');
      return;
    }

    // Optimistic update: close dialog and show success immediately
    resetForm();
    setEditingPosition(null);
    setEditDialogOpen(false);
    toast.success('Position updated successfully');

    try {
      await db.transact([
        tx.eventPositions[editingPosition.id].update({
          title: title.trim(),
          description: description.trim() || null,
          capacity: capacityNum,
          createElectionOnAgenda: createElection,
          updatedAt: Date.now(),
        }),
      ]);
    } catch (error) {
      console.error('Failed to update position:', error);
      toast.error('Failed to update position. Please try again.');
    }
  };

  const handleDeletePosition = async (positionId: string, positionTitle?: string) => {
    // Optimistic update: show success immediately
    toast.success('Position deleted successfully');

    try {
      const transactions: any[] = [tx.eventPositions[positionId].delete()];

      // Send notification to event participants
      if (authUser?.id && positionTitle) {
        const notificationTxs = notifyEventPositionDeleted({
          senderId: authUser.id,
          eventId,
          eventTitle: event?.title || 'Event',
          positionTitle,
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
    } catch (error) {
      console.error('Failed to delete position:', error);
      toast.error('Failed to delete position. Please try again.');
    }
  };

  const openEditDialog = (position: any) => {
    setEditingPosition(position);
    setTitle(position.title || '');
    setDescription(position.description || '');
    setCapacity(String(position.capacity || 1));
    setCreateElection(position.createElectionOnAgenda || false);
    setEditDialogOpen(true);
  };

  return {
    event,
    positions,
    isLoading,
    dialogs: {
      add: { open: addDialogOpen, setOpen: setAddDialogOpen },
      edit: { open: editDialogOpen, setOpen: setEditDialogOpen },
    },
    form: {
      title, setTitle,
      description, setDescription,
      capacity, setCapacity,
      createElection, setCreateElection,
      reset: resetForm,
    },
    actions: {
      add: handleAddPosition,
      edit: handleEditPosition,
      delete: handleDeletePosition,
      openEdit: openEditDialog,
    }
  };
}
