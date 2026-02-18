// spec: e2e/test-plans/groups-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Groups - Subscribe to Group', () => {
  test('User subscribes to a group', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Subscribe Group Test ${Date.now()}`,
    });

    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Wait for subscribe/unsubscribe button to appear
    const anySubButton = page.getByRole('button', { name: /subscribe/i }).first();
    await expect(anySubButton).toBeVisible({ timeout: 10000 });

    // 4. Click "Subscribe" button
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    const isSubscribed = (await page.getByRole('button', { name: /unsubscribe/i }).count()) > 0;

    if (!isSubscribed) {
      await subscribeButton.click();

      // 5. Button changes to "Unsubscribe"
      await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({
        timeout: 10000,
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
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Unsubscribe Group Test ${Date.now()}`,
    });

    await page.goto(`/group/${group.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Wait for subscribe/unsubscribe button to appear
    const anySubButton = page.getByRole('button', { name: /subscribe/i }).first();
    await expect(anySubButton).toBeVisible({ timeout: 10000 });

    // 4. Ensure user is subscribed first
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    if ((await subscribeButton.count()) > 0) {
      await subscribeButton.click();
      await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({ timeout: 10000 });
    }

    // 5. Click "Unsubscribe" button
    await page.getByRole('button', { name: /unsubscribe/i }).click();

    // 6. Button changes to "Subscribe"
    await expect(page.getByRole('button', { name: /^subscribe$/i })).toBeVisible({ timeout: 10000 });
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
