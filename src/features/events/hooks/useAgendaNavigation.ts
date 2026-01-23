/**
 * useAgendaNavigation Hook
 *
 * Provides functionality for navigating through agenda items,
 * activating/completing items, and sending notifications.
 */

import { useState, useMemo, useCallback } from 'react';
import { db, tx } from '../../../../db/db';
import { usePermissions } from '@db/rbac';
import { notifyAgendaItemActivated } from '@/utils/notification-helpers';
import { toast } from 'sonner';

interface AgendaItem {
  id: string;
  title: string;
  type: string;
  status: string;
  order: number;
  activatedAt?: number;
  completedAt?: number;
}

interface UseAgendaNavigationResult {
  currentAgendaItem: AgendaItem | null;
  currentIndex: number;
  totalItems: number;
  canNavigate: boolean;
  isLoading: boolean;
  activateAgendaItem: (itemId: string) => Promise<void>;
  moveToNextItem: () => Promise<void>;
  moveToPreviousItem: () => Promise<void>;
  completeCurrentItem: () => Promise<void>;
  hasNextItem: boolean;
  hasPreviousItem: boolean;
}

export function useAgendaNavigation(eventId: string): UseAgendaNavigationResult {
  const { user } = db.useAuth();
  const { can } = usePermissions({ eventId });
  const [isLoading, setIsLoading] = useState(false);

  // Query event with agenda items
  const { data, isLoading: queryLoading } = db.useQuery({
    events: {
      $: { where: { id: eventId } },
      agendaItems: {},
      participants: {
        user: {},
      },
    },
  });

  const event = data?.events?.[0];
  const agendaItems: AgendaItem[] = useMemo(() => {
    if (!event?.agendaItems) return [];
    return [...event.agendaItems]
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        order: item.order || 0,
        activatedAt: typeof item.activatedAt === 'number' ? item.activatedAt : undefined,
        completedAt: typeof item.completedAt === 'number' ? item.completedAt : undefined,
      }))
      .sort((a, b) => a.order - b.order);
  }, [event?.agendaItems]);

  const currentAgendaItemId = event?.currentAgendaItemId;

  const currentAgendaItem = useMemo(() => {
    if (!currentAgendaItemId) return null;
    return agendaItems.find(item => item.id === currentAgendaItemId) || null;
  }, [currentAgendaItemId, agendaItems]);

  const currentIndex = useMemo(() => {
    if (!currentAgendaItemId) return -1;
    return agendaItems.findIndex(item => item.id === currentAgendaItemId);
  }, [currentAgendaItemId, agendaItems]);

  const canManageAgenda = can('manage', 'agendaItems');

  const hasNextItem = currentIndex < agendaItems.length - 1;
  const hasPreviousItem = currentIndex > 0;

  const activateAgendaItem = useCallback(
    async (itemId: string) => {
      if (!user || !canManageAgenda) {
        toast.error('You do not have permission to manage the agenda');
        return;
      }

      const item = agendaItems.find(i => i.id === itemId);
      if (!item) {
        toast.error('Agenda item not found');
        return;
      }

      setIsLoading(true);
      try {
        const transactions: any[] = [];

        // Deactivate current item if exists
        if (currentAgendaItem) {
          transactions.push(
            tx.agendaItems[currentAgendaItem.id].update({
              status: currentAgendaItem.completedAt ? 'completed' : 'pending',
            })
          );
        }

        // Activate the new item
        transactions.push(
          tx.agendaItems[itemId].update({
            status: 'in-progress',
            activatedAt: Date.now(),
            updatedAt: Date.now(),
          }),
          tx.events[eventId].update({
            currentAgendaItemId: itemId,
            updatedAt: Date.now(),
          })
        );

        // Send notification to all participants
        if (event?.title) {
          const notificationTxs = notifyAgendaItemActivated({
            senderId: user.id,
            eventId,
            eventTitle: event.title,
            agendaItemId: itemId,
            agendaItemTitle: item.title,
            agendaItemType: item.type,
          });
          transactions.push(...notificationTxs);
        }

        await db.transact(transactions);
        toast.success(`Activated: ${item.title}`);
      } catch (error) {
        console.error('Error activating agenda item:', error);
        toast.error('Failed to activate agenda item');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, canManageAgenda, eventId, event?.title, currentAgendaItem, agendaItems]
  );

  const moveToNextItem = useCallback(async () => {
    if (!hasNextItem) {
      toast.info('No more agenda items');
      return;
    }

    const nextItem = agendaItems[currentIndex + 1];
    await activateAgendaItem(nextItem.id);
  }, [hasNextItem, currentIndex, agendaItems, activateAgendaItem]);

  const moveToPreviousItem = useCallback(async () => {
    if (!hasPreviousItem) {
      toast.info('No previous agenda items');
      return;
    }

    const prevItem = agendaItems[currentIndex - 1];
    await activateAgendaItem(prevItem.id);
  }, [hasPreviousItem, currentIndex, agendaItems, activateAgendaItem]);

  const completeCurrentItem = useCallback(async () => {
    if (!user || !canManageAgenda || !currentAgendaItem) {
      toast.error('Cannot complete agenda item');
      return;
    }

    setIsLoading(true);
    try {
      const transactions: any[] = [
        tx.agendaItems[currentAgendaItem.id].update({
          status: 'completed',
          completedAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ];

      // Auto-advance to next item if available
      if (hasNextItem) {
        const nextItem = agendaItems[currentIndex + 1];
        transactions.push(
          tx.agendaItems[nextItem.id].update({
            status: 'in-progress',
            activatedAt: Date.now(),
            updatedAt: Date.now(),
          }),
          tx.events[eventId].update({
            currentAgendaItemId: nextItem.id,
            updatedAt: Date.now(),
          })
        );

        // Send notification for next item
        if (event?.title) {
          const notificationTxs = notifyAgendaItemActivated({
            senderId: user.id,
            eventId,
            eventTitle: event.title,
            agendaItemId: nextItem.id,
            agendaItemTitle: nextItem.title,
            agendaItemType: nextItem.type,
          });
          transactions.push(...notificationTxs);
        }
      } else {
        // Clear current item if no more items
        transactions.push(
          tx.events[eventId].update({
            currentAgendaItemId: null,
            updatedAt: Date.now(),
          })
        );
      }

      await db.transact(transactions);
      toast.success(`Completed: ${currentAgendaItem.title}`);
    } catch (error) {
      console.error('Error completing agenda item:', error);
      toast.error('Failed to complete agenda item');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    user,
    canManageAgenda,
    currentAgendaItem,
    hasNextItem,
    currentIndex,
    agendaItems,
    eventId,
    event?.title,
  ]);

  return {
    currentAgendaItem,
    currentIndex,
    totalItems: agendaItems.length,
    canNavigate: canManageAgenda,
    isLoading: isLoading || queryLoading,
    activateAgendaItem,
    moveToNextItem,
    moveToPreviousItem,
    completeCurrentItem,
    hasNextItem,
    hasPreviousItem,
  };
}
