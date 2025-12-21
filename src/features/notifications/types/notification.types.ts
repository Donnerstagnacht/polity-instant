export type NotificationType =
  | 'group_invite'
  | 'event_invite'
  | 'message'
  | 'follow'
  | 'mention'
  | 'event_update'
  | 'group_update';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string | number;
  actionUrl?: string;
  relatedEntityType?: 'group' | 'event' | 'user' | 'message' | 'blog' | 'amendment';
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  recipient?: {
    id: string;
  };
  relatedUser?: {
    id: string;
  };
  relatedGroup?: {
    id: string;
    name?: string;
    imageURL?: string;
  };
  relatedEvent?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  relatedAmendment?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  relatedBlog?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  onBehalfOfGroup?: {
    id: string;
    name?: string;
    imageURL?: string;
  };
  onBehalfOfEvent?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  onBehalfOfAmendment?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  onBehalfOfBlog?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  recipientGroup?: {
    id: string;
    name?: string;
    imageURL?: string;
    memberships?: Array<{
      role?: {
        actionRights?: Array<{
          resource: string;
          action: string;
        }>;
      };
    }>;
  };
  recipientEvent?: {
    id: string;
    title?: string;
    imageURL?: string;
    participants?: Array<{
      role?: {
        actionRights?: Array<{
          resource: string;
          action: string;
        }>;
      };
    }>;
  };
  recipientAmendment?: {
    id: string;
    title?: string;
    imageURL?: string;
    amendmentRoleCollaborators?: Array<{
      role?: {
        actionRights?: Array<{
          resource: string;
          action: string;
        }>;
      };
    }>;
  };
  recipientBlog?: {
    id: string;
    title?: string;
    imageURL?: string;
    blogRoleBloggers?: Array<{
      role?: {
        actionRights?: Array<{
          resource: string;
          action: string;
        }>;
      };
    }>;
  };
}

export interface NotificationFilters {
  all: Notification[];
  unread: Notification[];
  read: Notification[];
  personal: Notification[];
  entity: Notification[];
}
