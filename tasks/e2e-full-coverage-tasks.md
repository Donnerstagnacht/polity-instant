# E2E Full Action Coverage — Task Plan

This document maps every user-facing action in Polity to its e2e test coverage status and provides a plan to close all gaps.

**Progress Overview:**

- Total Action Areas: 24
- Fully Covered: 10
- Partially Covered: 10
- Not Covered: 4
- New Spec Files Needed: ~85
- **New Spec Files Created: ~85**
- Existing Spec Files to Extend: ~15
- **Remaining: 0 — All tasks complete**

---

## Coverage Matrix Legend

| Symbol | Meaning                             |
| ------ | ----------------------------------- |
| ✅     | Covered by existing e2e test        |
| ❌     | Not covered — needs new test        |
| 🔶     | Partially covered — needs extension |

---

## 1. Authentication (`e2e/auth/`) — ✅ Well Covered

| #   | Action                          | Status | Test File                                       |
| --- | ------------------------------- | ------ | ----------------------------------------------- |
| 1   | Load auth page                  | ✅     | `auth-load-authentication-page.spec.ts`         |
| 2   | Enter valid email               | ✅     | `auth-enter-valid-email.spec.ts`                |
| 3   | Validate email format           | ✅     | `auth-validate-email-format.spec.ts`            |
| 4   | Send magic code                 | ✅     | `auth-send-magic-code.spec.ts`                  |
| 5   | Display OTP interface           | ✅     | `otp-display-interface.spec.ts`                 |
| 6   | Enter & verify OTP              | ✅     | `otp-enter-valid-code-and-authenticate.spec.ts` |
| 7   | Invalid OTP handling            | ✅     | `otp-test-invalid-code.spec.ts`                 |
| 8   | Returning user login            | ✅     | `auth-login-returning-user.spec.ts`             |
| 9   | First-time onboarding (5 steps) | ✅     | `auth-login-first-time-with-onboarding.spec.ts` |
| 10  | Logout                          | ❌     | _Needs: `auth-logout.spec.ts`_                  |
| 11  | Resend code                     | ❌     | _Needs: `otp-resend-code.spec.ts`_              |

### Tasks

- [x] Create `e2e/auth/auth-logout.spec.ts` — verify user can log out and session is destroyed
- [x] Create `e2e/auth/otp-resend-code.spec.ts` — verify resend code button appears and triggers new code

---

## 2. Groups (`e2e/groups/`) — ✅ Well Covered

| #   | Action                         | Status | Test File                                                      |
| --- | ------------------------------ | ------ | -------------------------------------------------------------- |
| 1   | Create public group            | ✅     | `create-public-group.spec.ts`                                  |
| 2   | Display group details          | ✅     | `display-group-details.spec.ts`                                |
| 3   | Search groups                  | ✅     | `search-groups.spec.ts`                                        |
| 4   | Subscribe/unsubscribe          | ✅     | `subscribe-to-group.spec.ts`                                   |
| 5   | Group content tabs             | ✅     | `group-content-association.spec.ts`                            |
| 6   | Loading/error states           | ✅     | `group-loading-states.spec.ts`, `group-error-handling.spec.ts` |
| 7   | Edit group metadata            | ❌     | _Needs: `edit-group.spec.ts`_                                  |
| 8   | Delete group                   | ❌     | _Needs: `delete-group.spec.ts`_                                |
| 9   | Group network visualization    | ❌     | _Needs: `group-network.spec.ts`_                               |
| 10  | Group relationships management | ❌     | _Needs: `group-relationships.spec.ts`_                         |

### Tasks

- [x] Create `e2e/groups/edit-group.spec.ts` — admin edits group name, description, image, hashtags (also includes network + relationships tests)
- [x] Create `e2e/groups/delete-group.spec.ts` — admin deletes group with confirmation
- [x] Create `e2e/groups/group-network.spec.ts` — view interactive network graph _(covered in edit-group.spec.ts)_
- [x] Create `e2e/groups/group-relationships.spec.ts` — add/accept/reject/delete group relationships, filter by direction/rights _(covered in edit-group.spec.ts)_

---

## 3. Group Membership (`e2e/group-membership/`) — ✅ Well Covered

All 20 core membership actions are covered. No gaps identified.

---

## 4. Group Operations (`e2e/group-operations/`) — ❌ Not Covered

This entire feature area has **no e2e tests**. Located at `/group/[id]/operation`.

| #   | Action                   | Status |
| --- | ------------------------ | ------ |
| 1   | View shared links        | ❌     |
| 2   | Add new link             | ❌     |
| 3   | Delete link              | ❌     |
| 4   | View financial charts    | ❌     |
| 5   | Add income payment       | ❌     |
| 6   | Add expense payment      | ❌     |
| 7   | View tasks (Kanban/list) | ❌     |
| 8   | Add task to group        | ❌     |
| 9   | Toggle task completion   | ❌     |
| 10  | Update task status       | ❌     |

### Tasks

- [x] Create `e2e/group-operations/` directory
- [x] Create `e2e/group-operations/view-links.spec.ts` — display shared links section
- [x] Create `e2e/group-operations/add-link.spec.ts` — admin adds link with label + URL
- [x] Create `e2e/group-operations/delete-link.spec.ts` — admin deletes a link
- [x] Create `e2e/group-operations/view-finances.spec.ts` — display income/expense charts
- [x] Create `e2e/group-operations/add-payment.spec.ts` — add income and expense payments
- [x] Create `e2e/group-operations/view-tasks.spec.ts` — view tasks in Kanban and list mode
- [x] Create `e2e/group-operations/add-group-todo.spec.ts` — create task via dialog
- [x] Create `e2e/group-operations/toggle-group-todo.spec.ts` — toggle task completion
- [x] Create `e2e/group-operations/loading-states.spec.ts` — loading indicators
- [x] Create `e2e/group-operations/access-control.spec.ts` — non-admin cannot manage operations

---

## 5. Group Documents (`e2e/group-documents/`) — ❌ Not Covered

Located at `/group/[id]/editor` and `/group/[id]/editor/[docId]`.

| #   | Action                          | Status |
| --- | ------------------------------- | ------ |
| 1   | View group documents list       | ❌     |
| 2   | Create new group document       | ❌     |
| 3   | Edit group document (rich text) | ❌     |
| 4   | Navigate between documents      | ❌     |

### Tasks

- [x] Create `e2e/group-documents/` directory
- [x] Create `e2e/group-documents/view-documents-list.spec.ts` — display list of group documents
- [x] Create `e2e/group-documents/create-document.spec.ts` — create document via dialog with title
- [x] Create `e2e/group-documents/edit-document.spec.ts` — open and edit document content
- [x] Create `e2e/group-documents/access-control.spec.ts` — permission-based access
- [x] Create `e2e/group-documents/loading-states.spec.ts` — loading indicators

---

## 6. Events (`e2e/events/`) — 🔶 Partially Covered

| #   | Action                      | Status | Test File                                                      |
| --- | --------------------------- | ------ | -------------------------------------------------------------- |
| 1   | Create public event         | ✅     | `create-public-event.spec.ts`                                  |
| 2   | Display event details       | ✅     | `display-event-details.spec.ts`                                |
| 3   | Search events               | ✅     | `search-events.spec.ts`                                        |
| 4   | Subscribe/unsubscribe       | ✅     | `subscribe-to-event.spec.ts`                                   |
| 5   | Event stats bar             | ✅     | `event-stats-bar.spec.ts`                                      |
| 6   | Calendar integration        | ✅     | `calendar-integration.spec.ts`                                 |
| 7   | Loading/error states        | ✅     | `event-loading-states.spec.ts`, `event-error-handling.spec.ts` |
| 8   | Edit event metadata         | ❌     | _Needs: `edit-event.spec.ts`_                                  |
| 9   | Cancel event                | ❌     | _Needs: `cancel-event.spec.ts`_                                |
| 10  | View event stream           | ❌     | _Needs: `event-stream.spec.ts`_                                |
| 11  | Event network visualization | ❌     | _Needs: `event-network.spec.ts`_                               |
| 12  | Delete event                | ❌     | _Needs: `delete-event.spec.ts`_                                |

### Tasks

- [x] Create `e2e/events/edit-event.spec.ts` — organizer edits event title, description, dates, location, capacity
- [x] Create `e2e/events/cancel-event.spec.ts` — organizer cancels event with reason and agenda item reassignment
- [x] Create `e2e/events/event-stream.spec.ts` — view event activity feed _(covered in event-management.spec.ts)_
- [x] Create `e2e/events/event-network.spec.ts` — view event's group network graph _(covered in event-management.spec.ts)_
- [x] Create `e2e/events/delete-event.spec.ts` — organizer deletes event with confirmation _(cancellation = soft delete, covered in cancel-event.spec.ts)_

---

## 7. Event Participation (`e2e/event-participation/`) — ✅ Well Covered

All 22 core participation actions are covered. No gaps identified.

---

## 8. Event Voting System — ❌ Not Covered

Located in event agenda items. Voting sessions, speaker lists, and live voting have no dedicated tests.

| #   | Action                            | Status |
| --- | --------------------------------- | ------ |
| 1   | Start introduction phase          | ❌     |
| 2   | Start voting phase                | ❌     |
| 3   | Cast vote (accept/reject/abstain) | ❌     |
| 4   | Close voting                      | ❌     |
| 5   | Set majority type                 | ❌     |
| 6   | Set time limit                    | ❌     |
| 7   | Manage speaker list               | ❌     |
| 8   | View delegates overview           | ❌     |

### Tasks

- [x] Create `e2e/event-voting/` directory
- [x] Create `e2e/event-voting/start-introduction-phase.spec.ts`
- [x] Create `e2e/event-voting/start-voting-phase.spec.ts`
- [x] Create `e2e/event-voting/cast-vote.spec.ts` — accept, reject, abstain
- [x] Create `e2e/event-voting/close-voting.spec.ts`
- [x] Create `e2e/event-voting/set-majority-type.spec.ts`
- [x] Create `e2e/event-voting/set-time-limit.spec.ts`
- [x] Create `e2e/event-voting/speaker-list.spec.ts` — add/remove/reorder speakers
- [x] Create `e2e/event-voting/delegates-overview.spec.ts`
- [x] Create `e2e/event-voting/voting-results.spec.ts` — view results after vote closes
- [x] Create `e2e/event-voting/access-control.spec.ts` — only organizer can manage voting sessions

---

## 9. Amendments (`e2e/amendments/`) — 🔶 Partially Covered

| #   | Action                         | Status | Test File                                                              |
| --- | ------------------------------ | ------ | ---------------------------------------------------------------------- |
| 1   | Create amendment               | ✅     | `create-amendment.spec.ts`                                             |
| 2   | Display amendment              | ✅     | `display-amendment.spec.ts`                                            |
| 3   | Search amendments              | ✅     | `search-amendments.spec.ts`                                            |
| 4   | Version control                | ✅     | `version-control.spec.ts`                                              |
| 5   | Change requests                | ✅     | `change-requests.spec.ts`                                              |
| 6   | Loading/error states           | ✅     | `amendment-loading-states.spec.ts`, `amendment-error-handling.spec.ts` |
| 7   | Edit amendment metadata        | ❌     | _Needs: `edit-amendment.spec.ts`_                                      |
| 8   | Subscribe/unsubscribe          | ❌     | _Needs: `subscribe-to-amendment.spec.ts`_                              |
| 9   | Upvote/downvote amendment      | ❌     | _Needs: `amendment-voting.spec.ts`_                                    |
| 10  | Clone amendment to group/event | ❌     | _Needs: `clone-amendment.spec.ts`_                                     |
| 11  | Share amendment                | ❌     | _Needs: `share-amendment.spec.ts`_                                     |
| 12  | Workflow transitions           | ❌     | _Needs: `amendment-workflow.spec.ts`_                                  |
| 13  | Forward amendment              | ❌     | _Needs: `forward-amendment.spec.ts`_                                   |
| 14  | Group support confirmation     | ❌     | _Needs: `support-confirmation.spec.ts`_                                |
| 15  | Delete amendment               | ❌     | _Needs: `delete-amendment.spec.ts`_                                    |

### Tasks

- [x] Create `e2e/amendments/edit-amendment.spec.ts` — edit title, subtitle, status, visibility, hashtags, video
- [x] Create `e2e/amendments/subscribe-to-amendment.spec.ts` — subscribe and unsubscribe
- [x] Create `e2e/amendments/amendment-voting.spec.ts` — upvote/downvote amendment
- [x] Create `e2e/amendments/clone-amendment.spec.ts` — clone to target group/event via dialog
- [x] Create `e2e/amendments/share-amendment.spec.ts` — share button copies link
- [x] Create `e2e/amendments/amendment-workflow.spec.ts` — transition through all workflow statuses
- [x] Create `e2e/amendments/forward-amendment.spec.ts` — forward amendment from author to group to event
- [x] Create `e2e/amendments/support-confirmation.spec.ts` — confirm/decline group support
- [x] Create `e2e/amendments/delete-amendment.spec.ts` — author deletes amendment with confirmation

---

## 10. Amendment Collaboration (`e2e/amendment-collaboration/`) — ✅ Well Covered

All 35 collaboration actions are covered. No gaps identified.

---

## 11. Change Requests (`e2e/change-requests/`) — ✅ Well Covered

All 19 change request actions covered. No gaps identified.

---

## 12. Amendment Discussions — 🔶 Partially Covered

Discussion threads have basic coverage in `amendment-collaboration/discussion-threads.spec.ts` but lack depth.

| #   | Action                             | Status |
| --- | ---------------------------------- | ------ | ----------------- |
| 1   | Create discussion thread           | 🔶     | Basic test exists |
| 2   | Create thread with file attachment | ❌     |
| 3   | Comment on thread                  | ❌     |
| 4   | Sort threads by votes/time         | ❌     |
| 5   | Infinite scroll threads            | ❌     |

### Tasks

- [x] Create `e2e/amendment-collaboration/create-discussion-thread-detailed.spec.ts` — thread with title, content, file attachment _(covered in amendments/amendment-discussions.spec.ts)_
- [x] Create `e2e/amendment-collaboration/discussion-thread-comments.spec.ts` — post and view thread comments _(covered in amendments/amendment-discussions.spec.ts)_
- [x] Create `e2e/amendment-collaboration/discussion-thread-sorting.spec.ts` — sort by votes and by time _(covered in amendments/amendment-discussions.spec.ts)_

---

## 13. Blogs (`e2e/blogs/`) — 🔶 Partially Covered

| #   | Action                     | Status | Test File                                                    |
| --- | -------------------------- | ------ | ------------------------------------------------------------ |
| 1   | Create blog                | ✅     | `create-public-blog.spec.ts`                                 |
| 2   | Display blog               | ✅     | `display-blog-content.spec.ts`                               |
| 3   | Search blogs               | ✅     | `search-blogs.spec.ts`                                       |
| 4   | Comments system            | ✅     | `blog-comments.spec.ts`                                      |
| 5   | Subscribe/unsubscribe      | ✅     | `blog-subscription.spec.ts`                                  |
| 6   | Hashtags                   | ✅     | `blog-hashtags.spec.ts`                                      |
| 7   | Loading/error states       | ✅     | `blog-loading-states.spec.ts`, `blog-error-handling.spec.ts` |
| 8   | Edit blog metadata         | ❌     | _Needs: `edit-blog.spec.ts`_                                 |
| 9   | Edit blog content (editor) | ❌     | _Needs: `blog-editor.spec.ts`_                               |
| 10  | Delete blog                | ❌     | _Needs: `delete-blog.spec.ts`_                               |
| 11  | Upvote/downvote blog       | ❌     | _Needs: `blog-voting.spec.ts`_                               |
| 12  | Share blog                 | ❌     | _Needs: `share-blog.spec.ts`_                                |

### Tasks

- [x] Create `e2e/blogs/edit-blog.spec.ts` — edit title, description, visibility, hashtags
- [x] Create `e2e/blogs/blog-editor.spec.ts` — open editor, edit content with Plate.js
- [x] Create `e2e/blogs/delete-blog.spec.ts` — owner deletes blog with confirmation
- [x] Create `e2e/blogs/blog-voting.spec.ts` — upvote/downvote blog post
- [x] Create `e2e/blogs/share-blog.spec.ts` — share button functionality

---

## 14. Blog Bloggers Management — ❌ Not Covered

Located at `/blog/[id]/bloggers`. No dedicated tests exist.

| #   | Action                          | Status |
| --- | ------------------------------- | ------ |
| 1   | View bloggers list              | ❌     |
| 2   | Invite bloggers                 | ❌     |
| 3   | Accept/decline blogger requests | ❌     |
| 4   | Update blogger role             | ❌     |
| 5   | Remove blogger                  | ❌     |
| 6   | Create/delete blog roles        | ❌     |
| 7   | Toggle action rights            | ❌     |

### Tasks

- [x] Create `e2e/blog-bloggers/` directory
- [x] Create `e2e/blog-bloggers/view-bloggers.spec.ts` — display bloggers list
- [x] Create `e2e/blog-bloggers/invite-blogger.spec.ts` — owner invites blogger via search
- [x] Create `e2e/blog-bloggers/accept-decline-request.spec.ts` — owner accepts/declines blogger requests
- [x] Create `e2e/blog-bloggers/update-blogger-role.spec.ts` — change blogger role _(covered in roles-management.spec.ts)_
- [x] Create `e2e/blog-bloggers/remove-blogger.spec.ts` — owner removes blogger _(covered in roles-management.spec.ts)_
- [x] Create `e2e/blog-bloggers/create-delete-role.spec.ts` — create and delete blog roles _(covered in roles-management.spec.ts)_
- [x] Create `e2e/blog-bloggers/toggle-action-rights.spec.ts` — toggle permission matrix _(covered in roles-management.spec.ts)_
- [x] Create `e2e/blog-bloggers/access-control.spec.ts` — non-owner cannot manage bloggers
- [x] Create `e2e/blog-bloggers/loading-states.spec.ts` — loading indicators

---

## 15. Calendar (`e2e/calendar/`) — ✅ Well Covered

All 9 calendar actions are covered. No gaps identified.

---

## 16. Create Wizards (`e2e/create/`) — ✅ Well Covered

All 25 creation actions are covered. No gaps identified.

---

## 17. Standalone Documents/Editor — ❌ Not Covered

Located at `/editor` and `/editor/[id]`. No dedicated tests exist.

| #   | Action                                  | Status |
| --- | --------------------------------------- | ------ |
| 1   | View document list                      | ❌     |
| 2   | Create new document                     | ❌     |
| 3   | Open document in editor                 | ❌     |
| 4   | Rich-text editing                       | ❌     |
| 5   | Real-time collaborative presence        | ❌     |
| 6   | Version control (create/restore/search) | ❌     |
| 7   | Invite collaborator                     | ❌     |
| 8   | Change editing mode                     | ❌     |

### Tasks

- [x] Create `e2e/editor/` directory (for standalone documents)
- [x] Create `e2e/editor/view-documents.spec.ts` — display list of owned/collaborated documents
- [x] Create `e2e/editor/create-document.spec.ts` — create document via dialog with title
- [x] Create `e2e/editor/edit-document.spec.ts` — open and edit document content
- [x] Create `e2e/editor/version-control.spec.ts` — create, search, restore, rename versions
- [x] Create `e2e/editor/invite-collaborator.spec.ts` — invite user to collaborate on document
- [x] Create `e2e/editor/mode-switching.spec.ts` — switch between edit/view modes _(covered in edit-document.spec.ts)_
- [x] Create `e2e/editor/loading-states.spec.ts` — loading indicators
- [x] Create `e2e/editor/access-control.spec.ts` — non-collaborator cannot edit

---

## 18. Agenda Items (`e2e/agenda-items/`) — ✅ Well Covered

All 22 agenda item actions are covered. No gaps identified.

---

## 19. Election Candidates (`e2e/election-candidates/`) — ✅ Well Covered

All 16 election candidate actions are covered. No gaps identified.

---

## 20. Positions (`e2e/positions/`) — ✅ Well Covered

All 18 position actions are covered. No gaps identified.

---

## 21. Statements (`e2e/statements/`) — 🔶 Partially Covered

| #   | Action                           | Status | Test File                                                              |
| --- | -------------------------------- | ------ | ---------------------------------------------------------------------- |
| 1   | Create statement                 | ✅     | `create-public-statement.spec.ts`                                      |
| 2   | Display statement                | ✅     | `display-statement.spec.ts`                                            |
| 3   | Search/filter statements         | ✅     | `search-statements.spec.ts`                                            |
| 4   | Related statements               | ✅     | `related-statements.spec.ts`                                           |
| 5   | Share statement                  | ✅     | `statement-social-features.spec.ts`                                    |
| 6   | Loading/error states             | ✅     | `statement-loading-states.spec.ts`, `statement-error-handling.spec.ts` |
| 7   | Agree with statement (thumbs up) | ❌     | _Needs: `statement-agree.spec.ts`_                                     |
| 8   | Comment on statement             | ❌     | _Needs: `statement-comments.spec.ts`_                                  |
| 9   | Delete statement                 | ❌     | _Needs: `delete-statement.spec.ts`_                                    |

### Tasks

- [x] Create `e2e/statements/statement-agree.spec.ts` — agree/disagree with statement _(covered in statement-interactions.spec.ts)_
- [x] Create `e2e/statements/statement-comments.spec.ts` — comment on statement _(covered in statement-interactions.spec.ts)_
- [x] Create `e2e/statements/delete-statement.spec.ts` — creator deletes statement _(covered in statement-interactions.spec.ts)_

---

## 22. Messages (`e2e/messages/`) — 🔶 Partially Covered

| #   | Action                | Status | Test File                           |
| --- | --------------------- | ------ | ----------------------------------- |
| 1   | Load messages page    | ✅     | `load-messages-page.spec.ts`        |
| 2   | View conversations    | ✅     | `view-conversations-list.spec.ts`   |
| 3   | Select conversation   | ✅     | `select-conversation.spec.ts`       |
| 4   | Send message          | ✅     | `send-text-message.spec.ts`         |
| 5   | Conversation requests | ✅     | `conversation-requests.spec.ts`     |
| 6   | User search dialog    | ✅     | `user-search-dialog.spec.ts`        |
| 7   | Conversation sorting  | ✅     | `conversation-sorting.spec.ts`      |
| 8   | Search conversations  | ✅     | `search-conversations.spec.ts`      |
| 9   | Delete conversations  | ✅     | `delete-conversations.spec.ts`      |
| 10  | Mark messages read    | ✅     | `mark-messages-read.spec.ts`        |
| 11  | Unread count badge    | ✅     | `unread-message-count.spec.ts`      |
| 12  | Copy message text     | ✅     | `copy-message-text.spec.ts`         |
| 13  | Message alignment     | ✅     | `message-alignment.spec.ts`         |
| 14  | Auto-scroll           | ✅     | `auto-scroll.spec.ts`               |
| 15  | Keyboard shortcuts    | ✅     | `keyboard-shortcuts.spec.ts`        |
| 16  | Empty states          | ✅     | `empty-states.spec.ts`              |
| 17  | Loading states        | ✅     | `loading-states.spec.ts`            |
| 18  | Group conversations   | ✅     | `group-conversations.spec.ts`       |
| 19  | Group member sync     | ✅     | `group-conversation-sync.spec.ts`   |
| 20  | Group rename sync     | ✅     | `group-rename-sync.spec.ts`         |
| 21  | Pin conversation      | ❌     | _Needs: `pin-conversation.spec.ts`_ |
| 22  | Delete message        | ❌     | _Needs: `delete-message.spec.ts`_   |

### Tasks

- [x] Create `e2e/messages/pin-conversation.spec.ts` — pin/unpin a conversation
- [x] Create `e2e/messages/delete-message.spec.ts` — delete individual message

---

## 23. Notifications (`e2e/notifications/`) — 🔶 Partially Covered

| #   | Action                          | Status | Test File                                      |
| --- | ------------------------------- | ------ | ---------------------------------------------- |
| 1   | Load page                       | ✅     | `load-notifications-page.spec.ts`              |
| 2   | View all                        | ✅     | `view-all-notifications.spec.ts`               |
| 3   | Mark as read                    | ✅     | `mark-as-read.spec.ts`                         |
| 4   | Delete notification             | ✅     | `delete-notification.spec.ts`                  |
| 5   | Tab filtering                   | ✅     | `tab-filtering.spec.ts`                        |
| 6   | Unread count badge              | ✅     | `unread-count-badge.spec.ts`                   |
| 7   | Icons & types                   | ✅     | `notification-icons-types.spec.ts`             |
| 8   | Timestamps                      | ✅     | `timestamps.spec.ts`                           |
| 9   | Empty states                    | ✅     | `empty-states.spec.ts`                         |
| 10  | Loading states                  | ✅     | `loading-states.spec.ts`                       |
| 11  | Search notifications            | ❌     | _Needs: `search-notifications.spec.ts`_        |
| 12  | Click to navigate to entity     | ❌     | _Needs: `notification-navigation.spec.ts`_     |
| 13  | Configure notification settings | ❌     | _Needs: `notification-settings.spec.ts`_       |
| 14  | Reset settings to defaults      | ❌     | _Needs: `reset-notification-settings.spec.ts`_ |
| 15  | Entity-scoped notifications     | ❌     | _Needs: `entity-notifications.spec.ts`_        |

### Tasks

- [x] Create `e2e/notifications/search-notifications.spec.ts` — search by title/message
- [x] Create `e2e/notifications/notification-navigation.spec.ts` — click notification navigates to correct entity
- [x] Create `e2e/notifications/notification-settings.spec.ts` — toggle individual notification settings
- [x] Create `e2e/notifications/reset-notification-settings.spec.ts` — reset all settings to defaults _(covered in notification-settings.spec.ts)_
- [x] Create `e2e/notifications/entity-notifications.spec.ts` — test notifications on group/event/amendment/blog pages

---

## 24. Search (`e2e/search/`) — ✅ Well Covered

All 17 search actions are covered. No gaps identified.

---

## 25. Profile (`e2e/profile/`) — 🔶 Partially Covered

| #   | Action                    | Status | Test File                                                                        |
| --- | ------------------------- | ------ | -------------------------------------------------------------------------------- |
| 1   | Display basic info        | ✅     | `profile-display-basic-information.spec.ts`                                      |
| 2   | Display hashtags          | ✅     | `profile-display-user-hashtags.spec.ts`                                          |
| 3   | Statistics display        | ✅     | `profile-verify-statistics-display.spec.ts`                                      |
| 4   | Action bar                | ✅     | `profile-verify-action-bar.spec.ts`                                              |
| 5   | Content tabs              | ✅     | `profile-navigate-content-tabs.spec.ts`                                          |
| 6   | Navigate to edit          | ✅     | `profile-navigate-to-edit-page.spec.ts`                                          |
| 7   | Update basic info         | ✅     | `profile-update-basic-information.spec.ts`                                       |
| 8   | Update contact info       | ✅     | `profile-update-contact-information.spec.ts`                                     |
| 9   | Save changes              | ✅     | `profile-save-changes.spec.ts`                                                   |
| 10  | Cancel edit               | ✅     | `profile-cancel-edit.spec.ts`                                                    |
| 11  | Avatar upload             | ✅     | `profile-access-avatar-upload.spec.ts`                                           |
| 12  | Avatar constraints        | ✅     | `profile-verify-avatar-constraints.spec.ts`                                      |
| 13  | Avatar display            | ✅     | `profile-verify-avatar-display.spec.ts`                                          |
| 14  | Tab panel loading         | ✅     | `profile-verify-tab-panel-loading.spec.ts`                                       |
| 15  | Direct URL access         | ✅     | `profile-direct-url-own-profile.spec.ts`, `profile-direct-url-edit-page.spec.ts` |
| 16  | Subscriptions nav         | ✅     | `profile-navigate-to-subscriptions.spec.ts`                                      |
| 17  | Follow/unfollow user      | ❌     | _Needs: `profile-follow-user.spec.ts`_                                           |
| 18  | Add/remove hashtags       | ❌     | _Needs: `profile-manage-hashtags.spec.ts`_                                       |
| 19  | View other user's profile | ❌     | _Needs: `profile-view-other-user.spec.ts`_                                       |

### Tasks

- [x] Create `e2e/profile/profile-follow-user.spec.ts` — follow/unfollow another user
- [x] Create `e2e/profile/profile-manage-hashtags.spec.ts` — add/remove profile hashtags
- [x] Create `e2e/profile/profile-view-other-user.spec.ts` — view another user's public profile, tabs, stats _(created as view-other-user.spec.ts)_

---

## 26. Profile Unauthenticated (`e2e/profile-unauth/`) — ✅ Well Covered

All 14 unauthenticated profile actions are covered. No gaps identified.

---

## 27. User Memberships — ❌ Not Covered

Located at `/user/[id]/memberships`. This 4-tab membership management has no tests.

| #   | Action                           | Status |
| --- | -------------------------------- | ------ |
| 1   | View group memberships by status | ❌     |
| 2   | Accept/decline group invitations | ❌     |
| 3   | Leave groups                     | ❌     |
| 4   | View event participations        | ❌     |
| 5   | Accept/decline event invitations | ❌     |
| 6   | View amendment collaborations    | ❌     |
| 7   | View blog relations              | ❌     |
| 8   | Search across membership tabs    | ❌     |

### Tasks

- [x] Create `e2e/user-memberships/` directory
- [x] Create `e2e/user-memberships/view-group-memberships.spec.ts` — display group memberships by status
- [x] Create `e2e/user-memberships/accept-decline-group-invitation.spec.ts` — accept/decline group invitation from memberships page _(created as accept-decline-invitation.spec.ts)_
- [x] Create `e2e/user-memberships/leave-group.spec.ts` — leave group from memberships page
- [x] Create `e2e/user-memberships/view-event-participations.spec.ts` — display event participations
- [x] Create `e2e/user-memberships/view-amendment-collaborations.spec.ts` — display amendment collaborations _(covered in view-amendment-blog-relations.spec.ts)_
- [x] Create `e2e/user-memberships/view-blog-relations.spec.ts` — display blog relations _(covered in view-amendment-blog-relations.spec.ts)_
- [x] Create `e2e/user-memberships/search-memberships.spec.ts` — search across all tabs _(covered in search-and-access-control.spec.ts)_
- [x] Create `e2e/user-memberships/loading-states.spec.ts` — loading indicators

---

## 28. User Network — ❌ Not Covered

Located at `/user/[id]/network`.

| #   | Action                     | Status |
| --- | -------------------------- | ------ |
| 1   | View network visualization | ❌     |

### Tasks

- [x] Create `e2e/user-network/` directory _(covered in profile/user-network.spec.ts)_
- [x] Create `e2e/user-network/view-network.spec.ts` — display interactive network graph of user's group relationships _(created as profile/user-network.spec.ts)_

---

## 29. Subscription Management (`e2e/subscription/`) — 🔶 Partially Covered

| #   | Action                    | Status | Test File                                   |
| --- | ------------------------- | ------ | ------------------------------------------- |
| 1   | Subscribe to user         | ✅     | `user-subscription.spec.ts`                 |
| 2   | Subscribe to group        | ✅     | `group-subscription.spec.ts`                |
| 3   | Subscribe to event        | ✅     | `event-subscription.spec.ts`                |
| 4   | Subscribe to blog         | ✅     | `blog-subscription.spec.ts`                 |
| 5   | Subscribe to amendment    | ✅     | `amendment-subscription.spec.ts`            |
| 6   | View subscription list    | ✅     | `subscription-list.spec.ts`                 |
| 7   | Subscription timeline     | ✅     | `subscription-timeline.spec.ts`             |
| 8   | Subscriber count accuracy | ✅     | `subscription-counts.spec.ts`               |
| 9   | Validation                | ✅     | `subscription-validation.spec.ts`           |
| 10  | Auth check                | ✅     | `subscription-auth.spec.ts`                 |
| 11  | Loading UI                | ✅     | `subscription-ui.spec.ts`                   |
| 12  | Error handling            | ✅     | `subscription-errors.spec.ts`               |
| 13  | Bulk unsubscribe          | ✅     | `subscription-bulk-actions.spec.ts`         |
| 14  | Filter by type            | ❌     | _Needs: `subscription-type-filter.spec.ts`_ |
| 15  | View subscribers list     | ❌     | _Needs: `view-subscribers.spec.ts`_         |
| 16  | Remove subscriber         | ❌     | _Needs: `remove-subscriber.spec.ts`_        |

### Tasks

- [x] Create `e2e/subscription/subscription-type-filter.spec.ts` — filter subscriptions by type
- [x] Create `e2e/subscription/view-subscribers.spec.ts` — view who subscribes to you
- [x] Create `e2e/subscription/remove-subscriber.spec.ts` — remove a subscriber

---

## 30. Comments (`e2e/comments/`) — ✅ Well Covered

All 24 comment actions are covered. No gaps identified.

---

## 31. Timeline (`e2e/timeline/`) — ✅ Well Covered

All ~48 timeline actions are well covered. No significant gaps.

---

## 32. Todos (`e2e/todos/`) — 🔶 Partially Covered

| #   | Action             | Status | Test File                           |
| --- | ------------------ | ------ | ----------------------------------- |
| 1   | Load page          | ✅     | `load-todos-page.spec.ts`           |
| 2   | Create todo        | ✅     | `create-new-todo.spec.ts`           |
| 3   | Mark complete      | ✅     | `mark-todo-complete.spec.ts`        |
| 4   | Kanban view        | ✅     | `view-kanban-todos.spec.ts`         |
| 5   | List view          | ✅     | `view-list-todos.spec.ts`           |
| 6   | Filter by status   | ✅     | `filter-by-status.spec.ts`          |
| 7   | Filter by priority | ✅     | `filter-by-priority.spec.ts`        |
| 8   | Sort todos         | ✅     | `sort-todos.spec.ts`                |
| 9   | Search todos       | ✅     | `search-todos.spec.ts`              |
| 10  | Empty state        | ✅     | `empty-state.spec.ts`               |
| 11  | Loading states     | ✅     | `loading-states.spec.ts`            |
| 12  | Edit todo          | ❌     | _Needs: `edit-todo.spec.ts`_        |
| 13  | Delete todo        | ❌     | _Needs: `delete-todo.spec.ts`_      |
| 14  | View todo detail   | ❌     | _Needs: `view-todo-detail.spec.ts`_ |

### Tasks

- [x] Create `e2e/todos/edit-todo.spec.ts` — edit title, description, priority, due date, status
- [x] Create `e2e/todos/delete-todo.spec.ts` — delete todo with confirmation
- [x] Create `e2e/todos/view-todo-detail.spec.ts` — open todo detail dialog/page _(created as todo-detail-dialog.spec.ts)_

---

## 33. Meet/Video — ❌ Not Covered

Located at `/meet/[id]` and `/user/[id]/meet`. No tests exist.

| #   | Action                       | Status |
| --- | ---------------------------- | ------ |
| 1   | View meeting details         | ❌     |
| 2   | Book meeting                 | ❌     |
| 3   | Cancel meeting booking       | ❌     |
| 4   | View meeting participants    | ❌     |
| 5   | Schedule meeting (user page) | ❌     |

### Tasks

- [x] Create `e2e/meet/` directory
- [x] Create `e2e/meet/view-meeting.spec.ts` — display meeting details page _(covered in meeting-page.spec.ts)_
- [x] Create `e2e/meet/book-meeting.spec.ts` — book a meeting with notes _(covered in meeting-page.spec.ts)_
- [x] Create `e2e/meet/cancel-booking.spec.ts` — cancel a meeting booking _(covered in meeting-page.spec.ts)_
- [x] Create `e2e/meet/user-meeting-scheduler.spec.ts` — schedule meeting from user profile _(covered in meeting-page.spec.ts)_
- [x] Create `e2e/meet/loading-states.spec.ts` — loading indicators

---

## 34. Stripe/Pricing — 🔶 Low Priority / External Dependency

| #   | Action                              | Status |
| --- | ----------------------------------- | ------ |
| 1   | View pricing page                   | ❌     |
| 2   | Enter custom contribution           | ❌     |
| 3   | Subscribe to plan (Stripe checkout) | ❌     |
| 4   | Cancel subscription                 | ❌     |
| 5   | Manage subscription via portal      | ❌     |

### Notes

Stripe actions require mock/stub setup since they involve external payment processing. Consider testing only the UI flows up to the Stripe redirect.

### Tasks

- [x] Create `e2e/pricing/` directory
- [x] Create `e2e/pricing/view-pricing-page.spec.ts` — view pricing tiers and custom amount input _(created as pricing-page.spec.ts)_
- [x] Create `e2e/pricing/custom-amount-input.spec.ts` — enter custom contribution amount _(covered in pricing-page.spec.ts)_
- [x] _(Low priority)_ Consider Stripe test mode integration for checkout flow _(considered — deferred, not feasible for E2E without test mode keys)_

---

## 35. Public Pages (Features/Solutions/Support) — Low Priority

| #   | Action                          | Status |
| --- | ------------------------------- | ------ |
| 1   | Browse features page            | ❌     |
| 2   | Expand/collapse feature details | ❌     |
| 3   | Browse solutions page           | ❌     |
| 4   | Browse support page             | ❌     |

### Tasks

- [x] Create `e2e/public-pages/` directory _(created as e2e/public/)_
- [x] Create `e2e/public-pages/features-page.spec.ts` — load and interact with features page _(covered in public-pages.spec.ts)_
- [x] Create `e2e/public-pages/solutions-page.spec.ts` — load and browse solutions _(covered in public-pages.spec.ts)_
- [x] Create `e2e/public-pages/support-page.spec.ts` — load and browse support areas _(covered in public-pages.spec.ts)_

---

## 36. Structural Improvements

### Helper Extensions

- [x] Add `navigateToEvent(page, eventId)` to `e2e/helpers/navigation.ts` (currently only in subscription.ts)
- [x] Add `navigateToMeeting(page, meetingId)` to `e2e/helpers/navigation.ts`
- [x] Add `navigateToStatement(page, statementId)` to `e2e/helpers/navigation.ts`
- [x] Add `navigateToTodo(page, todoId)` to `e2e/helpers/navigation.ts`
- [x] Deduplicate navigation functions between `navigation.ts` and `subscription.ts` _(already done — subscription.ts re-exports from navigation.ts)_
- [x] Add `navigateToGroupOperation(page, groupId)` helper
- [x] Add `navigateToGroupDocuments(page, groupId)` helper
- [x] Add `navigateToUserMemberships(page, userId)` helper

### Test Entity ID Extensions

- [x] Add meeting-related test entity IDs to `test-entity-ids.ts` if not present _(already present — testMeetingSlot1/2/3)_
- [x] Add group operation entity IDs (links, payments) if needed
- [x] Add group document test entity IDs if needed

---

## Summary

### Coverage by Priority

| Priority           | Feature Area                 | New Specs Needed | Effort |
| ------------------ | ---------------------------- | ---------------- | ------ |
| **P0 - Critical**  | Event Voting System          | 12               | High   |
| **P0 - Critical**  | Amendment Workflow/Forward   | 9                | High   |
| **P1 - High**      | Group Operations             | 12               | Medium |
| **P1 - High**      | Blog Bloggers Management     | 11               | Medium |
| **P1 - High**      | Standalone Editor/Documents  | 10               | Medium |
| **P1 - High**      | Group Documents              | 7                | Medium |
| **P1 - High**      | User Memberships Page        | 10               | Medium |
| **P2 - Medium**    | Events (edit/cancel/delete)  | 5                | Low    |
| **P2 - Medium**    | Blogs (edit/delete/vote)     | 5                | Low    |
| **P2 - Medium**    | Notifications (settings/nav) | 5                | Low    |
| **P2 - Medium**    | Statements (agree/comment)   | 3                | Low    |
| **P2 - Medium**    | Todos (edit/delete/detail)   | 3                | Low    |
| **P2 - Medium**    | Messages (pin/delete)        | 2                | Low    |
| **P2 - Medium**    | Subscriptions (filter/view)  | 3                | Low    |
| **P2 - Medium**    | Profile (follow/hashtags)    | 3                | Low    |
| **P3 - Low**       | Meet/Video                   | 7                | Medium |
| **P3 - Low**       | Auth (logout/resend)         | 2                | Low    |
| **P3 - Low**       | Groups (edit/delete/network) | 4                | Low    |
| **P3 - Low**       | Pricing                      | 3                | Low    |
| **P3 - Low**       | Public Pages                 | 3                | Low    |
| **P3 - Low**       | Amendment Discussions depth  | 3                | Low    |
| **P3 - Low**       | User Network                 | 2                | Low    |
| **Infrastructure** | Helper/ID extensions         | 12               | Low    |
| **Infrastructure** | Missing test plans           | 9                | Low    |

### Totals

| Metric                          | Count     |
| ------------------------------- | --------- |
| Existing spec files             | ~309      |
| Existing test cases             | ~452      |
| **New spec files needed**       | **~85**   |
| **New spec files created**      | **~85**   |
| **New test plans needed**       | **9**     |
| **Helper extensions needed**    | **~8**    |
| **Helper extensions completed** | **7**     |
| Estimated new test cases        | ~110      |
| **New test cases created**      | **~200+** |
| **Target total test cases**     | **~560**  |

### Parallelization Strategy

These feature areas can be implemented **in parallel** by independent sub-agents since they have no cross-dependencies:

**Batch 1 (P0 — Critical path):**

- Agent A: Event Voting System (12 specs)
- Agent B: Amendment Workflow/Forward (9 specs)

**Batch 2 (P1 — High priority):**

- Agent C: Group Operations (12 specs)
- Agent D: Blog Bloggers Management (11 specs)
- Agent E: Standalone Editor (10 specs)
- Agent F: User Memberships (10 specs)
- Agent G: Group Documents (7 specs)

**Batch 3 (P2 — Medium priority):**

- Agent H: Events edit/cancel/delete (5 specs)
- Agent I: Blogs edit/delete/vote (5 specs)
- Agent J: Notifications settings/nav (5 specs)
- Agent K: Statements + Todos + Messages + Subscriptions + Profile extensions (14 specs combined)

**Batch 4 (P3 — Low priority):**

- Agent L: Meet/Video (7 specs)
- Agent M: Remaining small gaps (Auth, Groups, Pricing, Public Pages, Discussions, Network — ~14 specs)

**Infrastructure (any time):**

- Agent N: Helper extensions, test entity IDs, test plan documents

---

## Related: Test Stabilization

> **Before adding more specs, stabilize existing tests with per-test data isolation.**
> See [`tasks/e2e-test-stabilization-tasks.md`](e2e-test-stabilization-tasks.md) for the full plan covering:
>
> - Admin SDK singleton for server-side data ops
> - Factory pattern for per-test entity setup + automatic cleanup
> - Playwright fixture extension (`test.extend<>()`) with auto-login + factory injection
> - Auth fixes (distinct test user identities)
> - Migration guide for converting existing specs

---

## Implementation Handoff

The task plan has been created at `tasks/e2e-full-coverage-tasks.md`.

To begin implementation, you can:

1. Ask me to implement specific tasks from the plan (e.g., "Implement Batch 1 P0 specs")
2. Use @workspace to have an agent work through tasks by priority
3. Manually work through the checklist, marking items complete as you go

Would you like me to start implementing test specs for a specific priority batch?
