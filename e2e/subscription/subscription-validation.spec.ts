// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';
import {
  navigateToUserProfile,
  clickSubscribeButton,
  waitForSubscribeState,
  ensureNotSubscribed,
} from '../helpers/subscription';

test.describe('Subscription Validation', () => {
  test('Cannot create duplicate subscriptions', async ({ authenticatedPage: page, userFactory }) => {
    await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const otherUser = await userFactory.createUser();

    await navigateToUserProfile(page, otherUser.id);

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

  test('Cannot subscribe to own content', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to own profile
    await page.goto('/user/page');
    await page.waitForLoadState('domcontentloaded');

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
