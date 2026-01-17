/**
 * Hook for managing group positions
 * Handles CRUD operations, holder management, history tracking, and election creation
 */

import { useState } from 'react';
import { toast } from 'sonner';
import db, { tx, id } from '../../../../db/db';
import {
  notifyPositionCreated,
  notifyPositionAssigned,
  notifyPositionVacated,
  notifyPositionDeleted,
  notifyElectionCreated,
} from '@/utils/notification-helpers';

export function useGroupPositions(groupId: string) {
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
  const { data, isLoading } = db.useQuery({
    positions: {
      $: {
        where: {
          'group.id': groupId,
        },
      },
      currentHolder: {},
      group: {},
      elections: {
        agendaItem: {
          event: {},
        },
        candidates: {
          user: {},
        },
      },
      holderHistory: {
        holder: {},
      },
    },
  });

  const positions = data?.positions || [];

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
      const positionId = id();
      const now = Date.now();

      const transactions: any[] = [
        tx.positions[positionId]
          .update({
            title: positionTitle,
            description: description.trim() || null,
            term: termNum,
            firstTermStart: new Date(firstTermStart).getTime(),
            createdAt: now,
            updatedAt: now,
          })
          .link({ group: groupId }),
      ];

      // If createElection is true, create election + agenda item
      if (createElection) {
        const electionId = id();
        const agendaItemId = id();

        transactions.push(
          tx.elections[electionId].update({
            title: `Election for ${positionTitle}`,
            description: `Vote for the ${positionTitle} position`,
            majorityType: 'simple',
            status: 'pending',
            isMultipleChoice: false,
            maxSelections: 1,
            createdAt: now,
            updatedAt: now,
          }),
          tx.elections[electionId].link({ position: positionId }),
          tx.agendaItems[agendaItemId].update({
            title: `Election: ${positionTitle}`,
            type: 'election',
            order: 0,
            createdAt: now,
            updatedAt: now,
          }),
          tx.agendaItems[agendaItemId].link({ election: electionId })
        );
      }

      // Send notifications to admins
      if (params?.senderId && params?.groupName && params?.adminUserIds) {
        for (const adminId of params.adminUserIds) {
          if (adminId !== params.senderId) {
            const notificationTxs = notifyPositionCreated({
              senderId: params.senderId,
              recipientUserId: adminId,
              groupId,
              groupName: params.groupName,
              positionTitle,
            });
            transactions.push(...notificationTxs);
          }
        }
      }

      await db.transact(transactions);
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
      await db.transact([
        tx.positions[editingPosition.id].update({
          title: title.trim(),
          description: description.trim() || null,
          term: termNum,
          firstTermStart: new Date(firstTermStart).getTime(),
          updatedAt: Date.now(),
        }),
      ]);
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
      const transactions: any[] = [tx.positions[positionId].delete()];

      // Send notifications to admins
      if (params?.senderId && params?.groupName && params?.adminUserIds && params?.positionTitle) {
        for (const adminId of params.adminUserIds) {
          if (adminId !== params.senderId) {
            const notificationTxs = notifyPositionDeleted({
              senderId: params.senderId,
              recipientUserId: adminId,
              groupId,
              groupName: params.groupName,
              positionTitle: params.positionTitle,
            });
            transactions.push(...notificationTxs);
          }
        }
      }

      await db.transact(transactions);
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
      const position = positions.find((p) => p.id === positionId);
      const transactions: any[] = [];

      // If there's a current holder, end their history entry and notify them
      if (position?.currentHolder?.id) {
        const currentHistoryEntry = position.holderHistory?.find(
          (h: any) => h.holder?.id === position.currentHolder?.id && !h.endDate
        );
        if (currentHistoryEntry) {
          transactions.push(
            tx.positionHolderHistory[currentHistoryEntry.id].update({
              endDate: now,
            })
          );
        }

        // Notify previous holder that they've been replaced
        if (senderId && groupName) {
          const notificationTxs = notifyPositionVacated({
            senderId,
            recipientUserId: position.currentHolder.id,
            groupId,
            groupName,
            positionTitle: positionTitle || position.title || 'Unknown Position',
          });
          transactions.push(...notificationTxs);
        }
      }

      // Create new history entry for the new holder
      const historyId = id();
      transactions.push(
        tx.positionHolderHistory[historyId]
          .update({
            startDate: now,
            endDate: null,
            reason: reason,
            createdAt: now,
          })
          .link({ position: positionId, holder: userId })
      );

      // Link new holder to position
      transactions.push(tx.positions[positionId].link({ currentHolder: userId }));

      // Notify new holder that they've been assigned
      if (senderId && groupName) {
        const notificationTxs = notifyPositionAssigned({
          senderId,
          recipientUserId: userId,
          groupId,
          groupName,
          positionTitle: positionTitle || position?.title || 'Unknown Position',
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
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
      const position = positions.find((p) => p.id === positionId);
      const transactions: any[] = [];

      // End the current holder's history entry
      if (position?.currentHolder?.id) {
        const currentHistoryEntry = position.holderHistory?.find(
          (h: any) => h.holder?.id === position.currentHolder?.id && !h.endDate
        );
        if (currentHistoryEntry) {
          transactions.push(
            tx.positionHolderHistory[currentHistoryEntry.id].update({
              endDate: now,
              reason: reason, // Update the reason for removal
            })
          );
        }

        // Notify holder that they've been removed
        if (senderId && groupName) {
          const notificationTxs = notifyPositionVacated({
            senderId,
            recipientUserId: position.currentHolder.id,
            groupId,
            groupName,
            positionTitle: positionTitle || position.title || 'Unknown Position',
          });
          transactions.push(...notificationTxs);
        }
      }

      // Unlink current holder
      if (position?.currentHolder?.id) {
        transactions.push(tx.positions[positionId].unlink({ currentHolder: position.currentHolder.id }));
      }

      await db.transact(transactions);
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
      const position = positions.find((p) => p.id === positionId);
      if (!position) {
        toast.error('Position not found');
        return { success: false };
      }

      const now = Date.now();
      const electionId = id();
      const agendaItemId = id();

      const transactions: any[] = [
        tx.elections[electionId].update({
          title: `Election for ${position.title}`,
          description: `Vote for the ${position.title} position`,
          majorityType: 'simple',
          status: 'pending',
          isMultipleChoice: false,
          maxSelections: 1,
          createdAt: now,
          updatedAt: now,
        }),
        tx.elections[electionId].link({ position: positionId }),
        tx.agendaItems[agendaItemId].update({
          title: `Election: ${position.title}`,
          type: 'election',
          order: 0,
          createdAt: now,
          updatedAt: now,
        }),
        tx.agendaItems[agendaItemId].link({ election: electionId }),
      ];

      // If eventId is provided, link agenda item to event
      if (eventId) {
        transactions.push(tx.agendaItems[agendaItemId].link({ event: eventId }));
      }

      // Send notifications to group members
      if (params?.senderId && params?.groupName && params?.memberUserIds) {
        for (const memberId of params.memberUserIds) {
          if (memberId !== params.senderId) {
            const notificationTxs = notifyElectionCreated({
              senderId: params.senderId,
              recipientUserId: memberId,
              groupId,
              groupName: params.groupName,
              positionTitle: position.title || 'Unknown Position',
            });
            transactions.push(...notificationTxs);
          }
        }
      }

      await db.transact(transactions);
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
