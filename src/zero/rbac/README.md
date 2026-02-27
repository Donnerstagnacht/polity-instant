# RBAC — Role-Based Access Control

Unified permission system shared between **React UI** and **Zero mutators (server)**.
Permission logic is defined once in `check.ts` and consumed by both layers.

```
┌──────────────────────────────────────────────────────┐
│  React UI                                            │
│  usePermissions(context) → { can, isMember, … }     │
│                          ↓                           │
│                     check.ts  ← single source of     │
│                          ↑       truth               │
│  Zero Mutators                                       │
│  can(tx, ctx, check)  → throws PermissionError       │
└──────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Check permissions in a React component

```tsx
import { usePermissions } from '@/zero/rbac';

function GroupSettings({ groupId }: { groupId: string }) {
  const { can, canManage, isMember, isLoading } = usePermissions({ groupId });

  if (isLoading) return <Spinner />;

  return (
    <>
      {canManage('groups') && <EditGroupButton />}
      {can('create', 'events') && <CreateEventButton />}
      {isMember() && <MemberContent />}
    </>
  );
}
```

### 2. Enforce permissions in a Zero mutator

```ts
import { defineMutator } from '@rocicorp/zero';
import { can } from '../rbac/can';

export const groupMutators = {
  update: defineMutator(schema, async ({ tx, ctx, args }) => {
    await can(tx, ctx, { action: 'manage', resource: 'groups', groupId: args.id });
    await tx.mutate.group.update({ ...args, updated_at: Date.now() });
  }),
};
```

- **Client (optimistic):** `can()` is skipped — the UI runs the mutation immediately.
- **Server (authoritative):** `can()` queries the DB, checks roles, and throws `PermissionError` if denied.

### 3. Handle permission errors in useXxxActions hooks

```ts
import { handleMutationError } from '../rbac/handleMutationError';

const updateGroup = useCallback(
  async args => {
    try {
      await zero.mutate(mutators.groups.update(args));
      toast.success(t('features.groups.toasts.updated'));
    } catch (error) {
      console.error('Failed to update group:', error);
      handleMutationError(error, t('features.groups.toasts.updateFailed'), t);
      throw error;
    }
  },
  [zero]
);
```

If the server rejects with `PermissionError`, the user sees a "Permission denied" toast with a description like _"cannot 'manage' on 'groups' in group:abc123"_. Other errors show the generic fallback message.

---

## Files

| File                     | Purpose                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| `types.ts`               | `ResourceType`, `ActionType`, `Membership`, `Participation`, etc.               |
| `constants.ts`           | `PERMISSION_IMPLIES` (inheritance), `DEFAULT_*_ROLES`, `ACTION_RIGHTS`          |
| `check.ts`               | Pure permission evaluation — `checkPermission()` + identity helpers             |
| `can.ts`                 | Server-side mutator guard — queries DB via `tx.run()`, throws `PermissionError` |
| `errors.ts`              | `PermissionError` class + `isPermissionError()` type guard                      |
| `handleMutationError.ts` | Toast utility for `useXxxActions` catch blocks                                  |
| `usePermissions.ts`      | React hook — loads RBAC data via Zero queries, exposes `can()` etc.             |
| `queries.ts`             | Zero query definitions for membership/participation/blogger permissions         |
| `workflow-constants.ts`  | Amendment workflow statuses, transitions, and validation                        |
| `index.ts`               | Barrel re-exports                                                               |

---

## `usePermissions` API

```ts
const perms = usePermissions({
  groupId?: string,
  eventId?: string,
  blogId?: string,
  amendment?: Amendment,
})
```

### Returns

| Property                | Type                                    | Description                                     |
| ----------------------- | --------------------------------------- | ----------------------------------------------- |
| `isLoading`             | `boolean`                               | `true` while RBAC data is syncing               |
| `can(action, resource)` | `(ActionType, ResourceType) => boolean` | Core permission check                           |
| `canView(resource)`     | `(ResourceType) => boolean`             | Shorthand for `can('view', …)`                  |
| `canManage(resource)`   | `(ResourceType) => boolean`             | Shorthand for `can('manage', …)`                |
| `canCreate(resource)`   | `(ResourceType) => boolean`             | Shorthand for `can('create', …)`                |
| `canUpdate(resource)`   | `(ResourceType) => boolean`             | Shorthand for `can('update', …)`                |
| `canDelete(resource)`   | `(ResourceType) => boolean`             | Shorthand for `can('delete', …)`                |
| `isMe(userId)`          | `(string?) => boolean`                  | Is target user the auth user?                   |
| `isMember()`            | `() => boolean`                         | Is user a member of the scoped group?           |
| `isParticipant()`       | `() => boolean`                         | Is user a participant of the scoped event?      |
| `isABlogger()`          | `() => boolean`                         | Is user a blogger of the scoped blog?           |
| `isCollaborator()`      | `() => boolean`                         | Is user a collaborator on the scoped amendment? |
| `isAuthor()`            | `() => boolean`                         | Is user the author of the scoped amendment?     |
| `canVote()`             | `() => boolean`                         | Has active voting right in scoped event?        |
| `canBeCandidate()`      | `() => boolean`                         | Has passive voting right in scoped event?       |

---

## `can()` (server-side) API

```ts
import { can } from '../rbac/can'

await can(tx, ctx, {
  action: ActionType,      // e.g. 'manage', 'create', 'view'
  resource: ResourceType,  // e.g. 'groups', 'events', 'groupRoles'
  groupId?: string | null, // scope to a specific group
  eventId?: string | null, // scope to a specific event
  blogId?: string | null,  // scope to a specific blog
})
```

- On **client** (`tx.location === 'client'`): returns immediately (no-op).
- On **server**: queries `group_membership` / `event_participant` / `blog_blogger` with their roles and action_rights, runs `checkPermission()`, and throws `PermissionError` on failure.

---

## Permission Inheritance

Defined in `constants.ts` via `PERMISSION_IMPLIES`:

| Has action            | Implies                              |
| --------------------- | ------------------------------------ |
| `manage`              | `view`, `create`, `update`, `delete` |
| `moderate`            | `view`                               |
| `manage_members`      | `view`, `invite_members`             |
| `manage_roles`        | `view`                               |
| `manage_participants` | `view`                               |
| `manage_speakers`     | `view`                               |
| `manage_votes`        | `view`                               |

A user with the `manage` action right on `groups` automatically passes checks for `view`, `create`, `update`, and `delete` on `groups`.

---

## Adding Permissions to a New Mutator

1. **Add `can()` in the mutator** (`src/zero/*/mutators.ts`):

   ```ts
   update: defineMutator(schema, async ({ tx, ctx, args }) => {
     await can(tx, ctx, { action: 'manage', resource: 'events', eventId: args.event_id })
     await tx.mutate.event.update(args)
   }),
   ```

2. **Use `handleMutationError` in the actions hook** (`src/zero/*/useXxxActions.ts`):

   ```ts
   catch (error) {
     handleMutationError(error, t('features.events.toasts.updateFailed'), t)
     throw error
   }
   ```

3. **Gate UI with `usePermissions`** (`src/features/*/ui/*.tsx`):
   ```tsx
   const { canManage } = usePermissions({ eventId });
   {
     canManage('events') && <EditEventButton />;
   }
   ```
