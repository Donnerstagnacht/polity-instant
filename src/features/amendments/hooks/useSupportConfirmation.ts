/**
 * useSupportConfirmation Hook
 *
 * Manages support confirmations for groups when change requests are accepted
 * on amendments they support.
 */

import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { notifySupportConfirmed, notifySupportDeclined } from '@/utils/notification-helpers';
import { toast } from 'sonner';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { mutators } from '@/zero/mutators';

interface SupportConfirmation {
  id: string;
  amendment_id: string;
  group_id: string;
  event_id: string;
  confirmed_by_id: string;
  status: string;
  confirmed_at: number;
  created_at: number;
  amendment?: {
    id: string;
    title: string;
    documents?: Array<{
      content: any;
    }>;
  };
}

interface UseSupportConfirmationResult {
  pendingConfirmations: SupportConfirmation[];
  isLoading: boolean;
  confirmSupport: (confirmationId: string) => Promise<void>;
  declineSupport: (confirmationId: string) => Promise<void>;
}

export function useSupportConfirmation(groupId?: string): UseSupportConfirmationResult {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { updateSupportConfirmation: updateSupportAction } = useAmendmentActions();

  // Query support confirmations for the group via facade
  const {
    supportConfirmationsByGroup: confirmationsData,
    isLoading: queryLoading,
  } = useAmendmentState({
    includeSupportConfirmationsByGroup: true,
    groupId,
  });

  const pendingConfirmations = useMemo((): SupportConfirmation[] => {
    if (!confirmationsData) return [];
    return confirmationsData as unknown as SupportConfirmation[];
  }, [confirmationsData]);

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
        await updateSupportAction({
          id: confirmationId,
          status: 'confirmed',
          confirmed_at: Date.now(),
        });

        // Send notification to amendment owner
        if (confirmation.amendment) {
          await notifySupportConfirmed({
            senderId: user.id,
            amendmentId: confirmation.amendment.id,
            amendmentTitle: confirmation.amendment.title,
            groupId: confirmation.group_id,
            groupName: confirmation.group_id,
          });
        }
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
        await updateSupportAction({
          id: confirmationId,
          status: 'declined',
          confirmed_at: Date.now(),
        });

        // Known limitation: Zero has no unlink operation. Supporter removal requires direct record deletion.
        if (confirmation.amendment) {
          // Send notification
          await notifySupportDeclined({
            senderId: user.id,
            amendmentId: confirmation.amendment.id,
            amendmentTitle: confirmation.amendment.title,
            groupId: confirmation.group_id,
            groupName: confirmation.group_id,
          });
        }
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
 * Trigger support confirmation when a change request is accepted.
 * Accepts a mutate function (from useMutate) instead of a Zero instance.
 * Caller must provide supporterGroups since this is a plain function, not a hook.
 */
export async function triggerSupporterConfirmation(
  mutate: (mutation: any) => any,
  params: {
    amendmentId: string;
    changeRequestId: string;
    changeRequestTitle?: string;
    userId: string;
    amendmentTitle?: string;
    supporterGroups?: Array<{ id: string }>;
  }
): Promise<void> {
  const { amendmentId, supporterGroups, amendmentTitle } = params;

  if (!supporterGroups?.length) {
    return; // No supporter groups to confirm
  }

  for (const group of supporterGroups) {
    const confirmationId = crypto.randomUUID();

    // Create support confirmation record
    await mutate(mutators.amendments.createSupportConfirmation({
      id: confirmationId,
      status: 'pending',
      amendment_id: amendmentId,
      group_id: group.id,
      event_id: null,
      confirmed_by_id: null,
      confirmed_at: 0,
    }));

    // Create agenda item for confirmation at group's next event
    const agendaItemId = crypto.randomUUID();
    await mutate(mutators.agendas.createAgendaItem({
      id: agendaItemId,
      title: `Support Confirmation: ${amendmentTitle || 'Amendment'}`,
      type: 'support_confirmation',
      status: 'scheduled',
      amendment_id: amendmentId,
      event_id: null,
      description: '',
      forwarding_status: '',
      order_index: 0,
      duration: 0,
      scheduled_time: '',
      start_time: 0,
      end_time: 0,
      activated_at: 0,
      completed_at: 0,
    }));

    // NOTE: agenda_item_id column does not exist on support_confirmation table
  }
}

/**
 * Create a confirmation agenda item for a specific group's event.
 * Accepts a mutate function (from useMutate) instead of a Zero instance.
 */
export async function createConfirmationAgendaItem(
  mutate: (mutation: any) => any,
  params: {
    confirmationId: string;
    amendmentTitle: string;
    eventId: string;
    groupId: string;
  }
): Promise<string> {
  const { confirmationId, amendmentTitle, eventId } = params;

  const agendaItemId = crypto.randomUUID();

  await mutate(mutators.agendas.createAgendaItem({
    id: agendaItemId,
    title: `Support Confirmation: ${amendmentTitle}`,
    type: 'support_confirmation',
    status: 'scheduled',
    description:
      'Vote to confirm or decline continued support for this amendment after recent changes.',
    event_id: eventId,
    amendment_id: null,
    forwarding_status: '',
    order_index: 0,
    duration: 0,
    scheduled_time: '',
    start_time: 0,
    end_time: 0,
    activated_at: 0,
    completed_at: 0,
  }));

  // NOTE: agenda_item_id column does not exist on support_confirmation table

  return agendaItemId;
}
