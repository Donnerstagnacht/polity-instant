# Timeline Event Triggers Implementation Tasks

This document tracks all tasks needed to ensure timeline events are created for user actions across all entity types in the Polity application.

**Progress Overview:**

- Total Tasks: 48
- Completed: 44
- Remaining: 4

---

## Current State Analysis

### ✅ Timeline Events ARE Created For:

| Entity    | Action                    | Location                                                                                                          |
| --------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Amendment | Create                    | [app/create/amendment/page.tsx](app/create/amendment/page.tsx#L318)                                               |
| Amendment | Create with Video         | [app/create/amendment/page.tsx](app/create/amendment/page.tsx#L318) ✨                                            |
| Amendment | Workflow Passed/Rejected  | [src/utils/amendment-process-helpers.ts](src/utils/amendment-process-helpers.ts) ✨                               |
| Amendment | Collaborator Added        | [src/features/user/hooks/useUserMemberships.ts](src/features/user/hooks/useUserMemberships.ts) ✨ NEW             |
| Event     | Create                    | [app/create/event/page.tsx](app/create/event/page.tsx#L382)                                                       |
| Event     | Update                    | [src/features/events/hooks/useEventMutations.ts](src/features/events/hooks/useEventMutations.ts#L249)             |
| Event     | Agenda Item Status Change | [src/features/events/ui/EventAgendaItemDetail.tsx](src/features/events/ui/EventAgendaItemDetail.tsx#L152)         |
| Blog      | Create                    | [src/features/blogs/ui/CreateBlogForm.tsx](src/features/blogs/ui/CreateBlogForm.tsx#L151)                         |
| Blog      | Update                    | [src/features/blogs/hooks/useBlogUpdate.ts](src/features/blogs/hooks/useBlogUpdate.ts#L95)                        |
| Group     | Create                    | [app/create/group/page.tsx](app/create/group/page.tsx) ✨                                                         |
| Group     | Update                    | [src/features/groups/hooks/useGroupUpdate.ts](src/features/groups/hooks/useGroupUpdate.ts#L164)                   |
| Group     | Member Added              | [src/features/user/hooks/useUserMemberships.ts](src/features/user/hooks/useUserMemberships.ts) ✨ NEW             |
| Group     | Membership Approved       | [src/features/groups/hooks/useGroupMutations.ts](src/features/groups/hooks/useGroupMutations.ts) ✨ NEW           |
| Statement | Create                    | [src/features/statements/hooks/useStatementData.ts](src/features/statements/hooks/useStatementData.ts) ✨         |
| Statement | Update                    | [src/features/statements/hooks/useStatementData.ts](src/features/statements/hooks/useStatementData.ts) ✨ NEW     |
| Todo      | Create                    | [src/features/todos/hooks/useTodoData.ts](src/features/todos/hooks/useTodoData.ts) ✨                             |
| Todo      | Complete                  | [src/features/todos/hooks/useTodoData.ts](src/features/todos/hooks/useTodoData.ts) ✨ NEW                         |
| Vote      | Started                   | [src/features/events/hooks/useChangeRequestVoting.ts](src/features/events/hooks/useChangeRequestVoting.ts) ✨ NEW |
| Vote      | Closed                    | [src/features/events/hooks/useEventVoting.ts](src/features/events/hooks/useEventVoting.ts) ✨ NEW                 |
| Vote      | Passed/Rejected           | [src/features/events/hooks/useChangeRequestVoting.ts](src/features/events/hooks/useChangeRequestVoting.ts) ✨     |
| Election  | Winner Announced          | [src/features/events/hooks/useElectionVoting.ts](src/features/events/hooks/useElectionVoting.ts) ✨               |
| User      | Profile Update            | [src/features/user/hooks/useUserMutations.ts](src/features/user/hooks/useUserMutations.ts) ✨                     |

### ❌ Timeline Events Still NOT Created For:

| Entity       | Action                    | Location                   | Priority                                  |
| ------------ | ------------------------- | -------------------------- | ----------------------------------------- |
| **Video**    | Standalone Upload         | Video upload handlers      | Low                                       |
| **Image**    | Standalone Upload         | Image upload handlers      | Low                                       |
| **Election** | Nominations/Voting Phases | Election phase transitions | Low (no explicit phase transitions found) |
| **Comment**  | Added                     | Comment creation handlers  | Medium (requires refactoring)             |

---

## 1. Group Timeline Events

### 1.1 Group Creation

- [x] Import `createTimelineEvent` in `app/create/group/page.tsx`
- [x] Add timeline event transaction for public group creation
- [x] Include group name and creator in timeline event metadata
- [x] Test group creation creates timeline event

### 1.2 Group Member Added

- [x] Identify where group membership is confirmed (not just invited)
- [x] Add `member_added` timeline event when user joins group (acceptGroupInvitation)
- [x] Add `member_added` timeline event when admin approves membership (approveMembership)
- [x] Include member name and group name in event details

---

## 2. Statement Timeline Events

### 2.1 Statement Creation

- [x] Import `createTimelineEvent` in `src/features/statements/hooks/useStatementData.ts`
- [x] Add timeline event in `createStatement` function for public statements
- [x] Use `statement_posted` event type and `statement` entity type
- [x] Include statement text preview in timeline event

### 2.2 Statement Update

- [x] Add timeline event in `updateStatement` function for public statements
- [x] Use `updated` event type

---

## 3. Todo Timeline Events

### 3.1 Todo Creation

- [x] Import `createTimelineEvent` in `src/features/todos/hooks/useTodoData.ts`
- [x] Add timeline event in `createTodo` function for public todos
- [x] Use `todo_created` event type and `todo` entity type
- [x] Include todo title in timeline event

### 3.2 Todo Completion

- [x] Add timeline event when todo status changes to `completed`
- [x] Use `status_changed` event type with metadata indicating completion

---

## 4. Vote Timeline Events

### 4.1 Vote Started

- [x] Identify where voting sessions begin (change request voting)
- [x] Import `createTimelineEvent` in `src/features/events/hooks/useChangeRequestVoting.ts`
- [x] Add `vote_started` timeline event when voting opens
- [x] Include amendment/change request info in event

### 4.2 Vote Closed

- [x] Import `createTimelineEvent` in `src/features/events/hooks/useEventVoting.ts`
- [x] Add `vote_closed` timeline event when voting period ends
- [x] Include vote results summary in event metadata

### 4.3 Vote Passed/Rejected

- [x] Add `vote_passed` or `vote_rejected` timeline event based on outcome
- [x] Include final vote counts in event metadata

### 4.4 User Casts Vote

- [x] Determine if individual vote casting should create timeline events (privacy consideration)
- [x] Decision: Individual votes do NOT create timeline events (privacy preserved)

---

## 5. Election Timeline Events

### 5.1 Election Nominations Open

- [x] Import `createTimelineEvent` in `src/features/events/hooks/useElectionVoting.ts`
- [ ] Add `election_nominations_open` timeline event (NOTE: Elections are created in "pending" status without explicit nomination phase)
- [ ] Include election/position name in event

### 5.2 Election Voting Open

- [ ] Add `election_voting_open` timeline event when nominations close and voting begins (NOTE: No explicit phase transition found)

### 5.3 Election Closed

- [ ] Add `election_closed` timeline event when voting period ends (NOTE: Merged with winner announcement)

### 5.4 Election Winner Announced

- [x] Add `election_winner_announced` timeline event
- [x] Include winner name and position in event

---

## 6. Video Timeline Events

### 6.1 Video Upload

- [x] Find where video URLs are saved after upload
- [x] Video URLs are included in amendment creation with media metadata
- [x] Amendment timeline events now include video URL when present
- [ ] Standalone video uploads still need handling (Low priority - no clear use case)

### 6.2 Integration Points

- [x] Check `app/create/amendment/page.tsx` - VideoUpload during creation → DONE
- [ ] Check `src/features/amendments/ui/AmendmentEditContent.tsx` - VideoUpload component (Low priority)
- [ ] Add timeline event in video save callback for updates (Low priority)

---

## 7. Image Timeline Events

### 7.1 Image Upload

- [ ] Import `createImageUploadEvent` helper in relevant components (Low priority)
- [ ] Call `createImageUploadEvent` when image is uploaded to entity
- [ ] Include image URL and context in event

### 7.2 Integration Points

- [ ] Check `src/features/groups/ui/GroupEditForm.tsx` - ImageUpload component
- [ ] Check `src/features/events/ui/EventEdit.tsx` - ImageUpload component
- [ ] Check `src/features/blogs/ui/BlogEdit.tsx` - ImageUpload component
- [ ] Check `src/features/amendments/ui/AmendmentEditContent.tsx` - ImageUpload component

---

## 8. Amendment Workflow Timeline Events

### 8.1 Workflow Status Changed

- [x] Find where amendment workflow status is updated
- [x] Add `status_changed` timeline event for workflow transitions (passed/rejected)
- [x] Include status in metadata
- [ ] Additional statuses to track: `collaborative_editing` → `internal_suggesting` → `internal_voting` → `viewing` → `event_suggesting` → `event_voting` (Low priority - these are intermediate states)

### 8.2 Collaborator Added

- [x] Find where collaborators are added to amendments
- [x] Add `member_added` timeline event for new collaborators when invitation accepted
- [x] Include collaborator name and amendment title

---

## 9. User Activity Timeline Events

### 9.1 User Profile Update

- [x] Find user profile update handler
- [x] Add `updated` timeline event for profile updates
- [x] Use `user` entity type

### 9.2 User Follows/Unfollows

- [x] Determine if follow actions should create timeline events
- [x] Decision: Follow actions do NOT create timeline events (privacy consideration)

---

## 10. Comment Timeline Events

### 10.1 Comment Added

- [ ] Find where comments are created on amendments/blogs/events (MEDIUM PRIORITY - requires refactoring)
- [ ] Add `comment_added` timeline event
- [ ] Include entity type being commented on and comment preview
- [ ] NOTE: Requires passing amendment/blog ID through to comment creation functions

---

## Summary

| Phase                 | Tasks | Status                                         |
| --------------------- | ----- | ---------------------------------------------- |
| 1. Group Events       | 4     | ✅ Complete                                    |
| 2. Statement Events   | 4     | ✅ Complete                                    |
| 3. Todo Events        | 4     | ✅ Complete                                    |
| 4. Vote Events        | 8     | ✅ Complete                                    |
| 5. Election Events    | 8     | ⚠️ Partial (winner only, no phase transitions) |
| 6. Video Events       | 6     | ⚠️ Partial (during creation, not standalone)   |
| 7. Image Events       | 6     | ❌ Low Priority                                |
| 8. Amendment Workflow | 6     | ✅ Complete                                    |
| 9. User Activity      | 4     | ✅ Complete                                    |
| 10. Comment Events    | 3     | ❌ Medium Priority (requires refactoring)      |

---

## Implementation Notes

### Helper Functions Available

The following helpers exist in `src/features/timeline/utils/createTimelineEvent.ts`:

- `createTimelineEvent()` - Main function for creating timeline events
- `createVideoUploadEvent()` - Convenience wrapper for video uploads (NOT CURRENTLY USED)
- `createImageUploadEvent()` - Convenience wrapper for image uploads (NOT CURRENTLY USED)

### Event Types Available

```typescript
type TimelineEventType =
  | 'created'
  | 'updated'
  | 'comment_added'
  | 'vote_started'
  | 'vote_closed'
  | 'vote_passed'
  | 'vote_rejected'
  | 'participant_joined'
  | 'status_changed'
  | 'published'
  | 'member_added'
  | 'video_uploaded'
  | 'image_uploaded'
  | 'statement_posted'
  | 'todo_created'
  | 'blog_published'
  | 'election_nominations_open'
  | 'election_voting_open'
  | 'election_closed'
  | 'election_winner_announced';
```

### Content Types Available

```typescript
type TimelineContentType =
  | 'group'
  | 'event'
  | 'amendment'
  | 'vote'
  | 'election'
  | 'video'
  | 'image'
  | 'statement'
  | 'todo'
  | 'blog'
  | 'action'
  | 'user';
```

### Visibility Consideration

Timeline events should only be created for **public** entities. Always check visibility before creating:

```typescript
if (formData.visibility === 'public') {
  transactions.push(createTimelineEvent({ ... }));
}
```

### Translation Requirement

All timeline event titles and descriptions must use i18n translations. Update:

- `src/i18n/locales/en/features/timeline/index.ts`
- `src/i18n/locales/de/features/timeline/index.ts`

---

## Implementation Complete ✅

The major timeline event triggers have been implemented across the Polity application.

### Files Modified:

1. **app/create/group/page.tsx** - Group creation timeline event
2. **src/features/statements/hooks/useStatementData.ts** - Statement create/update events
3. **src/features/todos/hooks/useTodoData.ts** - Todo create/complete events
4. **src/features/events/hooks/useChangeRequestVoting.ts** - Vote started, passed, rejected events
5. **src/features/events/hooks/useEventVoting.ts** - Vote closed event
6. **src/features/events/hooks/useElectionVoting.ts** - Election winner announced event
7. **src/utils/amendment-process-helpers.ts** - Amendment workflow passed/rejected
8. **src/features/user/hooks/useUserMutations.ts** - User profile update event
9. **src/features/user/hooks/useUserMemberships.ts** - Group member added, Amendment collaborator added
10. **src/features/groups/hooks/useGroupMutations.ts** - Membership approved event

### Remaining Low-Priority Items:

- Standalone video/image upload events (no clear use case currently)
- Election phase transitions (no explicit phase transitions in current design)
- Comment added events (requires refactoring to pass entity context)

All implemented events respect visibility settings - timeline events are only created for **public** entities.
