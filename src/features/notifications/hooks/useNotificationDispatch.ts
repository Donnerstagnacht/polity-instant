import { useEffect, useCallback } from 'react';
import { useZero } from '@rocicorp/zero/react';
import { mutators } from '@/zero/mutators';
import {
  setNotificationDispatch,
  type CreateNotificationInput,
} from '@/features/notifications/utils/notification-helpers';

/**
 * Configures the notification dispatch to use the Zero mutator.
 *
 * Call this once in the authenticated app shell so that all
 * `notify*()` helpers create notifications via Zero instead of
 * direct Supabase inserts.
 */
export function useNotificationDispatch(): void {
  const zero = useZero();

  const dispatch = useCallback(
    async (args: CreateNotificationInput) => {
      await zero.mutate(mutators.notifications.createNotification(args));
    },
    [zero],
  );

  useEffect(() => {
    setNotificationDispatch(dispatch);
    return () => setNotificationDispatch(null);
  }, [dispatch]);
}
