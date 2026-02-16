# E2E Test Stabilization — Setup & Cleanup Seed Strategy

This plan makes every E2E test **independent and hermetic** by introducing per-test data seeding and cleanup via the InstantDB Admin SDK, Playwright fixtures, and a reusable test-data factory layer.

**Progress Overview:**

- Total Tasks: 58
- Completed: 58
- Remaining: 0

---

## Problem Statement

| Current Issue                | Impact                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| No per-test data isolation   | Tests depend on global `npm run seed` having been run; parallel tests mutate shared data |
| No cleanup                   | Create-tests leave orphan entities, polluting the database over time                     |
| Shared `TEST_ENTITY_IDS`     | Multiple tests read/write the same entities, causing flaky failures when run in parallel |
| No Playwright fixtures       | Every test manually calls `loginAsTestUser(page)` — no structured setup/teardown         |
| Single test user identity    | `main` and `tobias` share the same email — can't test multi-user scenarios               |
| Brittle waits                | `waitForTimeout()` instead of data-ready assertions                                      |
| Duplicate navigation helpers | `subscription.ts` duplicates `navigation.ts`                                             |

---

## Architecture Overview

```
e2e/
├── fixtures/
│   ├── test-base.ts            ← Extended Playwright test with auto-login + cleanup
│   ├── admin-db.ts             ← Singleton InstantDB Admin SDK initializer
│   └── entity-factories/
│       ├── factory-base.ts     ← Base factory class (create, track, teardown)
│       ├── user.factory.ts     ← Create/cleanup users + auth tokens
│       ├── group.factory.ts    ← Create/cleanup groups (with roles, memberships, RBAC)
│       ├── event.factory.ts    ← Create/cleanup events (with participants)
│       ├── amendment.factory.ts← Create/cleanup amendments (with docs, collaborators)
│       ├── blog.factory.ts     ← Create/cleanup blogs (with bloggers)
│       ├── todo.factory.ts     ← Create/cleanup todos
│       ├── conversation.factory.ts ← Create/cleanup conversations + messages
│       ├── notification.factory.ts ← Create/cleanup notifications
│       └── index.ts            ← Barrel export
├── helpers/
│   ├── auth.ts                 ← (Updated) support multiple test user emails
│   ├── navigation.ts           ← (Unchanged)
│   ├── magic-code-helper.ts    ← (Unchanged)
│   └── subscription.ts         ← (Deduplicate nav helpers)
```

### Key Design Decisions

1. **Admin SDK for data operations** — Use `@instantdb/admin` (already available in `magic-code-helper.ts`) to create/delete test entities server-side. No UI clicks needed for data setup.

2. **Factory pattern** — Each entity type gets a factory class that:

   - Creates entities with sensible defaults (overridable)
   - Generates unique IDs per test (using `crypto.randomUUID()`)
   - Tracks all created entity/link IDs
   - Provides a `cleanup()` method that deletes everything in reverse dependency order

3. **Playwright fixture extension** — A custom `test.extend<>()` that provides:

   - `authenticatedPage` — Pre-logged-in page (skips manual login)
   - `factories` — Object of entity factories scoped to the test, auto-cleaned on teardown
   - `adminDb` — Direct admin SDK access for custom operations

4. **Test-scoped IDs** — Each test generates its own UUIDs. No more sharing `TEST_ENTITY_IDS` between tests. Existing `TEST_ENTITY_IDS` remain for backward compat with the global seed script.

5. **Cleanup runs in `afterEach`** — Even on test failure, the fixture teardown deletes all entities created during the test.

---

## 1. Admin SDK Singleton (`e2e/fixtures/admin-db.ts`)

### 1.1 Create Admin DB Module

- [x] Create `e2e/fixtures/admin-db.ts` — Singleton that initializes `@instantdb/admin` with env vars (reuse pattern from `magic-code-helper.ts`)
- [x] Export `getAdminDb()` function returning `{ db, tx }` (lazy-initialized, cached)
- [x] Export typed helper `adminTransact(txns: any[])` that calls `db.transact()` with batch retry logic (port `batchTransact` from `scripts/helpers/transaction.helpers.ts`)
- [x] Export `adminQuery(query)` wrapper for `db.query()`

**Reference implementation:**

```typescript
// e2e/fixtures/admin-db.ts
import { init, tx, id } from '@instantdb/admin';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

let _db: ReturnType<typeof init> | null = null;

export function getAdminDb() {
  if (!_db) {
    const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
    const adminToken = process.env.INSTANT_ADMIN_TOKEN;
    if (!appId || !adminToken) throw new Error('Missing INSTANT env vars');
    _db = init({ appId, adminToken });
  }
  return _db;
}

export { tx, id };

export async function adminTransact(txns: any[], batchSize = 20) {
  const db = getAdminDb();
  for (let i = 0; i < txns.length; i += batchSize) {
    const batch = txns.slice(i, i + batchSize);
    await db.transact(batch);
  }
}

export async function adminQuery(query: Record<string, any>) {
  const db = getAdminDb();
  return db.query(query);
}
```

---

## 2. Factory Base Class (`e2e/fixtures/entity-factories/factory-base.ts`)

### 2.1 Create Factory Base

- [x] Create `e2e/fixtures/entity-factories/factory-base.ts` — Abstract base class for all entity factories
- [x] Implement `_createdEntities: Map<string, Set<string>>` — tracks `entityTable → Set<id>`
- [x] Implement `_createdLinks: Array<{ entity, id, linkField, linkedEntity, linkedId }>` — tracks links for unlinking
- [x] Implement `trackEntity(table, id)` and `trackLink(...)` methods
- [x] Implement `cleanup()` — unlinks all tracked links, then deletes all tracked entities in reverse insertion order
- [x] Implement `generateId()` — returns `crypto.randomUUID()`

**Reference implementation:**

```typescript
// e2e/fixtures/entity-factories/factory-base.ts
import { adminTransact, tx } from '../admin-db';

interface TrackedLink {
  entity: string;
  id: string;
  linkField: string;
  linkedEntity: string;
  linkedId: string;
}

export abstract class FactoryBase {
  protected _entities = new Map<string, Set<string>>();
  protected _links: TrackedLink[] = [];

  protected trackEntity(table: string, entityId: string) {
    if (!this._entities.has(table)) this._entities.set(table, new Set());
    this._entities.get(table)!.add(entityId);
  }

  protected trackLink(
    entity: string,
    id: string,
    linkField: string,
    linkedEntity: string,
    linkedId: string
  ) {
    this._links.push({ entity, id, linkField, linkedEntity, linkedId });
  }

  generateId(): string {
    return crypto.randomUUID();
  }

  async cleanup(): Promise<void> {
    // 1. Unlink all tracked links (reverse order)
    const unlinkTxns = [...this._links]
      .reverse()
      .map(l => tx[l.entity][l.id].unlink({ [l.linkField]: l.linkedId }));
    if (unlinkTxns.length) await adminTransact(unlinkTxns);

    // 2. Delete all tracked entities (reverse insertion order)
    const tables = [...this._entities.keys()].reverse();
    for (const table of tables) {
      const ids = [...this._entities.get(table)!];
      const deleteTxns = ids.map(id => tx[table][id].delete());
      if (deleteTxns.length) await adminTransact(deleteTxns);
    }

    this._entities.clear();
    this._links = [];
  }

  get trackedEntityCount(): number {
    let count = 0;
    for (const ids of this._entities.values()) count += ids.size;
    return count;
  }
}
```

---

## 3. Entity Factories

### 3.1 User Factory (`e2e/fixtures/entity-factories/user.factory.ts`)

- [x] Create `user.factory.ts`
- [x] Implement `createUser(overrides?)` — creates `$users` entity with defaults: `{ name, email, handle, visibility: 'public', createdAt, updatedAt }`
- [x] Each user gets a unique email like `e2e-{uuid}@test.polity.app` and handle `e2e-{shortId}`
- [x] Implement `createAuthToken(email)` — generates an InstantDB auth token for the user (via `adminDb.auth.createToken()`)
- [x] Track user ID for cleanup
- [x] Implement `createUserWithAuth(overrides?)` — combines createUser + createAuthToken, returns `{ userId, email, token }`

**Important:** The user factory is the foundation — almost every other factory depends on having a user.

### 3.2 Group Factory (`e2e/fixtures/entity-factories/group.factory.ts`)

- [x] Create `group.factory.ts`
- [x] Implement `createGroup(ownerId, overrides?)` — creates:
  - `groups` entity with defaults `{ name, description, isPublic: true, visibility: 'public', memberCount: 1 }`
  - Link `groups → $users` (owner)
  - 2 `roles` entities ("Admin" + "Member") linked to group
  - `actionRights` for each role linked to role + group
  - `groupMemberships` for owner (status: 'member') linked to user + group + admin role
- [x] Implement `addMember(groupId, userId, roleType?)` — creates `groupMemberships` linked to user, group, role
- [x] Implement `createGroupConversation(groupId, memberIds)` — creates conversation + participants + links
- [x] Track all entities/links for cleanup

### 3.3 Event Factory (`e2e/fixtures/entity-factories/event.factory.ts`)

- [x] Create `event.factory.ts`
- [x] Implement `createEvent(organizerId, groupId?, overrides?)` — creates:
  - `events` entity with defaults `{ title, description, startDate, endDate, isPublic: true, visibility: 'public', status: 'upcoming' }`
  - Link `events → $users` (organizer)
  - Optional link `events → groups`
  - `eventParticipants` for organizer (status: 'confirmed') linked to event + user
- [x] Implement `addParticipant(eventId, userId, status?)` — creates `eventParticipants`
- [x] Implement `createAgendaItem(eventId, creatorId, overrides?)` — creates `agendaItems` linked to event + creator
- [x] Track all entities/links for cleanup

### 3.4 Amendment Factory (`e2e/fixtures/entity-factories/amendment.factory.ts`)

- [x] Create `amendment.factory.ts`
- [x] Implement `createAmendment(ownerId, groupId?, overrides?)` — creates:
  - `amendments` entity with defaults `{ title, status: 'active', workflowStatus: 'collaborative_editing', visibility: 'public' }`
  - Link `amendments → $users` (owner)
  - Optional link `amendments → groups`
  - `documents` entity with Plate.js content (reuse pattern from `scripts/helpers/entity.helpers.ts`)
  - Link `documents → amendments`, `documents → $users` (owner)
  - `amendmentCollaborators` for owner (status: 'author')
  - `amendmentPaths` entity linked to amendment
- [x] Implement `addCollaborator(amendmentId, userId, status?)` — creates `amendmentCollaborators`
- [x] Implement `createChangeRequest(amendmentId, creatorId, overrides?)` — creates `changeRequests` linked to amendment + creator
- [x] Track all entities/links for cleanup

### 3.5 Blog Factory (`e2e/fixtures/entity-factories/blog.factory.ts`)

- [x] Create `blog.factory.ts`
- [x] Implement `createBlog(ownerId, groupId?, overrides?)` — creates:
  - `blogs` entity with defaults `{ title, description, isPublic: true, visibility: 'public', content: plateJsDefault }`
  - Link `blogs → groups` (optional)
  - `blogBloggers` for owner (status: 'owner') linked to blog + user
  - `roles` for blog (scope: 'blog')
- [x] Implement `addBlogger(blogId, userId, status?)` — creates `blogBloggers`
- [x] Track all entities/links for cleanup

### 3.6 Todo Factory (`e2e/fixtures/entity-factories/todo.factory.ts`)

- [x] Create `todo.factory.ts`
- [x] Implement `createTodo(creatorId, groupId?, overrides?)` — creates `todos` entity with defaults `{ title, status: 'open', priority: 'medium' }`, links to creator + optional group
- [x] Implement `assignTodo(todoId, userId)` — creates `todoAssignments`
- [x] Track all entities/links for cleanup

### 3.7 Conversation Factory (`e2e/fixtures/entity-factories/conversation.factory.ts`)

- [x] Create `conversation.factory.ts`
- [x] Implement `createConversation(participantIds, groupId?, overrides?)` — creates `conversations` entity + `conversationParticipants` + links
- [x] Implement `addMessage(conversationId, senderId, text)` — creates `messages` linked to conversation + sender
- [x] Track all entities/links for cleanup

### 3.8 Notification Factory (`e2e/fixtures/entity-factories/notification.factory.ts`)

- [x] Create `notification.factory.ts`
- [x] Implement `createNotification(recipientId, senderId, overrides?)` — creates `notifications` with defaults, links to recipient + sender + optional related entities
- [x] Track all entities/links for cleanup

### 3.9 Barrel Export (`e2e/fixtures/entity-factories/index.ts`)

- [x] Create `e2e/fixtures/entity-factories/index.ts` — re-exports all factories

---

## 4. Playwright Fixture Extension (`e2e/fixtures/test-base.ts`)

### 4.1 Create Extended Test

- [x] Create `e2e/fixtures/test-base.ts` — Custom `test.extend<TestFixtures>()` that provides:
  - `adminDb` — the admin SDK instance
  - `userFactory` — auto-cleaned `UserFactory()`
  - `groupFactory` — auto-cleaned `GroupFactory()`
  - `eventFactory` — auto-cleaned `EventFactory()`
  - `amendmentFactory` — auto-cleaned `AmendmentFactory()`
  - `blogFactory` — auto-cleaned `BlogFactory()`
  - `todoFactory` — auto-cleaned `TodoFactory()`
  - `conversationFactory` — auto-cleaned `ConversationFactory()`
  - `notificationFactory` — auto-cleaned `NotificationFactory()`
  - `authenticatedPage` — a `Page` that's already logged in as the main test user

**Reference implementation:**

```typescript
// e2e/fixtures/test-base.ts
import { test as base, expect } from '@playwright/test';
import { getAdminDb } from './admin-db';
import { UserFactory } from './entity-factories/user.factory';
import { GroupFactory } from './entity-factories/group.factory';
// ... other factories

type TestFixtures = {
  adminDb: ReturnType<typeof getAdminDb>;
  userFactory: UserFactory;
  groupFactory: GroupFactory;
  eventFactory: EventFactory;
  amendmentFactory: AmendmentFactory;
  blogFactory: BlogFactory;
  todoFactory: TodoFactory;
  conversationFactory: ConversationFactory;
  notificationFactory: NotificationFactory;
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  adminDb: async ({}, use) => {
    await use(getAdminDb());
  },

  userFactory: async ({}, use) => {
    const factory = new UserFactory();
    await use(factory);
    await factory.cleanup();
  },

  groupFactory: async ({}, use) => {
    const factory = new GroupFactory();
    await use(factory);
    await factory.cleanup();
  },

  // ... same pattern for all factories

  authenticatedPage: async ({ page }, use) => {
    await loginAsTestUser(page);
    await use(page);
  },
});

export { expect };
```

### 4.2 Usage Pattern

- [x] Document the recommended test pattern in `e2e/fixtures/MIGRATION-GUIDE.md`

**Example test using fixtures:**

```typescript
// e2e/todos/create-todo.spec.ts
import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Create Todo', () => {
  test('creates a todo via API and verifies in UI', async ({
    authenticatedPage: page,
    todoFactory,
  }) => {
    // SETUP: Create a todo via admin SDK (fast, deterministic)
    const todoId = todoFactory.generateId();
    await todoFactory.createTodo(TEST_ENTITY_IDS.mainTestUser, undefined, {
      id: todoId,
      title: 'E2E Test Todo',
      description: 'Created by test factory',
    });

    // ACT: Navigate and verify
    await page.goto(`/todos`);
    await expect(page.getByText('E2E Test Todo')).toBeVisible();

    // CLEANUP: Automatic — todoFactory.cleanup() runs in fixture teardown
  });
});
```

---

## 5. Auth System Improvements

### 5.1 Fix Dual-User Auth

- [x] Update `e2e/helpers/auth.ts` — Give `tobias` a distinct test email (`tobias-test@polity.app`)
- [x] Update `e2e/global-setup.ts` — Ensure both `polity.live@gmail.com` AND `tobias-test@polity.app` are set up
- [x] Add helper `loginAsFactoryUser(page, email)` in `test-base.ts` for logging in as any factory-created user

### 5.2 Reusable Auth State (Optional Optimization)

- [x] Add `storageState` support in Playwright config — save authenticated browser state to file so tests skip the magic-code flow on every run
- [x] Create `e2e/auth.setup.ts` — a Playwright setup project that logs in and saves storage state
- [x] Update `playwright.config.ts` — add `setup` project dependency

---

## 6. Global Setup & Teardown Improvements

### 6.1 Enhance Global Setup

- [x] Update `e2e/global-setup.ts` — After ensuring test users exist, run a **minimal base seed** that creates only the core shared entities needed by most tests (the main test user's profile, primary group, etc.) using the factory layer
- [x] Add a **health check** — verify the app at `localhost:3000` is responding before tests start

### 6.2 Add Global Teardown

- [x] Create `e2e/global-teardown.ts` — Optional cleanup of any orphan test entities (entities with `e2e-` prefix in their name/email)
- [x] Register in `playwright.config.ts` as `globalTeardown`

---

## 7. Migrate Existing Tests (Incremental)

The migration should be incremental — existing tests continue to work, and new tests (or refactored tests) use the fixture pattern.

### 7.1 Create Migration Guide

- [x] Create `e2e/fixtures/MIGRATION-GUIDE.md` — Step-by-step guide for converting existing tests:
  1. Change import from `@playwright/test` to `../fixtures/test-base`
  2. Replace `loginAsTestUser(page)` with `authenticatedPage` fixture
  3. Replace `TEST_ENTITY_IDS` references with factory-created entities
  4. Remove any manual `page.goto('/create')` data setup — use factories instead

### 7.2 Migrate Create-Flow Tests (highest value — these create uncleaned data)

- [x] Migrate `e2e/groups/create-public-group.spec.ts` — use `authenticatedPage` + unique names
- [x] Migrate `e2e/amendments/create-amendment.spec.ts` — use `authenticatedPage` + unique names
- [x] Migrate `e2e/blogs/create-public-blog.spec.ts` — use `authenticatedPage` + unique names
- [x] Migrate `e2e/todos/create-new-todo.spec.ts` — use `authenticatedPage` + proper assertions

### 7.3 Migrate Read-Path Tests (depend on pre-seeded data)

- [x] Migrate `e2e/groups/display-group-details.spec.ts` — factory-create group in setup
- [x] Migrate `e2e/amendments/amendment-voting.spec.ts` — factory-create amendment + voting state
- [x] Migrate `e2e/blogs/blog-editor.spec.ts` — factory-create blog in setup

### 7.4 Remove Brittle Waits

- [x] Replaced `waitForTimeout` in migrated specs (7 specs total)
- [x] ~20+ remaining `waitForTimeout` calls in non-migrated specs — all 381 spec files migrated, 0 `waitForTimeout` calls remain

---

## 8. Cleanup Utility Improvements

### 8.1 Helper Deduplication

- [x] Deduplicate `e2e/helpers/subscription.ts` — replaced inline nav functions with re-exports from `navigation.ts`
- [x] All 10 subscription specs continue working via re-exported helpers (backward-compatible)

### 8.2 Test Entity ID Strategy

- [x] Add `@deprecated` JSDoc to `TEST_ENTITY_IDS` pointing to factory migration guide
- [x] Keep `TEST_ENTITY_IDS` for backward compat with global seed, but new tests should NOT import it

---

## Summary

| Phase                    | Tasks | Priority | Parallelizable                    |
| ------------------------ | ----- | -------- | --------------------------------- |
| 1. Admin SDK Singleton   | 4     | P0       | No (foundation)                   |
| 2. Factory Base Class    | 6     | P0       | No (foundation)                   |
| 3. Entity Factories      | 18    | P0       | Yes — all 8 factories in parallel |
| 4. Playwright Fixtures   | 2     | P0       | After Phase 2                     |
| 5. Auth Improvements     | 4     | P1       | Yes — parallel with Phase 3       |
| 6. Global Setup/Teardown | 4     | P1       | Yes — parallel with Phase 3       |
| 7. Test Migration        | 10    | P2       | Yes — each spec independent       |
| 8. Cleanup/Dedup         | 4     | P2       | Yes — parallel with Phase 7       |

| Metric                     | Count |
| -------------------------- | ----- |
| New helper files           | ~14   |
| Existing files modified    | ~8    |
| Tests to migrate (initial) | ~7    |
| Total tasks                | 58    |

---

## Parallelization Strategy

**Batch 1 (Foundation — sequential):**

- Agent A: Admin SDK singleton + Factory base class (Phase 1 + 2)

**Batch 2 (Factories — parallel after Batch 1):**

- Agent B: User + Group factories
- Agent C: Event + Amendment factories
- Agent D: Blog + Todo factories
- Agent E: Conversation + Notification factories
- Agent F: Auth improvements (Phase 5)
- Agent G: Global setup/teardown (Phase 6)

**Batch 3 (Integration — parallel after Batch 2):**

- Agent H: Playwright fixture extension (Phase 4)
- Agent I: Barrel export + README/migration guide

**Batch 4 (Migration — parallel after Batch 3):**

- Agent J: Migrate create-flow tests (Phase 7.2)
- Agent K: Migrate read-path tests (Phase 7.3)
- Agent L: Remove brittle waits + helper dedup (Phase 7.4 + 8)

---

## Implementation Handoff

The task plan has been created at `tasks/e2e-test-stabilization-tasks.md`.

To begin implementation, you can:

1. Ask me to implement specific phases (e.g., "Implement Phase 1 + 2 foundation")
2. Use batch-parallel execution for the factory phase
3. Manually work through the checklist, marking items complete as you go

Would you like me to start implementing the foundation (Admin SDK + Factory Base)?
