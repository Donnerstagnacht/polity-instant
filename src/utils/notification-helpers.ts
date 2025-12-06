/**
 * Notification Helper Functions
 *
 * Utilities for creating notifications on behalf of entities
 * and sending notifications to entity recipients.
 */

import { id, tx } from '../../db';

export type EntityType = 'group' | 'event' | 'amendment' | 'blog';

export type NotificationType =
  | 'group_invite'
  | 'event_invite'
  | 'message'
  | 'follow'
  | 'mention'
  | 'event_update'
  | 'group_update'
  | 'membership_approved'
  | 'membership_rejected'
  | 'membership_role_changed'
  | 'membership_removed'
  | 'membership_withdrawn'
  | 'membership_request'
  | 'collaboration_approved'
  | 'collaboration_rejected'
  | 'collaboration_role_changed'
  | 'collaboration_removed'
  | 'collaboration_withdrawn'
  | 'collaboration_request'
  | 'participation_approved'
  | 'participation_rejected'
  | 'participation_role_changed'
  | 'participation_removed'
  | 'participation_withdrawn'
  | 'participation_request';

export interface NotificationConfig {
  // Sender information
  senderId: string; // The user performing the action

  // Recipient information (either user or entity)
  recipientUserId?: string;
  recipientEntityType?: EntityType;
  recipientEntityId?: string;

  // Entity on behalf of which notification is sent
  onBehalfOfEntityType?: EntityType;
  onBehalfOfEntityId?: string;

  // Notification content
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;

  // Related entities for navigation
  relatedEntityType?: string;
  relatedGroupId?: string;
  relatedEventId?: string;
  relatedAmendmentId?: string;
  relatedBlogId?: string;
  relatedUserId?: string;
}

/**
 * Creates a notification transaction
 */
export function createNotification(config: NotificationConfig) {
  const notificationId = id();

  const baseNotification = {
    id: notificationId,
    type: config.type,
    title: config.title,
    message: config.message,
    actionUrl: config.actionUrl,
    relatedEntityType: config.relatedEntityType,
    isRead: false,
    createdAt: new Date().toISOString(),
    onBehalfOfEntityType: config.onBehalfOfEntityType,
    onBehalfOfEntityId: config.onBehalfOfEntityId,
    recipientEntityType: config.recipientEntityType,
    recipientEntityId: config.recipientEntityId,
  };

  const transactions: any[] = [tx.notifications[notificationId].update(baseNotification)];

  // Link sender
  transactions.push(tx.notifications[notificationId].link({ sender: config.senderId }));

  // Link recipient (user or entity)
  if (config.recipientUserId) {
    transactions.push(tx.notifications[notificationId].link({ recipient: config.recipientUserId }));
  }

  // Link recipient entity
  if (config.recipientEntityType && config.recipientEntityId) {
    const recipientKey = getRecipientEntityKey(config.recipientEntityType);
    transactions.push(
      tx.notifications[notificationId].link({ [recipientKey]: config.recipientEntityId })
    );
  }

  // Link onBehalfOf entity
  if (config.onBehalfOfEntityType && config.onBehalfOfEntityId) {
    const onBehalfKey = getOnBehalfEntityKey(config.onBehalfOfEntityType);
    transactions.push(
      tx.notifications[notificationId].link({ [onBehalfKey]: config.onBehalfOfEntityId })
    );
  }

  // Link related entities
  if (config.relatedGroupId) {
    transactions.push(
      tx.notifications[notificationId].link({ relatedGroup: config.relatedGroupId })
    );
  }

  if (config.relatedEventId) {
    transactions.push(
      tx.notifications[notificationId].link({ relatedEvent: config.relatedEventId })
    );
  }

  if (config.relatedAmendmentId) {
    transactions.push(
      tx.notifications[notificationId].link({ relatedAmendment: config.relatedAmendmentId })
    );
  }

  if (config.relatedBlogId) {
    transactions.push(tx.notifications[notificationId].link({ relatedBlog: config.relatedBlogId }));
  }

  if (config.relatedUserId) {
    transactions.push(tx.notifications[notificationId].link({ relatedUser: config.relatedUserId }));
  }

  return transactions;
}

/**
 * Helper to get the recipient entity key for linking
 */
function getRecipientEntityKey(entityType: EntityType): string {
  switch (entityType) {
    case 'group':
      return 'recipientGroup';
    case 'event':
      return 'recipientEvent';
    case 'amendment':
      return 'recipientAmendment';
    case 'blog':
      return 'recipientBlog';
  }
}

/**
 * Helper to get the onBehalfOf entity key for linking
 */
function getOnBehalfEntityKey(entityType: EntityType): string {
  switch (entityType) {
    case 'group':
      return 'onBehalfOfGroup';
    case 'event':
      return 'onBehalfOfEvent';
    case 'amendment':
      return 'onBehalfOfAmendment';
    case 'blog':
      return 'onBehalfOfBlog';
  }
}

/**
 * Send notification when a user is invited to a group
 */
export function notifyGroupInvite(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'group_invite',
    title: 'Group Invitation',
    message: `You've been invited to join ${params.groupName}`,
    actionUrl: `/group/${params.groupId}/memberships`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when membership is approved
 */
export function notifyMembershipApproved(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'membership_approved',
    title: 'Membership Approved',
    message: `Your request to join ${params.groupName} has been approved`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when membership is rejected
 */
export function notifyMembershipRejected(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'membership_rejected',
    title: 'Membership Request Rejected',
    message: `Your request to join ${params.groupName} has been rejected`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when membership role is changed
 */
export function notifyMembershipRoleChanged(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  newRole: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'membership_role_changed',
    title: 'Role Changed',
    message: `Your role in ${params.groupName} has been changed to ${params.newRole}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when member is removed
 */
export function notifyMembershipRemoved(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'membership_removed',
    title: 'Removed from Group',
    message: `You have been removed from ${params.groupName}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification to group when a member withdraws
 */
export function notifyMembershipWithdrawn(params: {
  senderId: string;
  senderName: string;
  groupId: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'membership_withdrawn',
    title: 'Member Left Group',
    message: `${params.senderName} has left ${params.groupName}`,
    actionUrl: `/group/${params.groupId}/memberships`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to group when a user requests membership
 */
export function notifyMembershipRequest(params: {
  senderId: string;
  senderName: string;
  groupId: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'membership_request',
    title: 'Membership Request',
    message: `${params.senderName} has requested to join ${params.groupName}`,
    actionUrl: `/group/${params.groupId}/memberships`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a user is invited to an event
 */
export function notifyEventInvite(params: {
  senderId: string;
  recipientUserId: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'event',
    onBehalfOfEntityId: params.eventId,
    type: 'event_invite',
    title: 'Event Invitation',
    message: `You've been invited to ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}/participants`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when participation is approved
 */
export function notifyParticipationApproved(params: {
  senderId: string;
  recipientUserId: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'event',
    onBehalfOfEntityId: params.eventId,
    type: 'participation_approved',
    title: 'Participation Approved',
    message: `Your request to participate in ${params.eventTitle} has been approved`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when participation is rejected
 */
export function notifyParticipationRejected(params: {
  senderId: string;
  recipientUserId: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'event',
    onBehalfOfEntityId: params.eventId,
    type: 'participation_rejected',
    title: 'Participation Request Rejected',
    message: `Your request to participate in ${params.eventTitle} has been rejected`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when participant role is changed
 */
export function notifyParticipationRoleChanged(params: {
  senderId: string;
  recipientUserId: string;
  eventId: string;
  eventTitle: string;
  newRole: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'event',
    onBehalfOfEntityId: params.eventId,
    type: 'participation_role_changed',
    title: 'Role Changed',
    message: `Your role in ${params.eventTitle} has been changed to ${params.newRole}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when participant is removed
 */
export function notifyParticipationRemoved(params: {
  senderId: string;
  recipientUserId: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'event',
    onBehalfOfEntityId: params.eventId,
    type: 'participation_removed',
    title: 'Removed from Event',
    message: `You have been removed from ${params.eventTitle}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification to event when a participant withdraws
 */
export function notifyParticipationWithdrawn(params: {
  senderId: string;
  senderName: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'participation_withdrawn',
    title: 'Participant Withdrew',
    message: `${params.senderName} has withdrawn from ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}/participants`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to event when a user requests participation
 */
export function notifyParticipationRequest(params: {
  senderId: string;
  senderName: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'participation_request',
    title: 'Participation Request',
    message: `${params.senderName} has requested to participate in ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}/participants`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a user is invited to collaborate on an amendment
 */
export function notifyCollaborationInvite(params: {
  senderId: string;
  recipientUserId: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'amendment',
    onBehalfOfEntityId: params.amendmentId,
    type: 'group_invite', // Using existing type, can be updated
    title: 'Collaboration Invitation',
    message: `You've been invited to collaborate on ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}/collaborators`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when collaboration is approved
 */
export function notifyCollaborationApproved(params: {
  senderId: string;
  recipientUserId: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'amendment',
    onBehalfOfEntityId: params.amendmentId,
    type: 'collaboration_approved',
    title: 'Collaboration Approved',
    message: `Your request to collaborate on ${params.amendmentTitle} has been approved`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when collaboration is rejected
 */
export function notifyCollaborationRejected(params: {
  senderId: string;
  recipientUserId: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'amendment',
    onBehalfOfEntityId: params.amendmentId,
    type: 'collaboration_rejected',
    title: 'Collaboration Request Rejected',
    message: `Your request to collaborate on ${params.amendmentTitle} has been rejected`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when collaborator role is changed
 */
export function notifyCollaborationRoleChanged(params: {
  senderId: string;
  recipientUserId: string;
  amendmentId: string;
  amendmentTitle: string;
  newRole: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'amendment',
    onBehalfOfEntityId: params.amendmentId,
    type: 'collaboration_role_changed',
    title: 'Role Changed',
    message: `Your role in ${params.amendmentTitle} has been changed to ${params.newRole}`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when collaborator is removed
 */
export function notifyCollaborationRemoved(params: {
  senderId: string;
  recipientUserId: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'amendment',
    onBehalfOfEntityId: params.amendmentId,
    type: 'collaboration_removed',
    title: 'Removed from Amendment',
    message: `You have been removed from ${params.amendmentTitle}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification to amendment when a collaborator withdraws
 */
export function notifyCollaborationWithdrawn(params: {
  senderId: string;
  senderName: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'collaboration_withdrawn',
    title: 'Collaborator Withdrew',
    message: `${params.senderName} has withdrawn from ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}/collaborators`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to amendment when a user requests collaboration
 */
export function notifyCollaborationRequest(params: {
  senderId: string;
  senderName: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'collaboration_request',
    title: 'Collaboration Request',
    message: `${params.senderName} has requested to collaborate on ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}/collaborators`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
    relatedUserId: params.senderId,
  });
}
