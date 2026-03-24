import { createSchema, createBuilder, type Row } from '@rocicorp/zero'

// Table imports
import { user, file } from './users/table'
import { group, groupMembership, role, actionRight } from './groups/table'
import { event, eventParticipant, participant, eventException } from './events/table'
import { amendment, amendmentCollaborator, amendmentPath, amendmentPathSegment, supportConfirmation } from './amendments/table'
import { document, documentVersion, documentCollaborator, documentCursor } from './documents/table'
import { agendaItem, speakerList, agendaItemChangeRequest } from './agendas/table'
import { todo, todoAssignment } from './todos/table'
import { conversation, conversationParticipant, message } from './messages/table'
import { notification, pushSubscription, notificationSetting, notificationRead } from './notifications/table'
import { blog, blogBlogger } from './blogs/table'
import { payment, stripeCustomer, stripeSubscription, stripePayment } from './payments/table'
import { statement, statementSurvey, statementSurveyOption, statementSurveyVote } from './statements/table'
import { hashtag, userHashtag, groupHashtag, amendmentHashtag, eventHashtag, blogHashtag, statementHashtag, link, timelineEvent, reaction } from './common/table'
// New domain imports
import { election, electionCandidate, elector, indicativeElectorParticipation, indicativeCandidateSelection, finalElectorParticipation, finalCandidateSelection } from './elections/table'
import { vote, voteChoice, voter, indicativeVoterParticipation, indicativeChoiceDecision, finalVoterParticipation, finalChoiceDecision, amendmentSupportVote, changeRequestVote, blogSupportVote, statementSupportVote, threadVote, commentVote } from './votes/table'
import { changeRequest } from './change-requests/table'
import { thread, comment } from './discussions/table'
import { position, positionHolderHistory, eventPosition, eventPositionHolder } from './positions/table'
import { eventDelegate, groupDelegateAllocation } from './delegates/table'
import { meetingSlot, meetingBooking } from './meet/table'
import { follow, groupRelationship, subscriber, groupWorkflow, groupWorkflowStep } from './network/table'
import { userPreference } from './preferences/table'
import { calendarSubscription } from './calendar-subscriptions/table'
// Voting Password
import { votingPassword } from './voting-password/table'
// Accreditation
import { accreditation } from './accreditation/table'

// Relationship imports
import { allRelationships } from './relationships'

// ============================================
// Schema Export
// ============================================
export const schema = createSchema({
  tables: [
    // Users
    user, file,
    // Groups
    group, groupMembership, role, actionRight,
    // Events
    event, eventParticipant, participant, eventException,
    // Amendments
    amendment, amendmentCollaborator, amendmentPath, amendmentPathSegment, supportConfirmation,
    // Documents
    document, documentVersion, documentCollaborator, documentCursor,
    // Agendas
    agendaItem, speakerList, agendaItemChangeRequest,
    // Elections
    election, electionCandidate, elector,
    indicativeElectorParticipation, indicativeCandidateSelection,
    finalElectorParticipation, finalCandidateSelection,
    // Votes
    vote, voteChoice, voter,
    indicativeVoterParticipation, indicativeChoiceDecision,
    finalVoterParticipation, finalChoiceDecision,
    amendmentSupportVote, changeRequestVote,
    blogSupportVote, statementSupportVote, threadVote, commentVote,
    // Change Requests
    changeRequest,
    // Discussions
    thread, comment,
    // Positions
    position, positionHolderHistory, eventPosition, eventPositionHolder,
    // Delegates
    eventDelegate, groupDelegateAllocation,
    // Meet
    meetingSlot, meetingBooking,
    // Network
    follow, groupRelationship, subscriber, groupWorkflow, groupWorkflowStep,
    // Todos
    todo, todoAssignment,
    // Messages
    conversation, conversationParticipant, message,
    // Notifications
    notification, pushSubscription, notificationSetting, notificationRead,
    // Blogs
    blog, blogBlogger,
    // Payments
    payment, stripeCustomer, stripeSubscription, stripePayment,
    // Statements
    statement, statementSurvey, statementSurveyOption, statementSurveyVote,
    // Preferences
    userPreference,
    // Common
    hashtag, userHashtag, groupHashtag, amendmentHashtag, eventHashtag, blogHashtag, statementHashtag, link, timelineEvent, reaction,
    // Calendar Subscriptions
    calendarSubscription,
    // Voting Password
    votingPassword,
    // Accreditation
    accreditation,
  ],
  relationships: allRelationships,
})

export type Schema = typeof schema

export const zql = createBuilder(schema)

// ============================================
// Row type exports
// ============================================
// Users
export type User = Row<Schema['tables']['user']>
export type File = Row<Schema['tables']['file']>
export type Follow = Row<Schema['tables']['follow']>

// Groups
export type Group = Row<Schema['tables']['group']>
export type GroupMembership = Row<Schema['tables']['group_membership']>
export type GroupRelationship = Row<Schema['tables']['group_relationship']>
export type Role = Row<Schema['tables']['role']>
export type ActionRight = Row<Schema['tables']['action_right']>
export type Position = Row<Schema['tables']['position']>
export type PositionHolderHistory = Row<Schema['tables']['position_holder_history']>

// Events
export type Event = Row<Schema['tables']['event']>
export type EventParticipant = Row<Schema['tables']['event_participant']>
export type EventDelegate = Row<Schema['tables']['event_delegate']>
export type GroupDelegateAllocation = Row<Schema['tables']['group_delegate_allocation']>
export type MeetingSlot = Row<Schema['tables']['meeting_slot']>
export type MeetingBooking = Row<Schema['tables']['meeting_booking']>
export type Participant = Row<Schema['tables']['participant']>
export type EventPosition = Row<Schema['tables']['event_position']>
export type EventPositionHolder = Row<Schema['tables']['event_position_holder']>
export type EventException = Row<Schema['tables']['event_exception']>
export type CalendarSubscription = Row<Schema['tables']['calendar_subscription']>

// Amendments
export type Amendment = Row<Schema['tables']['amendment']>
export type AmendmentSupportVote = Row<Schema['tables']['amendment_support_vote']>
export type ChangeRequest = Row<Schema['tables']['change_request']>
export type ChangeRequestVote = Row<Schema['tables']['change_request_vote']>
export type AmendmentCollaborator = Row<Schema['tables']['amendment_collaborator']>
export type AmendmentPath = Row<Schema['tables']['amendment_path']>
export type AmendmentPathSegment = Row<Schema['tables']['amendment_path_segment']>
export type SupportConfirmation = Row<Schema['tables']['support_confirmation']>

// Documents
export type Document = Row<Schema['tables']['document']>
export type DocumentVersion = Row<Schema['tables']['document_version']>
export type DocumentCollaborator = Row<Schema['tables']['document_collaborator']>
export type DocumentCursor = Row<Schema['tables']['document_cursor']>
export type Thread = Row<Schema['tables']['thread']>
export type Comment = Row<Schema['tables']['comment']>
export type ThreadVote = Row<Schema['tables']['thread_vote']>
export type CommentVote = Row<Schema['tables']['comment_vote']>

// Agendas
export type AgendaItem = Row<Schema['tables']['agenda_item']>
export type SpeakerList = Row<Schema['tables']['speaker_list']>
export type AgendaItemChangeRequestRow = Row<Schema['tables']['agenda_item_change_request']>
export type Election = Row<Schema['tables']['election']>
export type ElectionCandidate = Row<Schema['tables']['election_candidate']>
export type Elector = Row<Schema['tables']['elector']>
export type IndicativeElectorParticipation = Row<Schema['tables']['indicative_elector_participation']>
export type IndicativeCandidateSelection = Row<Schema['tables']['indicative_candidate_selection']>
export type FinalElectorParticipation = Row<Schema['tables']['final_elector_participation']>
export type FinalCandidateSelection = Row<Schema['tables']['final_candidate_selection']>
export type Vote = Row<Schema['tables']['vote']>
export type VoteChoice = Row<Schema['tables']['vote_choice']>
export type Voter = Row<Schema['tables']['voter']>
export type IndicativeVoterParticipation = Row<Schema['tables']['indicative_voter_participation']>
export type IndicativeChoiceDecision = Row<Schema['tables']['indicative_choice_decision']>
export type FinalVoterParticipation = Row<Schema['tables']['final_voter_participation']>
export type FinalChoiceDecision = Row<Schema['tables']['final_choice_decision']>

// Todos
export type Todo = Row<Schema['tables']['todo']>
export type TodoAssignment = Row<Schema['tables']['todo_assignment']>

// Messages
export type Conversation = Row<Schema['tables']['conversation']>
export type ConversationParticipant = Row<Schema['tables']['conversation_participant']>
export type Message = Row<Schema['tables']['message']>

// Notifications
export type Notification = Row<Schema['tables']['notification']>
export type PushSubscription = Row<Schema['tables']['push_subscription']>
export type NotificationSetting = Row<Schema['tables']['notification_setting']>

// Blogs
export type Blog = Row<Schema['tables']['blog']>
export type BlogBlogger = Row<Schema['tables']['blog_blogger']>
export type BlogSupportVote = Row<Schema['tables']['blog_support_vote']>

// Payments
export type Payment = Row<Schema['tables']['payment']>
export type StripeCustomer = Row<Schema['tables']['stripe_customer']>
export type StripeSubscription = Row<Schema['tables']['stripe_subscription']>
export type StripePayment = Row<Schema['tables']['stripe_payment']>

// Statements
export type Statement = Row<Schema['tables']['statement']>
export type StatementSupportVote = Row<Schema['tables']['statement_support_vote']>
export type StatementSurvey = Row<Schema['tables']['statement_survey']>
export type StatementSurveyOption = Row<Schema['tables']['statement_survey_option']>
export type StatementSurveyVote = Row<Schema['tables']['statement_survey_vote']>
export type StatementHashtag = Row<Schema['tables']['statement_hashtag']>

// Preferences
export type UserPreference = Row<Schema['tables']['user_preference']>

// Voting Password
export type VotingPasswordRow = Row<Schema['tables']['voting_password']>

// Accreditation
export type AccreditationRow = Row<Schema['tables']['accreditation']>

// Workflows
export type GroupWorkflowRow = Row<Schema['tables']['group_workflow']>
export type GroupWorkflowStepRow = Row<Schema['tables']['group_workflow_step']>

// Common
export type Subscriber = Row<Schema['tables']['subscriber']>
export type Hashtag = Row<Schema['tables']['hashtag']>
export type UserHashtag = Row<Schema['tables']['user_hashtag']>
export type GroupHashtag = Row<Schema['tables']['group_hashtag']>
export type AmendmentHashtag = Row<Schema['tables']['amendment_hashtag']>
export type EventHashtag = Row<Schema['tables']['event_hashtag']>
export type BlogHashtag = Row<Schema['tables']['blog_hashtag']>
export type StatementHashtagJunction = Row<Schema['tables']['statement_hashtag']>
export type Link = Row<Schema['tables']['link']>
export type TimelineEvent = Row<Schema['tables']['timeline_event']>
export type Reaction = Row<Schema['tables']['reaction']>

// ============================================
// Register default types
// ============================================
declare module '@rocicorp/zero' {
  interface DefaultTypes {
    schema: Schema
  }
}
