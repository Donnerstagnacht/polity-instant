import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import { notifyEventPositionCreated, notifyEventPositionDeleted } from '@/utils/notification-helpers';
import { useEventActions } from '@/zero/events/useEventActions';
import { useEventPositionsData } from '@/zero/events/useEventState';

export function useEventPositions(eventId: string) {
  const { user: authUser } = useAuth();
  const { createPosition, updatePosition, deletePosition } = useEventActions();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [createElection, setCreateElection] = useState(false);

  // Query event and positions
  const { event, positions, isLoading } = useEventPositionsData(eventId);

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
      const positionId = crypto.randomUUID();
      const positionTitle = title.trim();

      await createPosition({
        id: positionId,
        title: positionTitle,
        description: description.trim(),
        event_id: eventId,
      });

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
      await updatePosition({
        id: editingPosition.id,
        title: title.trim(),
        description: description.trim(),
      });
    } catch (error) {
      console.error('Failed to update position:', error);
      toast.error('Failed to update position. Please try again.');
    }
  };

  const handleDeletePosition = async (positionId: string, positionTitle?: string) => {
    // Optimistic update: show success immediately
    toast.success('Position deleted successfully');

    try {
      await deletePosition({ id: positionId });

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
