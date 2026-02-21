/**
 * Hook for managing group positions
 * Handles CRUD operations, holder management, history tracking, and election creation
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { useGroupPositions as useFacadeGroupPositions } from '@/zero/groups/useGroupState';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import {
  notifyPositionCreated,
  notifyPositionAssigned,
  notifyPositionVacated,
  notifyPositionDeleted,
  notifyElectionCreated,
} from '@/utils/notification-helpers';
import { sendNotificationFn } from '@/server/notifications';

export function useGroupPositions(groupId: string) {
  const { positions: positionsData, isLoading } = useFacadeGroupPositions(groupId);
  const {
    createPosition: createPositionAction,
    updatePosition: updatePositionAction,
    deletePosition: deletePositionAction,
    createPositionHolderHistory: createHistoryAction,
    updatePositionHolderHistory: updateHistoryAction,
  } = useGroupActions();
  const { createElection: createElectionAction, createAgendaItem: createAgendaItemAction } = useAgendaActions();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignHolderDialogOpen, setAssignHolderDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [editingPosition, setEditingPosition] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [term, setTerm] = useState('4');
  const [firstTermStart, setFirstTermStart] = useState('');
  const [createElection, setCreateElection] = useState(false);

  // Query positions with all relationships
  const positions = positionsData || [];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTerm('4');
    setFirstTermStart('');
    setCreateElection(false);
  };

  /**
   * Create a new position
   */
  const createPosition = async (params?: {
    senderId?: string;
    groupName?: string;
    adminUserIds?: string[];
  }) => {
    if (!title.trim()) {
      toast.error('Position title is required');
      return { success: false };
    }

    const termNum = parseInt(term, 10);
    if (isNaN(termNum) || termNum < 1) {
      toast.error('Term must be at least 1 year');
      return { success: false };
    }

    if (!firstTermStart) {
      toast.error('First term start date is required');
      return { success: false };
    }

    const positionTitle = title.trim();
    resetForm();
    setAddDialogOpen(false);
    toast.success('Position created successfully');

    try {
      const positionId = crypto.randomUUID();
      const now = Date.now();

      await createPositionAction({
        id: positionId,
        title: positionTitle,
        description: description.trim() || '',
        term: String(termNum),
        first_term_start: new Date(firstTermStart).getTime(),
        scheduled_revote_date: null,
        group_id: groupId,
        event_id: '',
      });

      // If createElection is true, create election + agenda item
      if (createElection) {
        const electionId = crypto.randomUUID();
        const agendaItemId = crypto.randomUUID();

        await createElectionAction({
          id: electionId,
          title: `Election for ${positionTitle}`,
          description: `Vote for the ${positionTitle} position`,
          majority_type: 'simple',
          status: 'pending',
          is_multiple_choice: false,
          max_selections: 1,
          position_id: positionId,
          agenda_item_id: agendaItemId,
          amendment_id: '',
          voting_start_time: 0,
          voting_end_time: 0,
        });

        await createAgendaItemAction({
          id: agendaItemId,
          title: `Election: ${positionTitle}`,
          description: '',
          type: 'election',
          status: 'pending',
          forwarding_status: '',
          order_index: 0,
          duration: 0,
          scheduled_time: '',
          start_time: 0,
          end_time: 0,
          activated_at: 0,
          completed_at: 0,
          event_id: '',
          amendment_id: '',
        });
      }

      sendNotificationFn({ data: { helper: 'notifyPositionCreated', params: { senderId: params?.senderId, groupId, groupName: params?.groupName } } }).catch(console.error)
      return { success: true, positionId };
    } catch (error) {
      console.error('Failed to create position:', error);
      toast.error('Failed to create position. Please try again.');
      return { success: false, error };
    }
  };

  /**
   * Update an existing position
   */
  const updatePosition = async () => {
    if (!editingPosition || !title.trim()) {
      toast.error('Position title is required');
      return { success: false };
    }

    const termNum = parseInt(term, 10);
    if (isNaN(termNum) || termNum < 1) {
      toast.error('Term must be at least 1 year');
      return { success: false };
    }

    if (!firstTermStart) {
      toast.error('First term start date is required');
      return { success: false };
    }

    resetForm();
    setEditingPosition(null);
    setEditDialogOpen(false);
    toast.success('Position updated successfully');

    try {
      await updatePositionAction({
        id: editingPosition.id,
        title: title.trim(),
        description: description.trim() || '',
        term: String(termNum),
        first_term_start: new Date(firstTermStart).getTime(),
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to update position:', error);
      toast.error('Failed to update position. Please try again.');
      return { success: false, error };
    }
  };

  /**
   * Delete a position
   */
  const deletePosition = async (
    positionId: string,
    params?: {
      positionTitle?: string;
      senderId?: string;
      groupName?: string;
      adminUserIds?: string[];
    }
  ) => {
    toast.success('Position deleted successfully');

    try {
      await deletePositionAction({ id: positionId });

      sendNotificationFn({ data: { helper: 'notifyPositionDeleted', params: { senderId: params?.senderId, groupId, groupName: params?.groupName, positionTitle: params?.positionTitle } } }).catch(console.error)
      return { success: true };
    } catch (error) {
      console.error('Failed to delete position:', error);
      toast.error('Failed to delete position. Please try again.');
      return { success: false, error };
    }
  };

  /**
   * Assign a holder to a position
   * Creates history entry for the new holder and ends the previous holder's entry
   */
  const assignHolder = async (
    positionId: string,
    userId: string,
    reason: 'elected' | 'appointed' = 'appointed',
    senderId?: string,
    groupName?: string,
    positionTitle?: string
  ) => {
    toast.success('Holder assigned successfully');

    try {
      const now = Date.now();
      const position: any = positions.find((p) => p.id === positionId);

      // If there's a current holder, end their history entry
      if (position?.current_holder?.id) {
        const currentHistoryEntry = position.holder_history?.find(
          (h: any) => h.holder?.id === position.current_holder?.id && !h.endDate
        );
        if (currentHistoryEntry) {
          await updateHistoryAction({
            id: currentHistoryEntry.id,
            end_date: now,
          });
        }
      }

      // Create new history entry for the new holder
      const historyId = crypto.randomUUID();
      await createHistoryAction({
        id: historyId,
        start_date: now,
        reason: reason,
        position_id: positionId,
        user_id: userId,
        end_date: null,
      });

      // Update position current holder
      await updatePositionAction({
        id: positionId,
        current_holder_id: userId,
      });

      sendNotificationFn({ data: { helper: 'notifyPositionAssigned', params: { senderId, recipientId: userId, groupId, groupName, positionTitle } } }).catch(console.error)
      return { success: true };
    } catch (error) {
      console.error('Failed to assign holder:', error);
      toast.error('Failed to assign holder. Please try again.');
      return { success: false, error };
    }
  };

  /**
   * Remove the current holder from a position
   */
  const removeHolder = async (
    positionId: string,
    reason: 'resigned' | 'removed' | 'term_ended' = 'removed',
    senderId?: string,
    groupName?: string,
    positionTitle?: string
  ) => {
    toast.success('Holder removed successfully');

    try {
      const now = Date.now();
      const position: any = positions.find((p) => p.id === positionId);

      // End the current holder's history entry
      if (position?.current_holder?.id) {
        const currentHistoryEntry = position.holder_history?.find(
          (h: any) => h.holder?.id === position.current_holder?.id && !h.endDate
        );
        if (currentHistoryEntry) {
          await updateHistoryAction({
            id: currentHistoryEntry.id,
            end_date: now,
            reason: reason,
          });
        }
      }

      // Clear current holder
      await updatePositionAction({
        id: positionId,
        current_holder_id: null as any,
      });

      sendNotificationFn({ data: { helper: 'notifyPositionVacated', params: { senderId, groupId, groupName, positionTitle } } }).catch(console.error)
      return { success: true };
    } catch (error) {
      console.error('Failed to remove holder:', error);
      toast.error('Failed to remove holder. Please try again.');
      return { success: false, error };
    }
  };

  /**
   * Create an election for a position (e.g., when term is ending)
   */
  const createElectionForPosition = async (
    positionId: string,
    eventId?: string,
    params?: {
      senderId?: string;
      groupName?: string;
      memberUserIds?: string[];
    }
  ) => {
    try {
      const position: any = positions.find((p) => p.id === positionId);
      if (!position) {
        toast.error('Position not found');
        return { success: false };
      }

      const now = Date.now();
      const electionId = crypto.randomUUID();
      const agendaItemId = crypto.randomUUID();

      await createElectionAction({
        id: electionId,
        title: `Election for ${position.title}`,
        description: `Vote for the ${position.title} position`,
        majority_type: 'simple',
        status: 'pending',
        is_multiple_choice: false,
        max_selections: 1,
        position_id: positionId,
        agenda_item_id: agendaItemId,
        amendment_id: '',
        voting_start_time: 0,
        voting_end_time: 0,
      });

      await createAgendaItemAction({
        id: agendaItemId,
        title: `Election: ${position.title}`,
        description: '',
        type: 'election',
        status: 'pending',
        forwarding_status: '',
        order_index: 0,
        duration: 0,
        scheduled_time: '',
        start_time: 0,
        end_time: 0,
        activated_at: 0,
        completed_at: 0,
        event_id: eventId || '',
        amendment_id: '',
      });

      sendNotificationFn({ data: { helper: 'notifyElectionCreated', params: { senderId: params?.senderId, groupId, groupName: params?.groupName } } }).catch(console.error)
      toast.success('Election created successfully');
      return { success: true, electionId };
    } catch (error) {
      console.error('Failed to create election:', error);
      toast.error('Failed to create election. Please try again.');
      return { success: false, error };
    }
  };

  /**
   * Open edit dialog with position data
   */
  const openEditDialog = (position: any) => {
    setEditingPosition(position);
    setTitle(position.title || '');
    setDescription(position.description || '');
    setTerm(String(position.term || 4));
    setFirstTermStart(
      position.firstTermStart ? new Date(position.firstTermStart).toISOString().split('T')[0] : ''
    );
    setEditDialogOpen(true);
  };

  /**
   * Open assign holder dialog
   */
  const openAssignHolderDialog = (position: any) => {
    setSelectedPosition(position);
    setAssignHolderDialogOpen(true);
  };

  /**
   * Open history dialog
   */
  const openHistoryDialog = (position: any) => {
    setSelectedPosition(position);
    setHistoryDialogOpen(true);
  };

  return {
    positions,
    isLoading,
    dialogs: {
      add: { open: addDialogOpen, setOpen: setAddDialogOpen },
      edit: { open: editDialogOpen, setOpen: setEditDialogOpen },
      assignHolder: { open: assignHolderDialogOpen, setOpen: setAssignHolderDialogOpen },
      history: { open: historyDialogOpen, setOpen: setHistoryDialogOpen },
    },
    form: {
      title,
      setTitle,
      description,
      setDescription,
      term,
      setTerm,
      firstTermStart,
      setFirstTermStart,
      createElection,
      setCreateElection,
      reset: resetForm,
    },
    selectedPosition,
    editingPosition,
    actions: {
      create: createPosition,
      update: updatePosition,
      delete: deletePosition,
      assignHolder,
      removeHolder,
      createElection: createElectionForPosition,
      openEdit: openEditDialog,
      openAssignHolder: openAssignHolderDialog,
      openHistory: openHistoryDialog,
    },
  };
}
