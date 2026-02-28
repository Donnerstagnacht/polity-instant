/**
 * useCancelEvent Hook
 *
 * Manages event cancellation with optional reassignment of agenda items
 * to a different event.
 */

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  notifyEventCancelled,
  notifyAgendaItemsReassigned,
  notifyRevoteScheduled,
} from '@/features/shared/utils/notification-helpers';
import { toast } from 'sonner';
import { useEventActions } from '@/zero/events/useEventActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useEventForCancel } from '@/zero/events/useEventState';

interface AgendaItem {
  id: string;
  title: string;
  sortOrder: number;
  amendment?: {
    id: string;
    title: string;
  };
  election?: {
    id: string;
    position?: {
      id: string;
      name: string;
    };
  };
}

interface UseCancelEventResult {
  isLoading: boolean;
  agendaItems: AgendaItem[];
  cancelEvent: (params: CancelEventParams) => Promise<void>;
  scheduleRevote: (
    positionId: string,
    revoteDate: Date,
    groupId: string,
    groupName: string,
    positionTitle: string
  ) => Promise<void>;
}

interface CancelEventParams {
  eventId: string;
  reason: string;
  reassignToEventId?: string;
  itemsToReassign?: string[];
}

export function useCancelEvent(eventId: string): UseCancelEventResult {
  const { user } = useAuth();
  const { cancelEvent: doCancelEvent } = useEventActions();
  const { updateAgendaItem } = useAgendaActions();
  const { updatePosition } = useGroupActions();
  const [isLoading, setIsLoading] = useState(false);

  // Query event data with agenda items
  const { event } = useEventForCancel(eventId);
  const agendaItems = useMemo((): AgendaItem[] => {
    if (!event?.agenda_items) return [];
    return event.agenda_items
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        sortOrder: item.order_index || 0,
        amendment: item.amendment,
        election: item.election,
      }))
      .sort((a: AgendaItem, b: AgendaItem) => a.sortOrder - b.sortOrder);
  }, [event?.agenda_items]);

  const cancelEvent = useCallback(
    async (params: CancelEventParams) => {
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      setIsLoading(true);
      try {
        // Update event status to cancelled
        await doCancelEvent({
          id: params.eventId,
          cancel_reason: params.reason,
        });


        // Reassign agenda items if specified
        if (params.reassignToEventId && params.itemsToReassign?.length) {
          // Reassign items sequentially
          let newSortOrder = 1;
          for (const itemId of params.itemsToReassign) {
            await updateAgendaItem({
              id: itemId,
              event_id: params.reassignToEventId,
              order_index: newSortOrder++,
            });
          }

        }

        toast.success('Event cancelled successfully');
      } catch (error) {
        console.error('Error cancelling event:', error);
        toast.error('Failed to cancel event');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, event]
  );

  const scheduleRevote = useCallback(
    async (
      positionId: string,
      revoteDate: Date,
      groupId: string,
      groupName: string,
      positionTitle: string
    ) => {
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      setIsLoading(true);
      try {
        await updatePosition({
          id: positionId,
          scheduled_revote_date: revoteDate.getTime(),
        });


        toast.success('Revote scheduled');
      } catch (error) {
        console.error('Error scheduling revote:', error);
        toast.error('Failed to schedule revote');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return {
    isLoading,
    agendaItems,
    cancelEvent,
    scheduleRevote,
  };
}
