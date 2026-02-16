# E2E Test Migration Guide

## Quick Migration Steps

### Step 1: Update Import

```diff
- import { test, expect } from '@playwright/test';
+ import { test, expect } from '../fixtures/test-base';
```

### Step 2: Replace Manual Login

```diff
  test('my test', async ({
-   page,
+   authenticatedPage: page,
  }) => {
-   await loginAsTestUser(page);
    await page.goto('/todos');
```

Remove the `import { loginAsTestUser } from '../helpers/auth';` if it's no longer used.

### Step 3: Replace `TEST_ENTITY_IDS` with Factories

**Before (shared data, flaky in parallel):**

```ts
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test('view group', async ({ page }) => {
  await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
});
```

**After (isolated data, auto-cleaned):**

```ts
test('view group', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
  const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
  const group = await groupFactory.createGroup(user.id, {
    name: `Test Group ${Date.now()}`,
  });

  await page.goto(`/group/${group.id}`);
});
```

### Step 4: Replace `waitForTimeout` with Proper Assertions

```diff
- await page.waitForTimeout(500);
- await expect(page.getByText('Created')).toBeVisible();
+ await expect(page.getByText('Created')).toBeVisible({ timeout: 5000 });
```

Common replacements:
| Before | After |
|--------|-------|
| `waitForTimeout(500)` | `expect(element).toBeVisible({ timeout: 5000 })` |
| `waitForTimeout(1000)` | `page.waitForLoadState('networkidle')` |
| `waitForTimeout(300)` after click | `expect(result).toBeVisible()` |

---

## Available Fixtures

| Fixture               | Type                  | Description                               |
| --------------------- | --------------------- | ----------------------------------------- |
| `authenticatedPage`   | `Page`                | Pre-logged-in page (main test user)       |
| `adminDb`             | `InstantDB`           | Direct admin SDK access                   |
| `userFactory`         | `UserFactory`         | Create users + auth tokens                |
| `groupFactory`        | `GroupFactory`        | Create groups with roles/memberships      |
| `eventFactory`        | `EventFactory`        | Create events with participants           |
| `amendmentFactory`    | `AmendmentFactory`    | Create amendments with docs/collaborators |
| `blogFactory`         | `BlogFactory`         | Create blogs with bloggers                |
| `todoFactory`         | `TodoFactory`         | Create todos with assignments             |
| `conversationFactory` | `ConversationFactory` | Create conversations + messages           |
| `notificationFactory` | `NotificationFactory` | Create notifications                      |

All factories auto-clean on test teardown (even on failure).

---

## Factory Usage Examples

### Create a Group with Members

```ts
test('group with members', async ({ authenticatedPage: page, groupFactory, userFactory }) => {
  const owner = await userFactory.createUser();
  const member = await userFactory.createUser();
  const group = await groupFactory.createGroup(owner.id);

  // addMember needs the memberRoleId from createGroup return
  await groupFactory.addMember(group.id, member.id, group.memberRoleId);

  await page.goto(`/group/${group.id}`);
  // ... assertions
});
```

### Create an Amendment with Change Requests

```ts
test('amendment workflow', async ({ authenticatedPage: page, amendmentFactory, userFactory }) => {
  const author = await userFactory.createUser();
  const amendment = await amendmentFactory.createAmendment(author.id, {
    title: 'Test Amendment',
    workflowStatus: 'internal_suggesting',
  });

  await amendmentFactory.createChangeRequest(amendment.id, author.id, {
    title: 'Proposed change',
    content: [{ type: 'p', children: [{ text: 'New text' }] }],
  });

  await page.goto(`/amendment/${amendment.id}`);
  // ... assertions
});
```

### Login as a Factory-Created User

```ts
import { test, expect, loginAsFactoryUser } from '../fixtures/test-base';

test('multi-user test', async ({ page, userFactory }) => {
  const user = await userFactory.createUserWithAuth();

  await loginAsFactoryUser(page, user.email);
  await page.goto('/todos');
  // ... now logged in as the factory user
});
```

---

## When to Use Factories vs UI Creation

| Scenario                              | Approach                                                            |
| ------------------------------------- | ------------------------------------------------------------------- |
| **Testing the create form itself**    | Use `authenticatedPage`, create via UI, unique names (`Date.now()`) |
| **Testing display/list/detail views** | Use factories for setup, then navigate to view                      |
| **Testing edit/delete flows**         | Use factories for setup, then perform UI action                     |
| **Testing multi-user scenarios**      | Use `userFactory.createUserWithAuth()` + `loginAsFactoryUser()`     |

---

## Notes

- `TEST_ENTITY_IDS` is deprecated for new tests. Use factories instead.
- Each test should be fully independent — no test should depend on another test running first.
- Factories use `Date.now()` or unique IDs to prevent name collisions in parallel runs.
- Cleanup runs automatically in fixture teardown — no manual cleanup needed.
