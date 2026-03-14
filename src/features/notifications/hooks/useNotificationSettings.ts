import { useState, useMemo, useCallback } from 'react';
import { useNotificationState } from '@/zero/notifications/useNotificationState';
import { useNotificationActions } from '@/zero/notifications/useNotificationActions';
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
 * Hook to query and manage notification settings for a user.
 * @param _userId — ignored; the facade derives user from Zero auth context.
 */
export function useNotificationSettings(_userId?: string) {
  const { settings: rawSettings, isLoading } = useNotificationState();
  const {
    updateSettings: facadeUpdateSettings,
    createSettings: facadeCreateSettings,
  } = useNotificationActions();
  const [isUpdating, setIsUpdating] = useState(false);

  // Get the settings or use defaults
  const settings = useMemo((): NotificationSettings => {
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
        ...(rawSettings.group_notifications as GroupNotificationSettings | undefined),
      },
      eventNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.eventNotifications,
        ...(rawSettings.event_notifications as EventNotificationSettings | undefined),
      },
      amendmentNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.amendmentNotifications,
        ...(rawSettings.amendment_notifications as AmendmentNotificationSettings | undefined),
      },
      blogNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.blogNotifications,
        ...(rawSettings.blog_notifications as BlogNotificationSettings | undefined),
      },
      todoNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.todoNotifications,
        ...(rawSettings.todo_notifications as TodoNotificationSettings | undefined),
      },
      socialNotifications: {
        ...DEFAULT_NOTIFICATION_SETTINGS.socialNotifications,
        ...(rawSettings.social_notifications as SocialNotificationSettings | undefined),
      },
      deliverySettings: {
        ...DEFAULT_NOTIFICATION_SETTINGS.deliverySettings,
        ...(rawSettings.delivery_settings as DeliverySettings | undefined),
      },
      timelineSettings: {
        ...DEFAULT_NOTIFICATION_SETTINGS.timelineSettings,
        ...(rawSettings.timeline_settings as TimelineSettings | undefined),
      },
      createdAt: rawSettings.created_at ? new Date(rawSettings.created_at) : undefined,
      updatedAt: rawSettings.updated_at ? new Date(rawSettings.updated_at) : undefined,
    };
  }, [rawSettings]);

  /**
   * Update notification settings
   * Creates new settings if they don't exist, otherwise updates existing
   */
  const updateSettings = useCallback(
    async (updates: Partial<Omit<NotificationSettings, 'id' | 'createdAt' | 'updatedAt'>>) => {
      // Convert camelCase local keys to snake_case DB column names
      const dbUpdates: {
        group_notifications?: GroupNotificationSettings;
        event_notifications?: EventNotificationSettings;
        amendment_notifications?: AmendmentNotificationSettings;
        blog_notifications?: BlogNotificationSettings;
        todo_notifications?: TodoNotificationSettings;
        social_notifications?: SocialNotificationSettings;
        delivery_settings?: DeliverySettings;
        timeline_settings?: TimelineSettings;
      } = {};
      if (updates.groupNotifications !== undefined) dbUpdates.group_notifications = updates.groupNotifications;
      if (updates.eventNotifications !== undefined) dbUpdates.event_notifications = updates.eventNotifications;
      if (updates.amendmentNotifications !== undefined) dbUpdates.amendment_notifications = updates.amendmentNotifications;
      if (updates.blogNotifications !== undefined) dbUpdates.blog_notifications = updates.blogNotifications;
      if (updates.todoNotifications !== undefined) dbUpdates.todo_notifications = updates.todoNotifications;
      if (updates.socialNotifications !== undefined) dbUpdates.social_notifications = updates.socialNotifications;
      if (updates.deliverySettings !== undefined) dbUpdates.delivery_settings = updates.deliverySettings;
      if (updates.timelineSettings !== undefined) dbUpdates.timeline_settings = updates.timelineSettings;

      setIsUpdating(true);
      try {
        const existingId = settings.id;

        if (existingId) {
          // Update existing settings — facade shows toast
          await facadeUpdateSettings({
            id: existingId,
            ...dbUpdates,
          });
        } else {
          // Create new settings — facade shows toast
          const newId = crypto.randomUUID();
          await facadeCreateSettings({
            id: newId,
            group_notifications: DEFAULT_NOTIFICATION_SETTINGS.groupNotifications,
            event_notifications: DEFAULT_NOTIFICATION_SETTINGS.eventNotifications,
            amendment_notifications: DEFAULT_NOTIFICATION_SETTINGS.amendmentNotifications,
            blog_notifications: DEFAULT_NOTIFICATION_SETTINGS.blogNotifications,
            todo_notifications: DEFAULT_NOTIFICATION_SETTINGS.todoNotifications,
            social_notifications: DEFAULT_NOTIFICATION_SETTINGS.socialNotifications,
            delivery_settings: DEFAULT_NOTIFICATION_SETTINGS.deliverySettings,
            timeline_settings: DEFAULT_NOTIFICATION_SETTINGS.timelineSettings,
            ...dbUpdates,
          });
        }

        return { success: true };
      } catch (err) {
        console.error('Failed to update notification settings:', err);
        return { success: false, error: err };
      } finally {
        setIsUpdating(false);
      }
    },
    [settings.id, facadeUpdateSettings, facadeCreateSettings]
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
        } as GroupNotificationSettings,
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
        } as EventNotificationSettings,
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
        } as AmendmentNotificationSettings,
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
        } as BlogNotificationSettings,
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
        } as TodoNotificationSettings,
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
        } as SocialNotificationSettings,
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
        } as DeliverySettings,
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
        } as TimelineSettings,
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
   */
  const toggleSetting = useCallback(
    <T extends 'groupNotifications' | 'eventNotifications' | 'amendmentNotifications' | 'blogNotifications' | 'todoNotifications' | 'socialNotifications' | 'deliverySettings'>(
      category: T,
      key: keyof NotificationSettings[T]
    ) => {
      const categorySettings = settings[category] as Record<string, boolean>;
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
    error: null,
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
