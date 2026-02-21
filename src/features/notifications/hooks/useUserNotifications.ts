import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useNotificationState } from '@/zero/notifications/useNotificationState';

/**
 * Fetches notifications relevant to the current user:
 * - Personal notifications (where user is the direct recipient)
 * - Entity notifications (for groups/events/amendments/blogs the user belongs to)
 *
 * Delegates all query logic to the notification facade state hook.
 */
export function useUserNotifications() {
  const { user } = useAuth();
  const { userNotifications, isLoading } = useNotificationState({
    includeUserNotifications: true,
  });

  const data = useMemo(
    () => ({ notifications: userNotifications }),
    [userNotifications]
  );

  return {
    data,
    isLoading,
    userId: user?.id,
  };
}
