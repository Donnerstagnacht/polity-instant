# Entity Notification System — Implementation Tasks

This document tracks all tasks to build a comprehensive, reusable entity notification system for groups, events, amendments, and blogs. Notifications are triggered by membership/participation/collaboration actions, visible to users with the appropriate action right, and surfaced in entity pages, the global `/notifications` page, and as badge counts on navigation items.

**Progress Overview:**

- Total Tasks: 59
- Completed: 0
- Remaining: 59

---

## 1. New `viewNotifications` Action Right

> A dedicated right that guards entity notification pages and navigation icons. Separate from the existing `manageNotifications` (which allows managing/deleting notifications). `viewNotifications` is read-only access to the notification feed.

### 1.1 RBAC Type Definitions

- [ ] **1.1.1** Add `'viewNotifications'` to the `ActionType` union in `src/zero/rbac/types.ts`
- [ ] **1.1.2** Add `PERMISSION_IMPLIES` entry: `manageNotifications` implies `['viewNotifications']` in `src/zero/rbac/constants.ts`

### 1.2 Default Role Templates

- [ ] **1.2.1** Add `{ resource: 'groupNotifications', action: 'viewNotifications' }` to `DEFAULT_GROUP_ROLES` → **Admin** (explicit alongside `manageNotifications`), **Moderator**, and **Member** roles in `src/zero/rbac/constants.ts`
- [ ] **1.2.2** Add the same to `DEFAULT_EVENT_ROLES` → **Organizer**, **Voter**, and **Participant** roles
- [ ] **1.2.3** Add the same to `DEFAULT_AMENDMENT_ROLES` → **Author** and **Collaborator** roles
- [ ] **1.2.4** Add `{ resource: 'groupNotifications', action: 'viewNotifications', label: 'View Notifications' }` to the `ACTION_RIGHTS` UI list

### 1.3 Navigation Guards

- [ ] **1.3.1** In `src/navigation/nav-items/nav-items-authenticated.tsx`, update `getGroupSecondaryNavItems` to accept a `canViewNotifications` param; gate the notifications nav item on this instead of `isAdmin`
- [ ] **1.3.2** Update `getEventSecondaryNavItems` similarly — notifications item gated by `canViewNotifications` instead of `isAdmin`
- [ ] **1.3.3** Update `getAmendmentSecondaryNavItems` similarly — notifications item gated by `canViewNotifications` instead of `canManage`
- [ ] **1.3.4** In `src/navigation/state/useNavigation.tsx`, compute `canViewNotifications` via `checkPermission('viewNotifications', 'groupNotifications')` from `usePermissions` and pass to each `getXxxSecondaryNavItems` call

---

## 2. Entity Colors — Centralize & Reuse

> Extract entity color definitions from `src/features/timeline/constants/content-type-config.ts` to a shared utility, and reference them in notification UI and across the codebase.

### 2.1 Create Shared Entity Color Config

- [ ] **2.1.1** Create `src/utils/entity-colors.ts` exporting `ENTITY_COLORS: Record<EntityType, { gradient, gradientDark, accentColor, borderColor, bgLight, bgDark }>` derived from the existing `CONTENT_TYPE_CONFIG` values for `group`, `event`, `amendment`, `blog`, and `user`
- [ ] **2.1.2** Add notification-card variants: `notificationBorderLeft` (e.g. `border-l-emerald-500` for group, `border-l-amber-500` for event, `border-l-violet-500` for amendment, `border-l-teal-500` for blog) and `badgeBg` classes
- [ ] **2.1.3** Add a `getEntityGradientClasses(entityType)` helper

### 2.2 Migrate Existing Usages

- [ ] **2.2.1** Update `src/features/timeline/constants/content-type-config.ts` to delegate entity colors to the shared module (keep `ContentType` superset and `CONTENT_TYPE_CONFIG` intact)
- [ ] **2.2.2** Update `src/features/notifications/ui/NotificationItem.tsx` to use entity-specific gradient border-left and badge colors from `entity-colors.ts`
- [ ] **2.2.3** Update `src/components/notifications/EntityNotifications.tsx` to import from `entity-colors.ts` for entity-type-specific card styling

---

## 3. Notification Schema Updates

> Add a `notification_read` table for entity-level shared read tracking and a `category` column to the notification table for efficient filtering.
>
> **Why `notification_read`?** Entity notifications (e.g. "User X requested to join Group Y") are stored once and shown to all members of that entity who hold the `viewNotifications` right. Unlike personal notifications which track `is_read` per-recipient row, entity notifications need a separate junction table to track whether _anyone_ on the entity has already seen them. The `notification_read` table records `(notification_id, entity_type, entity_id)` — once any authorized member views the entity's notification page, a row is inserted and the notification becomes "read" for that entire entity context. This prevents duplicating notification rows per member and keeps the read state entity-scoped.

### 3.1 Supabase Schema

- [ ] **3.1.1** Add SQL migration: `CREATE TABLE notification_read` with columns `(id UUID PK DEFAULT gen_random_uuid(), notification_id UUID FK REFERENCES notification(id) ON DELETE CASCADE, entity_type TEXT NOT NULL, entity_id UUID NOT NULL, read_by_user_id UUID FK REFERENCES auth.users(id), read_at TIMESTAMPTZ NOT NULL DEFAULT now())` with a UNIQUE constraint on `(notification_id, entity_type, entity_id)`
- [ ] **3.1.2** Add index: `CREATE INDEX idx_notification_read_entity ON notification_read (entity_type, entity_id)`
- [ ] **3.1.3** Add RLS policy: `ENABLE ROW LEVEL SECURITY; CREATE POLICY service_role_all ON notification_read FOR ALL USING (true) WITH CHECK (true)` (consistent with existing notification tables)
- [ ] **3.1.4** Add `category TEXT` column to the `notification` table (values: `'membership'`, `'subscription'`, `'content'`, `'moderation'`, `'voting'`, `'system'`) — add index `CREATE INDEX idx_notification_category ON notification (category)`
- [ ] **3.1.5** Add indexes on `notification` table: `(recipient_entity_id, created_at)`, `(recipient_group_id, created_at)`, `(recipient_id, is_read)` if not already present

### 3.2 Zero Table Definition

- [ ] **3.2.1** Add `notificationRead` table to `src/zero/notifications/table.ts`: `id, notification_id, entity_type, entity_id, read_by_user_id, read_at`
- [ ] **3.2.2** Add `category: string().optional()` column to the existing `notification` table definition

### 3.3 Zod Validation Schemas

- [ ] **3.3.1** Add `createNotificationReadSchema` and `deleteNotificationReadSchema` to `src/zero/notifications/schema.ts`
- [ ] **3.3.2** Add `category: z.string().nullable().optional()` to `baseNotificationSchema` and `createNotificationSchema`

### 3.4 Register Table in Zero Schema

- [ ] **3.4.1** Register the `notificationRead` table and its relationships (FK to `notification`) in the central Zero schema file

---

## 4. Reusable Notification Dispatch System

> A pure-function-based system where mutations or action hooks call a single `buildEntityNotification()` helper and pass the result to `createNotification`. Entity notifications target the entity (not individual users). Personal notifications target specific users.

### 4.1 Notification Builder — Pure Functions

- [ ] **4.1.1** Create `src/zero/notifications/builders.ts` with:
  - `buildEntityNotification(params)` — maps sender/recipient/related entity IDs to the correct columns (`recipient_group_id`, `recipient_event_id`, etc. based on `recipientEntityType`)
  - `buildPersonalNotification(params)` — for direct user-targeted notifications (sets `recipient_id`)
  - `buildBatchNotifications(params)` — for sending the same notification to multiple specific users (returns array)

### 4.2 Notification Type Constants

- [ ] **4.2.1** Create `src/zero/notifications/notificationTypes.ts` exporting grouped constants:
  ```ts
  export const GROUP_NOTIFICATION_TYPES = { MEMBERSHIP_REQUEST: 'membership_request', ... } as const
  export const EVENT_NOTIFICATION_TYPES = { PARTICIPATION_REQUEST: 'participation_request', ... } as const
  export const AMENDMENT_NOTIFICATION_TYPES = { COLLABORATION_REQUEST: 'collaboration_request', ... } as const
  export const BLOG_NOTIFICATION_TYPES = { NEW_SUBSCRIBER: 'blog_new_subscriber', ... } as const
  ```

### 4.3 Notification Dispatch Hook

- [ ] **4.3.1** Create `src/zero/notifications/useNotificationDispatch.ts` — hook wrapping `useNotificationActions().createNotification` that:
  - Accepts output from any builder function (single or array)
  - For arrays, inserts all in sequence (best-effort, swallows individual failures)
  - Generates UUIDs via `crypto.randomUUID()` for IDs not provided
  - Returns `{ dispatch(notification), dispatchBatch(notifications[]) }`

---

## 5. Notification Settings Integration

> The existing `notification_setting` table stores per-user preferences as JSONB columns (one per entity category: `group_notifications`, `event_notifications`, etc.). Each column contains a typed object with boolean flags (e.g. `{ membershipRequests: true, newMembers: false }`). **Currently, these settings are never consulted when dispatching notifications.** This phase adds a mapping from `NotificationType` → settings key and a gate function.
>
> **JSONB rationale**: Settings are only ever read client-side (loaded via Zero sync) and updated as whole-column writes. They are never queried or filtered by individual keys in SQL. JSONB is a good fit because: (1) it avoids 60+ boolean columns, (2) the schema is typed in TypeScript, (3) defaults are applied in the merge layer (NULL = all true), and (4) Zero handles JSONB columns natively.

### 5.1 Type-to-Setting Mapping

- [ ] **5.1.1** Create `src/features/notifications/logic/notificationTypeSettingMap.ts` exporting:
  ```ts
  type SettingPath = {
    category:
      | 'group_notifications'
      | 'event_notifications'
      | 'amendment_notifications'
      | 'blog_notifications'
      | 'todo_notifications'
      | 'social_notifications';
    key: string; // the boolean field name within that category
  };
  export const NOTIFICATION_TYPE_TO_SETTING: Record<string, SettingPath> = {
    membership_request: { category: 'group_notifications', key: 'membershipRequests' },
    membership_approved: { category: 'group_notifications', key: 'membershipRequests' },
    group_new_event: { category: 'group_notifications', key: 'newEvents' },
    group_new_subscriber: { category: 'group_notifications', key: 'newSubscribers' },
    participation_request: { category: 'event_notifications', key: 'participationRequests' },
    collaboration_request: { category: 'amendment_notifications', key: 'collaborationRequests' },
    // ... all ~150 types mapped to their setting key
  };
  ```

### 5.2 Gate Function

- [ ] **5.2.1** In the same file, export a pure function:
  ```ts
  export function shouldDispatchNotification(
    type: NotificationType,
    recipientSettings: NotificationSettings | null
  ): boolean;
  ```

  - Looks up `NOTIFICATION_TYPE_TO_SETTING[type]` for the category + key
  - If no mapping exists (e.g. system notifications), returns `true` (always send)
  - If `recipientSettings` is null, returns `true` (NULL = all defaults = all true)
  - Otherwise reads `recipientSettings[category][key]` and returns it
  - **Entity notifications**: always dispatched (shared entity log, not gated by individual settings)
  - **Personal notifications**: gated by recipient's settings

### 5.3 Integrate into Dispatch Hook

- [ ] **5.3.1** Update `useNotificationDispatch.ts` to accept an optional `recipientSettings` param. For personal notifications, call `shouldDispatchNotification()` and skip dispatch if it returns `false`. For entity notifications, always dispatch.

### 5.4 Delivery Settings Check

- [ ] **5.4.1** Also check `delivery_settings.inAppNotifications` — if `false`, skip in-app notification creation entirely (kill switch for all in-app notifications)

---

## 6. Group Notification Triggers

> Wire `createNotification` calls into group action flows. Entity-targeted notifications go to the group; personal notifications go to the affected user.

### 6.1 Group Notification Orchestration Hook

- [ ] **6.1.1** Create `src/features/groups/hooks/useGroupNotifications.ts` using `useNotificationDispatch` with handlers:
  - `notifyMembershipRequest(groupId, groupName, requestingUserId, requestingUserName)` → entity notification to group
  - `notifyMembershipApproved(groupId, groupName, userId, userName)` → personal to user + entity to group
  - `notifyMembershipRejected(groupId, groupName, userId, userName)` → personal to user + entity to group
  - `notifyMemberRemoved(groupId, groupName, userId, userName, removedByName)` → personal to user + entity to group
  - `notifyMemberLeft(groupId, groupName, userId, userName)` → entity to group
  - `notifyNewSubscriber(groupId, groupName, userId, userName)` → entity to group
  - `notifyUnsubscribed(groupId, groupName, userId, userName)` → entity to group
  - `notifyInvitation(groupId, groupName, userId, inviterName)` → personal to user
  - `notifyInvitationAccepted(groupId, groupName, userId, userName)` → entity to group
  - `notifyInvitationDeclined(groupId, groupName, userId, userName)` → entity to group
  - `notifyRoleChanged(groupId, groupName, userId, userName, newRole)` → personal to user + entity to group
  - `notifyGroupUpdated(groupId, groupName, updaterName)` → entity to group
  - `notifyNewEvent(groupId, groupName, eventId, eventTitle, creatorName)` → entity to group
  - `notifyNewAmendment(groupId, groupName, amendmentId, amendmentTitle, creatorName)` → entity to group

### 6.2 Integrate into Existing Group Feature Hooks

- [ ] **6.2.1** Find all group membership/subscription/invitation action call sites (in `src/features/groups/hooks/` or page hooks) and add the corresponding notification call from `useGroupNotifications` after each successful mutation

---

## 7. Event Notification Triggers

### 7.1 Event Notification Orchestration Hook

- [ ] **7.1.1** Create `src/features/events/hooks/useEventNotifications.ts` with handlers:
  - `notifyParticipationRequest(eventId, eventTitle, userId, userName)` → entity to event
  - `notifyParticipationApproved(eventId, eventTitle, userId, userName)` → personal + entity
  - `notifyParticipationRejected(eventId, eventTitle, userId, userName)` → personal + entity
  - `notifyParticipantRemoved(eventId, eventTitle, userId, userName)` → personal + entity
  - `notifyParticipantLeft(eventId, eventTitle, userId, userName)` → entity
  - `notifyNewSubscriber(eventId, eventTitle, userId, userName)` → entity
  - `notifyInvitation(eventId, eventTitle, userId, inviterName)` → personal
  - `notifyInvitationAccepted(eventId, eventTitle, userId, userName)` → entity
  - `notifyInvitationDeclined(eventId, eventTitle, userId, userName)` → entity
  - `notifyEventUpdated(eventId, eventTitle, updaterName)` → entity
  - `notifyScheduleChanged(eventId, eventTitle, updaterName)` → entity
  - `notifyAgendaItemCreated(eventId, eventTitle, itemTitle)` → entity
  - `notifyVotingSessionStarted(eventId, eventTitle, sessionName)` → entity
  - `notifyVotingSessionEnded(eventId, eventTitle, sessionName)` → entity

### 7.2 Integrate into Existing Event Feature Hooks

- [ ] **7.2.1** Wire notification calls into event participation, invitation, and editing action flows (same pattern as groups)

---

## 8. Amendment Notification Triggers

### 8.1 Amendment Notification Orchestration Hook

- [ ] **8.1.1** Create `src/features/amendments/hooks/useAmendmentNotifications.ts` with handlers:
  - `notifyCollaborationRequest(amendmentId, title, userId, userName)` → entity
  - `notifyCollaborationApproved(amendmentId, title, userId, userName)` → personal + entity
  - `notifyCollaborationRejected(amendmentId, title, userId, userName)` → personal + entity
  - `notifyCollaboratorRemoved(amendmentId, title, userId, userName)` → personal + entity
  - `notifyCollaboratorLeft(amendmentId, title, userId, userName)` → entity
  - `notifyNewSubscriber(amendmentId, title, userId, userName)` → entity
  - `notifyInvitation(amendmentId, title, userId, inviterName)` → personal
  - `notifyInvitationAccepted(amendmentId, title, userId, userName)` → entity
  - `notifyInvitationDeclined(amendmentId, title, userId, userName)` → entity
  - `notifyAmendmentUpdated(amendmentId, title, updaterName)` → entity
  - `notifyWorkflowChanged(amendmentId, title, newStatus)` → entity
  - `notifyChangeRequestCreated(amendmentId, title, crTitle, creatorName)` → entity
  - `notifyChangeRequestAccepted(amendmentId, title, crTitle)` → entity
  - `notifyChangeRequestRejected(amendmentId, title, crTitle)` → entity
  - `notifyVoteCast(amendmentId, title, voterName, voteType)` → entity

### 8.2 Integrate into Existing Amendment Feature Hooks

- [ ] **8.2.1** Wire notification calls into amendment collaboration, change request, and voting action flows

---

## 9. Entity Unread Badge in Navigation

> Show unread notification count badge on the entity's notifications nav item (secondary nav). A notification is "unread for the entity" if there is **no** row in `notification_read` for `(notification_id, entity_type, entity_id)`.

### 9.1 Notification Read Tracking — Queries & Mutators

- [ ] **9.1.1** Add query `notificationReads.byEntity({ entityType, entityId })` to `src/zero/notifications/queries.ts` — returns all `notification_read` rows for an entity
- [ ] **9.1.2** Add mutator `markEntityNotificationRead({ notification_id, entity_type, entity_id, read_by_user_id })` to `src/zero/notifications/mutators.ts`
- [ ] **9.1.3** Add mutator `markAllEntityNotificationsRead({ entity_type, entity_id, notification_ids[], read_by_user_id })` that batch-inserts `notification_read` rows

### 9.2 Entity Unread Count Hook

- [ ] **9.2.1** Create `src/zero/notifications/useEntityUnreadCount.ts` — hook that:
  - Accepts `{ entityType, entityId }`
  - Queries entity notifications via `notifications.byEntityId` and entity reads via `notificationReads.byEntity`
  - Returns `{ unreadCount }` = count of notifications with no matching read row
  - Memoizes efficiently with `useMemo`

### 9.3 Wire Badges into Navigation

- [ ] **9.3.1** In `src/navigation/state/useNavigation.tsx`, import `useEntityUnreadCount` and compute badge count for the current entity (based on active route)
- [ ] **9.3.2** Pass `notificationBadge` count to `getGroupSecondaryNavItems`, `getEventSecondaryNavItems`, `getAmendmentSecondaryNavItems` in `src/navigation/nav-items/nav-items-authenticated.tsx`

### 9.4 Auto-Mark Read on Page Visit

- [ ] **9.4.1** In `src/components/notifications/EntityNotifications.tsx`, call `markAllEntityNotificationsRead` on mount (with the current entity's unread notification IDs)

---

## 10. Entity Tab on `/notifications` Page

> The "Entity" tab shows entity notifications for all entities where the current user holds `viewNotifications` right.

### 10.1 Filter Update

- [ ] **10.1.1** Update `filterAccessibleNotifications` in `src/features/notifications/logic/notificationHelpers.ts` to also accept `viewNotifications` action (in addition to existing `manageNotifications` / `manage` checks)

### 10.2 Entity Badge Colors on Notification Items

- [ ] **10.2.1** In `src/features/notifications/ui/NotificationItem.tsx`, determine entity type from `recipientGroup`/`recipientEvent`/`recipientAmendment`/`recipientBlog` and apply corresponding entity-specific `notificationBorderLeft` + `badgeBg` classes from `entity-colors.ts`

### 10.3 Entity Gradient Badge on Cards

- [ ] **10.3.1** Add a small gradient "entity type" chip/tag to entity notification cards showing the entity type (Group/Event/Amendment/Blog) with the corresponding gradient from `entity-colors.ts`

---

## 11. Notification Icons & Colors — Expand Constants

> The current `notificationConstants.ts` only covers 7 legacy types. Expand to cover all ~150 notification types.

### 11.1 Expand Icon and Color Maps

- [ ] **11.1.1** In `src/features/notifications/utils/notificationConstants.ts`, add entries for all group, event, amendment, and blog notification types (match icons to action semantics: `UserPlus` for join/request, `Check` for approve, `X` for reject/remove, `Bell` for subscribe, `Settings` for update, etc.)
- [ ] **11.1.2** Add `getNotificationIcon(type: string): LucideIcon` and `getNotificationColor(type: string): string` helper functions with fallbacks

### 11.2 Update Consumers

- [ ] **11.2.1** Update `src/features/notifications/ui/NotificationItem.tsx` to use `getNotificationIcon` / `getNotificationColor`
- [ ] **11.2.2** Update `src/components/notifications/EntityNotifications.tsx` to import from centralized constants instead of its inline duplicate maps

---

## 12. Performance Considerations

### 12.1 Query Optimization

- [ ] **12.1.1** Add pagination to entity notification queries: update `byEntityId` in `src/zero/notifications/queries.ts` to include `.limit(100)` by default with an optional `limit` param
- [ ] **12.1.2** Add `.limit(50)` to `byRecipientGroups` query to prevent loading unbounded notification sets

### 12.2 Batch Dispatch Performance

- [ ] **12.2.1** In `useNotificationDispatch`, implement `dispatchBatch` with a configurable concurrency limit (default 5) using a sequential queue

---

## 13. Schema Sync Verification

> Per architecture conventions, Zero tables, Zod schemas, and Supabase schemas must stay in sync.

### 13.1 Verify All Three Layers

- [ ] **13.1.1** Verify `notification` table: Supabase SQL ↔ Zero `table.ts` ↔ Zod `schema.ts` all include the new `category` column
- [ ] **13.1.2** Verify `notification_read` table: exists in all three layers with matching columns and types
- [ ] **13.1.3** Verify the `viewNotifications` action type works in the RBAC system (no new DB changes needed — `action_right.action` is a TEXT column)

---

## Summary

| Phase                                | Tasks | Status      | Dependencies |
| ------------------------------------ | ----- | ----------- | ------------ |
| 1. `viewNotifications` Action Right  | 10    | Not Started | None         |
| 2. Entity Colors — Centralize        | 6     | Not Started | None         |
| 3. Notification Schema Updates       | 9     | Not Started | None         |
| 4. Reusable Dispatch System          | 3     | Not Started | None         |
| 5. Notification Settings Integration | 4     | Not Started | Phase 4      |
| 6. Group Notification Triggers       | 2     | Not Started | Phases 4 + 5 |
| 7. Event Notification Triggers       | 2     | Not Started | Phases 4 + 5 |
| 8. Amendment Notification Triggers   | 2     | Not Started | Phases 4 + 5 |
| 9. Entity Unread Badge               | 6     | Not Started | Phase 3      |
| 10. Entity Tab on `/notifications`   | 3     | Not Started | Phases 1 + 2 |
| 11. Icons & Colors — Expand          | 4     | Not Started | None         |
| 12. Performance                      | 3     | Not Started | Phases 4 + 9 |
| 13. Schema Sync                      | 3     | Not Started | Phase 3      |

**Parallelization Notes:**

- **Wave 1** (fully independent): Phases 1, 2, 3, 4, 11 can all be implemented in parallel
- **Wave 2** (depends on Wave 1): Phase 5 (needs Phase 4), Phase 9 (needs Phase 3), Phase 10 (needs Phases 1+2)
- **Wave 3** (depends on Wave 2): Phases 6, 7, 8 (need Phases 4+5)
- **Wave 4** (final): Phases 12, 13 (verification and polish)

---

## Notes

### Entity-Level Read Tracking (`notification_read` Table)

Unlike personal notifications where `is_read` is stored directly on the `notification` row (one row per recipient), entity notifications are stored **once** and shown to all members of that entity who hold the `viewNotifications` right. This means we cannot use `is_read` on the notification row itself — it would affect all viewers simultaneously. Instead, the `notification_read` junction table records `(notification_id, entity_type, entity_id)` with a UNIQUE constraint. When **any** authorized member visits the entity's notification page, all unread notifications for that entity get a `notification_read` row inserted. The notification then appears as "read" for that entire entity context. This is intentional — entity notifications are a shared log, not a personal inbox.

### JSONB for Notification Settings

The `notification_setting` table uses JSONB columns (`group_notifications`, `event_notifications`, etc.) to store per-category boolean flags. This is performant because: (1) settings are only ever read as whole objects (loaded via Zero sync), never filtered by individual keys in SQL, (2) it avoids 60+ boolean columns in the database, (3) the TypeScript layer provides full type safety via interfaces like `GroupNotificationSettings`, (4) NULL semantics are clean — NULL column = all defaults = all true (merge happens client-side), and (5) writes are always whole-column updates (not individual field patches).

### Notification Settings Integration

Currently, `notification_setting` preferences exist in the DB and UI (`NotificationSettingsPage`) but are **never consulted during notification dispatch**. Phase 5 fixes this by creating a `NOTIFICATION_TYPE_TO_SETTING` mapping that connects each `NotificationType` (e.g. `'membership_request'`) to its settings category and key (e.g. `group_notifications.membershipRequests`). A `shouldDispatchNotification()` pure function checks this mapping against the recipient's settings. **Entity notifications are always dispatched** (they are a shared entity log). **Personal notifications check the recipient's settings** before dispatch (e.g. if a user has disabled `membershipRequests`, they won't get a personal "your request was approved" notification).

### Notification Types Already Defined

The `NotificationType` union in `src/features/notifications/types/notification.types.ts` already covers ~150+ types across 8 categories. The builder functions reference these existing types — no new types need to be added.

### No Core Mutator Changes Needed

The existing `createNotification` mutator in `src/zero/notifications/mutators.ts` is generic — it accepts all columns as args and inserts with `is_read: false` and `created_at: now`. The builder functions handle the complexity of mapping entity types to the correct polymorphic columns (`recipient_group_id`, `recipient_event_id`, etc.).

### `groupNotifications` Resource Reused Across Entity Types

Events and amendments already reference `groupNotifications` as their notification resource in the RBAC constants. This keeps the permission model simple — one resource type for notification viewing/managing across all entity types.

### `content-type-config.ts` vs `entity-colors.ts`

`content-type-config.ts` remains the superset config (includes `vote`, `election`, `video`, etc. timeline content types). The new `entity-colors.ts` extracts just the entity-relevant subset (group/event/amendment/blog/user) for reuse outside timeline code.

---

## Implementation Handoff

The task plan has been created at `tasks/entity-notification-system-tasks.md`.

To begin implementation, you can:

1. Ask me to implement specific phases from the plan
2. Use sub-agents to parallelize independent phases (1, 2, 3, 4, 10)
3. Manually work through the checklist, marking items complete as you go

Would you like me to start implementing any specific phase?
