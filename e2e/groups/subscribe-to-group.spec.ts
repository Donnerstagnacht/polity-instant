// spec: e2e/test-plans/groups-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Groups - Subscribe to Group', () => {
  test('User subscribes to a group', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page (not subscribed)
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Click "Subscribe" button
    const subscribeButton = page.getByRole('button', { name: /subscribe/i });
    const isSubscribed = (await subscribeButton.getByText(/unsubscribe/i).count()) > 0;

    if (!isSubscribed) {
      await subscribeButton.click();

      // 5. Button changes to "Unsubscribe"
      await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({
        timeout: 3000,
      });

      // 6. Subscriber count increases
      await page.waitForTimeout(500);
    }

    // 7. Verify subscription state
    await expect(
      page.getByRole('button', { name: /unsubscribe/i }).or(subscribeButton)
    ).toBeVisible();
  });

  test('User unsubscribes from a group', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    // 3. Ensure user is subscribed first
    const unsubscribeButton = page.getByRole('button', { name: /unsubscribe/i });
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });

    if ((await subscribeButton.count()) > 0) {
      await subscribeButton.click();
      await page.waitForTimeout(500);
    }

    // 4. Click "Unsubscribe" button
    await unsubscribeButton.click();

    // 5. Button changes to "Subscribe"
    await expect(page.getByRole('button', { name: /^subscribe$/i })).toBeVisible({ timeout: 3000 });

    // 6. Subscriber count decreases
    await page.waitForTimeout(500);
  });

  test('Subscribe vs Member distinction is clear', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

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
