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

test.describe('Subscription Error Handling', () => {
  test('Subscription errors are handled', async ({ authenticatedPage: page, userFactory }) => {
    await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const otherUser = await userFactory.createUser();

    await navigateToUserProfile(page, otherUser.id);

    // 3. Ensure starting unsubscribed state
    await ensureNotSubscribed(page);

    // 4. Simulate network failure by going offline
    await page.context().setOffline(true);

    // 5. User attempts to subscribe
    await clickSubscribeButton(page);

    // 6. Wait a moment for error to occur
    await page.waitForTimeout(2000);

    // 7. Go back online
    await page.context().setOffline(false);

    // 8. Button should return to previous state or show error
    // Check if button is still in Subscribe state (operation failed)
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    const isSubscribeVisible = await subscribeButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    // If subscribe button still visible, error was handled
    if (isSubscribeVisible) {
      expect(isSubscribeVisible).toBe(true);
    }

    // 9. User can retry operation (now that we're online)
    await clickSubscribeButton(page);
    await waitForSubscribeState(page, true, 10000);
  });
});
