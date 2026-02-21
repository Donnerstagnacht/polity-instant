# Zero Facade Enforcement — Eliminate All Direct Zero Usage Outside `src/zero/`

This document tracks all tasks needed to enforce the rule: **No `useQuery`, `useMutate`, `useZero`, `queries`, or `mutators` imports from `@/zero` in files outside `src/zero/`.** All Zero access must go through facade hooks (`use<Domain>State` and `use<Domain>Actions`).

**Progress Overview:**

- Total Tasks: 92
- Completed: 0
- Remaining: 92

---

## 0. Foundation: Remove Forbidden Re-exports

### 0.1 Clean up `src/zero/index.ts`

- [ ] Remove `export { useZero, useQuery } from '@rocicorp/zero/react'`
- [ ] Remove the `useMutate()` function and its export
- [ ] Remove `export { queries } from './queries'`
- [ ] Remove `export { mutators } from './mutators'`
- [ ] Keep only: `schema`, `zql`, `dbProvider`, type re-exports, and domain mutator re-exports (if still needed internally)
- [ ] Verify that nothing inside `src/zero/` itself depends on these barrel re-exports (internal files should import directly from `@rocicorp/zero/react` or `./queries`)

> **Note:** Do this LAST (after all files are migrated) or the build will break. Mark this as blocked until all other tasks are done.

---

## 1. Enrich Facade Action Hooks (Prerequisites)

Before migrating feature files, these facade action hooks need new methods that the feature files currently call via `mutators.*`.

### 1.1 `useGroupActions` — Add missing methods

- [ ] `createPosition(args)` — wraps `mutators.groups.createPosition`
- [ ] `updateRelationship(args)` — wraps `mutators.groups.updateRelationship`
- [ ] `deleteRelationship(args)` — wraps `mutators.groups.deleteRelationship`
- [ ] `createRelationship(args)` — wraps `mutators.groups.createRelationship`
- [ ] `updateMemberRole(args)` — wraps `mutators.groups.updateMemberRole`
- [ ] `leaveGroup(args)` — wraps `mutators.groups.leaveGroup` (if not already present)

### 1.2 `useEventActions` — Add missing methods

- [ ] `createMeetingBooking(args)` — wraps `mutators.events.createMeetingBooking`
- [ ] `deleteMeetingBooking(args)` — wraps `mutators.events.deleteMeetingBooking`
- [ ] `createMeetingSlot(args)` — wraps `mutators.events.createMeetingSlot`
- [ ] `updateMeetingSlot(args)` — wraps `mutators.events.updateMeetingSlot`
- [ ] `deleteMeetingSlot(args)` — wraps `mutators.events.deleteMeetingSlot`
- [ ] `createPosition(args)`, `updatePosition(args)`, `deletePosition(args)`
- [ ] `inviteParticipant(args)`, `updateParticipant(args)`, `leaveEvent(args)`
- [ ] `updateEvent(args)`, `cancelEvent(args)`
- [ ] `addCandidate(args)` (may delegate to agendas)

### 1.3 `useAgendaActions` — Add missing methods

- [ ] `castElectionVote(args)`, `deleteElectionVote(args)`
- [ ] `addSpeaker(args)`, `removeSpeaker(args)`
- [ ] `addCandidate(args)`, `removeCandidate(args)`
- [ ] `deleteAgendaItem(args)`, `updateAgendaItem(args)`
- [ ] `activateAgendaItem(args)`, `completeAgendaItem(args)`
- [ ] `createAgendaItem(args)`

### 1.4 `useAmendmentActions` — Add missing methods

- [ ] `createVoteEntry(args)`, `updateVoteEntry(args)`
- [ ] `addCollaborator(args)`, `removeCollaborator(args)`, `updateCollaborator(args)`
- [ ] `createSupportConfirmation(args)`, `confirmSupport(args)`, `declineSupport(args)`
- [ ] `updateWorkflowStatus(args)`, `cloneAmendment(args)`, `setTarget(args)`
- [ ] `createChangeRequest(args)`, `voteChangeRequest(args)`
- [ ] `updateAmendmentProfile(args)` (title, description, etc.)

### 1.5 `useNotificationActions` — Add missing methods

- [ ] `registerPushSubscription(args)`
- [ ] `unregisterPushSubscription(args)`
- [ ] `createNotification(args)` (for programmatic notification creation)

### 1.6 `useBlogActions` — Add missing methods (check what exists)

- [ ] `createEntry(args)` — for blogger entries
- [ ] `deleteEntry(args)`, `updateEntry(args)` — blogger management
- [ ] `deleteSupportVote(args)`, `updateSupportVote(args)`, `createSupportVote(args)` — if not present

### 1.7 `useCommonActions` — Verify completeness

- [ ] `subscribe(args)`, `unsubscribe(args)` — should exist
- [ ] `addHashtag(args)`, `deleteHashtag(args)` — should exist

---

## 2. Enrich Facade State Hooks (Prerequisites)

### 2.1 `useGroupState` — Add missing query options

- [ ] `includeSearch?: boolean` + `searchQuery?: string` → returns `searchResults` (uses `queries.groups.search`)
- [ ] `includeHierarchy?: boolean` → returns `hierarchy` (uses `queries.groups.hierarchy`)
- [ ] `includeAllRelationships?: boolean` → returns `allRelationships` (uses `queries.groups.allRelationships`)
- [ ] `includeAllRelationshipsWithGroups?: boolean` → returns `allRelationshipsWithGroups`
- [ ] `includeMembershipsWithUsers?: boolean` → returns `membershipsWithUsers`
- [ ] `includeCurrentUserMembershipsWithGroups?: boolean` → returns `currentUserMembershipsWithGroups`
- [ ] `includePositions?: boolean` → returns `positions`
- [ ] `includeMembershipsByUser?: boolean` + `userId` → returns `membershipsByUser`

### 2.2 `useEventState` — Add missing query options

- [ ] `includeMeetingSlotsByUser?: boolean` + `userId` → returns `meetingSlots`
- [ ] `includeByGroup?: boolean` + `groupId` → returns `groupEvents`

### 2.3 `useNotificationState` — Add missing query options

- [ ] `includeByEntity?: boolean` + `entityId` → returns `entityNotifications`
- [ ] `includePushSubscriptions?: boolean` → returns `pushSubscriptions`

### 2.4 `useMessageState` — Add missing query options

- [ ] `includeConversationsByUser?: boolean` → returns `conversationsByUser`

### 2.5 `useBlogState` — Add missing query options

- [ ] `includeByGroup?: boolean` + `groupId` → returns `groupBlogs`
- [ ] `includeBloggersByUser?: boolean` + `userId` → returns `userBloggers`

### 2.6 `useAgendaState` — Add missing query options

- [ ] `includePendingElections?: boolean` → returns `pendingElections`

### 2.7 `useTodoState` — Add missing query options

- [ ] `includeByGroupWithAssignments?: boolean` + `groupId` → returns `groupTodosWithAssignments`

### 2.8 `useAmendmentState` — Add missing query options

- [ ] `includeByIdWithRelations?: boolean` → returns `amendmentWithRelations`
- [ ] `includeCollaboratorsByUser?: boolean` + `userId` → returns `userCollaborations`

---

## 3. Migrate Route Files (12 files — query-only, simplest)

### 3.1 Amendment routes

- [ ] `src/routes/_authed/amendment/$id/text.tsx` — `queries.users.byId` → `useUserState({ userId })`
- [ ] `src/routes/_authed/amendment/$id/settings.tsx` — `queries.amendments.byIdWithRelations` → `useAmendmentState({ amendmentId, includeByIdWithRelations: true })`
- [ ] `src/routes/_authed/amendment/$id/notifications.tsx` — `queries.notifications.byEntityId` → `useNotificationState({ entityId })`
- [ ] `src/routes/_authed/amendment/$id/collaborators.tsx` — `queries.amendments.byId` → `useAmendmentState({ amendmentId })`

### 3.2 Group routes

- [ ] `src/routes/_authed/group/$id/operation.tsx` — `queries.todos.byGroupWithAssignments` + `queries.groups.positions` → `useTodoState` + `useGroupState`
- [ ] `src/routes/_authed/group/$id/events.tsx` — `queries.events.byGroup` → `useEventState({ groupId })`
- [ ] `src/routes/_authed/group/$id/notifications.tsx` — `queries.notifications.byEntityId` → `useNotificationState({ entityId })`
- [ ] `src/routes/_authed/group/$id/blog.tsx` — `queries.blogs.byGroupWithHashtags` → `useBlogState({ groupId })`

### 3.3 Other routes

- [ ] `src/routes/_authed/event/$id/notifications.tsx` — `queries.notifications.byEntityId` → `useNotificationState({ entityId })`
- [ ] `src/routes/_authed/user/$id/blog.tsx` — `queries.blogs.bloggersByUser` → `useBlogState({ userId })`
- [ ] `src/routes/_authed/create/position.tsx` — `queries.groups.membershipsByUser` + `mutators.groups.createPosition` → `useGroupState` + `useGroupActions`
- [ ] `src/routes/_authed/create/election-candidate.tsx` — `queries.agendas.pendingElections` + `mutators.agendas.addCandidate` → `useAgendaState` + `useAgendaActions`

---

## 4. Migrate Component Files (10 files)

### 4.1 Group components

- [ ] `src/components/groups/GroupHierarchyFlow.tsx` — 3 queries → `useGroupState`
- [ ] `src/components/groups/GroupNetworkFlow.tsx` — 2 queries → `useGroupState`
- [ ] `src/components/groups/GroupRelationshipsManager.tsx` — 2 mutations → `useGroupActions`
- [ ] `src/components/groups/LinkGroupDialog.tsx` — 2 queries + mutations → `useGroupState` + `useGroupActions`

### 4.2 Shared components

- [ ] `src/components/shared/FilteredNetworkFlow.tsx` — 3 queries → `useUserState` + `useGroupState`
- [ ] `src/components/shared/ConversationSelectorDialog.tsx` — query + mutation → `useMessageState` + `useMessageActions`
- [ ] `src/components/messages/LinkPreview.tsx` — 7 domain queries → 7 `use<Domain>State` hooks
- [ ] `src/components/messages/AriaKaiMessageActions.tsx` — user query + message/user mutations → `useUserState` + `useMessageActions` + `useUserActions`
- [ ] `src/components/notifications/EntityNotifications.tsx` — notification query + mutations → `useNotificationState` + `useNotificationActions`
- [ ] `src/components/todos/todo-detail-dialog.tsx` — group query + todo mutations → `useGroupState` + `useTodoActions`
- [ ] `src/components/todos/kanban-board.tsx` — todo mutations → `useTodoActions`
- [ ] `src/components/auth/UserMenu.tsx` — group query → `useGroupState`
- [ ] `src/components/dev/DuplicateMembershipCleaner.tsx` — group query + mutation → `useGroupState` + `useGroupActions`
- [ ] `src/components/dialogs/AriaKaiWelcomeDialog.tsx` — user mutation → `useUserActions`

---

## 5. Migrate User Feature Files (8 files)

- [ ] `src/features/user/hooks/useUserMutations.ts` — `mutators.users.*` + `mutators.common.*` → `useUserActions` + `useCommonActions`
- [ ] `src/features/user/hooks/useFollowUser.ts` — `mutators.users.follow/unfollow` → `useUserActions`
- [ ] `src/features/user/hooks/useAvatarUpload.ts` — `mutators.users.updateProfile` → `useUserActions`
- [ ] `src/features/user/hooks/useSubscribeUser.ts` — `queries.common.*` → `useCommonState`
- [ ] `src/features/user/hooks/useUserMemberships.ts` — 4 domain queries + 8 domain mutations → 4 state + 4 actions hooks
- [ ] `src/features/user/ui/UserMeetingScheduler.tsx` — event query + mutations → `useEventState` + `useEventActions`
- [ ] `src/features/user/ui/UserNetworkFlow.tsx` — group query → `useGroupState`

---

## 6. Migrate Events Feature Files (18 files)

- [ ] `useEventMutations.ts` — `mutators.events.*` → `useEventActions`
- [ ] `useEventParticipation.ts` — `mutators.events.*` → `useEventActions`
- [ ] `useEventParticipants.ts` — `mutators.events.*` → `useEventActions`
- [ ] `useEventVoting.ts` — `mutators.events.*` → `useEventActions`
- [ ] `useElectionVoting.ts` — `mutators.events.*` → `useEventActions`
- [ ] `useChangeRequestVoting.ts` — `mutators.events.*` + `mutators.amendments.*` → `useEventActions` + `useAmendmentActions`
- [ ] `useVoting.ts` — `mutators.agendas.*` + `mutators.amendments.*` → `useAgendaActions` + `useAmendmentActions`
- [ ] `useSpeakerList.ts` — `mutators.agendas.*` → `useAgendaActions`
- [ ] `useEventStream.ts` — `mutators.agendas.*` + `mutators.amendments.*` → `useAgendaActions` + `useAmendmentActions`
- [ ] `useEventPositions.ts` — `mutators.events.*` → `useEventActions`
- [ ] `useAgendaItemMutations.ts` — `mutators.agendas.*` → `useAgendaActions`
- [ ] `useAgendaNavigation.ts` — `mutators.agendas.*` → `useAgendaActions`
- [ ] `useSubscribeEvent.ts` — `mutators.common.*` → `useCommonActions`
- [ ] `useEventAgendaItem.ts` — `mutators.agendas.*` + `mutators.amendments.*` → `useAgendaActions` + `useAmendmentActions`
- [ ] `useCancelEvent.ts` — `mutators.events.*` → `useEventActions`
- [ ] `EventWiki.tsx` — `mutators.events.*` → `useEventActions`
- [ ] `EventAgendaItemDetail.tsx` — `mutators.agendas.*` + `mutators.events.*` → `useAgendaActions` + `useEventActions`
- [ ] `CreateAgendaItemForm.tsx` — `mutators.agendas.*` → `useAgendaActions`

---

## 7. Migrate Amendments Feature Files (11 files)

- [ ] `useAmendmentWorkflow.ts` — `mutators.amendments.*` → `useAmendmentActions`
- [ ] `useAmendmentCollaboration.ts` — `mutators.amendments.*` → `useAmendmentActions`
- [ ] `useSubscribeAmendment.ts` — `mutators.common.*` → `useCommonActions`
- [ ] `useSupportConfirmation.ts` — `mutators.amendments.*` → `useAmendmentActions`
- [ ] `AmendmentWiki.tsx` — `mutators.amendments.*` → `useAmendmentActions`
- [ ] `VoteControls.tsx` — `mutators.amendments.*` → `useAmendmentActions`
- [ ] `VersionControl.tsx` — `mutators.documents.*` → `useDocumentActions`
- [ ] `ModeSelector.tsx` — `mutators.documents.*` → `useDocumentActions`
- [ ] `AmendmentProcessFlow.tsx` — `mutators.amendments.*` → `useAmendmentActions`
- [ ] `AmendmentEditContent.tsx` — `mutators.amendments.*` → `useAmendmentActions`
- [ ] `useDocumentEditor.ts` — `mutators.documents.*` → `useDocumentActions`

---

## 8. Migrate Remaining Feature Files

### 8.1 Editor (3 files)

- [ ] `useEditorVersion.ts` — `mutators.documents.*` → `useDocumentActions`
- [ ] `editor/ui/VersionControl.tsx` — `mutators.documents.*` + `mutators.blogs.*` → `useDocumentActions` + `useBlogActions`
- [ ] `editor/ui/InviteCollaboratorDialog.tsx` — `mutators.blogs.*` + `mutators.documents.*` → `useBlogActions` + `useDocumentActions`

### 8.2 Other

- [ ] `src/hooks/usePushSubscription.ts` — notification query + mutations → `useNotificationState` + `useNotificationActions`
- [ ] `src/features/meet/hooks/useMeetingBooking.ts` — event + notification mutations → `useEventActions` + `useNotificationActions`
- [ ] `src/navigation/state/useNavigation.tsx` — `useZero()` raw query → `useAmendmentState`

---

## 9. Final Enforcement

### 9.1 Remove barrel re-exports from `src/zero/index.ts`

- [ ] Remove `export { useZero, useQuery } from '@rocicorp/zero/react'`
- [ ] Remove `useMutate` function and export
- [ ] Remove `export { queries } from './queries'`
- [ ] Remove `export { mutators } from './mutators'`
- [ ] Remove all `export { *Mutators }` domain mutator re-exports (only needed if consumed outside `src/zero/`)

### 9.2 Verify type-only import

- [ ] `BlogBloggersManager.tsx` — `import type { User, BlogBlogger, Role, ActionRight } from '@/zero'` — type-only imports are acceptable OR move to shared types

### 9.3 Final verification

- [ ] `npx tsc --noEmit` — zero errors
- [ ] grep for `useMutate|useQuery|useZero` imported from `@/zero` outside `src/zero/` — zero matches
- [ ] grep for `queries\.|mutators\.` in files outside `src/zero/` — zero matches
- [ ] grep for `@rocicorp/zero` in files outside `src/zero/`, `src/providers/`, `src/lib/` — zero matches

---

## Summary

| Phase                            | Tasks      | Status                |
| -------------------------------- | ---------- | --------------------- |
| 0. Foundation (index.ts cleanup) | 6          | Not Started (blocked) |
| 1. Enrich action hooks           | 7 sections | Not Started           |
| 2. Enrich state hooks            | 8 sections | Not Started           |
| 3. Route files                   | 12         | Not Started           |
| 4. Component files               | 14         | Not Started           |
| 5. User features                 | 7          | Not Started           |
| 6. Events features               | 18         | Not Started           |
| 7. Amendments features           | 11         | Not Started           |
| 8. Remaining features            | 6          | Not Started           |
| 9. Final enforcement             | 5          | Not Started           |

---

## Implementation Notes

### Correct pattern (use this):

```typescript
// In a feature file:
import { useGroupState } from '@/zero/groups/useGroupState';
import { useGroupActions } from '@/zero/groups/useGroupActions';

function MyComponent({ groupId }) {
  const { group, members } = useGroupState({ groupId, includeMembers: true });
  const { joinGroup, leaveGroup } = useGroupActions();

  const handleJoin = () => joinGroup({ groupId });
}
```

### Forbidden pattern (NEVER do this):

```typescript
// WRONG — direct Zero access outside src/zero/
import { useQuery, useMutate, queries, mutators } from '@/zero';

function MyComponent({ groupId }) {
  const [group] = useQuery(queries.groups.byId({ id: groupId }));
  const mutate = useMutate();

  const handleJoin = () => mutate(mutators.groups.joinGroup({ groupId }));
}
```

### Parallelization Strategy

Phases 1 and 2 (facade enrichment) can be worked in parallel by domain. Once a domain's facades are enriched, its feature files (Phases 3-8) can be migrated independently. Multiple sub-agents can work on different domains simultaneously:

- **Agent A:** Groups facades → Groups feature files
- **Agent B:** Events facades → Events feature files
- **Agent C:** Amendments facades → Amendments feature files
- **Agent D:** All other domains (smaller scope)
