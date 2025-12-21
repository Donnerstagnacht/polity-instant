import { Bell, Calendar, MessageSquare, UserPlus, Users } from 'lucide-react';
import { NotificationType } from '../types/notification.types';

export const notificationIcons: Record<NotificationType, any> = {
  group_invite: Users,
  event_invite: Calendar,
  message: MessageSquare,
  follow: UserPlus,
  mention: Bell,
  event_update: Calendar,
  group_update: Users,
};

export const notificationColors: Record<NotificationType, string> = {
  group_invite: 'text-blue-500',
  event_invite: 'text-purple-500',
  message: 'text-green-500',
  follow: 'text-pink-500',
  mention: 'text-orange-500',
  event_update: 'text-indigo-500',
  group_update: 'text-cyan-500',
};
