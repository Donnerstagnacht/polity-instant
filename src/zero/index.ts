// Root barrel export for @/zero path alias
export { schema, zql } from './schema'
export type { Schema } from './schema'
export { dbProvider } from './db-provider'

// Re-export domain mutators for use in features
export { amendmentMutators } from './amendments/mutators'
export { eventMutators } from './events/mutators'
export { groupMutators } from './groups/mutators'
export { blogMutators } from './blogs/mutators'
export { documentMutators } from './documents/mutators'
export { messageMutators } from './messages/mutators'
export { notificationMutators } from './notifications/mutators'
export { agendaMutators } from './agendas/mutators'
export { commonMutators } from './common/mutators'
export { todoMutators } from './todos/mutators'
export { userMutators } from './users/mutators'
export { statementMutators } from './statements/mutators'
export { paymentMutators } from './payments/mutators'

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
