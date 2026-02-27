/**
 * useAgendaNavigation Hook
 *
 * Provides functionality for navigating through agenda items,
 * activating/completing items, and sending notifications.
 */

import { useState, useMemo, useCallback } from 'react';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useEventActions } from '@/zero/events/useEventActions';
import { useEventWithAgendaAndParticipants } from '@/zero/events/useEventState';
import { useAuth } from '@/providers/auth-provider';
import { usePermissions } from '@/zero/rbac';
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
  const { user } = useAuth();
  const { updateAgendaItem } = useAgendaActions();
  const { updateEvent } = useEventActions();
  const { can } = usePermissions({ eventId });
  const [isLoading, setIsLoading] = useState(false);

  // Query event with agenda items
  const { event, isLoading: queryLoading } = useEventWithAgendaAndParticipants(eventId);
  const agendaItems: AgendaItem[] = useMemo(() => {
    if (!event?.agenda_items) return [];
    return [...event.agenda_items]
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        status: item.status,
        order: item.order || 0,
        activatedAt: typeof item.activated_at === 'number' ? item.activated_at : undefined,
        completedAt: typeof item.completed_at === 'number' ? item.completed_at : undefined,
      }))
      .sort((a, b) => a.order - b.order);
  }, [event?.agenda_items]);

  const currentAgendaItemId = useMemo(() => {
    if (!event?.agenda_items) return null;
    const inProgress = [...event.agenda_items].find((item: any) => item.status === 'in-progress');
    return inProgress?.id || null;
  }, [event?.agenda_items]);

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
        // Deactivate current item if exists
        if (currentAgendaItem) {
          await updateAgendaItem({
            id: currentAgendaItem.id,
            status: currentAgendaItem.completedAt ? 'completed' : 'pending',
          });
        }

        // Activate the new item
        await updateAgendaItem({
          id: itemId,
          status: 'in-progress',
          activated_at: Date.now(),
        });
        await updateEvent({
          id: eventId,
        });

        if (event?.title) {
        }

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
      // Complete current item
      await updateAgendaItem({
        id: currentAgendaItem.id,
        status: 'completed',
        completed_at: Date.now(),
      });

      // Auto-advance to next item if available
      if (hasNextItem) {
        const nextItem = agendaItems[currentIndex + 1];
        await updateAgendaItem({
          id: nextItem.id,
          status: 'in-progress',
          activated_at: Date.now(),
        });
        await updateEvent({
          id: eventId,
        });

        // Send notification for next item
        if (event?.title) {
          await notifyAgendaItemActivated({
            senderId: user.id,
            eventId,
            eventTitle: event.title,
            agendaItemId: nextItem.id,
            agendaItemTitle: nextItem.title,
            agendaItemType: nextItem.type,
          });
        }
      } else {
        // Clear current item if no more items
        await updateEvent({
          id: eventId,
        });
      }

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
