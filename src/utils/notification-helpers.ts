/**
 * Notification Helper Functions
 *
 * Utilities for creating notifications on behalf of entities
 * and sending notifications to entity recipients.
 */

import { id, tx } from '../../db/db';

export type EntityType = 'group' | 'event' | 'amendment' | 'blog' | 'user';

export type NotificationType =
  // Legacy types
  | 'group_invite'
  | 'event_invite'
  | 'message'
  | 'follow'
  | 'mention'
  | 'event_update'
  | 'group_update'
  // Membership notifications
  | 'membership_approved'
  | 'membership_rejected'
  | 'membership_role_changed'
  | 'membership_removed'
  | 'membership_withdrawn'
  | 'membership_request'
  // Collaboration notifications
  | 'collaboration_approved'
  | 'collaboration_rejected'
  | 'collaboration_role_changed'
  | 'collaboration_removed'
  | 'collaboration_withdrawn'
  | 'collaboration_request'
  // Participation notifications
  | 'participation_approved'
  | 'participation_rejected'
  | 'participation_role_changed'
  | 'participation_removed'
  | 'participation_withdrawn'
  | 'participation_request'
  // Group admin notifications
  | 'group_admin_promoted'
  | 'group_admin_demoted'
  | 'group_role_created'
  | 'group_role_deleted'
  | 'group_role_updated'
  // Group resource notifications
  | 'group_link_added'
  | 'group_link_removed'
  | 'group_document_added'
  | 'group_document_removed'
  | 'group_new_subscriber'
  // Standalone document notifications
  | 'document_collaborator_invited'
  // Group position notifications
  | 'group_position_created'
  | 'group_position_deleted'
  | 'group_position_assigned'
  | 'group_position_vacated'
  | 'group_election_created'
  // Group event notifications
  | 'group_event_created'
  // Group relationship notifications
  | 'group_relationship_request'
  | 'group_relationship_approved'
  | 'group_relationship_rejected'
  // Group todo notifications
  | 'group_todo_assigned'
  | 'group_todo_updated'
  | 'group_todo_deleted'
  // Group payment notifications
  | 'group_payment_created'
  | 'group_payment_deleted'
  // Event notifications
  | 'event_organizer_promoted'
  | 'event_organizer_demoted'
  | 'event_agenda_item_created'
  | 'event_agenda_item_deleted'
  | 'event_schedule_changed'
  | 'event_candidate_added'
  | 'event_election_started'
  | 'event_election_ended'
  | 'event_position_created'
  | 'event_position_deleted'
  | 'event_delegates_finalized'
  | 'event_delegate_nominated'
  | 'event_meeting_booked'
  | 'event_meeting_cancelled'
  | 'event_speaker_added'
  | 'event_new_subscriber'
  // Amendment notifications
  | 'amendment_workflow_changed'
  | 'amendment_path_advanced'
  | 'amendment_cloned'
  | 'amendment_group_support'
  | 'amendment_comment_added'
  | 'change_request_created'
  | 'change_request_accepted'
  | 'change_request_rejected'
  | 'amendment_version_created'
  | 'voting_session_started'
  | 'voting_session_completed'
  | 'amendment_vote_cast'
  | 'amendment_new_subscriber'
  // Blog notifications
  | 'blog_new_subscriber'
  | 'blog_vote_cast'
  | 'blog_updated'
  | 'blog_writer_joined'
  | 'blog_role_changed'
  | 'blog_comment_added'
  | 'blog_writer_request'
  | 'blog_writer_invite'
  | 'blog_writer_removed'
  | 'blog_role_created'
  | 'blog_role_deleted'
  // Todo notifications
  | 'todo_assigned'
  | 'todo_updated'
  | 'todo_completed'
  | 'todo_deleted'
  | 'todo_due_soon'
  | 'todo_overdue'
  // User/social notifications
  | 'new_follower'
  | 'direct_message'
  | 'conversation_request'
  | 'conversation_accepted'
  // User response notifications (Phase 12.4)
  | 'group_invitation_accepted'
  | 'group_invitation_declined'
  | 'group_request_withdrawn'
  | 'event_invitation_accepted'
  | 'event_invitation_declined'
  | 'event_request_withdrawn'
  | 'collaboration_invitation_accepted'
  | 'collaboration_invitation_declined'
  | 'collaboration_request_withdrawn'
  | 'blog_invitation_accepted'
  | 'blog_invitation_declined'
  | 'blog_request_withdrawn'
  | 'blog_writer_left';

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
 * Creates a notification transaction and triggers push notification
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

  // Trigger push notification if recipient is a user (client-side only)
  if (typeof window !== 'undefined' && config.recipientUserId) {
    // Use setTimeout to not block the notification creation
    const userId = config.recipientUserId;
    setTimeout(() => {
      sendPushNotification(userId, {
        title: config.title,
        message: config.message,
        actionUrl: config.actionUrl,
        notificationId,
        type: config.type,
      }).catch((error) => {
        console.error('[Notification] Failed to send push notification:', error);
        // Don't throw - notification was already created in DB
      });
    }, 0);
  }

  return transactions;
}

/**
 * Send push notification via API
 */
async function sendPushNotification(
  userId: string,
  notification: {
    title: string;
    message: string;
    actionUrl?: string;
    notificationId?: string;
    type?: string;
  }
): Promise<void> {
  try {
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        notification,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send push notification');
    }

    const result = await response.json();
    console.log('[Notification] Push notification sent:', result);
  } catch (error) {
    console.error('[Notification] Error sending push notification:', error);
    throw error;
  }
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
    case 'user':
      return 'recipientUser';
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
    case 'user':
      return 'onBehalfOfUser';
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
 * Send notification to a user when an event is created in a group they're a member of
 */
export function notifyGroupEventCreated(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'group_event_created',
    title: 'New Event',
    message: `${params.groupName} has created a new event: ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
    relatedGroupId: params.groupId,
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

// ============================================================================
// GROUP ADMIN NOTIFICATIONS
// ============================================================================

/**
 * Send notification when a member is promoted to admin
 */
export function notifyAdminPromoted(params: {
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
    type: 'group_admin_promoted',
    title: 'Promoted to Admin',
    message: `You have been promoted to admin in ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when an admin is demoted to member
 */
export function notifyAdminDemoted(params: {
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
    type: 'group_admin_demoted',
    title: 'Demoted to Member',
    message: `You have been demoted to member in ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a role is created
 */
export function notifyRoleCreated(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  roleName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'user',
    recipientEntityId: params.recipientUserId,
    type: 'group_role_created',
    title: 'New Role Created',
    message: `A new role "${params.roleName}" has been created in ${params.groupName}`,
    actionUrl: `/group/${params.groupId}/memberships`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a role is deleted
 */
export function notifyRoleDeleted(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  roleName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'user',
    recipientEntityId: params.recipientUserId,
    type: 'group_role_deleted',
    title: 'Role Deleted',
    message: `The role "${params.roleName}" has been deleted from ${params.groupName}`,
    actionUrl: `/group/${params.groupId}/memberships`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when role action rights are updated
 */
export function notifyActionRightsChanged(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  roleName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'user',
    recipientEntityId: params.recipientUserId,
    type: 'group_role_updated',
    title: 'Role Permissions Updated',
    message: `The permissions for "${params.roleName}" have been updated in ${params.groupName}`,
    actionUrl: `/group/${params.groupId}/memberships`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

// ============================================================================
// GROUP RESOURCE NOTIFICATIONS
// ============================================================================

/**
 * Send notification when a link is added to the group
 */
export function notifyLinkAdded(params: {
  senderId: string;
  groupId: string;
  groupName: string;
  linkTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'group_link_added',
    title: 'New Link Added',
    message: `A new link "${params.linkTitle}" has been added to ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a link is removed from the group
 */
export function notifyLinkRemoved(params: {
  senderId: string;
  groupId: string;
  groupName: string;
  linkTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'group_link_removed',
    title: 'Link Removed',
    message: `The link "${params.linkTitle}" has been removed from ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a document is added to the group
 */
export function notifyDocumentCreated(params: {
  senderId: string;
  groupId: string;
  groupName: string;
  documentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'group_document_added',
    title: 'New Document Added',
    message: `A new document "${params.documentTitle}" has been added to ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a document is removed from the group
 */
export function notifyDocumentDeleted(params: {
  senderId: string;
  groupId: string;
  groupName: string;
  documentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'group_document_removed',
    title: 'Document Removed',
    message: `The document "${params.documentTitle}" has been removed from ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a user is invited to collaborate on a standalone document
 */
export function notifyDocumentCollaboratorInvited(params: {
  senderId: string;
  recipientUserId: string;
  documentId: string;
  documentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'document_collaborator_invited',
    title: 'Document Collaboration Invite',
    message: `You've been invited to collaborate on "${params.documentTitle}"`,
    actionUrl: `/editor/${params.documentId}`,
  });
}

/**
 * Send notification when a new subscriber joins the group
 */
export function notifyGroupNewSubscriber(params: {
  senderId: string;
  senderName: string;
  groupId: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'group_new_subscriber',
    title: 'New Subscriber',
    message: `${params.senderName} has subscribed to ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
    relatedUserId: params.senderId,
  });
}

// ============================================================================
// GROUP POSITION NOTIFICATIONS
// ============================================================================

/**
 * Send notification when a position is created
 */
export function notifyPositionCreated(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  positionTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'user',
    recipientEntityId: params.recipientUserId,
    type: 'group_position_created',
    title: 'New Position Created',
    message: `A new position "${params.positionTitle}" has been created in ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a position is deleted
 */
export function notifyPositionDeleted(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  positionTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'user',
    recipientEntityId: params.recipientUserId,
    type: 'group_position_deleted',
    title: 'Position Deleted',
    message: `The position "${params.positionTitle}" has been deleted from ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a user is assigned to a position
 */
export function notifyPositionAssigned(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  positionTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'group_position_assigned',
    title: 'Position Assigned',
    message: `You have been assigned to the position "${params.positionTitle}" in ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a user is removed from a position
 */
export function notifyPositionVacated(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  positionTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'group_position_vacated',
    title: 'Position Vacated',
    message: `You have been removed from the position "${params.positionTitle}" in ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when an election is created for a position
 */
export function notifyElectionCreated(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  positionTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'user',
    recipientEntityId: params.recipientUserId,
    type: 'group_election_created',
    title: 'Election Created',
    message: `An election has been created for "${params.positionTitle}" in ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

// ============================================================================
// GROUP RELATIONSHIP NOTIFICATIONS
// ============================================================================

/**
 * Send notification when a group relationship is requested
 */
export function notifyRelationshipRequested(params: {
  senderId: string;
  sourceGroupId: string;
  sourceGroupName: string;
  targetGroupId: string;
  targetGroupName: string;
  relationshipType: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.targetGroupId,
    type: 'group_relationship_request',
    title: 'Relationship Request',
    message: `${params.sourceGroupName} has requested a ${params.relationshipType} relationship with ${params.targetGroupName}`,
    actionUrl: `/group/${params.targetGroupId}/network`,
    relatedEntityType: 'group',
    relatedGroupId: params.sourceGroupId,
  });
}

/**
 * Send notification when a group relationship is approved
 */
export function notifyRelationshipApproved(params: {
  senderId: string;
  sourceGroupId: string;
  sourceGroupName: string;
  targetGroupId: string;
  targetGroupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.sourceGroupId,
    type: 'group_relationship_approved',
    title: 'Relationship Approved',
    message: `${params.targetGroupName} has approved the relationship request`,
    actionUrl: `/group/${params.sourceGroupId}/network`,
    relatedEntityType: 'group',
    relatedGroupId: params.targetGroupId,
  });
}

/**
 * Send notification when a group relationship is rejected
 */
export function notifyRelationshipRejected(params: {
  senderId: string;
  sourceGroupId: string;
  sourceGroupName: string;
  targetGroupId: string;
  targetGroupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.sourceGroupId,
    type: 'group_relationship_rejected',
    title: 'Relationship Rejected',
    message: `${params.targetGroupName} has rejected the relationship request`,
    actionUrl: `/group/${params.sourceGroupId}/network`,
    relatedEntityType: 'group',
    relatedGroupId: params.targetGroupId,
  });
}

// ============================================================================
// GROUP TODO NOTIFICATIONS
// ============================================================================

/**
 * Send notification when a todo is assigned
 */
export function notifyTodoAssigned(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  todoTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'group_todo_assigned',
    title: 'Task Assigned',
    message: `You have been assigned "${params.todoTitle}" in ${params.groupName}`,
    actionUrl: `/group/${params.groupId}/todos`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a todo is updated
 */
export function notifyTodoUpdated(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  todoTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'group_todo_updated',
    title: 'Task Updated',
    message: `The task "${params.todoTitle}" in ${params.groupName} has been updated`,
    actionUrl: `/group/${params.groupId}/todos`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a todo is deleted
 */
export function notifyTodoDeleted(params: {
  senderId: string;
  recipientUserId: string;
  groupId: string;
  groupName: string;
  todoTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'group',
    onBehalfOfEntityId: params.groupId,
    type: 'group_todo_deleted',
    title: 'Task Deleted',
    message: `The task "${params.todoTitle}" in ${params.groupName} has been deleted`,
    actionUrl: `/group/${params.groupId}/todos`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

// ============================================================================
// GROUP PAYMENT NOTIFICATIONS
// ============================================================================

/**
 * Send notification when a payment is created
 */
export function notifyPaymentCreated(params: {
  senderId: string;
  groupId: string;
  groupName: string;
  paymentDescription: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'group_payment_created',
    title: 'Payment Created',
    message: `A new payment "${params.paymentDescription}" has been created in ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

/**
 * Send notification when a payment is deleted
 */
export function notifyPaymentDeleted(params: {
  senderId: string;
  groupId: string;
  groupName: string;
  paymentDescription: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'group_payment_deleted',
    title: 'Payment Deleted',
    message: `The payment "${params.paymentDescription}" has been deleted from ${params.groupName}`,
    actionUrl: `/group/${params.groupId}`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
  });
}

// ============================================================================
// EVENT NOTIFICATIONS
// ============================================================================

/**
 * Send notification when a participant is promoted to organizer
 */
export function notifyOrganizerPromoted(params: {
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
    type: 'event_organizer_promoted',
    title: 'Promoted to Organizer',
    message: `You have been promoted to organizer in ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when an organizer is demoted
 */
export function notifyOrganizerDemoted(params: {
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
    type: 'event_organizer_demoted',
    title: 'Demoted from Organizer',
    message: `You have been demoted from organizer in ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when an agenda item is created
 */
export function notifyAgendaItemCreated(params: {
  senderId: string;
  eventId: string;
  eventTitle: string;
  agendaItemTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_agenda_item_created',
    title: 'Agenda Item Added',
    message: `"${params.agendaItemTitle}" has been added to ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when an agenda item is deleted
 */
export function notifyAgendaItemDeleted(params: {
  senderId: string;
  eventId: string;
  eventTitle: string;
  agendaItemTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_agenda_item_deleted',
    title: 'Agenda Item Removed',
    message: `"${params.agendaItemTitle}" has been removed from ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when event schedule changes
 */
export function notifyScheduleChanged(params: {
  senderId: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_schedule_changed',
    title: 'Schedule Changed',
    message: `The schedule for ${params.eventTitle} has been updated`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when a candidate is added to an election
 */
export function notifyCandidateAdded(params: {
  senderId: string;
  eventId: string;
  eventTitle: string;
  candidateName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_candidate_added',
    title: 'Candidate Added',
    message: `${params.candidateName} has been added as a candidate in ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when an election starts
 */
export function notifyElectionStarted(params: {
  senderId: string;
  eventId: string;
  eventTitle: string;
  electionTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_election_started',
    title: 'Election Started',
    message: `Voting has started for "${params.electionTitle}" in ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when an election ends
 */
export function notifyElectionEnded(params: {
  senderId: string;
  eventId: string;
  eventTitle: string;
  electionTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_election_ended',
    title: 'Election Ended',
    message: `Voting has ended for "${params.electionTitle}" in ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when an event position is created
 */
export function notifyEventPositionCreated(params: {
  senderId: string;
  eventId: string;
  eventTitle: string;
  positionTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_position_created',
    title: 'Position Created',
    message: `A new position "${params.positionTitle}" has been created in ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when an event position is deleted
 */
export function notifyEventPositionDeleted(params: {
  senderId: string;
  eventId: string;
  eventTitle: string;
  positionTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_position_deleted',
    title: 'Position Deleted',
    message: `The position "${params.positionTitle}" has been deleted from ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when delegates are finalized
 */
export function notifyDelegatesFinalized(params: {
  senderId: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_delegates_finalized',
    title: 'Delegates Finalized',
    message: `Delegates have been finalized for ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when a delegate is nominated
 */
export function notifyDelegateNominated(params: {
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
    type: 'event_delegate_nominated',
    title: 'Delegate Nominated',
    message: `You have been nominated as a delegate for ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when a meeting is booked
 */
export function notifyMeetingBooked(params: {
  senderId: string;
  senderName: string;
  recipientUserId: string;
  eventId?: string;
  eventTitle?: string;
  meetingTime: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: params.eventId ? 'event' : undefined,
    onBehalfOfEntityId: params.eventId,
    type: 'event_meeting_booked',
    title: 'Meeting Booked',
    message: `${params.senderName} has booked a meeting with you${params.eventTitle ? ` for ${params.eventTitle}` : ''} at ${params.meetingTime}`,
    actionUrl: params.eventId ? `/event/${params.eventId}` : '/calendar',
    relatedEntityType: params.eventId ? 'event' : undefined,
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when a meeting is cancelled
 */
export function notifyMeetingCancelled(params: {
  senderId: string;
  senderName: string;
  recipientUserId: string;
  eventId?: string;
  eventTitle?: string;
  meetingTime: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: params.eventId ? 'event' : undefined,
    onBehalfOfEntityId: params.eventId,
    type: 'event_meeting_cancelled',
    title: 'Meeting Cancelled',
    message: `${params.senderName} has cancelled the meeting${params.eventTitle ? ` for ${params.eventTitle}` : ''} at ${params.meetingTime}`,
    actionUrl: params.eventId ? `/event/${params.eventId}` : '/calendar',
    relatedEntityType: params.eventId ? 'event' : undefined,
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when a speaker is added
 */
export function notifySpeakerAdded(params: {
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
    type: 'event_speaker_added',
    title: 'Added to Speaker List',
    message: `You have been added to the speaker list for ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when a new subscriber joins the event
 */
export function notifyEventNewSubscriber(params: {
  senderId: string;
  senderName: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_new_subscriber',
    title: 'New Subscriber',
    message: `${params.senderName} has subscribed to ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
    relatedUserId: params.senderId,
  });
}

// ============================================================================
// AMENDMENT NOTIFICATIONS
// ============================================================================

/**
 * Send notification when workflow status changes
 */
export function notifyWorkflowChanged(params: {
  senderId: string;
  amendmentId: string;
  amendmentTitle: string;
  newStatus: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'amendment_workflow_changed',
    title: 'Workflow Status Changed',
    message: `The status of ${params.amendmentTitle} has changed to ${params.newStatus}`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when amendment advances through path
 */
export function notifyPathAdvanced(params: {
  senderId: string;
  amendmentId: string;
  amendmentTitle: string;
  segmentName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'amendment_path_advanced',
    title: 'Path Advanced',
    message: `${params.amendmentTitle} has advanced to ${params.segmentName}`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when an amendment is cloned
 */
export function notifyAmendmentCloned(params: {
  senderId: string;
  senderName: string;
  originalAmendmentId: string;
  originalAmendmentTitle: string;
  newAmendmentId: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.originalAmendmentId,
    type: 'amendment_cloned',
    title: 'Amendment Cloned',
    message: `${params.senderName} has cloned ${params.originalAmendmentTitle}`,
    actionUrl: `/amendment/${params.newAmendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.newAmendmentId,
  });
}

/**
 * Send notification when a group adds support
 */
export function notifyGroupSupportAdded(params: {
  senderId: string;
  amendmentId: string;
  amendmentTitle: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'amendment_group_support',
    title: 'Group Support Added',
    message: `${params.groupName} has added support for ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when a comment is added
 */
export function notifyAmendmentCommentAdded(params: {
  senderId: string;
  senderName: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'amendment_comment_added',
    title: 'New Comment',
    message: `${params.senderName} commented on ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a change request is created
 */
export function notifyChangeRequestCreated(params: {
  senderId: string;
  senderName: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'change_request_created',
    title: 'Change Request Created',
    message: `${params.senderName} has created a change request for ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}/change-requests`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a change request is accepted
 */
export function notifyChangeRequestAccepted(params: {
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
    type: 'change_request_accepted',
    title: 'Change Request Accepted',
    message: `Your change request for ${params.amendmentTitle} has been accepted`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when a change request is rejected
 */
export function notifyChangeRequestRejected(params: {
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
    type: 'change_request_rejected',
    title: 'Change Request Rejected',
    message: `Your change request for ${params.amendmentTitle} has been rejected`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when a new version is created
 */
export function notifyVersionCreated(params: {
  senderId: string;
  amendmentId: string;
  amendmentTitle: string;
  version: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'amendment_version_created',
    title: 'New Version Created',
    message: `Version ${params.version} of ${params.amendmentTitle} has been created`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when a voting session starts
 */
export function notifyVotingSessionStarted(params: {
  senderId: string;
  amendmentId: string;
  amendmentTitle: string;
  eventId?: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'voting_session_started',
    title: 'Voting Session Started',
    message: `Voting has started for ${params.amendmentTitle}`,
    actionUrl: params.eventId ? `/event/${params.eventId}` : `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when a voting session completes
 */
export function notifyVotingSessionCompleted(params: {
  senderId: string;
  amendmentId: string;
  amendmentTitle: string;
  eventId?: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'voting_session_completed',
    title: 'Voting Session Completed',
    message: `Voting has completed for ${params.amendmentTitle}`,
    actionUrl: params.eventId ? `/event/${params.eventId}` : `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
    relatedEventId: params.eventId,
  });
}

/**
 * Send notification when a support vote is cast
 */
export function notifyAmendmentVoted(params: {
  senderId: string;
  senderName: string;
  recipientUserId: string;
  amendmentId: string;
  amendmentTitle: string;
  voteType: 'upvote' | 'downvote';
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'amendment',
    onBehalfOfEntityId: params.amendmentId,
    type: 'amendment_vote_cast',
    title: params.voteType === 'upvote' ? 'Amendment Upvoted' : 'Amendment Downvoted',
    message: `${params.senderName} has ${params.voteType}d ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
  });
}

/**
 * Send notification when a new subscriber joins the amendment
 */
export function notifyAmendmentNewSubscriber(params: {
  senderId: string;
  senderName: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'amendment_new_subscriber',
    title: 'New Subscriber',
    message: `${params.senderName} has subscribed to ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
    relatedUserId: params.senderId,
  });
}

// ============================================================================
// BLOG NOTIFICATIONS
// ============================================================================

/**
 * Send notification when a new subscriber joins the blog
 */
export function notifyBlogNewSubscriber(params: {
  senderId: string;
  senderName: string;
  blogId: string;
  blogTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'blog',
    recipientEntityId: params.blogId,
    type: 'blog_new_subscriber',
    title: 'New Subscriber',
    message: `${params.senderName} has subscribed to ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a blog receives a vote
 */
export function notifyBlogVoted(params: {
  senderId: string;
  senderName: string;
  recipientUserId: string;
  blogId: string;
  blogTitle: string;
  voteType: 'upvote' | 'downvote';
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'blog',
    onBehalfOfEntityId: params.blogId,
    type: 'blog_vote_cast',
    title: params.voteType === 'upvote' ? 'Blog Upvoted' : 'Blog Downvoted',
    message: `${params.senderName} has ${params.voteType}d ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
  });
}

/**
 * Send notification when a writer joins the blog
 */
export function notifyBloggerJoined(params: {
  senderId: string;
  senderName: string;
  blogId: string;
  blogTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'blog',
    recipientEntityId: params.blogId,
    type: 'blog_writer_joined',
    title: 'Writer Joined',
    message: `${params.senderName} has joined ${params.blogTitle} as a writer`,
    actionUrl: `/blog/${params.blogId}`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a blogger's role is changed
 */
export function notifyBloggerRoleChanged(params: {
  senderId: string;
  recipientUserId: string;
  blogId: string;
  blogTitle: string;
  newRole: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'blog',
    onBehalfOfEntityId: params.blogId,
    type: 'blog_role_changed',
    title: 'Role Changed',
    message: `Your role in ${params.blogTitle} has been changed to ${params.newRole}`,
    actionUrl: `/blog/${params.blogId}`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
  });
}

/**
 * Send notification when a comment is added to a blog
 */
export function notifyBlogCommentAdded(params: {
  senderId: string;
  senderName: string;
  blogId: string;
  blogTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'blog',
    recipientEntityId: params.blogId,
    type: 'blog_comment_added',
    title: 'New Comment',
    message: `${params.senderName} commented on ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a writer request is received
 */
export function notifyBlogWriterRequest(params: {
  senderId: string;
  senderName: string;
  blogId: string;
  blogTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'blog',
    recipientEntityId: params.blogId,
    type: 'blog_writer_request',
    title: 'Writer Request',
    message: `${params.senderName} has requested to write for ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a user is invited to write for a blog
 */
export function notifyBloggerInvited(params: {
  senderId: string;
  recipientUserId: string;
  blogId: string;
  blogTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'blog',
    onBehalfOfEntityId: params.blogId,
    type: 'blog_writer_invite',
    title: 'Writer Invitation',
    message: `You've been invited to write for ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
  });
}

/**
 * Send notification when a blogger is removed from a blog
 */
export function notifyBloggerRemoved(params: {
  senderId: string;
  recipientUserId: string;
  blogId: string;
  blogTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    onBehalfOfEntityType: 'blog',
    onBehalfOfEntityId: params.blogId,
    type: 'blog_writer_removed',
    title: 'Removed from Blog',
    message: `You have been removed from ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
  });
}

/**
 * Send notification when a blog role is created
 */
export function notifyBlogRoleCreated(params: {
  senderId: string;
  blogId: string;
  blogTitle: string;
  roleName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'blog',
    recipientEntityId: params.blogId,
    type: 'blog_role_created',
    title: 'New Role Created',
    message: `A new role "${params.roleName}" has been created in ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}/bloggers`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
  });
}

/**
 * Send notification when a blog role is deleted
 */
export function notifyBlogRoleDeleted(params: {
  senderId: string;
  blogId: string;
  blogTitle: string;
  roleName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'blog',
    recipientEntityId: params.blogId,
    type: 'blog_role_deleted',
    title: 'Role Deleted',
    message: `The role "${params.roleName}" has been deleted from ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}/bloggers`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
  });
}

// ============================================================================
// TODO NOTIFICATIONS
// ============================================================================

/**
 * Send notification when a todo is assigned (standalone)
 */
export function notifyStandaloneTodoAssigned(params: {
  senderId: string;
  recipientUserId: string;
  todoId: string;
  todoTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'todo_assigned',
    title: 'Task Assigned',
    message: `You have been assigned "${params.todoTitle}"`,
    actionUrl: `/todos`,
  });
}

/**
 * Send notification when a todo is completed
 */
export function notifyTodoCompleted(params: {
  senderId: string;
  senderName: string;
  recipientUserId: string;
  todoTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'todo_completed',
    title: 'Task Completed',
    message: `${params.senderName} has completed "${params.todoTitle}"`,
    actionUrl: `/todos`,
  });
}

/**
 * Send notification when a standalone todo is deleted
 */
export function notifyStandaloneTodoDeleted(params: {
  senderId: string;
  senderName: string;
  recipientUserId: string;
  todoTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'todo_deleted',
    title: 'Task Deleted',
    message: `${params.senderName} has deleted "${params.todoTitle}"`,
    actionUrl: `/todos`,
  });
}

/**
 * Send notification when a todo is due soon
 */
export function notifyTodoDueSoon(params: {
  senderId: string;
  recipientUserId: string;
  todoTitle: string;
  dueIn: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'todo_due_soon',
    title: 'Task Due Soon',
    message: `"${params.todoTitle}" is due in ${params.dueIn}`,
    actionUrl: `/todos`,
  });
}

/**
 * Send notification when a todo is overdue
 */
export function notifyTodoOverdue(params: {
  senderId: string;
  recipientUserId: string;
  todoTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'todo_overdue',
    title: 'Task Overdue',
    message: `"${params.todoTitle}" is overdue`,
    actionUrl: `/todos`,
  });
}

// ============================================================================
// USER/SOCIAL NOTIFICATIONS
// ============================================================================

/**
 * Send notification when a user gets a new follower
 */
export function notifyNewFollower(params: {
  senderId: string;
  senderName: string;
  recipientUserId: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'new_follower',
    title: 'New Follower',
    message: `${params.senderName} started following you`,
    actionUrl: `/user/${params.senderId}`,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a direct message is received
 */
export function notifyDirectMessage(params: {
  senderId: string;
  senderName: string;
  recipientUserId: string;
  conversationId: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'direct_message',
    title: 'New Message',
    message: `${params.senderName} sent you a message`,
    actionUrl: `/messages/${params.conversationId}`,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a conversation request is received
 */
export function notifyConversationRequest(params: {
  senderId: string;
  senderName: string;
  recipientUserId: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'conversation_request',
    title: 'Conversation Request',
    message: `${params.senderName} wants to start a conversation with you`,
    actionUrl: `/messages`,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification when a conversation request is accepted
 */
export function notifyConversationAccepted(params: {
  senderId: string;
  senderName: string;
  recipientUserId: string;
  conversationId: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'conversation_accepted',
    title: 'Conversation Accepted',
    message: `${params.senderName} accepted your conversation request`,
    actionUrl: `/messages/${params.conversationId}`,
    relatedUserId: params.senderId,
  });
}

// ============================================================================
// USER RESPONSE NOTIFICATIONS (Phase 12.4)
// Notifications sent to entity admins/owners when users respond to invitations
// ============================================================================

// --- GROUP INVITATION RESPONSES ---

/**
 * Send notification to group when a user accepts an invitation
 */
export function notifyGroupInvitationAccepted(params: {
  senderId: string;
  senderName: string;
  groupId: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'group_invitation_accepted',
    title: 'Invitation Accepted',
    message: `${params.senderName} has accepted the invitation to join ${params.groupName}`,
    actionUrl: `/group/${params.groupId}/memberships`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to group when a user declines an invitation
 */
export function notifyGroupInvitationDeclined(params: {
  senderId: string;
  senderName: string;
  groupId: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'group_invitation_declined',
    title: 'Invitation Declined',
    message: `${params.senderName} has declined the invitation to join ${params.groupName}`,
    actionUrl: `/group/${params.groupId}/memberships`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to group when a user withdraws their membership request
 */
export function notifyGroupRequestWithdrawn(params: {
  senderId: string;
  senderName: string;
  groupId: string;
  groupName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'group',
    recipientEntityId: params.groupId,
    type: 'group_request_withdrawn',
    title: 'Request Withdrawn',
    message: `${params.senderName} has withdrawn their request to join ${params.groupName}`,
    actionUrl: `/group/${params.groupId}/memberships`,
    relatedEntityType: 'group',
    relatedGroupId: params.groupId,
    relatedUserId: params.senderId,
  });
}

// --- EVENT INVITATION RESPONSES ---

/**
 * Send notification to event when a user accepts an invitation
 */
export function notifyEventInvitationAccepted(params: {
  senderId: string;
  senderName: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_invitation_accepted',
    title: 'Invitation Accepted',
    message: `${params.senderName} has accepted the invitation to ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}/participants`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to event when a user declines an invitation
 */
export function notifyEventInvitationDeclined(params: {
  senderId: string;
  senderName: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_invitation_declined',
    title: 'Invitation Declined',
    message: `${params.senderName} has declined the invitation to ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}/participants`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to event when a user withdraws their participation request
 */
export function notifyEventRequestWithdrawn(params: {
  senderId: string;
  senderName: string;
  eventId: string;
  eventTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'event',
    recipientEntityId: params.eventId,
    type: 'event_request_withdrawn',
    title: 'Request Withdrawn',
    message: `${params.senderName} has withdrawn their request to participate in ${params.eventTitle}`,
    actionUrl: `/event/${params.eventId}/participants`,
    relatedEntityType: 'event',
    relatedEventId: params.eventId,
    relatedUserId: params.senderId,
  });
}

// --- AMENDMENT COLLABORATION INVITATION RESPONSES ---

/**
 * Send notification to amendment when a user accepts a collaboration invitation
 */
export function notifyCollaborationInvitationAccepted(params: {
  senderId: string;
  senderName: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'collaboration_invitation_accepted',
    title: 'Invitation Accepted',
    message: `${params.senderName} has accepted the invitation to collaborate on ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}/collaborators`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to amendment when a user declines a collaboration invitation
 */
export function notifyCollaborationInvitationDeclined(params: {
  senderId: string;
  senderName: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'collaboration_invitation_declined',
    title: 'Invitation Declined',
    message: `${params.senderName} has declined the invitation to collaborate on ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}/collaborators`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to amendment when a user withdraws their collaboration request
 */
export function notifyCollaborationRequestWithdrawn(params: {
  senderId: string;
  senderName: string;
  amendmentId: string;
  amendmentTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'amendment',
    recipientEntityId: params.amendmentId,
    type: 'collaboration_request_withdrawn',
    title: 'Request Withdrawn',
    message: `${params.senderName} has withdrawn their request to collaborate on ${params.amendmentTitle}`,
    actionUrl: `/amendment/${params.amendmentId}/collaborators`,
    relatedEntityType: 'amendment',
    relatedAmendmentId: params.amendmentId,
    relatedUserId: params.senderId,
  });
}

// --- BLOG INVITATION RESPONSES ---

/**
 * Send notification to blog when a user accepts an invitation to write
 */
export function notifyBlogInvitationAccepted(params: {
  senderId: string;
  senderName: string;
  blogId: string;
  blogTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'blog',
    recipientEntityId: params.blogId,
    type: 'blog_invitation_accepted',
    title: 'Invitation Accepted',
    message: `${params.senderName} has accepted the invitation to write for ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}/bloggers`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to blog when a user declines an invitation to write
 */
export function notifyBlogInvitationDeclined(params: {
  senderId: string;
  senderName: string;
  blogId: string;
  blogTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'blog',
    recipientEntityId: params.blogId,
    type: 'blog_invitation_declined',
    title: 'Invitation Declined',
    message: `${params.senderName} has declined the invitation to write for ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}/bloggers`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to blog when a user withdraws their writer request
 */
export function notifyBlogRequestWithdrawn(params: {
  senderId: string;
  senderName: string;
  blogId: string;
  blogTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'blog',
    recipientEntityId: params.blogId,
    type: 'blog_request_withdrawn',
    title: 'Request Withdrawn',
    message: `${params.senderName} has withdrawn their request to write for ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}/bloggers`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
    relatedUserId: params.senderId,
  });
}

/**
 * Send notification to blog when a writer leaves
 */
export function notifyBlogWriterLeft(params: {
  senderId: string;
  senderName: string;
  blogId: string;
  blogTitle: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientEntityType: 'blog',
    recipientEntityId: params.blogId,
    type: 'blog_writer_left',
    title: 'Writer Left',
    message: `${params.senderName} has left ${params.blogTitle}`,
    actionUrl: `/blog/${params.blogId}/bloggers`,
    relatedEntityType: 'blog',
    relatedBlogId: params.blogId,
    relatedUserId: params.senderId,
  });
}

