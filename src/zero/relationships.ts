import { relationships } from '@rocicorp/zero'

// Users
import { user, file, userStats } from './users/table'
// Groups
import { group, groupMembership, role, actionRight } from './groups/table'
// Events
import { event, eventParticipant, participant } from './events/table'
// Amendments
import { amendment, amendmentCollaborator, amendmentPath, amendmentPathSegment, supportConfirmation } from './amendments/table'
// Documents
import { document, documentVersion, documentCollaborator, documentCursor } from './documents/table'
// Agendas
import { agendaItem, speakerList } from './agendas/table'
// Elections
import { election, electionCandidate, scheduledElection } from './elections/table'
// Votes
import { amendmentVoteEntry, amendmentSupportVote, amendmentVote, amendmentVotingSession, amendmentVotingSessionVote, changeRequestVote, eventVotingSession, eventVote, electionVote, blogSupportVote, threadVote, commentVote } from './votes/table'
// Change Requests
import { changeRequest } from './change-requests/table'
// Discussions
import { thread, comment } from './discussions/table'
// Positions
import { position, positionHolderHistory, eventPosition, eventPositionHolder } from './positions/table'
// Delegates
import { eventDelegate, groupDelegateAllocation } from './delegates/table'
// Meet
import { meetingSlot, meetingBooking } from './meet/table'
// Network
import { follow, groupRelationship, subscriber } from './network/table'
// Todos
import { todo, todoAssignment } from './todos/table'
// Messages
import { conversation, conversationParticipant, message } from './messages/table'
// Notifications
import { notification, pushSubscription, notificationSetting, notificationRead } from './notifications/table'
// Blogs
import { blog, blogBlogger } from './blogs/table'
// Payments
import { payment, stripeCustomer, stripeSubscription, stripePayment } from './payments/table'
// Statements
import { statement } from './statements/table'
// Common
import { hashtag, userHashtag, groupHashtag, amendmentHashtag, eventHashtag, blogHashtag, link, timelineEvent, reaction } from './common/table'

// ============================================
// User relationships
// ============================================
export const userRelationships = relationships(user, ({ many }) => ({
  follows_as_follower: many({ sourceField: ['id'], destSchema: follow, destField: ['follower_id'] }),
  follows_as_followee: many({ sourceField: ['id'], destSchema: follow, destField: ['followee_id'] }),
  stats: many({ sourceField: ['id'], destSchema: userStats, destField: ['user_id'] }),
  group_memberships: many({ sourceField: ['id'], destSchema: groupMembership, destField: ['user_id'] }),
  owned_groups: many({ sourceField: ['id'], destSchema: group, destField: ['owner_id'] }),
  created_events: many({ sourceField: ['id'], destSchema: event, destField: ['creator_id'] }),
  event_participations: many({ sourceField: ['id'], destSchema: eventParticipant, destField: ['user_id'] }),
  event_delegates: many({ sourceField: ['id'], destSchema: eventDelegate, destField: ['user_id'] }),
  meeting_slots: many({ sourceField: ['id'], destSchema: meetingSlot, destField: ['user_id'] }),
  meeting_bookings: many({ sourceField: ['id'], destSchema: meetingBooking, destField: ['user_id'] }),
  created_amendments: many({ sourceField: ['id'], destSchema: amendment, destField: ['created_by_id'] }),
  amendment_collaborations: many({ sourceField: ['id'], destSchema: amendmentCollaborator, destField: ['user_id'] }),
  amendment_vote_entries: many({ sourceField: ['id'], destSchema: amendmentVoteEntry, destField: ['user_id'] }),
  amendment_support_votes: many({ sourceField: ['id'], destSchema: amendmentSupportVote, destField: ['user_id'] }),
  amendment_votes: many({ sourceField: ['id'], destSchema: amendmentVote, destField: ['user_id'] }),
  change_requests: many({ sourceField: ['id'], destSchema: changeRequest, destField: ['user_id'] }),
  change_request_votes: many({ sourceField: ['id'], destSchema: changeRequestVote, destField: ['user_id'] }),
  created_agenda_items: many({ sourceField: ['id'], destSchema: agendaItem, destField: ['creator_id'] }),
  speaker_list_entries: many({ sourceField: ['id'], destSchema: speakerList, destField: ['user_id'] }),
  election_candidacies: many({ sourceField: ['id'], destSchema: electionCandidate, destField: ['user_id'] }),
  election_votes: many({ sourceField: ['id'], destSchema: electionVote, destField: ['voter_id'] }),
  created_todos: many({ sourceField: ['id'], destSchema: todo, destField: ['creator_id'] }),
  todo_assignments: many({ sourceField: ['id'], destSchema: todoAssignment, destField: ['user_id'] }),
  conversation_participations: many({ sourceField: ['id'], destSchema: conversationParticipant, destField: ['user_id'] }),
  sent_messages: many({ sourceField: ['id'], destSchema: message, destField: ['sender_id'] }),
  notifications: many({ sourceField: ['id'], destSchema: notification, destField: ['recipient_id'] }),
  sent_notifications: many({ sourceField: ['id'], destSchema: notification, destField: ['sender_id'] }),
  push_subscriptions: many({ sourceField: ['id'], destSchema: pushSubscription, destField: ['user_id'] }),
  notification_settings: many({ sourceField: ['id'], destSchema: notificationSetting, destField: ['user_id'] }),
  blogger_relations: many({ sourceField: ['id'], destSchema: blogBlogger, destField: ['user_id'] }),
  blog_support_votes: many({ sourceField: ['id'], destSchema: blogSupportVote, destField: ['user_id'] }),
  payments_made: many({ sourceField: ['id'], destSchema: payment, destField: ['payer_user_id'] }),
  payments_received: many({ sourceField: ['id'], destSchema: payment, destField: ['receiver_user_id'] }),
  statements: many({ sourceField: ['id'], destSchema: statement, destField: ['user_id'] }),
  subscriptions: many({ sourceField: ['id'], destSchema: subscriber, destField: ['subscriber_id'] }),
  subscribers: many({ sourceField: ['id'], destSchema: subscriber, destField: ['user_id'] }),
  user_hashtags: many({ sourceField: ['id'], destSchema: userHashtag, destField: ['user_id'] }),
  links: many({ sourceField: ['id'], destSchema: link, destField: ['user_id'] }),
  timeline_events: many({ sourceField: ['id'], destSchema: timelineEvent, destField: ['user_id'] }),
  performed_timeline_events: many({ sourceField: ['id'], destSchema: timelineEvent, destField: ['actor_id'] }),
  reactions: many({ sourceField: ['id'], destSchema: reaction, destField: ['user_id'] }),
  position_holder_histories: many({ sourceField: ['id'], destSchema: positionHolderHistory, destField: ['user_id'] }),
  event_position_holdings: many({ sourceField: ['id'], destSchema: eventPositionHolder, destField: ['user_id'] }),
  event_votes: many({ sourceField: ['id'], destSchema: eventVote, destField: ['user_id'] }),
  document_versions: many({ sourceField: ['id'], destSchema: documentVersion, destField: ['author_id'] }),
  document_collaborations: many({ sourceField: ['id'], destSchema: documentCollaborator, destField: ['user_id'] }),
  document_cursors: many({ sourceField: ['id'], destSchema: documentCursor, destField: ['user_id'] }),
  threads: many({ sourceField: ['id'], destSchema: thread, destField: ['user_id'] }),
  comments: many({ sourceField: ['id'], destSchema: comment, destField: ['user_id'] }),
  thread_votes: many({ sourceField: ['id'], destSchema: threadVote, destField: ['user_id'] }),
  comment_votes: many({ sourceField: ['id'], destSchema: commentVote, destField: ['user_id'] }),
  support_confirmations: many({ sourceField: ['id'], destSchema: supportConfirmation, destField: ['confirmed_by_id'] }),
  amendment_voting_session_votes: many({ sourceField: ['id'], destSchema: amendmentVotingSessionVote, destField: ['user_id'] }),
  requested_conversations: many({ sourceField: ['id'], destSchema: conversation, destField: ['requested_by_id'] }),
  participants: many({ sourceField: ['id'], destSchema: participant, destField: ['user_id'] }),
}))

export const fileRelationships = relationships(file, () => ({}))

// ============================================
// Follow relationships
// ============================================
export const followRelationships = relationships(follow, ({ one }) => ({
  follower: one({ sourceField: ['follower_id'], destSchema: user, destField: ['id'] }),
  followee: one({ sourceField: ['followee_id'], destSchema: user, destField: ['id'] }),
}))

export const userStatsRelationships = relationships(userStats, ({ one }) => ({
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

// ============================================
// Group relationships
// ============================================
export const groupRelationships = relationships(group, ({ one, many }) => ({
  owner: one({ sourceField: ['owner_id'], destSchema: user, destField: ['id'] }),
  memberships: many({ sourceField: ['id'], destSchema: groupMembership, destField: ['group_id'] }),
  relationships_as_source: many({ sourceField: ['id'], destSchema: groupRelationship, destField: ['group_id'] }),
  relationships_as_target: many({ sourceField: ['id'], destSchema: groupRelationship, destField: ['related_group_id'] }),
  roles: many({ sourceField: ['id'], destSchema: role, destField: ['group_id'] }),
  positions: many({ sourceField: ['id'], destSchema: position, destField: ['group_id'] }),
  events: many({ sourceField: ['id'], destSchema: event, destField: ['group_id'] }),
  amendments: many({ sourceField: ['id'], destSchema: amendment, destField: ['group_id'] }),
  todos: many({ sourceField: ['id'], destSchema: todo, destField: ['group_id'] }),
  blogs: many({ sourceField: ['id'], destSchema: blog, destField: ['group_id'] }),
  subscribers: many({ sourceField: ['id'], destSchema: subscriber, destField: ['group_id'] }),
  group_hashtags: many({ sourceField: ['id'], destSchema: groupHashtag, destField: ['group_id'] }),
  links: many({ sourceField: ['id'], destSchema: link, destField: ['group_id'] }),
  timeline_events: many({ sourceField: ['id'], destSchema: timelineEvent, destField: ['group_id'] }),
  payments_made: many({ sourceField: ['id'], destSchema: payment, destField: ['payer_group_id'] }),
  payments_received: many({ sourceField: ['id'], destSchema: payment, destField: ['receiver_group_id'] }),
  conversations: many({ sourceField: ['id'], destSchema: conversation, destField: ['group_id'] }),
}))

export const groupMembershipRelationships = relationships(groupMembership, ({ one }) => ({
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  role: one({ sourceField: ['role_id'], destSchema: role, destField: ['id'] }),
}))

export const groupRelationshipRelationships = relationships(groupRelationship, ({ one }) => ({
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  related_group: one({ sourceField: ['related_group_id'], destSchema: group, destField: ['id'] }),
}))

export const roleRelationships = relationships(role, ({ one, many }) => ({
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  action_rights: many({ sourceField: ['id'], destSchema: actionRight, destField: ['role_id'] }),
}))

export const actionRightRelationships = relationships(actionRight, ({ one }) => ({
  role: one({ sourceField: ['role_id'], destSchema: role, destField: ['id'] }),
}))

export const positionRelationships = relationships(position, ({ one, many }) => ({
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  holder_history: many({ sourceField: ['id'], destSchema: positionHolderHistory, destField: ['position_id'] }),
  elections: many({ sourceField: ['id'], destSchema: election, destField: ['position_id'] }),
}))

export const positionHolderHistoryRelationships = relationships(positionHolderHistory, ({ one }) => ({
  position: one({ sourceField: ['position_id'], destSchema: position, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

// ============================================
// Event relationships
// ============================================
export const eventRelationships = relationships(event, ({ one, many }) => ({
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  creator: one({ sourceField: ['creator_id'], destSchema: user, destField: ['id'] }),
  participants: many({ sourceField: ['id'], destSchema: eventParticipant, destField: ['event_id'] }),
  delegates: many({ sourceField: ['id'], destSchema: eventDelegate, destField: ['event_id'] }),
  delegate_allocations: many({ sourceField: ['id'], destSchema: groupDelegateAllocation, destField: ['event_id'] }),
  meeting_slots: many({ sourceField: ['id'], destSchema: meetingSlot, destField: ['event_id'] }),
  event_participants: many({ sourceField: ['id'], destSchema: participant, destField: ['event_id'] }),
  event_positions: many({ sourceField: ['id'], destSchema: eventPosition, destField: ['event_id'] }),
  voting_sessions: many({ sourceField: ['id'], destSchema: eventVotingSession, destField: ['event_id'] }),
  scheduled_elections: many({ sourceField: ['id'], destSchema: scheduledElection, destField: ['event_id'] }),
  agenda_items: many({ sourceField: ['id'], destSchema: agendaItem, destField: ['event_id'] }),
  todos: many({ sourceField: ['id'], destSchema: todo, destField: ['event_id'] }),
  subscribers: many({ sourceField: ['id'], destSchema: subscriber, destField: ['event_id'] }),
  event_hashtags: many({ sourceField: ['id'], destSchema: eventHashtag, destField: ['event_id'] }),
  timeline_events: many({ sourceField: ['id'], destSchema: timelineEvent, destField: ['event_id'] }),
}))

export const eventParticipantRelationships = relationships(eventParticipant, ({ one }) => ({
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  role: one({ sourceField: ['role_id'], destSchema: role, destField: ['id'] }),
}))

export const eventDelegateRelationships = relationships(eventDelegate, ({ one }) => ({
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const groupDelegateAllocationRelationships = relationships(groupDelegateAllocation, ({ one }) => ({
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
}))

export const meetingSlotRelationships = relationships(meetingSlot, ({ one, many }) => ({
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  bookings: many({ sourceField: ['id'], destSchema: meetingBooking, destField: ['slot_id'] }),
  links: many({ sourceField: ['id'], destSchema: link, destField: ['meeting_slot_id'] }),
}))

export const meetingBookingRelationships = relationships(meetingBooking, ({ one }) => ({
  slot: one({ sourceField: ['slot_id'], destSchema: meetingSlot, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const participantRelationships = relationships(participant, ({ one }) => ({
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const eventPositionRelationships = relationships(eventPosition, ({ one, many }) => ({
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  holders: many({ sourceField: ['id'], destSchema: eventPositionHolder, destField: ['position_id'] }),
}))

export const eventPositionHolderRelationships = relationships(eventPositionHolder, ({ one }) => ({
  position: one({ sourceField: ['position_id'], destSchema: eventPosition, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const eventVotingSessionRelationships = relationships(eventVotingSession, ({ one, many }) => ({
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  agenda_item: one({ sourceField: ['agenda_item_id'], destSchema: agendaItem, destField: ['id'] }),
  votes: many({ sourceField: ['id'], destSchema: eventVote, destField: ['session_id'] }),
}))

export const eventVoteRelationships = relationships(eventVote, ({ one }) => ({
  session: one({ sourceField: ['session_id'], destSchema: eventVotingSession, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const scheduledElectionRelationships = relationships(scheduledElection, ({ one }) => ({
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
}))

// ============================================
// Amendment relationships
// ============================================
export const amendmentRelationships = relationships(amendment, ({ one, many }) => ({
  created_by: one({ sourceField: ['created_by_id'], destSchema: user, destField: ['id'] }),
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  clone_source: one({ sourceField: ['clone_source_id'], destSchema: amendment, destField: ['id'] }),
  vote_entries: many({ sourceField: ['id'], destSchema: amendmentVoteEntry, destField: ['amendment_id'] }),
  support_votes: many({ sourceField: ['id'], destSchema: amendmentSupportVote, destField: ['amendment_id'] }),
  votes: many({ sourceField: ['id'], destSchema: amendmentVote, destField: ['amendment_id'] }),
  change_requests: many({ sourceField: ['id'], destSchema: changeRequest, destField: ['amendment_id'] }),
  voting_sessions: many({ sourceField: ['id'], destSchema: amendmentVotingSession, destField: ['amendment_id'] }),
  collaborators: many({ sourceField: ['id'], destSchema: amendmentCollaborator, destField: ['amendment_id'] }),
  paths: many({ sourceField: ['id'], destSchema: amendmentPath, destField: ['amendment_id'] }),
  support_confirmations: many({ sourceField: ['id'], destSchema: supportConfirmation, destField: ['amendment_id'] }),
  documents: many({ sourceField: ['id'], destSchema: document, destField: ['amendment_id'] }),
  agenda_items: many({ sourceField: ['id'], destSchema: agendaItem, destField: ['amendment_id'] }),
  elections: many({ sourceField: ['id'], destSchema: election, destField: ['amendment_id'] }),
  todos: many({ sourceField: ['id'], destSchema: todo, destField: ['amendment_id'] }),
  subscribers: many({ sourceField: ['id'], destSchema: subscriber, destField: ['amendment_id'] }),
  amendment_hashtags: many({ sourceField: ['id'], destSchema: amendmentHashtag, destField: ['amendment_id'] }),
  timeline_events: many({ sourceField: ['id'], destSchema: timelineEvent, destField: ['amendment_id'] }),
  threads: many({ sourceField: ['id'], destSchema: thread, destField: ['amendment_id'] }),
}))

export const amendmentVoteEntryRelationships = relationships(amendmentVoteEntry, ({ one }) => ({
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const amendmentSupportVoteRelationships = relationships(amendmentSupportVote, ({ one }) => ({
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const amendmentVoteRelationships = relationships(amendmentVote, ({ one }) => ({
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const changeRequestRelationships = relationships(changeRequest, ({ one, many }) => ({
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  votes: many({ sourceField: ['id'], destSchema: changeRequestVote, destField: ['change_request_id'] }),
}))

export const changeRequestVoteRelationships = relationships(changeRequestVote, ({ one }) => ({
  change_request: one({ sourceField: ['change_request_id'], destSchema: changeRequest, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const amendmentVotingSessionRelationships = relationships(amendmentVotingSession, ({ one, many }) => ({
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  votes: many({ sourceField: ['id'], destSchema: amendmentVotingSessionVote, destField: ['session_id'] }),
}))

export const amendmentVotingSessionVoteRelationships = relationships(amendmentVotingSessionVote, ({ one }) => ({
  session: one({ sourceField: ['session_id'], destSchema: amendmentVotingSession, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const amendmentCollaboratorRelationships = relationships(amendmentCollaborator, ({ one }) => ({
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const amendmentPathRelationships = relationships(amendmentPath, ({ one, many }) => ({
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  segments: many({ sourceField: ['id'], destSchema: amendmentPathSegment, destField: ['path_id'] }),
}))

export const amendmentPathSegmentRelationships = relationships(amendmentPathSegment, ({ one }) => ({
  path: one({ sourceField: ['path_id'], destSchema: amendmentPath, destField: ['id'] }),
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
}))

export const supportConfirmationRelationships = relationships(supportConfirmation, ({ one }) => ({
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  confirmed_by: one({ sourceField: ['confirmed_by_id'], destSchema: user, destField: ['id'] }),
}))

// ============================================
// Document relationships
// ============================================
export const documentRelationships = relationships(document, ({ one, many }) => ({
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  versions: many({ sourceField: ['id'], destSchema: documentVersion, destField: ['document_id'] }),
  collaborators: many({ sourceField: ['id'], destSchema: documentCollaborator, destField: ['document_id'] }),
  cursors: many({ sourceField: ['id'], destSchema: documentCursor, destField: ['document_id'] }),
  threads: many({ sourceField: ['id'], destSchema: thread, destField: ['document_id'] }),
}))

export const documentVersionRelationships = relationships(documentVersion, ({ one }) => ({
  document: one({ sourceField: ['document_id'], destSchema: document, destField: ['id'] }),
  author: one({ sourceField: ['author_id'], destSchema: user, destField: ['id'] }),
}))

export const documentCollaboratorRelationships = relationships(documentCollaborator, ({ one }) => ({
  document: one({ sourceField: ['document_id'], destSchema: document, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const documentCursorRelationships = relationships(documentCursor, ({ one }) => ({
  document: one({ sourceField: ['document_id'], destSchema: document, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const threadRelationships = relationships(thread, ({ one, many }) => ({
  document: one({ sourceField: ['document_id'], destSchema: document, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  comments: many({ sourceField: ['id'], destSchema: comment, destField: ['thread_id'] }),
  votes: many({ sourceField: ['id'], destSchema: threadVote, destField: ['thread_id'] }),
}))

export const commentRelationships = relationships(comment, ({ one, many }) => ({
  thread: one({ sourceField: ['thread_id'], destSchema: thread, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  parent: one({ sourceField: ['parent_id'], destSchema: comment, destField: ['id'] }),
  replies: many({ sourceField: ['id'], destSchema: comment, destField: ['parent_id'] }),
  votes: many({ sourceField: ['id'], destSchema: commentVote, destField: ['comment_id'] }),
}))

export const threadVoteRelationships = relationships(threadVote, ({ one }) => ({
  thread: one({ sourceField: ['thread_id'], destSchema: thread, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const commentVoteRelationships = relationships(commentVote, ({ one }) => ({
  comment: one({ sourceField: ['comment_id'], destSchema: comment, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

// ============================================
// Agenda relationships
// ============================================
export const agendaItemRelationships = relationships(agendaItem, ({ one, many }) => ({
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  creator: one({ sourceField: ['creator_id'], destSchema: user, destField: ['id'] }),
  speaker_list: many({ sourceField: ['id'], destSchema: speakerList, destField: ['agenda_item_id'] }),
  election: many({ sourceField: ['id'], destSchema: election, destField: ['agenda_item_id'] }),
}))

export const speakerListRelationships = relationships(speakerList, ({ one }) => ({
  agenda_item: one({ sourceField: ['agenda_item_id'], destSchema: agendaItem, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const electionRelationships = relationships(election, ({ one, many }) => ({
  agenda_item: one({ sourceField: ['agenda_item_id'], destSchema: agendaItem, destField: ['id'] }),
  position: one({ sourceField: ['position_id'], destSchema: position, destField: ['id'] }),
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  candidates: many({ sourceField: ['id'], destSchema: electionCandidate, destField: ['election_id'] }),
  votes: many({ sourceField: ['id'], destSchema: electionVote, destField: ['election_id'] }),
  timeline_events: many({ sourceField: ['id'], destSchema: timelineEvent, destField: ['election_id'] }),
}))

export const electionCandidateRelationships = relationships(electionCandidate, ({ one, many }) => ({
  election: one({ sourceField: ['election_id'], destSchema: election, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  votes: many({ sourceField: ['id'], destSchema: electionVote, destField: ['candidate_id'] }),
}))

export const electionVoteRelationships = relationships(electionVote, ({ one }) => ({
  election: one({ sourceField: ['election_id'], destSchema: election, destField: ['id'] }),
  candidate: one({ sourceField: ['candidate_id'], destSchema: electionCandidate, destField: ['id'] }),
  voter: one({ sourceField: ['voter_id'], destSchema: user, destField: ['id'] }),
}))

// ============================================
// Todo relationships
// ============================================
export const todoRelationships = relationships(todo, ({ one, many }) => ({
  creator: one({ sourceField: ['creator_id'], destSchema: user, destField: ['id'] }),
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  assignments: many({ sourceField: ['id'], destSchema: todoAssignment, destField: ['todo_id'] }),
  timeline_events: many({ sourceField: ['id'], destSchema: timelineEvent, destField: ['todo_id'] }),
}))

export const todoAssignmentRelationships = relationships(todoAssignment, ({ one }) => ({
  todo: one({ sourceField: ['todo_id'], destSchema: todo, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

// ============================================
// Message relationships
// ============================================
export const conversationRelationships = relationships(conversation, ({ one, many }) => ({
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  requested_by: one({ sourceField: ['requested_by_id'], destSchema: user, destField: ['id'] }),
  participants: many({ sourceField: ['id'], destSchema: conversationParticipant, destField: ['conversation_id'] }),
  messages: many({ sourceField: ['id'], destSchema: message, destField: ['conversation_id'] }),
}))

export const conversationParticipantRelationships = relationships(conversationParticipant, ({ one }) => ({
  conversation: one({ sourceField: ['conversation_id'], destSchema: conversation, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const messageRelationships = relationships(message, ({ one }) => ({
  conversation: one({ sourceField: ['conversation_id'], destSchema: conversation, destField: ['id'] }),
  sender: one({ sourceField: ['sender_id'], destSchema: user, destField: ['id'] }),
}))

// ============================================
// Notification relationships
// ============================================
export const notificationRelationships = relationships(notification, ({ one }) => ({
  recipient: one({ sourceField: ['recipient_id'], destSchema: user, destField: ['id'] }),
  sender: one({ sourceField: ['sender_id'], destSchema: user, destField: ['id'] }),
  related_user: one({ sourceField: ['related_user_id'], destSchema: user, destField: ['id'] }),
  related_group: one({ sourceField: ['related_group_id'], destSchema: group, destField: ['id'] }),
  related_event: one({ sourceField: ['related_event_id'], destSchema: event, destField: ['id'] }),
  related_amendment: one({ sourceField: ['related_amendment_id'], destSchema: amendment, destField: ['id'] }),
  related_blog: one({ sourceField: ['related_blog_id'], destSchema: blog, destField: ['id'] }),
  on_behalf_of_group: one({ sourceField: ['on_behalf_of_group_id'], destSchema: group, destField: ['id'] }),
  on_behalf_of_event: one({ sourceField: ['on_behalf_of_event_id'], destSchema: event, destField: ['id'] }),
  on_behalf_of_amendment: one({ sourceField: ['on_behalf_of_amendment_id'], destSchema: amendment, destField: ['id'] }),
  on_behalf_of_blog: one({ sourceField: ['on_behalf_of_blog_id'], destSchema: blog, destField: ['id'] }),
  recipient_group: one({ sourceField: ['recipient_group_id'], destSchema: group, destField: ['id'] }),
  recipient_event: one({ sourceField: ['recipient_event_id'], destSchema: event, destField: ['id'] }),
  recipient_amendment: one({ sourceField: ['recipient_amendment_id'], destSchema: amendment, destField: ['id'] }),
  recipient_blog: one({ sourceField: ['recipient_blog_id'], destSchema: blog, destField: ['id'] }),
}))

export const pushSubscriptionRelationships = relationships(pushSubscription, ({ one }) => ({
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const notificationSettingRelationships = relationships(notificationSetting, ({ one }) => ({
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

export const notificationReadRelationships = relationships(notificationRead, ({ one }) => ({
  notification: one({ sourceField: ['notification_id'], destSchema: notification, destField: ['id'] }),
  read_by_user: one({ sourceField: ['read_by_user_id'], destSchema: user, destField: ['id'] }),
}))

// ============================================
// Blog relationships
// ============================================
export const blogRelationships = relationships(blog, ({ one, many }) => ({
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  bloggers: many({ sourceField: ['id'], destSchema: blogBlogger, destField: ['blog_id'] }),
  support_votes: many({ sourceField: ['id'], destSchema: blogSupportVote, destField: ['blog_id'] }),
  roles: many({ sourceField: ['id'], destSchema: role, destField: ['blog_id'] }),
  subscribers: many({ sourceField: ['id'], destSchema: subscriber, destField: ['blog_id'] }),
  blog_hashtags: many({ sourceField: ['id'], destSchema: blogHashtag, destField: ['blog_id'] }),
  timeline_events: many({ sourceField: ['id'], destSchema: timelineEvent, destField: ['blog_id'] }),
  document_versions: many({ sourceField: ['id'], destSchema: documentVersion, destField: ['blog_id'] }),
}))

export const blogBloggerRelationships = relationships(blogBlogger, ({ one }) => ({
  blog: one({ sourceField: ['blog_id'], destSchema: blog, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  role: one({ sourceField: ['role_id'], destSchema: role, destField: ['id'] }),
}))

export const blogSupportVoteRelationships = relationships(blogSupportVote, ({ one }) => ({
  blog: one({ sourceField: ['blog_id'], destSchema: blog, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
}))

// ============================================
// Payment relationships
// ============================================
export const paymentRelationships = relationships(payment, ({ one }) => ({
  payer_user: one({ sourceField: ['payer_user_id'], destSchema: user, destField: ['id'] }),
  payer_group: one({ sourceField: ['payer_group_id'], destSchema: group, destField: ['id'] }),
  receiver_user: one({ sourceField: ['receiver_user_id'], destSchema: user, destField: ['id'] }),
  receiver_group: one({ sourceField: ['receiver_group_id'], destSchema: group, destField: ['id'] }),
}))

export const stripeCustomerRelationships = relationships(stripeCustomer, ({ one, many }) => ({
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  subscriptions: many({ sourceField: ['id'], destSchema: stripeSubscription, destField: ['customer_id'] }),
  payments: many({ sourceField: ['id'], destSchema: stripePayment, destField: ['customer_id'] }),
}))

export const stripeSubscriptionRelationships = relationships(stripeSubscription, ({ one, many }) => ({
  customer: one({ sourceField: ['customer_id'], destSchema: stripeCustomer, destField: ['id'] }),
  payments: many({ sourceField: ['id'], destSchema: stripePayment, destField: ['stripe_subscription_id'] }),
}))

export const stripePaymentRelationships = relationships(stripePayment, ({ one }) => ({
  customer: one({ sourceField: ['customer_id'], destSchema: stripeCustomer, destField: ['id'] }),
}))

// ============================================
// Statement relationships
// ============================================
export const statementRelationships = relationships(statement, ({ one, many }) => ({
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  timeline_events: many({ sourceField: ['id'], destSchema: timelineEvent, destField: ['statement_id'] }),
}))

// ============================================
// Common relationships
// ============================================
export const subscriberRelationships = relationships(subscriber, ({ one }) => ({
  subscriber_user: one({ sourceField: ['subscriber_id'], destSchema: user, destField: ['id'] }),
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  blog: one({ sourceField: ['blog_id'], destSchema: blog, destField: ['id'] }),
}))

export const hashtagRelationships = relationships(hashtag, ({ many }) => ({
  user_hashtags: many({ sourceField: ['id'], destSchema: userHashtag, destField: ['hashtag_id'] }),
  group_hashtags: many({ sourceField: ['id'], destSchema: groupHashtag, destField: ['hashtag_id'] }),
  amendment_hashtags: many({ sourceField: ['id'], destSchema: amendmentHashtag, destField: ['hashtag_id'] }),
  event_hashtags: many({ sourceField: ['id'], destSchema: eventHashtag, destField: ['hashtag_id'] }),
  blog_hashtags: many({ sourceField: ['id'], destSchema: blogHashtag, destField: ['hashtag_id'] }),
}))

export const userHashtagRelationships = relationships(userHashtag, ({ one }) => ({
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  hashtag: one({ sourceField: ['hashtag_id'], destSchema: hashtag, destField: ['id'] }),
}))

export const groupHashtagRelationships = relationships(groupHashtag, ({ one }) => ({
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  hashtag: one({ sourceField: ['hashtag_id'], destSchema: hashtag, destField: ['id'] }),
}))

export const amendmentHashtagRelationships = relationships(amendmentHashtag, ({ one }) => ({
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  hashtag: one({ sourceField: ['hashtag_id'], destSchema: hashtag, destField: ['id'] }),
}))

export const eventHashtagRelationships = relationships(eventHashtag, ({ one }) => ({
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  hashtag: one({ sourceField: ['hashtag_id'], destSchema: hashtag, destField: ['id'] }),
}))

export const blogHashtagRelationships = relationships(blogHashtag, ({ one }) => ({
  blog: one({ sourceField: ['blog_id'], destSchema: blog, destField: ['id'] }),
  hashtag: one({ sourceField: ['hashtag_id'], destSchema: hashtag, destField: ['id'] }),
}))

export const linkRelationships = relationships(link, ({ one }) => ({
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  meeting_slot: one({ sourceField: ['meeting_slot_id'], destSchema: meetingSlot, destField: ['id'] }),
}))

export const timelineEventRelationships = relationships(timelineEvent, ({ one, many }) => ({
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  group: one({ sourceField: ['group_id'], destSchema: group, destField: ['id'] }),
  amendment: one({ sourceField: ['amendment_id'], destSchema: amendment, destField: ['id'] }),
  event: one({ sourceField: ['event_id'], destSchema: event, destField: ['id'] }),
  todo: one({ sourceField: ['todo_id'], destSchema: todo, destField: ['id'] }),
  blog: one({ sourceField: ['blog_id'], destSchema: blog, destField: ['id'] }),
  statement: one({ sourceField: ['statement_id'], destSchema: statement, destField: ['id'] }),
  actor: one({ sourceField: ['actor_id'], destSchema: user, destField: ['id'] }),
  election: one({ sourceField: ['election_id'], destSchema: election, destField: ['id'] }),
  amendment_vote: one({ sourceField: ['amendment_vote_id'], destSchema: amendmentVote, destField: ['id'] }),
  reactions: many({ sourceField: ['id'], destSchema: reaction, destField: ['timeline_event_id'] }),
}))

export const reactionRelationships = relationships(reaction, ({ one }) => ({
  user: one({ sourceField: ['user_id'], destSchema: user, destField: ['id'] }),
  timeline_event: one({ sourceField: ['timeline_event_id'], destSchema: timelineEvent, destField: ['id'] }),
}))

// ============================================
// All relationships array for schema assembly
// ============================================
export const allRelationships = [
  // Users
  userRelationships,
  fileRelationships,
  followRelationships,
  userStatsRelationships,
  // Groups
  groupRelationships,
  groupMembershipRelationships,
  groupRelationshipRelationships,
  roleRelationships,
  actionRightRelationships,
  positionRelationships,
  positionHolderHistoryRelationships,
  // Events
  eventRelationships,
  eventParticipantRelationships,
  eventDelegateRelationships,
  groupDelegateAllocationRelationships,
  meetingSlotRelationships,
  meetingBookingRelationships,
  participantRelationships,
  eventPositionRelationships,
  eventPositionHolderRelationships,
  eventVotingSessionRelationships,
  eventVoteRelationships,
  scheduledElectionRelationships,
  // Amendments
  amendmentRelationships,
  amendmentVoteEntryRelationships,
  amendmentSupportVoteRelationships,
  amendmentVoteRelationships,
  changeRequestRelationships,
  changeRequestVoteRelationships,
  amendmentVotingSessionRelationships,
  amendmentVotingSessionVoteRelationships,
  amendmentCollaboratorRelationships,
  amendmentPathRelationships,
  amendmentPathSegmentRelationships,
  supportConfirmationRelationships,
  // Documents
  documentRelationships,
  documentVersionRelationships,
  documentCollaboratorRelationships,
  documentCursorRelationships,
  threadRelationships,
  commentRelationships,
  threadVoteRelationships,
  commentVoteRelationships,
  // Agendas
  agendaItemRelationships,
  speakerListRelationships,
  electionRelationships,
  electionCandidateRelationships,
  electionVoteRelationships,
  // Todos
  todoRelationships,
  todoAssignmentRelationships,
  // Messages
  conversationRelationships,
  conversationParticipantRelationships,
  messageRelationships,
  // Notifications
  notificationRelationships,
  pushSubscriptionRelationships,
  notificationSettingRelationships,
  notificationReadRelationships,
  // Blogs
  blogRelationships,
  blogBloggerRelationships,
  blogSupportVoteRelationships,
  // Payments
  paymentRelationships,
  stripeCustomerRelationships,
  stripeSubscriptionRelationships,
  stripePaymentRelationships,
  // Statements
  statementRelationships,
  // Common
  subscriberRelationships,
  hashtagRelationships,
  userHashtagRelationships,
  groupHashtagRelationships,
  amendmentHashtagRelationships,
  eventHashtagRelationships,
  blogHashtagRelationships,
  linkRelationships,
  timelineEventRelationships,
  reactionRelationships,
]
