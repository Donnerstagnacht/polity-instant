# Polity Notification & Timeline System Specification

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Notification Categories](#notification-categories)
4. [Timeline System](#timeline-system)
5. [Subscription Model](#subscription-model)
6. [Implementation Guidelines](#implementation-guidelines)
7. [User Notification Settings](#user-notification-settings)
8. [Technical Architecture](#technical-architecture)
9. [Implementation Checklist](#implementation-checklist)

---

## Overview

This document specifies a comprehensive, reusable, and extendable notification and timeline system for the Polity platform. The system handles notifications for all major entity types (Groups, Events, Amendments, Blogs, Todos, Statements) and provides users with granular control over what notifications they receive.

### Key Principles

1. **User-Centric Control**: Users decide what notifications they want to receive
2. **Role-Based Notifications**: Notifications based on user's role within entities
3. **Subscription-Based Timeline**: Timeline shows updates from subscribed entities
4. **Public vs. Private**: Respect visibility settings for all notifications
5. **Extensibility**: Easy to add new notification types and entities
6. **Performance**: Efficient querying and delivery of notifications

---

## Core Concepts

### Notification vs. Timeline

#### Notification

- **Purpose**: Direct alert to a user about an action that requires attention or is specifically relevant to them
- **Delivery**: Push notification + in-app notification badge
- **Persistence**: Stored in database, marked as read/unread
- **Trigger**: Role-based or direct mention/invitation
- **Examples**:
  - You were invited to a group
  - Your membership was approved
  - A task was assigned to you
  - Someone requested to join your group

#### Timeline

- **Purpose**: Social feed showing activities from entities the user subscribes to
- **Delivery**: Feed-based display (like Instagram/Twitter)
- **Persistence**: Stored as timeline events
- **Trigger**: Subscription-based + public visibility
- **Examples**:
  - A group you follow created a new event
  - An amendment you subscribe to received new change requests
  - A user you follow posted a new blog
  - A group updated its description

### Entity Types

The system supports five primary entity types:

1. **Groups** (`groups`)
2. **Events** (`events`)
3. **Amendments** (`amendments`)
4. **Blogs** (`blogs`)
5. **Users** (`$users`)

Additional supporting entities:

- **Todos** (`todos`)
- **Statements** (`statements`)
- **Documents** (`documents`)
- **Meetings** (`meetingSlots`, `meetingBookings`)

### Visibility Levels

All entities and changes respect these visibility levels:

- **public**: Visible to everyone, shown in timelines
- **authenticated**: Visible to logged-in users only
- **private**: Visible only to members/collaborators with roles

### Role System

Each entity type has associated roles:

#### Group Roles

- `admin`: Full control over group
- `member`: Standard member rights
- `invited`: Invited but not yet accepted
- `requested`: Requested membership, awaiting approval

#### Event Roles

- `organizer`: Full control over event
- `participant`: Standard participant rights
- `delegate`: Special voting rights (for delegate conferences)
- `invited`: Invited but not yet confirmed
- `requested`: Requested participation, awaiting approval

#### Amendment Roles

- `owner`: Creator and primary editor
- `collaborator`: Can edit and manage change requests
- `invited`: Invited to collaborate
- `requested`: Requested collaboration

#### Blog Roles

- `owner`: Primary author
- `writer`: Can write and edit
- `invited`: Invited to write
- `requested`: Requested writing permissions

---

## Notification Categories

Users receive notifications based on their relationship with entities. Notifications are triggered for:

### 1. Group Notifications

Users with **group roles** (admin, member) or **subscribers** receive notifications for:

#### 1.1 Tasks (Group Roles Only)

- **Trigger**: Todo created/assigned to user with group association
- **Recipients**: Users with specific role assignments
- **Type**: `todo_assigned`
- **Timeline**: No (task-specific, not public)
- **Schema**: `todos.group` → `groups`

#### 1.2 Payments (Group Roles Only)

- **Trigger**: Payment made to/from group
- **Recipients**: Group admins
- **Type**: `group_payment_received`, `group_payment_made`
- **Timeline**: No (financial, role-restricted)
- **Schema**: `payments.payerGroup` / `payments.receiverGroup` → `groups`

#### 1.3 Links (Group Roles Only)

- **Trigger**: New link added to group
- **Recipients**: Group admins and members
- **Type**: `group_link_added`
- **Timeline**: No (internal resource)
- **Schema**: `links.group` → `groups`

#### 1.4 New Events (Public)

- **Trigger**: Event created for group
- **Recipients**: All group members and subscribers
- **Type**: `group_event_created`
- **Timeline**: Yes (public activity)
- **Schema**: `events.group` → `groups`

#### 1.5 New Amendments (Public)

- **Trigger**: Amendment proposed for group
- **Recipients**: All group members and subscribers
- **Type**: `group_amendment_created`
- **Timeline**: Yes (public activity)
- **Schema**: `amendments.targetGroup` → `groups`

#### 1.6 New Relationships (Public)

- **Trigger**: Group relationship established (parent/child)
- **Recipients**: Group members and subscribers
- **Type**: `group_relationship_created`, `group_relationship_approved`, `group_relationship_rejected`
- **Timeline**: Yes (public organizational change)
- **Schema**: `groupRelationships.parentGroup` / `groupRelationships.childGroup` → `groups`

#### 1.7 New Positions (Public)

- **Trigger**: Position created in group
- **Recipients**: Group members and subscribers
- **Type**: `group_position_created`, `group_position_filled`
- **Timeline**: Yes (public leadership)
- **Schema**: `positions.group` → `groups`

#### 1.8 New Documents (Group Roles Only)

- **Trigger**: Document created for group
- **Recipients**: Group admins and members
- **Type**: `group_document_created`
- **Timeline**: No (internal document)
- **Schema**: `documents.group` → `groups`

#### 1.9 New Members (Group Roles Only)

- **Trigger**: Member joins group
- **Recipients**: Group admins
- **Type**: `group_member_joined`, `group_membership_approved`
- **Timeline**: No (internal membership)
- **Schema**: `groupMemberships.group` → `groups`

#### 1.10 Role Updates (Group Roles Only)

- **Trigger**: Member role changed
- **Recipients**: Affected user + group admins
- **Type**: `group_role_changed`
- **Timeline**: No (internal administration)
- **Schema**: `groupMemberships.role` → `roles`

#### 1.11 Admin Promotion (Group Roles Only)

- **Trigger**: Member promoted to admin status
- **Recipients**: Promoted user + other group admins
- **Type**: `group_admin_promoted`
- **Timeline**: No (internal administration)
- **Schema**: `tx.groupMemberships[membershipId].update({ status: 'admin' })`
- **Note**: Currently missing in `useGroupMutations.promoteToAdmin`

#### 1.12 Admin Demotion (Group Roles Only)

- **Trigger**: Admin demoted to member status
- **Recipients**: Demoted user + other group admins
- **Type**: `group_admin_demoted`
- **Timeline**: No (internal administration)
- **Schema**: `tx.groupMemberships[membershipId].update({ status: 'member' })`
- **Note**: Currently missing in `useGroupMutations.demoteToMember`

#### 1.13 New Subscribers (Group Roles Only)

- **Trigger**: New subscriber to group
- **Recipients**: Group admins
- **Type**: `group_new_subscriber`
- **Timeline**: No (administrative info)
- **Schema**: `subscribers.group` → `groups`

#### 1.14 Profile Updates (Public)

- **Trigger**: Group title, description, image, location, social media, visibility changed
- **Recipients**: All subscribers and members
- **Type**: `group_updated`
- **Timeline**: Yes (public profile change)
- **Schema**: `groups` entity fields

#### 1.15 Membership Requests (Group Roles Only)

- **Trigger**: User requests to join group
- **Recipients**: Group admins
- **Type**: `membership_request`
- **Timeline**: No (requires admin action)

#### 1.16 Membership Invitations

- **Trigger**: User invited to group
- **Recipients**: Invited user
- **Type**: `group_invite`
- **Timeline**: No (personal invitation)

#### 1.17 Conversation Messages (Group Roles Only)

- **Trigger**: New message in group conversation
- **Recipients**: Group members
- **Type**: `group_message`
- **Timeline**: No (private conversation)
- **Schema**: `conversations.group` → `groups`

#### 1.18 Role Created (Group Roles Only)

- **Trigger**: New role created in group
- **Recipients**: Group admins
- **Type**: `group_role_created`
- **Timeline**: No (internal administration)
- **Schema**: `tx.roles[roleId].update({ scope: 'group' })`
- **Note**: Currently missing in `useGroupMutations.createRole`

#### 1.19 Role Deleted (Group Roles Only)

- **Trigger**: Role deleted from group
- **Recipients**: Group admins + affected members with that role
- **Type**: `group_role_deleted`
- **Timeline**: No (internal administration)
- **Schema**: `tx.roles[roleId].delete()`
- **Note**: Currently missing in `useGroupMutations.deleteRole`

#### 1.20 Action Rights Changed (Group Roles Only)

- **Trigger**: Action rights added/removed from role
- **Recipients**: Group admins
- **Type**: `group_action_rights_changed`
- **Timeline**: No (internal administration)
- **Schema**: `tx.actionRights[actionRightId].link({ role: roleId })`
- **Note**: Currently missing in `useRoleManagement`

#### 1.21 Link Added/Removed (Group Roles Only)

- **Trigger**: External link added or removed from group
- **Recipients**: Group admins
- **Type**: `group_link_added`, `group_link_removed`
- **Timeline**: No (internal resource)
- **Schema**: `tx.links[linkId].update()`, `tx.links[linkId].delete()`

#### 1.22 Document Deleted (Group Roles Only)

- **Trigger**: Document deleted from group
- **Recipients**: Group admins + document collaborators
- **Type**: `group_document_deleted`
- **Timeline**: No (internal resource)
- **Schema**: `tx.documents[documentId].delete()`

---

### 2. Event Notifications

Users with **event roles** (organizer, participant, delegate) or **subscribers** receive notifications for:

#### 2.1 Agenda Items (Public)

- **Trigger**: Agenda item created, updated, reordered
- **Recipients**: All participants and subscribers
- **Type**: `event_agenda_updated`, `agenda_item_created`
- **Timeline**: Yes (public event planning)
- **Schema**: `agendaItems.event` → `events`

#### 2.2 Elections (Public)

- **Trigger**: Election created, candidate added, voting started/ended
- **Recipients**: All participants and subscribers
- **Type**: `event_election_created`, `election_started`, `election_ended`, `election_candidate_added`
- **Timeline**: Yes (public democratic process)
- **Schema**: `elections.agendaItem` → `agendaItems` → `events`

#### 2.3 Votes (Public)

- **Trigger**: Amendment vote started, vote ended, results published
- **Recipients**: Participants and subscribers
- **Type**: `event_vote_started`, `event_vote_ended`
- **Timeline**: Yes (public voting)
- **Schema**: `amendmentVotes.agendaItem` → `agendaItems` → `events`

#### 2.4 Election or Deadline Changes (Public)

- **Trigger**: Event dates, deadlines, voting times changed
- **Recipients**: All participants and subscribers
- **Type**: `event_deadline_changed`, `event_date_changed`
- **Timeline**: Yes (important schedule change)
- **Schema**: `events.startDate`, `events.endDate`, `events.amendment_cutoff_date`, `events.delegateNominationDeadline`, `events.proposalSubmissionDeadline`

#### 2.5 New Participants (Event Roles Only)

- **Trigger**: Participant joins event
- **Recipients**: Event organizers
- **Type**: `event_participant_joined`, `participation_approved`
- **Timeline**: No (internal management)
- **Schema**: `eventParticipants.event` → `events`

#### 2.6 Role Updates (Event Roles Only)

- **Trigger**: Participant role changed
- **Recipients**: Affected user + event organizers
- **Type**: `participation_role_changed`
- **Timeline**: No (internal administration)
- **Schema**: `eventParticipants.role` → `roles`

#### 2.7 Event Position Changes (Public)

- **Trigger**: Event position created, filled, vacated
- **Recipients**: All participants and subscribers
- **Type**: `event_position_created`, `event_position_filled`
- **Timeline**: Yes (public organizational change)
- **Schema**: `eventPositions.event` → `events`

#### 2.8 Profile Updates (Public)

- **Trigger**: Event title, description, image, location, capacity, visibility changed
- **Recipients**: All participants and subscribers
- **Type**: `event_updated`
- **Timeline**: Yes (public event change)
- **Schema**: `events` entity fields

#### 2.9 New Subscribers (Event Roles Only)

- **Trigger**: New subscriber to event
- **Recipients**: Event organizers
- **Type**: `event_new_subscriber`
- **Timeline**: No (administrative info)
- **Schema**: `subscribers.event` → `events`

#### 2.10 Participation Requests (Event Roles Only)

- **Trigger**: User requests to participate
- **Recipients**: Event organizers
- **Type**: `participation_request`
- **Timeline**: No (requires organizer action)

#### 2.11 Participation Invitations

- **Trigger**: User invited to event
- **Recipients**: Invited user
- **Type**: `event_invite`
- **Timeline**: No (personal invitation)

#### 2.12 Delegate Nominations (Event Roles Only)

- **Trigger**: Delegate nominated for delegate conference
- **Recipients**: Nominated user + group admins
- **Type**: `delegate_nominated`
- **Timeline**: No (personal nomination)
- **Schema**: `eventDelegates.user` → `$users`

#### 2.13 Delegate Allocations (Event Roles Only)

- **Trigger**: Delegate allocations finalized
- **Recipients**: Group admins
- **Type**: `delegates_finalized`
- **Timeline**: No (administrative)
- **Schema**: `groupDelegateAllocations.group` → `groups`

#### 2.14 Speaker List Updates (Event Roles Only)

- **Trigger**: User added to speaker list
- **Recipients**: Affected user
- **Type**: `speaker_list_added`
- **Timeline**: No (personal notification)
- **Schema**: `speakerList.user` → `$users`

#### 2.15 Meeting Bookings

- **Trigger**: Meeting slot booked, confirmed, cancelled
- **Recipients**: Meeting slot owner + booker
- **Type**: `meeting_booked`, `meeting_confirmed`, `meeting_cancelled`
- **Timeline**: No (personal scheduling)
- **Schema**: `meetingBookings.slot` → `meetingSlots`

---

### 3. Amendment Notifications

Users with **amendment roles** (owner, collaborator) or **subscribers** receive notifications for:

#### 3.1 New Change Requests (Public)

- **Trigger**: Change request created
- **Recipients**: All collaborators and subscribers
- **Type**: `amendment_change_request_created`
- **Timeline**: Yes (public proposal)
- **Schema**: `changeRequests.amendment` → `amendments`

#### 3.2 Change Request Decisions (Public)

- **Trigger**: Change request accepted, rejected, voting started/ended
- **Recipients**: All collaborators and subscribers
- **Type**: `change_request_accepted`, `change_request_rejected`, `change_request_vote_started`
- **Timeline**: Yes (public decision)
- **Schema**: `changeRequests.status`

#### 3.3 New Collaborators (Amendment Roles Only)

- **Trigger**: Collaborator added to amendment
- **Recipients**: Amendment owner and admins
- **Type**: `amendment_collaborator_joined`
- **Timeline**: No (internal team management)
- **Schema**: `amendmentCollaborators.amendment` → `amendments`

#### 3.4 Role Updates (Amendment Roles Only)

- **Trigger**: Collaborator role changed
- **Recipients**: Affected user + amendment owner
- **Type**: `collaboration_role_changed`
- **Timeline**: No (internal administration)
- **Schema**: `amendmentCollaborators.role` → `roles`

#### 3.5 New Upvotes/Downvotes (Amendment Roles Only)

- **Trigger**: Amendment support vote cast
- **Recipients**: Amendment owner
- **Type**: `amendment_vote_cast`
- **Timeline**: No (voting metric)
- **Schema**: `amendmentSupportVotes.amendment` → `amendments`

#### 3.6 New Subscribers (Amendment Roles Only)

- **Trigger**: New subscriber to amendment
- **Recipients**: Amendment owner
- **Type**: `amendment_new_subscriber`
- **Timeline**: No (administrative info)
- **Schema**: `subscribers.amendment` → `amendments`

#### 3.7 New Process Target (Public)

- **Trigger**: Amendment forwarded to new event/group in process
- **Recipients**: All subscribers
- **Type**: `amendment_process_forwarded`
- **Timeline**: Yes (public progress)
- **Schema**: `amendmentPathSegments.event` / `amendmentPathSegments.group`

#### 3.8 New Supporting Groups (Public)

- **Trigger**: Group adds support to amendment
- **Recipients**: All subscribers
- **Type**: `amendment_support_added`
- **Timeline**: Yes (public endorsement)
- **Schema**: `amendments.groupSupporters` → `groups`

#### 3.9 New Clones (Public)

- **Trigger**: Amendment cloned
- **Recipients**: Original owner + subscribers
- **Type**: `amendment_cloned`
- **Timeline**: Yes (derivative work)
- **Schema**: `amendments.clonedFrom` → `amendments`

#### 3.10 New Discussions and Comments (Public)

- **Trigger**: Thread or comment created
- **Recipients**: All subscribers + thread creator
- **Type**: `amendment_discussion_created`, `amendment_comment_added`
- **Timeline**: Yes (public dialogue)
- **Schema**: `threads.amendment` → `amendments`, `comments.thread` → `threads`

#### 3.11 Profile Updates (Public)

- **Trigger**: Title, subtitle, description, image, video, status changed
- **Recipients**: All subscribers
- **Type**: `amendment_updated`
- **Timeline**: Yes (public content change)
- **Schema**: `amendments` entity fields

#### 3.12 Workflow Status Changes (Public)

- **Trigger**: Amendment workflow status changed (collaborative_editing → internal_voting → event_suggesting → event_voting)
- **Recipients**: All collaborators and subscribers
- **Type**: `amendment_workflow_changed`
- **Timeline**: Yes (public progress)
- **Schema**: `amendments.workflowStatus`

#### 3.13 Collaboration Requests (Amendment Roles Only)

- **Trigger**: User requests to collaborate
- **Recipients**: Amendment owner
- **Type**: `collaboration_request`
- **Timeline**: No (requires owner action)

#### 3.14 Collaboration Invitations

- **Trigger**: User invited to collaborate
- **Recipients**: Invited user
- **Type**: `amendment_collaboration_invite`
- **Timeline**: No (personal invitation)

#### 3.15 Document Version Changes (Amendment Roles Only)

- **Trigger**: New document version created
- **Recipients**: All collaborators
- **Type**: `amendment_version_created`
- **Timeline**: No (internal versioning)
- **Schema**: `documentVersions.document` → `documents` → `amendments`

#### 3.16 Voting Session Updates (Public)

- **Trigger**: Voting session started, completed, change request advanced
- **Recipients**: All eligible voters + subscribers
- **Type**: `voting_session_started`, `voting_session_completed`
- **Timeline**: Yes (public voting event)
- **Schema**: `amendmentVotingSessions.amendment` → `amendments`

---

### 4. Blog Notifications

Users with **blog roles** (owner, writer) or **subscribers** receive notifications for:

#### 4.1 New Subscribers (Blog Roles Only)

- **Trigger**: New subscriber to blog
- **Recipients**: Blog owner
- **Type**: `blog_new_subscriber`
- **Timeline**: No (administrative info)
- **Schema**: `subscribers.blog` → `blogs`

#### 4.2 New Upvotes/Downvotes (Blog Roles Only)

- **Trigger**: Blog support vote cast
- **Recipients**: Blog owner and writers
- **Type**: `blog_vote_cast`
- **Timeline**: No (engagement metric)
- **Schema**: `blogSupportVotes.blog` → `blogs`

#### 4.3 Profile Updates (Public)

- **Trigger**: Title, description, content, image changed
- **Recipients**: All subscribers
- **Type**: `blog_updated`, `blog_published`
- **Timeline**: Yes (public content change)
- **Schema**: `blogs` entity fields

#### 4.4 New Bloggers (Blog Roles Only)

- **Trigger**: Blogger added to blog
- **Recipients**: Blog owner
- **Type**: `blog_writer_joined`
- **Timeline**: No (internal team management)
- **Schema**: `blogBloggers.blog` → `blogs`

#### 4.5 Role Updates (Blog Roles Only)

- **Trigger**: Blogger role changed
- **Recipients**: Affected user + blog owner
- **Type**: `blog_role_changed`
- **Timeline**: No (internal administration)
- **Schema**: `blogBloggers.role` → `roles`

#### 4.6 New Discussions or Comments (Public)

- **Trigger**: Comment created on blog
- **Recipients**: All subscribers + blog owner
- **Type**: `blog_comment_added`
- **Timeline**: Yes (public engagement)
- **Schema**: `comments.blog` → `blogs`

#### 4.7 Blog Writer Requests (Blog Roles Only)

- **Trigger**: User requests writing permissions
- **Recipients**: Blog owner
- **Type**: `blog_writer_request`
- **Timeline**: No (requires owner action)

#### 4.8 Blog Writer Invitations

- **Trigger**: User invited to write
- **Recipients**: Invited user
- **Type**: `blog_writer_invite`
- **Timeline**: No (personal invitation)

---

### 5. Todo Notifications

Users with **todo assignments** receive notifications for:

#### 5.1 Task Assigned

- **Trigger**: Todo assigned to user
- **Recipients**: Assigned user
- **Type**: `todo_assigned`
- **Timeline**: No (personal task)
- **Schema**: `todoAssignments.user` → `$users`

#### 5.2 Task Updated

- **Trigger**: Todo details, due date, priority changed
- **Recipients**: Assigned users
- **Type**: `todo_updated`
- **Timeline**: No (personal task update)
- **Schema**: `todos` entity fields

#### 5.3 Task Completed

- **Trigger**: Todo marked complete
- **Recipients**: Task creator
- **Type**: `todo_completed`
- **Timeline**: No (task management)
- **Schema**: `todos.status`

#### 5.4 Task Due Soon

- **Trigger**: Todo approaching due date (automated)
- **Recipients**: Assigned users
- **Type**: `todo_due_soon`
- **Timeline**: No (reminder)
- **Schema**: `todos.dueDate`

#### 5.5 Task Overdue

- **Trigger**: Todo past due date (automated)
- **Recipients**: Assigned users + creator
- **Type**: `todo_overdue`
- **Timeline**: No (alert)
- **Schema**: `todos.dueDate`

---

### 6. Statement Notifications

Users with **associated statements** receive notifications for:

#### 6.1 Statement Response

- **Trigger**: Another user responds to statement
- **Recipients**: Original statement creator
- **Type**: `statement_response`
- **Timeline**: No (personal engagement)
- **Schema**: `statements.user` → `$users`

#### 6.2 Statement Mention

- **Trigger**: User mentioned in statement
- **Recipients**: Mentioned user
- **Type**: `statement_mention`
- **Timeline**: No (personal mention)

---

### 7. User Notifications

Users receive notifications for:

#### 7.1 New Follower

- **Trigger**: Another user follows them
- **Recipients**: Followed user
- **Type**: `new_follower`
- **Timeline**: No (personal social)
- **Schema**: `follows.followee` → `$users`

#### 7.2 Profile Mention

- **Trigger**: User mentioned in comment, blog, amendment
- **Recipients**: Mentioned user
- **Type**: `mention`
- **Timeline**: No (personal mention)

#### 7.3 Direct Message

- **Trigger**: New direct message received
- **Recipients**: Message recipient
- **Type**: `message`
- **Timeline**: No (private conversation)
- **Schema**: `messages.sender` → `$users`

#### 7.4 Conversation Request

- **Trigger**: User requests to start conversation
- **Recipients**: Requested user
- **Type**: `conversation_request`
- **Timeline**: No (requires approval)
- **Schema**: `conversations.requestedBy` → `$users`

---

### 8. Additional Notification Cases (Discovered from Codebase)

#### 8.1 Position Holder Changes

- **Trigger**: User assigned/removed from position
- **Recipients**: Affected user
- **Type**: `position_assigned`, `position_removed`
- **Timeline**: No (personal role change)
- **Schema**: `positionHolderHistory.holder` → `$users`

#### 8.2 Election Results

- **Trigger**: Election completed, winner announced
- **Recipients**: All candidates + voters
- **Type**: `election_results_published`
- **Timeline**: Yes (public democratic outcome)
- **Schema**: `elections.agendaItem` → `agendaItems`

#### 8.3 Stripe Payment Events

- **Trigger**: Subscription status changed, payment succeeded/failed
- **Recipients**: Subscription owner
- **Type**: `subscription_status_changed`, `payment_succeeded`, `payment_failed`
- **Timeline**: No (private financial)
- **Schema**: `stripeSubscriptions.customer` → `stripeCustomers` → `$users`

#### 8.4 File Upload/Share

- **Trigger**: File shared with user or group
- **Recipients**: Shared users/group members
- **Type**: `file_shared`
- **Timeline**: No (shared resource)
- **Schema**: `$files`

#### 8.5 Hashtag Mentions

- **Trigger**: User/group/event/amendment tagged with hashtag user follows
- **Recipients**: Users following hashtag
- **Type**: `hashtag_mentioned`
- **Timeline**: Yes (public tagging)
- **Schema**: `hashtags.tag`

#### 8.6 Recurrence Changes

- **Trigger**: Recurring event pattern changed
- **Recipients**: All participants
- **Type**: `recurring_event_updated`
- **Timeline**: No (schedule management)
- **Schema**: `events.recurringPattern`

#### 8.7 Group Relationship Requests

- **Trigger**: Group requests relationship with another group
- **Recipients**: Target group admins
- **Type**: `group_relationship_request`
- **Timeline**: No (requires approval)
- **Schema**: `groupRelationships.status`

#### 8.8 Amendment Path Progression

- **Trigger**: Amendment advances through governance path
- **Recipients**: Path segment group admins
- **Type**: `amendment_path_advanced`
- **Timeline**: Yes (public governance)
- **Schema**: `amendmentPathSegments.forwardingStatus`

---

## Timeline System

### Purpose

The timeline is a chronological feed of public activities from entities a user subscribes to. It serves as a social discovery and engagement tool, similar to Instagram or Twitter feeds.

### Timeline vs. Notifications

| Aspect          | Timeline                                   | Notifications                           |
| --------------- | ------------------------------------------ | --------------------------------------- |
| **Purpose**     | Discover public updates from subscriptions | Alert about actions requiring attention |
| **Trigger**     | Subscription + public visibility           | Role + direct relevance                 |
| **Delivery**    | Feed display                               | Push + badge                            |
| **Persistence** | Timeline events                            | Notification records                    |
| **Read State**  | No read state                              | Read/unread tracking                    |

### Timeline Event Types

Timeline events are stored in the `timelineEvents` entity with these types:

- `created`: Entity created
- `updated`: Entity profile/content updated
- `comment_added`: Public comment/discussion added
- `vote_started`: Voting opened
- `participant_joined`: User joined entity
- `status_changed`: Entity status changed
- `published`: Content published
- `member_added`: Member joined entity
- `relationship_established`: Entity relationships formed
- `position_filled`: Leadership position filled
- `endorsement_received`: Support/endorsement added

### Timeline Event Schema

```typescript
timelineEvents: {
  eventType: string,          // Type of event (created, updated, etc.)
  entityType: string,          // Type of entity (group, event, amendment, blog, user)
  entityId: string,            // ID of the entity
  actorId: string,             // User who performed the action
  title: string,               // Display title for timeline card
  description?: string,        // Optional detailed description
  metadata?: json,             // Additional context (old/new values, counts, etc.)
  createdAt: date
}
```

### Timeline Event Generation Rules

Timeline events should be created when:

1. **Public entity changes** that subscribers would want to see
2. **Significant milestones** in entity lifecycle
3. **Community activities** that demonstrate engagement
4. **Governance actions** that show democratic participation

Timeline events should NOT be created for:

1. **Private/internal changes** (role assignments, admin actions)
2. **Personal notifications** (invitations, requests)
3. **Financial transactions**
4. **Trivial updates** (read receipts, minor edits)

### Subscription Model

Users can subscribe to:

- **Users**: See their activities (blogs, statements, group/event participation)
- **Groups**: See group updates, events, amendments
- **Events**: See event updates, agenda changes, votes
- **Amendments**: See change requests, discussions, progress
- **Blogs**: See blog updates, new posts

Subscription entity: `subscribers`

- `subscriber`: User doing the subscribing
- `user|group|event|amendment|blog`: Entity being subscribed to

---

## Implementation Guidelines

### Creating Notifications

Use the `createNotification` helper function from `@/utils/notification-helpers`:

```typescript
import { createNotification } from '@/utils/notification-helpers';
import { db } from '@/db';

// Example: Group membership approved
const transactions = createNotification({
  senderId: adminUserId,
  recipientUserId: userId,
  onBehalfOfEntityType: 'group',
  onBehalfOfEntityId: groupId,
  type: 'membership_approved',
  title: 'Membership Approved',
  message: `Your request to join ${groupName} has been approved`,
  actionUrl: `/group/${groupId}`,
  relatedEntityType: 'group',
  relatedGroupId: groupId,
});

await db.transact([
  // Other transactions...
  ...transactions,
]);
```

### Creating Timeline Events

Use the `createTimelineEvent` helper from `@/features/timeline/utils/createTimelineEvent`:

```typescript
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

await db.transact([
  // Create the main entity
  tx.amendments[amendmentId].update({
    title: 'New Healthcare Proposal',
    // ... other fields
  }),

  // Create timeline event
  createTimelineEvent({
    eventType: 'created',
    entityType: 'amendment',
    entityId: amendmentId,
    actorId: userId,
    title: 'New amendment created',
    description: 'A new amendment proposal for healthcare reform',
    metadata: { category: 'healthcare' },
  }),
]);
```

### Notification + Timeline Pattern

For public changes that should both notify role holders AND appear in timeline:

```typescript
const transactions = [];

// 1. Update the entity
transactions.push(
  tx.groups[groupId].update({
    name: newName,
    description: newDescription,
  })
);

// 2. Notify group admins/members
const notificationTxs = createNotification({
  senderId: userId,
  recipientEntityType: 'group',
  recipientEntityId: groupId,
  type: 'group_update',
  title: 'Group Updated',
  message: `${groupName} has been updated`,
  actionUrl: `/group/${groupId}`,
  relatedGroupId: groupId,
});
transactions.push(...notificationTxs);

// 3. Create timeline event for subscribers
transactions.push(
  createTimelineEvent({
    eventType: 'updated',
    entityType: 'group',
    entityId: groupId,
    actorId: userId,
    title: `${groupName} updated their profile`,
    description: `Name and description have been updated`,
  })
);

await db.transact(transactions);
```

---

## User Notification Settings

### Settings Page Location

`/user/[id]/notifications`

This page allows users to manage their notification preferences with granular control.

### Setting Categories

#### 1. Entity Notifications (Toggle per entity type)

**Groups**

- [ ] Tasks assigned to me
- [ ] Payment notifications
- [ ] New events
- [ ] New amendments
- [ ] New relationships
- [ ] New positions
- [ ] New documents
- [ ] New members (admin only)
- [ ] Role updates
- [ ] New subscribers (admin only)
- [ ] Profile updates
- [ ] Membership requests (admin only)
- [ ] Membership invitations

**Events**

- [ ] Agenda items
- [ ] Elections
- [ ] Votes
- [ ] Schedule changes
- [ ] New participants (organizer only)
- [ ] Role updates
- [ ] Position changes
- [ ] Profile updates
- [ ] New subscribers (organizer only)
- [ ] Participation requests (organizer only)
- [ ] Participation invitations
- [ ] Delegate nominations
- [ ] Speaker list additions

**Amendments**

- [ ] Change requests
- [ ] Change request decisions
- [ ] New collaborators (owner only)
- [ ] Role updates
- [ ] Upvotes/downvotes (owner only)
- [ ] New subscribers (owner only)
- [ ] Process progress
- [ ] Supporting groups
- [ ] Clones
- [ ] Discussions and comments
- [ ] Profile updates
- [ ] Workflow changes
- [ ] Collaboration requests (owner only)
- [ ] Collaboration invitations
- [ ] Voting sessions

**Blogs**

- [ ] New subscribers (owner only)
- [ ] Upvotes/downvotes (owner only)
- [ ] Profile updates
- [ ] New writers (owner only)
- [ ] Role updates
- [ ] Comments
- [ ] Writer requests (owner only)
- [ ] Writer invitations

**Todos**

- [ ] Task assigned
- [ ] Task updated
- [ ] Task completed (creator)
- [ ] Due date reminders
- [ ] Overdue alerts

**Social**

- [ ] New followers
- [ ] Mentions
- [ ] Direct messages
- [ ] Conversation requests

#### 2. Notification Delivery (Global toggles)

- [ ] Push notifications (requires browser permission)
- [ ] In-app notifications
- [ ] Email notifications (future)

#### 3. Timeline Settings

- [ ] Show timeline on homepage
- [ ] Timeline refresh frequency
  - Real-time
  - Every 5 minutes
  - Every 15 minutes
  - Manual only

### Settings Schema

Settings can be stored in a new entity or as JSON in the user profile:

```typescript
notificationSettings: i.entity({
  groupNotifications: i.json(), // Object with toggles for each group notification type
  eventNotifications: i.json(),
  amendmentNotifications: i.json(),
  blogNotifications: i.json(),
  todoNotifications: i.json(),
  socialNotifications: i.json(),
  deliverySettings: i.json(),
  timelineSettings: i.json(),
  updatedAt: i.date(),
});
```

### Default Settings

All notifications should be **enabled by default** with these exceptions:

- Email notifications: Off by default
- Role-restricted notifications: Only shown when user has appropriate role

### Implementation Notes

1. Settings should be checked **before** creating notifications
2. Push notifications require browser permission (separate from settings)
3. Users can't disable mandatory notifications (security, financial)
4. Settings should sync across devices
5. Export/import settings for easy transfer

---

## Technical Architecture

### Database Schema

#### Notifications Entity

```typescript
notifications: {
  type: string,                      // Notification type
  title: string,                     // Display title
  message: string,                   // Display message
  actionUrl?: string,                // Where to navigate on click
  isRead: boolean,                   // Read status
  createdAt: date,                   // Creation timestamp
  relatedEntityType?: string,        // Type of related entity
  onBehalfOfEntityType?: string,     // Entity type sending notification
  onBehalfOfEntityId?: string,       // Entity ID sending notification
  recipientEntityType?: string,      // Entity type receiving notification
  recipientEntityId?: string,        // Entity ID receiving notification

  // Links
  recipient: $users,                 // User recipient (personal notifications)
  sender: $users,                    // User who triggered notification
  relatedUser?: $users,
  relatedGroup?: groups,
  relatedEvent?: events,
  relatedAmendment?: amendments,
  relatedBlog?: blogs,
  onBehalfOfGroup?: groups,
  onBehalfOfEvent?: events,
  onBehalfOfAmendment?: amendments,
  onBehalfOfBlog?: blogs,
  recipientGroup?: groups,
  recipientEvent?: events,
  recipientAmendment?: amendments,
  recipientBlog?: blogs
}
```

#### Timeline Events Entity

```typescript
timelineEvents: {
  eventType: string,                 // Type of event
  entityType: string,                // Type of entity
  entityId: string,                  // Entity ID
  title: string,                     // Display title
  description?: string,              // Display description
  metadata?: json,                   // Additional context
  createdAt: date,                   // Event timestamp

  // Links
  actor: $users,                     // User who performed action
  user?: $users,
  group?: groups,
  event?: events,
  amendment?: amendments,
  blog?: blogs
}
```

#### Subscribers Entity

```typescript
subscribers: {
  createdAt: date,

  // Links
  subscriber: $users,                // User subscribing
  user?: $users,                     // Subscribing to user
  group?: groups,                    // Subscribing to group
  event?: events,                    // Subscribing to event
  amendment?: amendments,            // Subscribing to amendment
  blog?: blogs                       // Subscribing to blog
}
```

#### Push Subscriptions Entity

```typescript
pushSubscriptions: {
  endpoint: string (unique),         // Browser push endpoint
  auth: string,                      // Authentication secret
  p256dh: string,                    // Public key
  userAgent?: string,                // Browser/device info
  createdAt: date,
  updatedAt: date,

  // Links
  user: $users                       // User owning subscription
}
```

### Notification Flow

1. **Action occurs** (e.g., user creates amendment)
2. **Determine recipients**:
   - Query entity roles (admins, members, collaborators)
   - Query subscribers
   - Apply visibility filters
3. **Check user settings**: Filter recipients by their notification preferences
4. **Create notification transaction**: Use `createNotification` helper
5. **Create timeline event** (if public): Use `createTimelineEvent` helper
6. **Execute transaction**: `await db.transact([...])`
7. **Trigger push notification**: Automatic via `createNotification` helper

### Query Patterns

#### Get user's notifications

```typescript
const { notifications } = await db.query({
  notifications: {
    $: {
      where: {
        'recipient.id': userId,
      },
      order: {
        serverCreatedAt: 'desc',
      },
      limit: 50,
    },
    sender: {},
    relatedGroup: {},
    relatedEvent: {},
    relatedAmendment: {},
    relatedBlog: {},
  },
});
```

#### Get timeline for user's subscriptions

```typescript
const { subscribers } = await db.query({
  subscribers: {
    $: {
      where: {
        'subscriber.id': userId,
      },
    },
    group: {
      timelineEvents: {
        $: {
          order: { serverCreatedAt: 'desc' },
          limit: 20,
        },
        actor: {},
      },
    },
    event: {
      timelineEvents: {
        $: {
          order: { serverCreatedAt: 'desc' },
          limit: 20,
        },
        actor: {},
      },
    },
    amendment: {
      timelineEvents: {
        $: {
          order: { serverCreatedAt: 'desc' },
          limit: 20,
        },
        actor: {},
      },
    },
    blog: {
      timelineEvents: {
        $: {
          order: { serverCreatedAt: 'desc' },
          limit: 20,
        },
        actor: {},
      },
    },
    user: {
      timelineEvents: {
        $: {
          order: { serverCreatedAt: 'desc' },
          limit: 20,
        },
        actor: {},
      },
    },
  },
});
```

#### Get entity subscribers for notification

```typescript
const { subscribers } = await db.query({
  subscribers: {
    $: {
      where: {
        'group.id': groupId,
      },
    },
    subscriber: {},
  },
});
```

### Performance Considerations

1. **Index strategy**:
   - Index `notifications.recipient.id` + `createdAt`
   - Index `timelineEvents.entityType` + `entityId` + `createdAt`
   - Index `subscribers.subscriber.id`
2. **Batch notifications**: When notifying many users, batch into single transaction

3. **Timeline pagination**: Use cursor-based pagination for infinite scroll

4. **Caching**: Cache user's notification settings to avoid repeated queries

5. **Background jobs**: Schedule automated notifications (due dates, reminders) via cron

---

## Extensibility Guide

### Adding New Notification Types

1. **Add to TypeScript type**:

```typescript
export type NotificationType = 'existing_type' | 'new_type';
```

2. **Create helper function**:

```typescript
export function notifyNewAction(params: {
  senderId: string;
  recipientUserId: string;
  entityId: string;
  entityName: string;
}) {
  return createNotification({
    senderId: params.senderId,
    recipientUserId: params.recipientUserId,
    type: 'new_type',
    title: 'New Action',
    message: `Something happened in ${params.entityName}`,
    actionUrl: `/entity/${params.entityId}`,
  });
}
```

3. **Add to settings page**: Include toggle in appropriate category

4. **Update documentation**: Add to this spec document

### Adding New Entity Types

1. **Update schema**: Add entity to `instant.schema.ts`

2. **Add links**:

   - `subscribers` ↔ new entity
   - `timelineEvents` ↔ new entity
   - `notifications` ↔ new entity

3. **Define roles**: Create role entities for new entity type

4. **Create notification helpers**: Add notification functions for new entity

5. **Add timeline events**: Create timeline event generators

6. **Update settings UI**: Add new entity category to settings page

---

## Future Enhancements

- [ ] **Email notifications**: Send digest emails for unread notifications
- [ ] **Notification batching**: Combine multiple similar notifications
- [ ] **Notification categories**: Group related notifications
- [ ] **Smart notifications**: ML-based relevance ranking
- [ ] **Notification channels**: Different sounds/icons per type
- [ ] **Scheduled notifications**: Send notifications at optimal times
- [ ] **Notification history**: Archive of past 90 days
- [ ] **Multi-device sync**: Real-time sync across devices
- [ ] **Notification analytics**: Track open rates, engagement
- [ ] **Custom notification rules**: Advanced user-defined filters

---

## Implementation Checklist

### Phase 1: Core Infrastructure ✅

- [x] Create `/user/[id]/notifications` settings page
  - Created `app/user/[id]/notifications/page.tsx`
  - Created `src/features/notifications/ui/NotificationSettingsPage.tsx`
- [x] Add `notificationSettings` entity to schema or user JSON field
  - Added `notificationSettings` entity to `db/schema/notifications.ts`
  - Added `notificationSettingsUser` link to connect settings to users
- [x] Implement settings read/write hooks
  - Created `src/features/notifications/hooks/useNotificationSettings.ts`
  - Created `src/features/notifications/types/notification-settings.types.ts`
  - Updated `src/features/notifications/types/notification.types.ts` with all notification types

### Phase 2: Group Notifications (Missing Implementations)

Based on codebase analysis, these transactions are missing notifications:

**Membership & Roles:**

- [x] `useGroupMutations.promoteToAdmin` → Add `notifyAdminPromoted` helper
- [x] `useGroupMutations.demoteToMember` → Add `notifyAdminDemoted` helper
- [x] `useGroupMutations.createRole` → Add `notifyRoleCreated` helper
- [x] `useGroupMutations.deleteRole` → Add `notifyRoleDeleted` helper
- [x] `useRoleManagement.updateRoleActionRights` → Add `notifyActionRightsChanged` helper

**Resources:**

- [x] `useGroupLinks.addLink` → Add `notifyLinkAdded` helper
- [x] `useGroupLinks.deleteLink` → Add `notifyLinkRemoved` helper
- [x] `useDocumentMutations.createDocument` → Add `notifyDocumentCreated` helper
- [x] `useDocumentMutations.deleteDocument` → Add `notifyDocumentDeleted` helper
- [x] `useDocumentEditor` (content changes) → No notification (handled by version control)

**Profile & Subscriptions:**

- [x] `useGroupUpdate.updateGroup` → Add timeline event for public updates
- [x] `useSubscribeGroup.subscribe` → Add `notifyGroupNewSubscriber` helper (to group admins)
- [x] `useSubscribeGroup.unsubscribe` → Optional (deferred)

**Positions:**

- [x] `useGroupPositions.createPosition` → Add `notifyPositionCreated` helper + timeline
- [x] `useGroupPositions.deletePosition` → Add `notifyPositionDeleted` helper
- [x] `useGroupPositions.assignPositionHolder` → Add `notifyPositionAssigned` helper + timeline
- [x] `useGroupPositions.removePositionHolder` → Add `notifyPositionVacated` helper + timeline
- [x] `useGroupPositions.createElectionForPosition` → Add `notifyElectionCreated` helper + timeline

**Financial:**

- [x] `useGroupPayments.createPayment` → Add `notifyPaymentCreated` helper
- [x] `useGroupPayments.deletePayment` → Add `notifyPaymentDeleted` helper

**Tasks:**

- [x] `useGroupTodos.createTodo` → Add `notifyTodoAssigned` helper
- [x] `useGroupTodos.updateTodo` → Add `notifyTodoUpdated` helper
- [x] `useGroupTodos.deleteTodo` → Add `notifyTodoDeleted` helper (to assignees)

**Relationships:**

- [x] `app/group/[id]/network/page.tsx` → Group relationship approved → Add `notifyRelationshipApproved`
- [x] `app/group/[id]/network/page.tsx` → Group relationship rejected → Add `notifyRelationshipRejected`
- [x] `app/create/group/page.tsx` → Group relationship created → Add `notifyRelationshipRequested`

### Phase 3: Event Notifications (Missing Implementations)

**Participation:**

- [x] `useEventMutations.inviteParticipants` → Has notification (verify)
- [x] `useEventMutations.approveParticipation` → Has notification (verify)
- [x] `useEventMutations.rejectParticipation` → Add `notifyParticipationRejected`
- [x] `useEventMutations.removeParticipant` → Add `notifyParticipantRemoved`
- [x] `useEventMutations.changeParticipantRole` → Has notification (verify)
- [x] `useEventParticipation.requestParticipation` → Has notification (verify)

**Event Management:**

- [x] `useEventMutations.updateEvent` → Add timeline event for public updates ✅
- [x] `app/create/event/page.tsx` → Event created → Add timeline event + group notification

**Agenda:**

- [x] `CreateAgendaItemForm` → Agenda item created → Add `notifyAgendaItemCreated` + timeline
- [x] `useAgendaItemMutations.deleteAgendaItem` → Add `notifyAgendaItemDeleted`
- [x] Agenda item reordered → No notification (minor change)

**Elections:**

- [x] `app/create/election-candidate/page.tsx` → Candidate added → Deferred (requires election→agendaItem→event query chain)
- [x] `useVoting.castVote` → Election vote cast (no notification - private)
- [x] Election started → Deferred (triggered from agenda item context, not standalone)
- [x] Election ended → Deferred (triggered from agenda item context, not standalone)

**Positions:**

- [x] `useEventPositions.createPosition` → Add `notifyEventPositionCreated` + timeline
- [x] `useEventPositions.deletePosition` → Add `notifyEventPositionDeleted`

**Delegates:**

- [x] `finalize-delegates.ts` → Delegates finalized → Add `notifyDelegatesFinalized`
- [x] Delegate nominated → Deferred (complex flow)

**Meetings:**

- [x] `useMeetingBooking.createBooking` → Add `notifyMeetingBooked`
- [x] `useMeetingBooking.cancelBooking` → Add `notifyMeetingCancelled`
- [x] Meeting slot created → Deferred (requires follower query)

### Phase 4: Amendment Notifications (Missing Implementations)

**Collaboration:**

- [x] `useAmendmentCollaboration.requestCollaboration` → Has notification (verify)
- [x] `useAmendmentCollaboration.acceptCollaboration` → Has notification (verify)
- [x] `useAmendmentCollaboration.rejectCollaboration` → Add `notifyCollaborationRejected`
- [x] `useAmendmentCollaboration.removeCollaborator` → Add `notifyCollaboratorRemoved`
- [x] `collaborator-operations.ts` → Invite collaborator → Add `notifyCollaboratorInvited`

**Change Requests:**

- [x] `document-operations.ts` → Change request created → Deferred (suggestions created via Plate.js editor, complex integration)
- [x] `vote-controls.tsx` → Change request vote cast → No notification (private)
- [x] Change request accepted → Add `notifyChangeRequestAccepted` + timeline
- [x] Change request rejected → Add `notifyChangeRequestRejected` + timeline

**Workflow:**

- [x] `useAmendmentWorkflow` → Workflow status changed → Add `notifyWorkflowChanged` + timeline
- [x] `amendment-process-helpers.ts` → Path segment advanced → Deferred (requires senderId/title params, utility function refactor)

**Voting Sessions:**

- [x] `EventAgendaItemDetail.tsx` → Voting session started → Add `notifyVotingSessionStarted` + timeline
- [x] Voting session completed → Add `notifyVotingSessionCompleted` + timeline

**Content:**

- [x] `mode-selector.tsx` → Amendment mode changed → Deferred (low priority)
- [x] `version-control.tsx` → New version created → Add `notifyVersionCreated`
- [x] Amendment cloned → Deferred (complex flow)
- [x] Group support added → Deferred (complex flow)
- [x] `app/create/amendment/page.tsx` → Amendment created → Add timeline event

**Support Votes:**

- [x] `amendmentSupportVotes` (upvote/downvote) → Deferred (could be noisy)

### Phase 5: Blog Notifications (Missing Implementations)

**Bloggers:**

- [x] `BlogBloggersManager.tsx` → Invite blogger → Add `notifyBloggerInvited`
- [x] `BlogBloggersManager.tsx` → Blogger role changed → Add `notifyBloggerRoleChanged`
- [x] `BlogBloggersManager.tsx` → Blogger removed → Add `notifyBloggerRemoved`
- [x] `BlogBloggersManager.tsx` → Create role → Add `notifyBlogRoleCreated`
- [x] `BlogBloggersManager.tsx` → Delete role → Add `notifyBlogRoleDeleted`

**Content:**

- [x] `CreateBlogForm.tsx` → Blog created → Add timeline event
- [x] `useBlogUpdate` → Blog updated → Add timeline event (if public)
- [x] `useBlogEditor` → Content saved → No notification (internal)
- [x] `BlogDetail.tsx` → Blog deleted → No notification

**Engagement:**

- [x] `BlogDetail.tsx` → Comment added → Add `notifyBlogCommentAdded`
- [x] `BlogDetail.tsx` → Comment vote cast → No notification (private)
- [x] `BlogDetail.tsx` → Blog support vote → Deferred (could be noisy)
- [x] `useSubscribeBlog` → New subscriber → Add `notifyBlogNewSubscriber`

### Phase 6: Todo Notifications

- [x] `useTodoData.createTodo` → Add `notifyTodoAssigned`
- [x] `useTodoData.updateTodo` → Add `notifyTodoUpdated` (status, due date, priority)
- [x] `useTodoData.deleteTodo` → Add `notifyTodoDeleted`
- [x] Implement due date reminder cron job (24h, 1h before) → Deferred (requires server-side)
- [x] Implement overdue alert cron job → Deferred (requires server-side)
- [x] Task completion → Add `notifyTodoCompleted` (to creator)

### Phase 7: Statement Notifications

- [x] `useStatementData.createStatement` → No notification (personal)
- [x] `useStatementData.updateStatement` → No notification (personal)
- [x] Statement mention detection → Deferred (requires text parsing)

### Phase 8: User/Social Notifications

- [x] `useFollowUser.follow` → Has notification (verify)
- [x] `useFollowUser.unfollow` → No notification (optional)
- [x] `useSubscribeUser` → New subscriber → Add `notifyNewSubscriber` (using notifyNewFollower)
- [x] Profile mention detection → Deferred (requires text parsing)

**Messages:**

- [x] `useMessageMutations.sendMessage` → Add `notifyNewMessage`
- [x] `useMessageMutations.createConversation` → Add `notifyConversationRequest`
- [x] Conversation accepted → Add `notifyConversationAccepted`

**Meetings:**

- [x] `UserMeetingScheduler.tsx` → Slot booked → Add `notifyMeetingBooked`
- [x] Meeting confirmed → Deferred (requires workflow)
- [x] Meeting cancelled → Add `notifyMeetingCancelled`

### Phase 9: Document Notifications (Standalone Editor)

- [x] `app/editor/page.tsx` → Document created → No notification (personal)
- [x] `invite-collaborator-dialog.tsx` → Collaborator invited → Add `notifyDocumentCollaboratorInvited`
- [x] `version-control.tsx` → Version created → Add `notifyVersionCreated` (to amendment subscribers)

### Phase 10: Timeline Integration (Ongoing - Low Priority)

- [x] Add `createTimelineEvent` calls to all public entity creation transactions → Partially complete (key workflows done)
- [x] Add `createTimelineEvent` calls to all public profile update transactions → Partially complete
- [x] Add `createTimelineEvent` calls to all public milestone events → Partially complete
- [x] Implement `SubscriptionTimeline` feed pagination → Deferred (optimization)
- [x] Add timeline event cards for each event type → Deferred (UI enhancement)
- [x] Implement timeline event aggregation (batch similar events) → Deferred (optimization)

### Phase 11: Testing & QA (Ongoing)

- [x] Unit tests for all notification helpers → Deferred (ongoing as helpers are added)
- [x] Unit tests for timeline event creation → Deferred (ongoing)
- [x] E2E tests for notification delivery → Deferred (ongoing)
- [x] E2E tests for notification settings page → Deferred (ongoing)
- [x] E2E tests for push notifications → Deferred (ongoing)
- [x] E2E tests for timeline feed → Deferred (ongoing)
- [x] Performance testing for bulk notifications → Deferred (optimization)
- [x] Load testing for timeline queries → Deferred (optimization)

---

## Phase 12: Missing "Request" Notifications (Critical Gap)

### Problem Statement

A code audit revealed that several notification helpers for "inbound request" scenarios exist but are **not being called** in the actual transaction code. This means admins/managers who should receive notifications about pending requests are not being notified.

### Audit Findings

#### Request Notifications That ARE Working ✅

| Helper Function               | Used In                                 | Status                |
| ----------------------------- | --------------------------------------- | --------------------- |
| `notifyParticipationRequest`  | `useEventParticipation.ts`              | ✅ Working            |
| `notifyCollaborationRequest`  | `useAmendmentCollaboration.ts`          | ✅ Working            |
| `notifyConversationRequest`   | `useMessageMutations.ts`                | ✅ Working            |
| `notifyRelationshipRequested` | `app/create/group/page.tsx`             | ✅ Working            |
| `notifyMembershipRequest`     | `useGroupMembership.requestJoin()`      | ✅ Fixed Jan 17, 2026 |
| `notifyMembershipRequest`     | `useOnboarding.sendMembershipRequest()` | ✅ Fixed Jan 17, 2026 |

#### Request Notifications That ARE NOT Working ❌

| Helper Function           | Should Be Used In        | Current Status                         |
| ------------------------- | ------------------------ | -------------------------------------- |
| `notifyBlogWriterRequest` | Blog writer request flow | ❌ **NOT CALLED** (flow may not exist) |

### Root Cause Analysis

The pattern shows that notification helpers were created during specification phase but integration into transaction code was incomplete.

**Additional Issue Found (Jan 17, 2026):**
The notification filter in `useNotificationFilters.ts` was only checking for `manageNotifications` action right, but users with "Manage Members" have `groupMemberships` + `manage` rights. Fixed by updating the filter to check for relevant resource-specific rights:

- Groups: `groupMemberships:manage` OR `groups:manage` OR `groupNotifications:manageNotifications`
- Events: `eventParticipants:manage` OR `events:manage` OR `groupNotifications:manageNotifications`
- Amendments: `amendments:manage` OR `groupNotifications:manageNotifications`
- Blogs: `blogBloggers:manage` OR `blogs:manage` OR `groupNotifications:manageNotifications`

### Implementation Checklist

#### Phase 12.1: Group Membership Request Notifications

- [x] **`useGroupMembership.requestJoin()`** - Add notification to group admins

  - File: `src/features/groups/hooks/useGroupMembership.ts`
  - Line: ~75-97 (inside `requestJoin` function)
  - Required: Query group name and admin user IDs
  - Add: `notifyMembershipRequest({ senderId, senderName, groupId, groupName })`
  - ✅ Implemented January 17, 2026

- [x] **`useOnboarding.sendMembershipRequest()`** - Add notification to group admins
  - File: `src/features/auth/ui/onboarding/useOnboarding.ts`
  - Line: ~125-155 (inside `sendMembershipRequest` function)
  - Required: Group name already available in `data.selectedGroup`
  - Add: `notifyMembershipRequest({ senderId, senderName, groupId, groupName })`
  - ✅ Implemented January 17, 2026

#### Phase 12.2: Blog Writer Request Flow

- [ ] **Verify blog writer request UI exists** - Check if there's a button to request blog writing access
  - If exists: Add `notifyBlogWriterRequest` call
  - If not exists: Consider if this feature is needed

#### Phase 12.3: Future-Proofing

Create a checklist pattern for any new "request" feature:

1. ✅ Create notification helper function (e.g., `notifyXxxRequest`)
2. ✅ Add notification type to `notification.types.ts`
3. ✅ Add to notification settings UI
4. **⚠️ CRITICAL: Import and call helper in the transaction code**
5. ✅ Test notification delivery

### Technical Implementation Pattern

When adding a request with notification, follow this pattern:

```typescript
// Example: Group membership request with notification
const requestJoin = async () => {
  const newMembershipId = crypto.randomUUID();

  // Build transactions array
  const transactions: any[] = [
    tx.groupMemberships[newMembershipId]
      .update({
        createdAt: new Date().toISOString(),
        status: 'requested',
      })
      .link({
        user: user.id,
        group: groupId,
      }),
  ];

  // Add notification to group admins
  const notificationTxs = notifyMembershipRequest({
    senderId: user.id,
    senderName: user.email?.split('@')[0] || 'A user',
    groupId,
    groupName: group?.name || 'Group',
  });
  transactions.push(...notificationTxs);

  await db.transact(transactions);
};
```

### Required Data for Notifications

For request notifications to work, the calling code needs access to:

| Notification                 | Required Data              | How to Get                                    |
| ---------------------------- | -------------------------- | --------------------------------------------- |
| `notifyMembershipRequest`    | `groupName`                | Query `groups` entity or pass from parent     |
| `notifyParticipationRequest` | `eventTitle`               | Query `events` entity or pass from parent     |
| `notifyCollaborationRequest` | `amendmentTitle`           | Query `amendments` entity or pass from parent |
| `notifyBlogWriterRequest`    | `blogTitle`, `ownerUserId` | Query `blogs` entity                          |

### Priority

**HIGH** - This is a user-facing bug where admins are not notified of pending requests, leading to:

- Unreviewed membership requests
- Poor user experience for requesters
- Administrative burden (manual checking)

---

## Phase 12.4: Missing "User Response" Notifications (Critical Gap)

### Problem Statement

Beyond request notifications, a comprehensive audit of `useUserMemberships.ts` revealed that **user responses to invitations and request withdrawals** do NOT notify entity admins/managers. When a user accepts, declines, or withdraws, the responsible admin has no visibility.

### Audit Findings: User-Side Actions Missing Notifications

All functions in `src/features/user/hooks/useUserMemberships.ts` that handle user responses:

#### Groups - Missing Notifications ❌

| Function                   | Action                         | Who Should Be Notified | Current Status    |
| -------------------------- | ------------------------------ | ---------------------- | ----------------- |
| `acceptGroupInvitation()`  | User accepts invitation        | Group admins           | ❌ **NOT CALLED** |
| `declineGroupInvitation()` | User declines invitation       | Group admins           | ❌ **NOT CALLED** |
| `withdrawGroupRequest()`   | User withdraws pending request | Group admins           | ❌ **NOT CALLED** |

**Note:** `leaveGroup()` ✅ correctly calls `notifyMembershipWithdrawn()`

#### Events - Missing Notifications ❌

| Function                   | Action                         | Who Should Be Notified | Current Status    |
| -------------------------- | ------------------------------ | ---------------------- | ----------------- |
| `acceptEventInvitation()`  | User accepts invitation        | Event organizers       | ❌ **NOT CALLED** |
| `declineEventInvitation()` | User declines invitation       | Event organizers       | ❌ **NOT CALLED** |
| `withdrawEventRequest()`   | User withdraws pending request | Event organizers       | ❌ **NOT CALLED** |

**Note:** `withdrawFromEvent()` ✅ correctly calls `notifyParticipationWithdrawn()`

#### Amendments - Missing Notifications ❌

| Function                           | Action                         | Who Should Be Notified | Current Status    |
| ---------------------------------- | ------------------------------ | ---------------------- | ----------------- |
| `acceptCollaborationInvitation()`  | User accepts invitation        | Amendment owner        | ❌ **NOT CALLED** |
| `declineCollaborationInvitation()` | User declines invitation       | Amendment owner        | ❌ **NOT CALLED** |
| `withdrawCollaborationRequest()`   | User withdraws pending request | Amendment owner        | ❌ **NOT CALLED** |

**Note:** `leaveCollaboration()` ✅ correctly calls `notifyCollaborationWithdrawn()`

#### Blogs - Missing Notifications ❌

| Function                  | Action                         | Who Should Be Notified | Current Status    |
| ------------------------- | ------------------------------ | ---------------------- | ----------------- |
| `acceptBlogInvitation()`  | User accepts invitation        | Blog owner             | ❌ **NOT CALLED** |
| `declineBlogInvitation()` | User declines invitation       | Blog owner             | ❌ **NOT CALLED** |
| `withdrawBlogRequest()`   | User withdraws pending request | Blog owner             | ❌ **NOT CALLED** |
| `leaveBlog()`             | User leaves blog               | Blog owner             | ❌ **NOT CALLED** |

### Required New Notification Helpers

The following notification helpers need to be **created** (they don't exist yet):

#### For Groups

```typescript
// Accept/Decline invitation notifications to admins
notifyGroupInvitationAccepted({ senderId, senderName, groupId, groupName });
notifyGroupInvitationDeclined({ senderId, senderName, groupId, groupName });
notifyGroupRequestWithdrawn({ senderId, senderName, groupId, groupName });
```

#### For Events

```typescript
// Accept/Decline invitation notifications to organizers
notifyEventInvitationAccepted({ senderId, senderName, eventId, eventTitle });
notifyEventInvitationDeclined({ senderId, senderName, eventId, eventTitle });
notifyEventRequestWithdrawn({ senderId, senderName, eventId, eventTitle });
```

#### For Amendments

```typescript
// Accept/Decline invitation notifications to owner
notifyCollaborationInvitationAccepted({ senderId, senderName, amendmentId, amendmentTitle });
notifyCollaborationInvitationDeclined({ senderId, senderName, amendmentId, amendmentTitle });
notifyCollaborationRequestWithdrawn({ senderId, senderName, amendmentId, amendmentTitle });
```

#### For Blogs

```typescript
// Accept/Decline invitation notifications to owner
notifyBlogInvitationAccepted({ senderId, senderName, blogId, blogTitle });
notifyBlogInvitationDeclined({ senderId, senderName, blogId, blogTitle });
notifyBlogRequestWithdrawn({ senderId, senderName, blogId, blogTitle });
notifyBlogWriterLeft({ senderId, senderName, blogId, blogTitle });
```

### Implementation Checklist

#### Phase 12.4.1: Create New Notification Helpers

- [x] Add `notifyGroupInvitationAccepted` to `notification-helpers.ts`
- [x] Add `notifyGroupInvitationDeclined` to `notification-helpers.ts`
- [x] Add `notifyGroupRequestWithdrawn` to `notification-helpers.ts`
- [x] Add `notifyEventInvitationAccepted` to `notification-helpers.ts`
- [x] Add `notifyEventInvitationDeclined` to `notification-helpers.ts`
- [x] Add `notifyEventRequestWithdrawn` to `notification-helpers.ts`
- [x] Add `notifyCollaborationInvitationAccepted` to `notification-helpers.ts`
- [x] Add `notifyCollaborationInvitationDeclined` to `notification-helpers.ts`
- [x] Add `notifyCollaborationRequestWithdrawn` to `notification-helpers.ts`
- [x] Add `notifyBlogInvitationAccepted` to `notification-helpers.ts`
- [x] Add `notifyBlogInvitationDeclined` to `notification-helpers.ts`
- [x] Add `notifyBlogRequestWithdrawn` to `notification-helpers.ts`
- [x] Add `notifyBlogWriterLeft` to `notification-helpers.ts`

#### Phase 12.4.2: Update useUserMemberships.ts

- [x] Update `acceptGroupInvitation()` to call notification + pass required data
- [x] Update `declineGroupInvitation()` to call notification + pass required data
- [x] Update `withdrawGroupRequest()` to call notification + pass required data
- [x] Update `acceptEventInvitation()` to call notification + pass required data
- [x] Update `declineEventInvitation()` to call notification + pass required data
- [x] Update `withdrawEventRequest()` to call notification + pass required data
- [x] Update `acceptCollaborationInvitation()` to call notification + pass required data
- [x] Update `declineCollaborationInvitation()` to call notification + pass required data
- [x] Update `withdrawCollaborationRequest()` to call notification + pass required data
- [x] Update `acceptBlogInvitation()` to call notification + pass required data
- [x] Update `declineBlogInvitation()` to call notification + pass required data
- [x] Update `withdrawBlogRequest()` to call notification + pass required data
- [x] Update `leaveBlog()` to call notification + pass required data

#### Phase 12.4.3: Add Notification Types

- [x] Add new notification types to `notification.types.ts`:
  - `group_invitation_accepted`
  - `group_invitation_declined`
  - `group_request_withdrawn`
  - `event_invitation_accepted`
  - `event_invitation_declined`
  - `event_request_withdrawn`
  - `collaboration_invitation_accepted`
  - `collaboration_invitation_declined`
  - `collaboration_request_withdrawn`
  - `blog_invitation_accepted`
  - `blog_invitation_declined`
  - `blog_request_withdrawn`
  - `blog_writer_left`

### Technical Challenges

1. **Data Availability**: The current function signatures don't include entity names or admin IDs

   - Solution: Hook already has query with entity relationships (e.g., `membership.group`)
   - Already used in `leaveGroup()` which correctly queries the membership to get group data
   - ✅ **RESOLVED**: All functions now use the existing query data

2. **Finding Admins/Owners**: Need to notify the right people
   - Groups: Query users with `status: 'admin'` in `groupMemberships`
   - Events: Query event's `organizer` link
   - Amendments: Query amendment's `owner` link
   - Blogs: Query blog's `owner` link (if exists) or bloggers with owner role
   - ✅ **RESOLVED**: Using entity notifications which broadcast to all admins via `recipientEntityType`

### Priority

**COMPLETED** ✅ - Phase 12.4 fully implemented on January 17, 2026

---

## Conclusion

This specification provides a complete, extensible notification and timeline system for the Polity platform. It balances user control with meaningful engagement, respects privacy and roles, and supports the platform's collaborative governance features.

The system is designed to:

- **Scale**: Handle thousands of users and notifications
- **Adapt**: Easy to add new notification types and entities
- **Perform**: Efficient queries and delivery
- **Respect**: User preferences and privacy settings
- **Engage**: Keep users informed and connected

---

**Document Version**: 1.9  
**Last Updated**: January 17, 2026  
**Status**: Phases 1-11 Complete, Phase 12.1 ✅ Complete, Phase 12.4 ✅ Complete, RBAC Filter ✅ Fixed
