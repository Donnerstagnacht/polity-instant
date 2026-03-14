/**
 * Maps NotificationType → notification_setting category + key.
 * Used by shouldDispatchNotification() to gate personal notifications
 * against the recipient's preferences.
 */

import type { NotificationType } from '../types/notification.types'
import type { NotificationSettings } from '../types/notification-settings.types'

type SettingCategory =
  | 'groupNotifications'
  | 'eventNotifications'
  | 'amendmentNotifications'
  | 'blogNotifications'
  | 'todoNotifications'
  | 'socialNotifications'

interface SettingPath {
  category: SettingCategory
  key: string
}

/**
 * Map from NotificationType to the settings category and boolean key
 * that controls whether the notification should be dispatched.
 *
 * Types not listed here (e.g. system notifications) always dispatch.
 */
export const NOTIFICATION_TYPE_TO_SETTING: Partial<Record<NotificationType, SettingPath>> = {
  // ── Group Notifications ────────────────────────────────────────────
  // Membership
  membership_request: { category: 'groupNotifications', key: 'membershipRequests' },
  membership_approved: { category: 'groupNotifications', key: 'membershipRequests' },
  membership_rejected: { category: 'groupNotifications', key: 'membershipRequests' },
  membership_invite: { category: 'groupNotifications', key: 'membershipInvitations' },
  membership_withdrawn: { category: 'groupNotifications', key: 'membershipRequests' },
  member_removed: { category: 'groupNotifications', key: 'newMembers' },
  group_invitation_accepted: { category: 'groupNotifications', key: 'membershipInvitations' },
  group_invitation_declined: { category: 'groupNotifications', key: 'membershipInvitations' },
  group_request_withdrawn: { category: 'groupNotifications', key: 'membershipRequests' },
  group_invite: { category: 'groupNotifications', key: 'membershipInvitations' },

  // Content
  group_new_event: { category: 'groupNotifications', key: 'newEvents' },
  group_new_amendment: { category: 'groupNotifications', key: 'newAmendments' },
  group_profile_updated: { category: 'groupNotifications', key: 'profileUpdates' },
  group_update: { category: 'groupNotifications', key: 'profileUpdates' },
  group_new_subscriber: { category: 'groupNotifications', key: 'newSubscribers' },
  group_link_added: { category: 'groupNotifications', key: 'newDocuments' },
  group_link_removed: { category: 'groupNotifications', key: 'newDocuments' },
  group_document_added: { category: 'groupNotifications', key: 'newDocuments' },
  group_document_removed: { category: 'groupNotifications', key: 'newDocuments' },

  // Admin
  group_admin_promoted: { category: 'groupNotifications', key: 'roleUpdates' },
  group_admin_demoted: { category: 'groupNotifications', key: 'roleUpdates' },
  group_role_created: { category: 'groupNotifications', key: 'roleUpdates' },
  group_role_deleted: { category: 'groupNotifications', key: 'roleUpdates' },
  group_role_updated: { category: 'groupNotifications', key: 'roleUpdates' },

  // Todos
  group_todo_assigned: { category: 'groupNotifications', key: 'tasksAssigned' },
  group_todo_updated: { category: 'groupNotifications', key: 'tasksAssigned' },

  // Payments
  group_payment_created: { category: 'groupNotifications', key: 'paymentNotifications' },
  group_payment_deleted: { category: 'groupNotifications', key: 'paymentNotifications' },

  // Relationships
  group_relationship_request: { category: 'groupNotifications', key: 'newRelationships' },
  group_relationship_approved: { category: 'groupNotifications', key: 'newRelationships' },
  group_relationship_rejected: { category: 'groupNotifications', key: 'newRelationships' },

  // Positions & Elections
  group_position_created: { category: 'groupNotifications', key: 'newPositions' },
  group_position_assigned: { category: 'groupNotifications', key: 'newPositions' },
  group_position_vacated: { category: 'groupNotifications', key: 'newPositions' },
  group_election_created: { category: 'groupNotifications', key: 'newPositions' },
  group_election_results: { category: 'groupNotifications', key: 'newPositions' },

  // ── Event Notifications ────────────────────────────────────────────
  // Participation
  participation_request: { category: 'eventNotifications', key: 'participationRequests' },
  participation_approved: { category: 'eventNotifications', key: 'participationRequests' },
  participation_rejected: { category: 'eventNotifications', key: 'participationRequests' },
  participation_invite: { category: 'eventNotifications', key: 'participationInvitations' },
  participation_withdrawn: { category: 'eventNotifications', key: 'participationRequests' },
  participant_removed: { category: 'eventNotifications', key: 'newParticipants' },
  event_invite: { category: 'eventNotifications', key: 'participationInvitations' },
  event_invitation_accepted: { category: 'eventNotifications', key: 'participationInvitations' },
  event_invitation_declined: { category: 'eventNotifications', key: 'participationInvitations' },
  event_request_withdrawn: { category: 'eventNotifications', key: 'participationRequests' },

  // Content
  event_profile_updated: { category: 'eventNotifications', key: 'profileUpdates' },
  event_update: { category: 'eventNotifications', key: 'profileUpdates' },
  event_new_subscriber: { category: 'eventNotifications', key: 'newSubscribers' },
  event_organizer_promoted: { category: 'eventNotifications', key: 'roleUpdates' },
  event_organizer_demoted: { category: 'eventNotifications', key: 'roleUpdates' },
  event_agenda_item_created: { category: 'eventNotifications', key: 'agendaItems' },
  event_agenda_item_deleted: { category: 'eventNotifications', key: 'agendaItems' },
  event_schedule_changed: { category: 'eventNotifications', key: 'scheduleChanges' },

  // Elections & Positions
  event_candidate_added: { category: 'eventNotifications', key: 'elections' },
  event_election_started: { category: 'eventNotifications', key: 'elections' },
  event_election_ended: { category: 'eventNotifications', key: 'elections' },
  event_position_created: { category: 'eventNotifications', key: 'positionChanges' },
  event_position_deleted: { category: 'eventNotifications', key: 'positionChanges' },
  event_delegates_finalized: { category: 'eventNotifications', key: 'delegateNominations' },
  event_delegate_nominated: { category: 'eventNotifications', key: 'delegateNominations' },

  // Meetings & Speakers
  event_meeting_booked: { category: 'eventNotifications', key: 'meetingBookings' },
  event_meeting_cancelled: { category: 'eventNotifications', key: 'meetingBookings' },
  event_speaker_added: { category: 'eventNotifications', key: 'speakerListAdditions' },

  // ── Amendment Notifications ────────────────────────────────────────
  // Collaboration
  collaboration_request: { category: 'amendmentNotifications', key: 'collaborationRequests' },
  collaboration_approved: { category: 'amendmentNotifications', key: 'collaborationRequests' },
  collaboration_rejected: { category: 'amendmentNotifications', key: 'collaborationRequests' },
  collaboration_invite: { category: 'amendmentNotifications', key: 'collaborationInvitations' },
  collaboration_withdrawn: { category: 'amendmentNotifications', key: 'collaborationRequests' },
  collaborator_removed: { category: 'amendmentNotifications', key: 'newCollaborators' },
  collaboration_invitation_accepted: { category: 'amendmentNotifications', key: 'collaborationInvitations' },
  collaboration_invitation_declined: { category: 'amendmentNotifications', key: 'collaborationInvitations' },
  collaboration_request_withdrawn: { category: 'amendmentNotifications', key: 'collaborationRequests' },

  // Content
  amendment_profile_updated: { category: 'amendmentNotifications', key: 'profileUpdates' },
  amendment_new_subscriber: { category: 'amendmentNotifications', key: 'newSubscribers' },
  amendment_owner_promoted: { category: 'amendmentNotifications', key: 'roleUpdates' },
  amendment_owner_demoted: { category: 'amendmentNotifications', key: 'roleUpdates' },
  amendment_workflow_changed: { category: 'amendmentNotifications', key: 'workflowChanges' },
  amendment_path_advanced: { category: 'amendmentNotifications', key: 'processProgress' },
  amendment_cloned: { category: 'amendmentNotifications', key: 'clones' },
  amendment_group_support: { category: 'amendmentNotifications', key: 'supportingGroups' },
  amendment_target_set: { category: 'amendmentNotifications', key: 'supportingGroups' },
  amendment_comment_added: { category: 'amendmentNotifications', key: 'discussions' },

  // Change Requests
  change_request_created: { category: 'amendmentNotifications', key: 'changeRequests' },
  change_request_accepted: { category: 'amendmentNotifications', key: 'changeRequestDecisions' },
  change_request_rejected: { category: 'amendmentNotifications', key: 'changeRequestDecisions' },
  change_request_vote_cast: { category: 'amendmentNotifications', key: 'changeRequests' },
  amendment_version_created: { category: 'amendmentNotifications', key: 'changeRequests' },

  // Voting
  voting_session_started: { category: 'amendmentNotifications', key: 'votingSessions' },
  voting_session_completed: { category: 'amendmentNotifications', key: 'votingSessions' },
  amendment_vote_cast: { category: 'amendmentNotifications', key: 'upvotesDownvotes' },
  amendment_rejected: { category: 'amendmentNotifications', key: 'votingSessions' },

  // ── Blog Notifications ─────────────────────────────────────────────
  blog_new_subscriber: { category: 'blogNotifications', key: 'newSubscribers' },
  blog_vote_cast: { category: 'blogNotifications', key: 'upvotesDownvotes' },
  blog_updated: { category: 'blogNotifications', key: 'profileUpdates' },
  blog_published: { category: 'blogNotifications', key: 'profileUpdates' },
  blog_deleted: { category: 'blogNotifications', key: 'profileUpdates' },
  blog_writer_joined: { category: 'blogNotifications', key: 'newWriters' },
  blog_role_changed: { category: 'blogNotifications', key: 'roleUpdates' },
  blog_comment_added: { category: 'blogNotifications', key: 'comments' },
  blog_writer_request: { category: 'blogNotifications', key: 'writerRequests' },
  blog_writer_invite: { category: 'blogNotifications', key: 'writerInvitations' },
  blog_writer_removed: { category: 'blogNotifications', key: 'newWriters' },
  blog_role_created: { category: 'blogNotifications', key: 'roleUpdates' },
  blog_role_deleted: { category: 'blogNotifications', key: 'roleUpdates' },
  blog_invitation_accepted: { category: 'blogNotifications', key: 'writerInvitations' },
  blog_invitation_declined: { category: 'blogNotifications', key: 'writerInvitations' },
  blog_request_withdrawn: { category: 'blogNotifications', key: 'writerRequests' },
  blog_writer_left: { category: 'blogNotifications', key: 'newWriters' },

  // ── Todo Notifications ─────────────────────────────────────────────
  todo_assigned: { category: 'todoNotifications', key: 'taskAssigned' },
  todo_updated: { category: 'todoNotifications', key: 'taskUpdated' },
  todo_completed: { category: 'todoNotifications', key: 'taskCompleted' },
  todo_due_soon: { category: 'todoNotifications', key: 'dueDateReminders' },
  todo_overdue: { category: 'todoNotifications', key: 'overdueAlerts' },

  // ── Social Notifications ───────────────────────────────────────────
  new_follower: { category: 'socialNotifications', key: 'newFollowers' },
  profile_mention: { category: 'socialNotifications', key: 'mentions' },
  direct_message: { category: 'socialNotifications', key: 'directMessages' },
  conversation_request: { category: 'socialNotifications', key: 'conversationRequests' },
  conversation_accepted: { category: 'socialNotifications', key: 'conversationRequests' },
  follow: { category: 'socialNotifications', key: 'newFollowers' },
  mention: { category: 'socialNotifications', key: 'mentions' },
  message: { category: 'socialNotifications', key: 'directMessages' },

  // Statement types
  statement_response: { category: 'socialNotifications', key: 'mentions' },
  statement_mention: { category: 'socialNotifications', key: 'mentions' },
}

/**
 * Check whether a personal notification should be dispatched based on recipient settings.
 *
 * - Entity notifications are ALWAYS dispatched (shared entity log, not gated).
 * - If no mapping exists for the type, returns true (always send).
 * - If settings is null/undefined, returns true (NULL = all defaults = all true).
 * - Otherwise reads the boolean at settings[category][key].
 */
export function shouldDispatchNotification(
  type: NotificationType,
  recipientSettings: NotificationSettings | null | undefined,
  options?: { isEntityNotification?: boolean }
): boolean {
  // Entity notifications always dispatch
  if (options?.isEntityNotification) return true

  // Check delivery kill switch
  if (recipientSettings?.deliverySettings?.inAppNotifications === false) return false

  const mapping = NOTIFICATION_TYPE_TO_SETTING[type]
  if (!mapping) return true // unmapped types always dispatch
  if (!recipientSettings) return true // NULL = all defaults = all true

  const categorySettings = recipientSettings[mapping.category]
  if (!categorySettings) return true // NULL category = all true

  const value = (categorySettings as Record<string, boolean>)[mapping.key]
  return value !== false // undefined or true = dispatch
}
