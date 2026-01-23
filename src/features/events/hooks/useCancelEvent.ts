/**
 * useCancelEvent Hook
 *
 * Manages event cancellation with optional reassignment of agenda items
 * to a different event.
 */

import { useState, useCallback, useMemo } from 'react';
import { db, tx, id } from '../../../../db/db';
import {
  notifyEventCancelled,
  notifyAgendaItemsReassigned,
  notifyRevoteScheduled,
} from '@/utils/notification-helpers';
import { toast } from 'sonner';

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
  const { user } = db.useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Query event data with agenda items
  const { data } = db.useQuery({
    events: {
      $: {
        where: { id: eventId },
      },
      agendaItems: {
        amendment: {},
        election: {
          position: {},
        },
      },
      participants: {
        user: {},
      },
    },
  });

  const event = data?.events?.[0];
  const agendaItems = useMemo((): AgendaItem[] => {
    if (!event?.agendaItems) return [];
    return event.agendaItems
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        sortOrder: item.sortOrder || 0,
        amendment: item.amendment,
        election: item.election,
      }))
      .sort((a: AgendaItem, b: AgendaItem) => a.sortOrder - b.sortOrder);
  }, [event?.agendaItems]);

  const cancelEvent = useCallback(
    async (params: CancelEventParams) => {
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      setIsLoading(true);
      try {
        const transactions: any[] = [];

        // Update event status to cancelled
        transactions.push(
          tx.events[params.eventId].update({
            status: 'cancelled',
            cancellationReason: params.reason,
            cancelledAt: Date.now(),
          })
        );

        // Get participant user IDs for notifications
        const participantUserIds =
          event?.participants
            ?.filter((p: any) => p.user?.id !== user.id)
            .map((p: any) => p.user?.id)
            .filter(Boolean) || [];

        // Notify participants about cancellation
        const cancelNotifications = notifyEventCancelled({
          senderId: user.id,
          eventId: params.eventId,
          eventTitle: event?.title || 'Event',
          cancellationReason: params.reason,
        });
        transactions.push(...cancelNotifications);

        // Reassign agenda items if specified
        if (params.reassignToEventId && params.itemsToReassign?.length) {
          // Get the target event's current max sort order
          const targetEventData = await db.queryOnce({
            events: {
              $: {
                where: { id: params.reassignToEventId },
              },
              agendaItems: {},
            },
          });

          const targetEvent = targetEventData.data?.events?.[0];
          const maxSortOrder = Math.max(
            0,
            ...(targetEvent?.agendaItems?.map((item: any) => item.sortOrder || 0) || [0])
          );

          let newSortOrder = maxSortOrder + 1;

          for (const itemId of params.itemsToReassign) {
            // Unlink from current event and link to new event
            transactions.push(
              tx.agendaItems[itemId]
                .unlink({ event: params.eventId })
                .link({ event: params.reassignToEventId })
                .update({ sortOrder: newSortOrder++ })
            );
          }

          // Notify about reassignment
          const reassignNotifications = notifyAgendaItemsReassigned({
            senderId: user.id,
            sourceEventId: params.eventId,
            sourceEventTitle: event?.title || 'Event',
            targetEventId: params.reassignToEventId,
            targetEventTitle: targetEvent?.title || 'Event',
            itemCount: params.itemsToReassign.length,
          });
          transactions.push(...reassignNotifications);
        }

        await db.transact(transactions);
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
        const transactions: any[] = [
          tx.positions[positionId].update({
            scheduledRevoteDate: revoteDate.getTime(),
          }),
        ];

        // Notify about scheduled revote
        const notificationTxs = notifyRevoteScheduled({
          senderId: user.id,
          groupId,
          groupName,
          positionTitle,
          scheduledDate: revoteDate.toISOString(),
        });
        transactions.push(...notificationTxs);

        await db.transact(transactions);
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
