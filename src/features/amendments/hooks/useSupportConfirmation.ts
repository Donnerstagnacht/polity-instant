/**
 * useSupportConfirmation Hook
 *
 * Manages support confirmations for groups when change requests are accepted
 * on amendments they support.
 */

import { useState, useMemo, useCallback } from 'react';
import { db, tx, id } from '../../../../db/db';
import { notifySupportConfirmed, notifySupportDeclined } from '@/utils/notification-helpers';
import { toast } from 'sonner';

interface SupportConfirmation {
  id: string;
  status: 'pending' | 'confirmed' | 'declined';
  changeRequestId: string;
  originalVersion: any;
  createdAt: number;
  respondedAt?: number;
  amendment?: {
    id: string;
    title: string;
    document?: {
      content: any;
    };
  };
  group?: {
    id: string;
    name: string;
  };
  changeRequest?: {
    id: string;
    title: string;
    description: string;
  };
}

interface UseSupportConfirmationResult {
  pendingConfirmations: SupportConfirmation[];
  isLoading: boolean;
  confirmSupport: (confirmationId: string) => Promise<void>;
  declineSupport: (confirmationId: string) => Promise<void>;
}

export function useSupportConfirmation(groupId?: string): UseSupportConfirmationResult {
  const { user } = db.useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Query support confirmations for the group
  const { data, isLoading: queryLoading } = db.useQuery(
    groupId
      ? {
          supportConfirmations: {
            $: {
              where: {
                'group.id': groupId,
                status: 'pending',
              },
            },
            amendment: {
              document: {},
            },
            group: {},
            changeRequest: {},
          },
        }
      : null
  );

  const pendingConfirmations = useMemo((): SupportConfirmation[] => {
    if (!data?.supportConfirmations) return [];
    return data.supportConfirmations as SupportConfirmation[];
  }, [data?.supportConfirmations]);

  const confirmSupport = useCallback(
    async (confirmationId: string) => {
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const confirmation = pendingConfirmations.find(c => c.id === confirmationId);
      if (!confirmation) {
        toast.error('Confirmation not found');
        return;
      }

      setIsLoading(true);
      try {
        const transactions: any[] = [
          tx.supportConfirmations[confirmationId].update({
            status: 'confirmed',
            respondedAt: Date.now(),
          }),
        ];

        // Send notification to amendment owner
        if (confirmation.amendment && confirmation.group) {
          const notificationTxs = notifySupportConfirmed({
            senderId: user.id,
            amendmentId: confirmation.amendment.id,
            amendmentTitle: confirmation.amendment.title,
            groupId: confirmation.group.id,
            groupName: confirmation.group.name,
          });
          transactions.push(...notificationTxs);
        }

        await db.transact(transactions);
        toast.success('Support confirmed');
      } catch (error) {
        console.error('Error confirming support:', error);
        toast.error('Failed to confirm support');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, pendingConfirmations]
  );

  const declineSupport = useCallback(
    async (confirmationId: string) => {
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const confirmation = pendingConfirmations.find(c => c.id === confirmationId);
      if (!confirmation) {
        toast.error('Confirmation not found');
        return;
      }

      setIsLoading(true);
      try {
        const transactions: any[] = [
          tx.supportConfirmations[confirmationId].update({
            status: 'declined',
            respondedAt: Date.now(),
          }),
        ];

        // Remove group from amendment supporters
        if (confirmation.amendment && confirmation.group) {
          transactions.push(
            tx.amendments[confirmation.amendment.id].unlink({
              groupSupporters: confirmation.group.id,
            })
          );

          // Send notification
          const notificationTxs = notifySupportDeclined({
            senderId: user.id,
            amendmentId: confirmation.amendment.id,
            amendmentTitle: confirmation.amendment.title,
            groupId: confirmation.group.id,
            groupName: confirmation.group.name,
          });
          transactions.push(...notificationTxs);
        }

        await db.transact(transactions);
        toast.success('Support declined');
      } catch (error) {
        console.error('Error declining support:', error);
        toast.error('Failed to decline support');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, pendingConfirmations]
  );

  return {
    pendingConfirmations,
    isLoading: isLoading || queryLoading,
    confirmSupport,
    declineSupport,
  };
}

/**
 * Trigger support confirmation when a change request is accepted
 */
export async function triggerSupporterConfirmation(params: {
  amendmentId: string;
  changeRequestId: string;
  changeRequestTitle?: string;
  userId: string;
}): Promise<void> {
  const { amendmentId, changeRequestId, userId } = params;

  // Query the amendment to get its supporter groups and current document
  const { data } = await db.queryOnce({
    amendments: {
      $: { where: { id: amendmentId } },
      groupSupporters: {},
      document: {},
    },
  });

  const amendment = (data as any)?.amendments?.[0];
  if (!amendment?.groupSupporters?.length) {
    return; // No supporter groups to confirm
  }

  const transactions: any[] = [];

  for (const group of amendment.groupSupporters) {
    const confirmationId = id();

    // Create support confirmation record
    transactions.push(
      tx.supportConfirmations[confirmationId]
        .update({
          status: 'pending',
          changeRequestId,
          originalVersion: amendment.document?.content || null,
          createdAt: Date.now(),
        })
        .link({
          amendment: amendmentId,
          group: group.id,
          changeRequest: changeRequestId,
        })
    );

    // Create agenda item for confirmation at group's next event
    const agendaItemId = id();
    transactions.push(
      tx.agendaItems[agendaItemId]
        .update({
          title: `Support Confirmation: ${amendment.title || 'Amendment'}`,
          type: 'support_confirmation',
          status: 'scheduled',
          createdAt: Date.now(),
        })
        .link({
          amendment: amendmentId,
          supportConfirmation: confirmationId,
        })
    );

    // Link agenda item to support confirmation
    transactions.push(
      tx.supportConfirmations[confirmationId].link({
        agendaItem: agendaItemId,
      })
    );
  }

  if (transactions.length > 0) {
    await db.transact(transactions);
  }
}

/**
 * Create a confirmation agenda item for a specific group's event
 */
export async function createConfirmationAgendaItem(params: {
  confirmationId: string;
  amendmentTitle: string;
  eventId: string;
  groupId: string;
}): Promise<string> {
  const { confirmationId, amendmentTitle, eventId, groupId } = params;

  const agendaItemId = id();

  await db.transact([
    tx.agendaItems[agendaItemId]
      .update({
        title: `Support Confirmation: ${amendmentTitle}`,
        type: 'support_confirmation',
        status: 'scheduled',
        description:
          'Vote to confirm or decline continued support for this amendment after recent changes.',
        createdAt: Date.now(),
      })
      .link({
        event: eventId,
        supportConfirmation: confirmationId,
      }),
    tx.supportConfirmations[confirmationId].link({
      agendaItem: agendaItemId,
    }),
  ]);

  return agendaItemId;
}
