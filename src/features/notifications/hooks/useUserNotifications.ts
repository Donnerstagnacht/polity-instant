import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useNotificationState } from '@/zero/notifications/useNotificationState';
import { mapZeroNotification } from '../logic/notificationHelpers';

/**
 * Fetches notifications relevant to the current user:
 * - Personal notifications (where user is the direct recipient)
 * - Entity notifications (for groups/events/amendments/blogs the user belongs to)
 *
 * Delegates all query logic to the notification facade state hook.
 * Maps snake_case Zero data to camelCase Notification interface.
 */
export function useUserNotifications() {
  const { user } = useAuth();
  const { userNotifications, isLoading } = useNotificationState({
    includeUserNotifications: true,
  });

  const data = useMemo(
    () => ({ notifications: userNotifications.map(mapZeroNotification) }),
    [userNotifications]
  );

  return {
    data,
    isLoading,
    userId: user?.id,
  };
}
