# Notification Transaction Audit — Implementation Tasks

This document is the result of a full codebase scan for `db.transact` / `.tx.` calls. Every transaction that creates, updates, or deletes something a user should know about is listed below, grouped by whether a notification is **already present** or **missing**.

**Progress Overview:**

- Total Missing Notification Integrations: ~35
- Completed: 29
- Skipped (intentional): 7
- Remaining: ~0 (all actionable gaps addressed)

### Completed Items (2025-06-20)

- §0: All 8 new helper functions + types created
- §1.1: Amendment support voting → `notifyAmendmentVoted`
- §1.2: Clone amendment → `notifyAmendmentCloned`
- §1.3: Amendment profile update → `notifyAmendmentProfileUpdated`
- §1.4: Amendment target set → `notifyAmendmentTargetSet`
- §1.9: Amendment rejected TODO → `notifyAmendmentRejected`
- §2.1: Blog support voting → `notifyBlogVoted`
- §2.3: Blog deleted → `notifyBlogDeleted`
- §2.5: Blog published → `notifyBlogPublished` (on visibility change)
- §3.1: Election candidate (EventWiki) → `notifyCandidateAdded`
- §3.2: Election candidate (EventAgendaItemDetail) → `notifyCandidateAdded`
- §3.8/C5: Event schedule changed → `notifyScheduleChanged` (in useEventMutations)
- §4.1: Group profile update → `notifyGroupProfileUpdated`
- §4.3: Group payment deleted → `notifyPaymentDeleted` (replaced hacky pattern)
- §6.1: Create amendment page → `notifyGroupNewAmendment` (when target group set)
- §6.3: Create election candidate → `notifyCandidateAdded`
- §6.5: Group network relationships → already done (verified)

### Completed Items (2026-02-15) — Phase 2

- §1.6: Discussion threads → `notifyAmendmentCommentAdded` (extended function signatures with optional notification context)
- §1.8: Change request voting → `notifyChangeRequestVoteCast` (new helper + type added)
- §3.4: Speaker list → `notifySpeakerListJoined` (new helper, extended hook with optional eventContext)
- §6.4: Create position → `notifyGroupPositionCreated` (new group-level helper)

### Completed Items (2026-02-15) — Phase 3 (Re-scan fixes)

- Editor InviteCollaboratorDialog → `notifyDocumentCollaboratorInvited` + `notifyBloggerInvited` (was missing in unified editor version)
- useEventParticipants → fixed silent bypass: now passes `senderId`, `eventTitle`, `userId` to `useEventMutations` calls
- EventParticipants.tsx → updated callers to pass `participant.user?.id` to accept/remove actions
- finalize-delegates API route → now passes `senderId` to `buildFinalizeDelegatesTransactions`
- TodoTimelineCard.tsx → `notifyStandaloneTodoAssigned` on self-assign (notifies todo creator)
- §1.8: Change request voting → `notifyChangeRequestVoteCast` (new helper + type added)
- §3.4: Speaker list → `notifySpeakerListJoined` (new helper, extended hook with optional eventContext)
- §6.4: Create position → `notifyGroupPositionCreated` (new group-level helper)

### Skipped Items

- §1.5: Amendment forwarding via process flow → already handled by voting-results.ts
- §1.7: Thread/comment voting → too noisy
- §2.4: Blog editor auto-save → intentionally skipped
- §2.7: Blog created → self-action, no subscribers yet
- §3.3: Election vote cast → too noisy, result notification exists
- §3.10/C4: Event reassignment → already handled by useCancelEvent caller
- §5.1: Statement created → no recipient/subscriber system
- §5.2: User profile → self-action
- §6.6: Standalone document → self-action

---

## Architecture Overview

### How notifications work today

1. **Helper functions** in `src/utils/notification-helpers.ts` (e.g. `notifyMembershipApproved()`) return an array of InstantDB transaction objects.
2. The caller **spreads** those transactions into the main `db.transact([...mainTxs, ...notificationTxs])` call.
3. `createNotification()` also fire-and-forgets a push notification via `POST /api/push/send`.

### How to add a missing notification

1. If the helper **already exists** in `notification-helpers.ts`, import and call it.
2. If the helper **does not exist yet**, create it following the existing pattern (see `createNotification`).
3. Add the notification type to `NotificationType` in both:
   - `src/utils/notification-helpers.ts`
   - `src/features/notifications/types/notification.types.ts`
4. Spread the returned transactions into the existing `db.transact()` call.

### Parallelization strategy for subagents

Each numbered section below is **independent** and can be worked on by a separate subagent in parallel. The sections are organized by feature folder so there are no cross-file conflicts:

| Subagent | Scope (folder)                                                           | Sections       |
| -------- | ------------------------------------------------------------------------ | -------------- |
| **A**    | `src/features/amendments/`                                               | §1             |
| **B**    | `src/features/blogs/`                                                    | §2             |
| **C**    | `src/features/events/`                                                   | §3             |
| **D**    | `src/features/groups/`                                                   | §4             |
| **E**    | `src/features/user/` + `src/features/statements/` + `src/features/meet/` | §5             |
| **F**    | `app/create/` + `app/group/` + `app/editor/`                             | §6             |
| **G**    | `src/utils/notification-helpers.ts` (new helpers only)                   | §0 — run FIRST |

**Subagent G must run first** to create any new helper functions that other subagents will import. Alternatively, each subagent can create its own helpers inline and a final cleanup agent merges them.

---

## §0. New Notification Helpers Required (Subagent G — run first)

These helpers **do not exist yet** in `src/utils/notification-helpers.ts` and must be created before the other subagents can import them.

- [ ] `notifyAmendmentProfileUpdated({ senderId, amendmentId, amendmentTitle })` — notify collaborators when amendment profile is edited
- [ ] `notifyAmendmentCloned({ senderId, senderName, amendmentId, amendmentTitle, cloneId })` — notify original amendment collaborators
- [ ] `notifyAmendmentTargetSet({ senderId, amendmentId, amendmentTitle, groupId, groupName })` — notify collaborators when target group/event is set
- [ ] `notifyAmendmentSupportVote({ senderId, senderName, amendmentId, amendmentTitle })` — notify amendment owner of support vote
- [ ] `notifyAmendmentCommentAdded({ senderId, senderName, amendmentId, amendmentTitle, threadId })` — notify collaborators of new discussion thread/comment
- [ ] `notifyBlogSupportVote({ senderId, senderName, blogId, blogTitle })` — notify blog owner of support vote
- [ ] `notifyBlogDeleted({ senderId, blogId, blogTitle })` — notify bloggers when blog is deleted
- [ ] `notifyBlogPublished({ senderId, blogId, blogTitle })` — notify subscribers when blog is published/updated
- [ ] `notifyEventCandidateAdded({ senderId, senderName, eventId, eventTitle, electionId })` — notify event organizers when a user self-nominates as candidate
- [ ] `notifyEventScheduleChanged({ senderId, eventId, eventTitle })` — notify participants when event schedule/details change (already in types, need helper)
- [ ] `notifyGroupProfileUpdated({ senderId, groupId, groupName })` — notify group members when profile is updated
- [ ] `notifyEventProfileUpdated({ senderId, eventId, eventTitle })` — notify participants when event profile is updated
- [ ] `notifyElectionVoteCast({ senderId, electionId, eventId, eventTitle })` — notify election candidates/organizers of votes (optional, may be too noisy)
- [ ] `notifyChangeRequestVoteCast({ senderId, changeRequestId, amendmentId })` — notify change request author of vote (optional, may be too noisy)
- [ ] `notifyAmendmentRejected({ amendmentId, amendmentTitle, groupId, groupName })` — notify collaborators when amendment is rejected at vote (referenced by TODO in `voting-results.ts`)
- [ ] `notifyStatementCreated({ senderId, statementId, tag })` — notify followers of a new statement (optional)
- [ ] `notifyGroupEventCreatedToMembers({ senderId, groupId, groupName, eventId, eventTitle })` — ensure group members (not just admins) are notified of new events
- [ ] `notifyPaymentDeleted({ senderId, groupId, groupName, paymentDescription })` — separate from `notifyPaymentCreated` for deletion (currently reuses create helper with "Deleted:" prefix)

Also add any missing types to both `NotificationType` unions.

---

## §1. Amendments — Missing Notifications (Subagent A)

### Files: `src/features/amendments/`

#### 1.1 Support Voting (AmendmentWiki.tsx)

**File:** `src/features/amendments/AmendmentWiki.tsx` (lines ~217–260)
**Transaction:** `amendmentSupportVotes` create/update/delete + `amendments` update (upvotes/downvotes)
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyAmendmentSupportVote` after support vote transaction
- [ ] Notify amendment owner/collaborators that someone voted on their amendment

#### 1.2 Clone Amendment (AmendmentWiki.tsx)

**File:** `src/features/amendments/AmendmentWiki.tsx` (lines ~456–553)
**Transaction:** Creates cloned amendment, document, collaborator, path, agenda items, amendment votes
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyAmendmentCloned` to notify original amendment collaborators

#### 1.3 Amendment Profile Update (AmendmentEditContent.tsx)

**File:** `src/features/amendments/ui/AmendmentEditContent.tsx` (line ~158)
**Transaction:** Updates amendment title, subtitle, tags, image, video, etc.
**Current state:** ❌ No notification (only timeline events)
**Action:**

- [ ] Import and call `notifyAmendmentProfileUpdated` to notify collaborators

#### 1.4 Amendment Target Set/Changed (AmendmentProcessFlow.tsx)

**File:** `src/features/amendments/ui/AmendmentProcessFlow.tsx` (lines ~454, ~506, ~603)
**Transaction:** Sets/updates target group and event, creates path segments with agenda items
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyAmendmentTargetSet` to notify collaborators when target is set/changed

#### 1.5 Amendment Forwarding via Process Flow (AmendmentProcessFlow.tsx)

**File:** `src/features/amendments/ui/AmendmentProcessFlow.tsx` (line ~914)
**Transaction:** Forward amendment to group/event
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyAmendmentForwarded` (already exists) for forwarding via process flow

#### 1.6 Discussion Thread/Comment Created (thread-operations.ts)

**File:** `src/features/amendments/discussions/utils/thread-operations.ts` (lines 39, 69)
**Transaction:** Creates thread or comment on amendment
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyAmendmentCommentAdded` to notify collaborators of new threads and comments
- [ ] Need to pass `userId` and amendment context to the notification helper

#### 1.7 Thread/Comment Voting (voting-utils.ts)

**File:** `src/features/amendments/utils/voting-utils.ts` (lines ~48–148)
**Transaction:** Thread votes and comment votes (up/down)
**Current state:** ❌ No notification
**Decision:** ⚠️ **OPTIONAL** — Thread/comment votes may be too noisy for notifications. Consider skipping or adding as a user-configurable setting.

#### 1.8 Change Request Voting (VoteControls.tsx)

**File:** `src/features/amendments/ui/VoteControls.tsx` (lines ~98, ~123)
**Transaction:** Vote on change requests (internal voting)
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyChangeRequestVoteCast` to notify change request author (optional, evaluate noise level)

#### 1.9 Amendment Rejected at Vote (voting-results.ts)

**File:** `src/features/amendments/utils/voting-results.ts` (line ~123)
**Transaction:** Amendment changes to rejected status
**Current state:** ❌ Has explicit TODO comment: `// TODO: Add notification when notifyAmendmentRejected is created`
**Action:**

- [ ] Create `notifyAmendmentRejected` helper
- [ ] Call it when amendment is rejected

---

## §2. Blogs — Missing Notifications (Subagent B)

### Files: `src/features/blogs/`

#### 2.1 Blog Support Voting (BlogDetail.tsx)

**File:** `src/features/blogs/ui/BlogDetail.tsx` (lines ~291–330)
**Transaction:** `blogSupportVotes` create/update/delete + `blogs` update
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyBlogSupportVote` to notify blog owner

#### 2.2 Blog Comment Voting (BlogDetail.tsx)

**File:** `src/features/blogs/ui/BlogDetail.tsx` (lines ~87–100)
**Transaction:** `commentVotes` create/update/delete
**Current state:** ❌ No notification
**Decision:** ⚠️ **OPTIONAL** — Comment votes may be too noisy

#### 2.3 Blog Deleted (BlogDetail.tsx)

**File:** `src/features/blogs/ui/BlogDetail.tsx` (line ~395)
**Transaction:** `blogs[blogId].delete()`
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyBlogDeleted` to notify bloggers

#### 2.4 Blog Content Save (BlogEditor.tsx)

**File:** `src/features/blogs/ui/BlogEditor.tsx` (line ~39)
**Transaction:** `blogs[blogId].update({ content, updatedAt })`
**Current state:** ❌ No notification
**Decision:** ⚠️ **SKIP** — Auto-save content updates should not trigger notifications

#### 2.5 Blog Published/Updated (useBlogUpdate.ts)

**File:** `src/features/blogs/hooks/useBlogUpdate.ts` (lines ~111, ~136)
**Transaction:** Updates blog title, description, visibility, hashtags
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyBlogPublished` when visibility changes to public or blog is significantly updated

#### 2.6 Blog Mode Changed (ModeSelector.tsx)

**File:** `src/features/blogs/ui/ModeSelector.tsx` (line ~78)
**Transaction:** `blogs[blogId].update({ editingMode })`
**Current state:** ❌ No notification
**Decision:** ⚠️ **SKIP** — Mode changes are editor-level actions, not notification-worthy

#### 2.7 Blog Created (CreateBlogForm.tsx)

**File:** `src/features/blogs/ui/CreateBlogForm.tsx` (line ~162)
**Transaction:** Creates blog with hashtags and timeline events
**Current state:** ❌ No notification to followers/subscribers
**Decision:** ⚠️ **OPTIONAL** — Could notify followers of the author that a new blog was created

---

## §3. Events — Missing Notifications (Subagent C)

### Files: `src/features/events/`

#### 3.1 Election Candidate Self-Nomination (EventWiki.tsx)

**File:** `src/features/events/EventWiki.tsx` (line ~201)
**Transaction:** Creates `electionCandidates` entry
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyEventCandidateAdded` to notify event organizers

#### 3.2 Election Candidate Self-Nomination (EventAgendaItemDetail.tsx)

**File:** `src/features/events/ui/EventAgendaItemDetail.tsx` (lines ~212, ~255)
**Transaction:** Creates/deletes `electionCandidates` entry from agenda item detail
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyEventCandidateAdded` when candidate is added

#### 3.3 Election Vote Cast (useVoting.ts)

**File:** `src/features/events/hooks/useVoting.ts` (lines ~15–90)
**Transaction:** Creates/updates/deletes `electionVotes` and `amendmentVoteEntries`
**Current state:** ❌ No notification
**Decision:** ⚠️ **OPTIONAL** — Individual votes during active voting may be too noisy. The voting _result_ is already notified.

#### 3.4 Speaker List Add/Remove (useSpeakerList.ts)

**File:** `src/features/events/hooks/useSpeakerList.ts` (lines ~18, ~44)
**Transaction:** Creates/deletes `speakerList` entries
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifySpeakerAdded` to notify event organizers (create helper if needed)
- [ ] May be too noisy — consider as optional

#### 3.5 Event Stream Voting (useEventStream.ts)

**File:** `src/features/events/hooks/useEventStream.ts` (lines ~104–218)
**Transaction:** Speaker list and election/amendment voting within live stream
**Current state:** ❌ No notification
**Decision:** ⚠️ **SKIP** — These are real-time voting actions during a live event stream, participants are already watching

#### 3.6 Agenda Item Reordering (useAgendaNavigation.ts, agenda parts)

**File:** `src/features/events/hooks/useAgendaNavigation.ts` (lines ~139, ~225)
**Transaction:** Updates agenda item positions/ordering
**Current state:** ✅ Already calls `notifyAgendaItemActivated` for item activation
**Decision:** Reordering itself doesn't need notification. Already covered.

#### 3.7 Event Position Create/Delete (useEventPositions.ts)

**File:** `src/features/events/hooks/useEventPositions.ts` (lines ~101, ~127, ~160)
**Transaction:** Creates/deletes event positions
**Current state:** ✅ Already imports `notifyEventPositionCreated` and `notifyEventPositionDeleted`

#### 3.8 Event Schedule Changed (various event update paths)

**Current state:** The notification type `event_schedule_changed` exists in type definitions, but:

- [ ] Verify `notifyEventScheduleChanged` helper exists and is called when event time/date is changed

#### 3.9 Revote Scheduling (revote-scheduling.ts)

**File:** `src/features/events/utils/revote-scheduling.ts` (lines ~79–231)
**Current state:** ✅ Already calls `notifyRevoteScheduled`

#### 3.10 Event Reassignment (event-reassignment.ts)

**File:** `src/features/events/utils/event-reassignment.ts` (lines ~199, ~213)
**Transaction:** Reassigns agenda items between events
**Current state:** ❌ No notification (but `notifyAgendaItemsReassigned` exists in `useCancelEvent`)
**Action:**

- [ ] Import and call `notifyAgendaItemsReassigned` when agenda items are reassigned

---

## §4. Groups — Missing Notifications (Subagent D)

### Files: `src/features/groups/`

#### 4.1 Group Profile Update (useGroupUpdate.ts)

**File:** `src/features/groups/hooks/useGroupUpdate.ts` (line ~176)
**Transaction:** Updates group name, description, location, social media, image
**Current state:** ❌ No notification (only timeline)
**Action:**

- [ ] Import and call `notifyGroupProfileUpdated` to notify group members

#### 4.2 Group Document Editor Save (useDocumentEditor.ts)

**File:** `src/features/groups/hooks/useDocumentEditor.ts` (lines ~116, ~142, ~166)
**Transaction:** Saves/updates group document content
**Current state:** ❌ No notification
**Decision:** ⚠️ **SKIP** — Auto-save content updates should not trigger notifications

#### 4.3 Group Payment Deleted (useGroupPayments.ts)

**File:** `src/features/groups/hooks/useGroupPayments.ts` (line ~123)
**Transaction:** Deletes a payment
**Current state:** ⚠️ Uses `notifyPaymentCreated` with "Deleted:" prefix (hacky)
**Action:**

- [ ] Create `notifyPaymentDeleted` helper and use it instead

#### 4.4 Group Todo Deleted (useGroupTodos.ts)

**File:** `src/features/groups/hooks/useGroupTodos.ts` (line ~191)
**Transaction:** Deletes a todo
**Current state:** ✅ Already calls `notifyTodoUpdated` — but could use a more specific `notifyTodoDeleted`
**Decision:** Already covered, minor improvement possible

---

## §5. User / Statements / Meet — Missing Notifications (Subagent E)

### Files: `src/features/user/`, `src/features/statements/`, `src/features/meet/`

#### 5.1 User Profile Update (useUserMutations.ts)

**File:** `src/features/user/hooks/useUserMutations.ts` (lines ~39, ~67, ~116, ~223)
**Transaction:** Updates user name, bio, avatar, hashtags, meeting availability
**Current state:** ❌ No notification
**Decision:** ⚠️ **SKIP** — Users editing their own profile don't need to be notified

#### 5.2 User Meeting Scheduler — Slot Management (UserMeetingScheduler.tsx)

**File:** `src/features/user/ui/UserMeetingScheduler.tsx` (lines ~197, ~259, ~268, ~389)
**Transaction:** Creates/updates/deletes meeting slots and bookings
**Current state:** ❌ No notification for meeting slot changes
**Decision:** Bookings already notify via `useMeetingBooking.ts`. Slot management is self-service — **SKIP**

#### 5.3 Statement Created/Updated/Deleted (useStatementData.ts)

**File:** `src/features/statements/hooks/useStatementData.ts` (lines ~73, ~120, ~138)
**Transaction:** Creates/updates/deletes statements
**Current state:** ❌ No notification
**Action:**

- [ ] **OPTIONAL**: Import and call `notifyStatementCreated` to notify followers when a public statement is posted

#### 5.4 User Subscription Management (useUserSubscriptions.ts)

**File:** `src/features/user/hooks/useUserSubscriptions.ts` (lines ~58, ~73)
**Transaction:** Deletes subscriptions (unsubscribe)
**Current state:** ❌ No notification
**Decision:** ⚠️ **SKIP** — Unsubscribing is a user's own action, no notification needed

---

## §6. App-Level Pages — Missing Notifications (Subagent F)

### Files: `app/create/`, `app/group/`, `app/editor/`

#### 6.1 Create Amendment Page (app/create/amendment/page.tsx)

**File:** `app/create/amendment/page.tsx` (line ~335)
**Transaction:** Creates amendment with collaborator, roles, document, hashtags, timeline
**Current state:** ❌ No notification
**Decision:** ⚠️ **LOW PRIORITY** — Amendment creation is a self-action. But if linked to a group, the group could be notified (`group_new_amendment`).

- [ ] If amendment is linked to a target group, call `notifyGroupNewAmendment` (helper may need creation)

#### 6.2 Create Event Page (app/create/event/page.tsx)

**File:** `app/create/event/page.tsx` (line ~427)
**Transaction:** Creates event with participants, roles, delegates, timeline
**Current state:** ✅ Imports `notifyGroupEventCreated` — already notifies group

#### 6.3 Create Election Candidate (app/create/election-candidate/page.tsx)

**File:** `app/create/election-candidate/page.tsx` (line ~106)
**Transaction:** Creates election candidate
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyEventCandidateAdded` to notify event organizers

#### 6.4 Create Position (app/create/position/page.tsx)

**File:** `app/create/position/page.tsx` (line ~86)
**Transaction:** Creates position
**Current state:** ❌ No notification (but position creation in useGroupPositions does notify)
**Action:**

- [ ] Import and call `notifyPositionCreated` (already exists)

#### 6.5 Group Network — Relationship Management (app/group/[id]/network/page.tsx)

**File:** `app/group/[id]/network/page.tsx` (lines ~215, ~238, ~254)
**Transaction:** Accepts/rejects/removes group relationships
**Current state:** ❌ No notification
**Action:**

- [ ] Import and call `notifyGroupRelationshipApproved` / `notifyGroupRelationshipRejected` (check if helpers exist)

#### 6.6 Standalone Document Creation (app/editor/page.tsx)

**File:** `app/editor/page.tsx` (line ~60)
**Transaction:** Creates standalone document
**Current state:** ❌ No notification
**Decision:** ⚠️ **SKIP** — Self-action, no one to notify initially

---

## Already Working ✅ (No action needed)

These transactions already have proper notification integrations:

| File                                       | Transaction                                                                      | Notification                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `useGroupMutations.ts`                     | Invite, approve, reject, remove member, promote/demote admin, create/delete role | ✅ All covered                                                   |
| `useGroupMembership.ts`                    | Request join                                                                     | ✅ `notifyMembershipRequest`                                     |
| `useGroupLinks.ts`                         | Add/remove link                                                                  | ✅ `notifyLinkAdded/Removed`                                     |
| `useGroupTodos.ts`                         | Create/update/complete todo                                                      | ✅ `notifyTodoAssigned/Updated/Completed`                        |
| `useGroupPositions.ts`                     | Create/delete position, assign, vacate, election                                 | ✅ All covered                                                   |
| `useGroupPayments.ts`                      | Create payment                                                                   | ✅ `notifyPaymentCreated`                                        |
| `useDocumentMutations.ts`                  | Create/delete document                                                           | ✅ `notifyDocumentCreated/Deleted`                               |
| `useSubscribeGroup.ts`                     | Subscribe                                                                        | ✅ `notifyGroupNewSubscriber`                                    |
| `useRoleManagement.ts`                     | Update action rights                                                             | ✅ `notifyActionRightsChanged`                                   |
| `useEventMutations.ts`                     | Invite, approve, reject, remove, promote                                         | ✅ All covered                                                   |
| `useEventParticipation.ts`                 | Request participation                                                            | ✅ `notifyParticipationRequest`                                  |
| `useSubscribeEvent.ts`                     | Subscribe                                                                        | ✅ `notifyEventNewSubscriber`                                    |
| `useAgendaItemMutations.ts`                | Delete/transfer agenda item                                                      | ✅ `notifyAgendaItemDeleted/Transferred`                         |
| `CreateAgendaItemForm.tsx`                 | Create agenda item                                                               | ✅ `notifyAgendaItemCreated`                                     |
| `EventAgendaItemDetail.tsx`                | Start/complete voting session                                                    | ✅ `notifyVotingSessionStarted/Completed`                        |
| `useEventVoting.ts`                        | Voting phase lifecycle                                                           | ✅ `notifyVotingPhaseStarted/Completed/Forwarded/ElectionResult` |
| `useAgendaNavigation.ts`                   | Activate agenda item                                                             | ✅ `notifyAgendaItemActivated`                                   |
| `useElectionVoting.ts`                     | Position assigned after election                                                 | ✅ `notifyPositionAssigned`                                      |
| `useChangeRequestVoting.ts`                | Accept/reject change request                                                     | ✅ `notifyChangeRequestAccepted/Rejected`                        |
| `useCancelEvent.ts`                        | Cancel event                                                                     | ✅ `notifyEventCancelled/AgendaItemsReassigned/RevoteScheduled`  |
| `useEventPositions.ts`                     | Create/delete event position                                                     | ✅ `notifyEventPositionCreated/Deleted`                          |
| `revote-scheduling.ts`                     | Schedule revote                                                                  | ✅ `notifyRevoteScheduled`                                       |
| `useAmendmentCollaboration.ts`             | Request collaboration                                                            | ✅ `notifyCollaborationRequest`                                  |
| `collaborator-operations.ts`               | Invite, approve, reject, remove, role change                                     | ✅ All covered                                                   |
| `useAmendmentWorkflow.ts`                  | Workflow status change                                                           | ✅ `notifyWorkflowChanged`                                       |
| `useSubscribeAmendment.ts`                 | Subscribe                                                                        | ✅ `notifyAmendmentNewSubscriber`                                |
| `VersionControl.tsx` (amendments)          | Create version                                                                   | ✅ `notifyVersionCreated`                                        |
| `document-operations.ts`                   | Accept/reject change request                                                     | ✅ `notifyChangeRequestAccepted/Rejected`                        |
| `useSupportConfirmation.ts`                | Support confirmed/declined                                                       | ✅ `notifySupportConfirmed/Declined`                             |
| `voting-results.ts`                        | Amendment forwarded                                                              | ✅ `notifyAmendmentForwarded`                                    |
| `BlogBloggersManager.tsx`                  | Invite, role change, remove, create/delete role                                  | ✅ All covered                                                   |
| `BlogDetail.tsx`                           | Comment added                                                                    | ✅ `notifyBlogCommentAdded`                                      |
| `useSubscribeBlog.ts`                      | Subscribe                                                                        | ✅ `notifyBlogNewSubscriber`                                     |
| `useFollowUser.ts`                         | Follow user                                                                      | ✅ `notifyNewFollower`                                           |
| `useSubscribeUser.ts`                      | Subscribe to user                                                                | ✅ `notifyNewFollower`                                           |
| `useMeetingBooking.ts`                     | Book/cancel meeting                                                              | ✅ `notifyMeetingBooked/Cancelled`                               |
| `useMessageMutations.ts`                   | Send message, request/accept conversation                                        | ✅ All covered                                                   |
| `useUserMemberships.ts`                    | All accept/decline/withdraw/leave                                                | ✅ All covered (Phase 12.4)                                      |
| `useOnboarding.ts`                         | Membership request                                                               | ✅ `notifyMembershipRequest`                                     |
| `InviteCollaboratorDialog.tsx` (documents) | Invite collaborator                                                              | ✅ `notifyDocumentCollaboratorInvited`                           |
| `useTodoData.ts`                           | Create/complete/delete standalone todo                                           | ✅ `notifyStandaloneTodoAssigned/Completed/Deleted`              |
| `app/create/group/page.tsx`                | Relationship request                                                             | ✅ `notifyRelationshipRequested`                                 |
| `app/create/event/page.tsx`                | Create event for group                                                           | ✅ `notifyGroupEventCreated`                                     |

---

## Priority Assessment

### HIGH Priority (user-facing gaps, admin visibility)

- [ ] §1.6 — Discussion threads/comments with no notification
- [ ] §1.9 — Amendment rejected (has explicit TODO)
- [ ] §3.1/3.2/6.3 — Election candidate self-nomination not notified
- [ ] §4.1 — Group profile update not notified
- [ ] §6.5 — Group relationship accept/reject not notified

### MEDIUM Priority (stakeholder visibility)

- [ ] §1.1 — Amendment support voting
- [ ] §1.2 — Amendment cloning
- [ ] §1.4 — Amendment target set/changed
- [ ] §2.1 — Blog support voting
- [ ] §2.3 — Blog deleted
- [ ] §2.5 — Blog published/updated
- [ ] §3.10 — Event reassignment
- [ ] §4.3 — Group payment deletion (fix hacky implementation)
- [ ] §6.1 — Amendment creation linked to group
- [ ] §6.4 — Position creation from create page

### LOW Priority / Optional

- [ ] §1.5 — Amendment forwarding via process flow (may already be covered)
- [ ] §1.7 — Thread/comment voting (likely too noisy)
- [ ] §1.8 — Change request voting (evaluate noise)
- [ ] §2.2 — Blog comment voting (too noisy)
- [ ] §2.7 — Blog created (notify followers)
- [ ] §3.3 — Election vote cast (too noisy)
- [ ] §3.4 — Speaker list add/remove
- [ ] §3.8 — Event schedule changed (verify)
- [ ] §5.3 — Statement created (notify followers)

---

## Summary

| Section | Scope                   | Tasks | Priority Mix         |
| ------- | ----------------------- | ----- | -------------------- |
| §0      | New helpers (run first) | ~18   | Prerequisite         |
| §1      | Amendments              | 9     | 3 HIGH, 3 MED, 3 LOW |
| §2      | Blogs                   | 5     | 0 HIGH, 3 MED, 2 LOW |
| §3      | Events                  | 5     | 2 HIGH, 1 MED, 2 LOW |
| §4      | Groups                  | 2     | 1 HIGH, 1 MED        |
| §5      | User/Statements/Meet    | 1     | 1 LOW                |
| §6      | App pages               | 5     | 2 HIGH, 3 MED        |

---

## Notes

- **Version control / editor saves** (VersionControl, BlogEditor, DocumentEditor) should NOT generate notifications when content is auto-saved — only on explicit version creation (already handled).
- **Voting during live events** (useEventStream, useVoting) should NOT generate individual vote notifications — the result notification (already implemented) is sufficient.
- **Self-actions** (user profile updates, creating own documents, subscribing) generally don't need notifications.
- **The `notifyPaymentCreated` reuse for deletion** in `useGroupPayments.ts` (line ~123) is a code smell — should use a dedicated `notifyPaymentDeleted` helper.
- **The explicit TODO** in `voting-results.ts` (line ~123) for `notifyAmendmentRejected` has been pending since the initial implementation.
- **i18n**: All notification titles and messages should use i18n keys, but the current pattern uses hardcoded English strings in helpers. This is a known tech debt.
