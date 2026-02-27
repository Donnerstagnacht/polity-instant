/**
 * Grouped notification type constants.
 * Provides type-safe access to NotificationType values without scattered string literals.
 */

export const GROUP_NOTIFICATION_TYPES = {
  MEMBERSHIP_REQUEST: 'membership_request',
  MEMBERSHIP_APPROVED: 'membership_approved',
  MEMBERSHIP_REJECTED: 'membership_rejected',
  MEMBERSHIP_INVITE: 'membership_invite',
  MEMBERSHIP_WITHDRAWN: 'membership_withdrawn',
  MEMBER_REMOVED: 'member_removed',
  NEW_EVENT: 'group_new_event',
  NEW_AMENDMENT: 'group_new_amendment',
  PROFILE_UPDATED: 'group_profile_updated',
  NEW_SUBSCRIBER: 'group_new_subscriber',
  LINK_ADDED: 'group_link_added',
  LINK_REMOVED: 'group_link_removed',
  DOCUMENT_ADDED: 'group_document_added',
  DOCUMENT_REMOVED: 'group_document_removed',
  ADMIN_PROMOTED: 'group_admin_promoted',
  ADMIN_DEMOTED: 'group_admin_demoted',
  ROLE_CREATED: 'group_role_created',
  ROLE_DELETED: 'group_role_deleted',
  ROLE_UPDATED: 'group_role_updated',
  TODO_ASSIGNED: 'group_todo_assigned',
  TODO_UPDATED: 'group_todo_updated',
  PAYMENT_CREATED: 'group_payment_created',
  PAYMENT_DELETED: 'group_payment_deleted',
  RELATIONSHIP_REQUEST: 'group_relationship_request',
  RELATIONSHIP_APPROVED: 'group_relationship_approved',
  RELATIONSHIP_REJECTED: 'group_relationship_rejected',
  POSITION_CREATED: 'group_position_created',
  POSITION_ASSIGNED: 'group_position_assigned',
  POSITION_VACATED: 'group_position_vacated',
  ELECTION_CREATED: 'group_election_created',
  ELECTION_RESULTS: 'group_election_results',
  INVITATION_ACCEPTED: 'group_invitation_accepted',
  INVITATION_DECLINED: 'group_invitation_declined',
  REQUEST_WITHDRAWN: 'group_request_withdrawn',
} as const

export const EVENT_NOTIFICATION_TYPES = {
  PARTICIPATION_REQUEST: 'participation_request',
  PARTICIPATION_APPROVED: 'participation_approved',
  PARTICIPATION_REJECTED: 'participation_rejected',
  PARTICIPATION_INVITE: 'participation_invite',
  PARTICIPATION_WITHDRAWN: 'participation_withdrawn',
  PARTICIPANT_REMOVED: 'participant_removed',
  PROFILE_UPDATED: 'event_profile_updated',
  NEW_SUBSCRIBER: 'event_new_subscriber',
  ORGANIZER_PROMOTED: 'event_organizer_promoted',
  ORGANIZER_DEMOTED: 'event_organizer_demoted',
  AGENDA_ITEM_CREATED: 'event_agenda_item_created',
  AGENDA_ITEM_DELETED: 'event_agenda_item_deleted',
  SCHEDULE_CHANGED: 'event_schedule_changed',
  CANDIDATE_ADDED: 'event_candidate_added',
  ELECTION_STARTED: 'event_election_started',
  ELECTION_ENDED: 'event_election_ended',
  POSITION_CREATED: 'event_position_created',
  POSITION_DELETED: 'event_position_deleted',
  DELEGATES_FINALIZED: 'event_delegates_finalized',
  DELEGATE_NOMINATED: 'event_delegate_nominated',
  MEETING_BOOKED: 'event_meeting_booked',
  MEETING_CANCELLED: 'event_meeting_cancelled',
  SPEAKER_ADDED: 'event_speaker_added',
  INVITATION_ACCEPTED: 'event_invitation_accepted',
  INVITATION_DECLINED: 'event_invitation_declined',
  REQUEST_WITHDRAWN: 'event_request_withdrawn',
} as const

export const AMENDMENT_NOTIFICATION_TYPES = {
  COLLABORATION_REQUEST: 'collaboration_request',
  COLLABORATION_APPROVED: 'collaboration_approved',
  COLLABORATION_REJECTED: 'collaboration_rejected',
  COLLABORATION_INVITE: 'collaboration_invite',
  COLLABORATION_WITHDRAWN: 'collaboration_withdrawn',
  COLLABORATOR_REMOVED: 'collaborator_removed',
  PROFILE_UPDATED: 'amendment_profile_updated',
  NEW_SUBSCRIBER: 'amendment_new_subscriber',
  OWNER_PROMOTED: 'amendment_owner_promoted',
  OWNER_DEMOTED: 'amendment_owner_demoted',
  WORKFLOW_CHANGED: 'amendment_workflow_changed',
  PATH_ADVANCED: 'amendment_path_advanced',
  CLONED: 'amendment_cloned',
  GROUP_SUPPORT: 'amendment_group_support',
  TARGET_SET: 'amendment_target_set',
  COMMENT_ADDED: 'amendment_comment_added',
  CHANGE_REQUEST_CREATED: 'change_request_created',
  CHANGE_REQUEST_ACCEPTED: 'change_request_accepted',
  CHANGE_REQUEST_REJECTED: 'change_request_rejected',
  CHANGE_REQUEST_VOTE_CAST: 'change_request_vote_cast',
  VERSION_CREATED: 'amendment_version_created',
  VOTING_SESSION_STARTED: 'voting_session_started',
  VOTING_SESSION_COMPLETED: 'voting_session_completed',
  VOTE_CAST: 'amendment_vote_cast',
  REJECTED: 'amendment_rejected',
  INVITATION_ACCEPTED: 'collaboration_invitation_accepted',
  INVITATION_DECLINED: 'collaboration_invitation_declined',
  REQUEST_WITHDRAWN: 'collaboration_request_withdrawn',
} as const

export const BLOG_NOTIFICATION_TYPES = {
  NEW_SUBSCRIBER: 'blog_new_subscriber',
  VOTE_CAST: 'blog_vote_cast',
  UPDATED: 'blog_updated',
  PUBLISHED: 'blog_published',
  DELETED: 'blog_deleted',
  WRITER_JOINED: 'blog_writer_joined',
  ROLE_CHANGED: 'blog_role_changed',
  COMMENT_ADDED: 'blog_comment_added',
  WRITER_REQUEST: 'blog_writer_request',
  WRITER_INVITE: 'blog_writer_invite',
  WRITER_REMOVED: 'blog_writer_removed',
  ROLE_CREATED: 'blog_role_created',
  ROLE_DELETED: 'blog_role_deleted',
  INVITATION_ACCEPTED: 'blog_invitation_accepted',
  INVITATION_DECLINED: 'blog_invitation_declined',
  REQUEST_WITHDRAWN: 'blog_request_withdrawn',
  WRITER_LEFT: 'blog_writer_left',
} as const

export const TODO_NOTIFICATION_TYPES = {
  ASSIGNED: 'todo_assigned',
  UPDATED: 'todo_updated',
  COMPLETED: 'todo_completed',
  DUE_SOON: 'todo_due_soon',
  OVERDUE: 'todo_overdue',
} as const

export const SOCIAL_NOTIFICATION_TYPES = {
  NEW_FOLLOWER: 'new_follower',
  PROFILE_MENTION: 'profile_mention',
  DIRECT_MESSAGE: 'direct_message',
  CONVERSATION_REQUEST: 'conversation_request',
  CONVERSATION_ACCEPTED: 'conversation_accepted',
} as const

/**
 * Notification category values for the `category` column.
 */
export const NOTIFICATION_CATEGORIES = {
  MEMBERSHIP: 'membership',
  SUBSCRIPTION: 'subscription',
  CONTENT: 'content',
  MODERATION: 'moderation',
  VOTING: 'voting',
  SYSTEM: 'system',
} as const

export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[keyof typeof NOTIFICATION_CATEGORIES]
