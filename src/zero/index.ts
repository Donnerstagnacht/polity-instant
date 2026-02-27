// Root barrel export for @/zero path alias
export { schema, zql } from './schema'
export type { Schema } from './schema'
export { dbProvider } from './db-provider'

// Re-export domain shared mutators for use in features
export { amendmentSharedMutators } from './amendments/shared-mutators'
export { eventSharedMutators } from './events/shared-mutators'
export { groupSharedMutators } from './groups/shared-mutators'
export { blogSharedMutators } from './blogs/shared-mutators'
export { documentSharedMutators } from './documents/shared-mutators'
export { messageSharedMutators } from './messages/shared-mutators'
export { notificationSharedMutators } from './notifications/shared-mutators'
export { agendaSharedMutators } from './agendas/shared-mutators'
export { commonSharedMutators } from './common/shared-mutators'
export { todoSharedMutators } from './todos/shared-mutators'
export { userSharedMutators } from './users/shared-mutators'
export { statementSharedMutators } from './statements/shared-mutators'
export { paymentSharedMutators } from './payments/shared-mutators'

// Re-export all Row types
export type {
  // Users
  User, File, Follow, UserStats,
  // Groups
  Group, GroupMembership, GroupRelationship, Role, ActionRight, Position, PositionHolderHistory,
  // Events
  Event, EventParticipant, EventDelegate, GroupDelegateAllocation, MeetingSlot, MeetingBooking,
  Participant, EventPosition, EventPositionHolder, EventVotingSession, EventVote, ScheduledElection,
  // Amendments
  Amendment, AmendmentVoteEntry, AmendmentSupportVote, AmendmentVote, ChangeRequest, ChangeRequestVote,
  AmendmentVotingSession, AmendmentVotingSessionVote, AmendmentCollaborator, AmendmentPath,
  AmendmentPathSegment, SupportConfirmation,
  // Documents
  Document, DocumentVersion, DocumentCollaborator, DocumentCursor, Thread, Comment, ThreadVote, CommentVote,
  // Agendas
  AgendaItem, SpeakerList, Election, ElectionCandidate, ElectionVote,
  // Todos
  Todo, TodoAssignment,
  // Messages
  Conversation, ConversationParticipant, Message,
  // Notifications
  Notification, PushSubscription, NotificationSetting,
  // Blogs
  Blog, BlogBlogger, BlogSupportVote,
  // Payments
  Payment, StripeCustomer, StripeSubscription, StripePayment,
  // Statements
  Statement,
  // Common
  Subscriber, Hashtag, Link, TimelineEvent, Reaction,
} from './schema'
