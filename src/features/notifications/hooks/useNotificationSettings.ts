import { useState, useMemo, useCallback } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';
import {
  NotificationSettings,
  GroupNotificationSettings,
  EventNotificationSettings,
  AmendmentNotificationSettings,
  BlogNotificationSettings,
  TodoNotificationSettings,
  SocialNotificationSettings,
  DeliverySettings,
  TimelineSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../types/notification-settings.types';

/**
 * Hook to query and manage notification settings for a user
 */
export function useNotificationSettings(userId?: string) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Query user's notification settings
  const { data, isLoading, error } = db.useQuery(
    userId
      ? {
          notificationSettings: {
            $: {
              where: {
                'user.id': userId,
              },
            },
          },
        }
      : null
  );

  // Get the settings or use defaults
  const settings = useMemo((): NotificationSettings => {
    const rawSettings = data?.notificationSettings?.[0];

    if (!rawSettings) {
      return {
        ...DEFAULT_NOTIFICATION_SETTINGS,
      };
    }

    // Merge with defaults to ensure all fields exist
    return {
      id: rawSettings.id,
      groupNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.groupNotifications,
        ...(rawSettings.groupNotifications as GroupNotificationSettings | undefined),
      },
      eventNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.eventNotifications,
        ...(rawSettings.eventNotifications as EventNotificationSettings | undefined),
      },
      amendmentNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.amendmentNotifications,
        ...(rawSettings.amendmentNotifications as AmendmentNotificationSettings | undefined),
      },
      blogNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.blogNotifications,
        ...(rawSettings.blogNotifications as BlogNotificationSettings | undefined),
      },
      todoNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.todoNotifications,
        ...(rawSettings.todoNotifications as TodoNotificationSettings | undefined),
      },
      socialNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.socialNotifications,
        ...(rawSettings.socialNotifications as SocialNotificationSettings | undefined),
      },
      deliverySettings: {
        ...DEFAULT_NOTIFICATION_SETTINGS.deliverySettings,
        ...(rawSettings.deliverySettings as DeliverySettings | undefined),
      },
      timelineSettings: {
        ...DEFAULT_NOTIFICATION_SETTINGS.timelineSettings,
        ...(rawSettings.timelineSettings as TimelineSettings | undefined),
      },
      createdAt: rawSettings.createdAt ? new Date(rawSettings.createdAt) : undefined,
      updatedAt: rawSettings.updatedAt ? new Date(rawSettings.updatedAt) : undefined,
    };
  }, [data]);

  /**
   * Update notification settings
   * Creates new settings if they don't exist, otherwise updates existing
   */
  const updateSettings = useCallback(
    async (updates: Partial<Omit<NotificationSettings, 'id' | 'createdAt' | 'updatedAt'>>) => {
      if (!userId) {
        toast.error('User ID is required to update settings');
        return { success: false, error: new Error('User ID required') };
      }

      setIsUpdating(true);
      try {
        const now = new Date();
        const existingId = settings.id;

        if (existingId) {
          // Update existing settings
          await db.transact([
            tx.notificationSettings[existingId].update({
              ...updates,
              updatedAt: now,
            }),
          ]);
        } else {
          // Create new settings
          const newId = id();
          await db.transact([
            tx.notificationSettings[newId]
              .update({
                ...DEFAULT_NOTIFICATION_SETTINGS,
                ...updates,
                createdAt: now,
                updatedAt: now,
              })
              .link({ user: userId }),
          ]);
        }

        toast.success('Settings saved');
        return { success: true };
      } catch (err) {
        console.error('Failed to update notification settings:', err);
        toast.error('Failed to save settings');
        return { success: false, error: err };
      } finally {
        setIsUpdating(false);
      }
    },
    [userId, settings.id]
  );

  /**
   * Update a specific category of notification settings
   */
  const updateGroupNotifications = useCallback(
    (updates: Partial<GroupNotificationSettings>) => {
      return updateSettings({
        groupNotifications: {
          ...settings.groupNotifications,
          ...updates,
        },
      });
    },
    [updateSettings, settings.groupNotifications]
  );

  const updateEventNotifications = useCallback(
    (updates: Partial<EventNotificationSettings>) => {
      return updateSettings({
        eventNotifications: {
          ...settings.eventNotifications,
          ...updates,
        },
      });
    },
    [updateSettings, settings.eventNotifications]
  );

  const updateAmendmentNotifications = useCallback(
    (updates: Partial<AmendmentNotificationSettings>) => {
      return updateSettings({
        amendmentNotifications: {
          ...settings.amendmentNotifications,
          ...updates,
        },
      });
    },
    [updateSettings, settings.amendmentNotifications]
  );

  const updateBlogNotifications = useCallback(
    (updates: Partial<BlogNotificationSettings>) => {
      return updateSettings({
        blogNotifications: {
          ...settings.blogNotifications,
          ...updates,
        },
      });
    },
    [updateSettings, settings.blogNotifications]
  );

  const updateTodoNotifications = useCallback(
    (updates: Partial<TodoNotificationSettings>) => {
      return updateSettings({
        todoNotifications: {
          ...settings.todoNotifications,
          ...updates,
        },
      });
    },
    [updateSettings, settings.todoNotifications]
  );

  const updateSocialNotifications = useCallback(
    (updates: Partial<SocialNotificationSettings>) => {
      return updateSettings({
        socialNotifications: {
          ...settings.socialNotifications,
          ...updates,
        },
      });
    },
    [updateSettings, settings.socialNotifications]
  );

  const updateDeliverySettings = useCallback(
    (updates: Partial<DeliverySettings>) => {
      return updateSettings({
        deliverySettings: {
          ...settings.deliverySettings,
          ...updates,
        },
      });
    },
    [updateSettings, settings.deliverySettings]
  );

  const updateTimelineSettings = useCallback(
    (updates: Partial<TimelineSettings>) => {
      return updateSettings({
        timelineSettings: {
          ...settings.timelineSettings,
          ...updates,
        },
      });
    },
    [updateSettings, settings.timelineSettings]
  );

  /**
   * Reset all settings to defaults
   */
  const resetToDefaults = useCallback(async () => {
    return updateSettings(DEFAULT_NOTIFICATION_SETTINGS);
  }, [updateSettings]);

  /**
   * Toggle a specific boolean setting
   * Note: This only works for settings that are boolean values
   */
  const toggleSetting = useCallback(
    <T extends 'groupNotifications' | 'eventNotifications' | 'amendmentNotifications' | 'blogNotifications' | 'todoNotifications' | 'socialNotifications' | 'deliverySettings'>(
      category: T,
      key: keyof NotificationSettings[T]
    ) => {
      const categorySettings = settings[category] as unknown as Record<string, boolean>;
      const currentValue = categorySettings[key as string];
      const updates = {
        [category]: {
          ...settings[category],
          [key]: !currentValue,
        },
      };
      return updateSettings(updates as Partial<NotificationSettings>);
    },
    [settings, updateSettings]
  );

  return {
    settings,
    isLoading,
    isUpdating,
    error,
    updateSettings,
    updateGroupNotifications,
    updateEventNotifications,
    updateAmendmentNotifications,
    updateBlogNotifications,
    updateTodoNotifications,
    updateSocialNotifications,
    updateDeliverySettings,
    updateTimelineSettings,
    resetToDefaults,
    toggleSetting,
  };
}
