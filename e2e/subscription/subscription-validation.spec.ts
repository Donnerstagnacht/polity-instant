// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';
import {
  navigateToUserProfile,
  clickSubscribeButton,
  waitForSubscribeState,
  ensureNotSubscribed,
} from '../helpers/subscription';

const TEST_USER_ID = TEST_ENTITY_IDS.testUser1;

test.describe('Subscription Validation', () => {
  test('Cannot create duplicate subscriptions', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to user profile
    await navigateToUserProfile(page, TEST_USER_ID);

    // 3. Ensure we start unsubscribed
    await ensureNotSubscribed(page);

    // 4. Subscribe to the user
    await clickSubscribeButton(page);
    await waitForSubscribeState(page, true);

    // 5. Verify button shows "Unsubscribe"
    await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible();

    // 6. Click again should unsubscribe (toggle), not create duplicate
    await clickSubscribeButton(page);
    await waitForSubscribeState(page, false);

    // 7. Verify we're back to "Subscribe" state
    await expect(page.getByRole('button', { name: /^subscribe$/i })).toBeVisible();
  });

  test('Cannot subscribe to own content', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to own profile
    await page.goto('/user/page');
    await page.waitForLoadState('networkidle');

    // 3. Verify subscribe button is either hidden or disabled
    const subscribeButtons = page.getByRole('button', { name: /^subscribe$/i });
    const count = await subscribeButtons.count();

    if (count > 0) {
      // If button exists, verify it's disabled
      await expect(subscribeButtons.first()).toBeDisabled();
    }
    // Otherwise button is correctly hidden (count === 0)
  });
});
