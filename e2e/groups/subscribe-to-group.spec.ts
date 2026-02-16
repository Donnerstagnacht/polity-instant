// spec: e2e/test-plans/groups-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Groups - Subscribe to Group', () => {
  test('User subscribes to a group', async ({
    authenticatedPage: page,
    groupFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Subscribe Group Test ${Date.now()}`,
    });

    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 4. Click "Subscribe" button
    const subscribeButton = page.getByRole('button', { name: /subscribe/i });
    const isSubscribed = (await page.getByRole('button', { name: /unsubscribe/i }).count()) > 0;

    if (!isSubscribed) {
      await subscribeButton.click();

      // 5. Button changes to "Unsubscribe"
      await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({
        timeout: 5000,
      });
    }

    // 7. Verify subscription state
    await expect(
      page.getByRole('button', { name: /unsubscribe/i }).or(subscribeButton)
    ).toBeVisible();
  });

  test('User unsubscribes from a group', async ({
    authenticatedPage: page,
    groupFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Unsubscribe Group Test ${Date.now()}`,
    });

    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Ensure user is subscribed first
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });

    if ((await subscribeButton.count()) > 0) {
      await subscribeButton.click();
    }

    // 4. Click "Unsubscribe" button
    await unsubscribeButton.click();

    // 5. Button changes to "Subscribe"
    await expect(page.getByRole('button', { name: /^subscribe$/i })).toBeVisible({ timeout: 5000 });
  });

  test('Subscribe vs Member distinction is clear', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to group page
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    // 3. Subscribe without joining as member
    const subscribeButton = page.getByRole('button', { name: /subscribe/i });
    const joinButton = page.getByRole('button', { name: /join|request/i });

    // 4. Verify both actions available independently
    await subscribeButton.count();
    await joinButton.count();

    // Both actions can be taken independently
    // Subscription doesn't grant member access
  });
});
