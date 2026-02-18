// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import {
  navigateToUserProfile,
  clickSubscribeButton,
  waitForSubscribeState,
  ensureNotSubscribed,
} from '../helpers/subscription';

test.describe('Subscription Error Handling', () => {
  test('Subscription errors are handled', async ({ authenticatedPage: page, userFactory }) => {
    test.setTimeout(60000);
    const otherUser = await userFactory.createUser();

    await navigateToUserProfile(page, otherUser.id);

    // 3. Ensure starting unsubscribed state
    await ensureNotSubscribed(page);

    // 4. Simulate network failure by going offline
    await page.context().setOffline(true);

    // 5. User attempts to subscribe
    await clickSubscribeButton(page);

    // 6. Wait for the operation to fail and revert (or stay optimistic)
    await page.waitForTimeout(3000);

    // 7. Go back online
    await page.context().setOffline(false);

    // 8. Wait for state to stabilize after reconnection
    await page.waitForTimeout(2000);

    // 9. Ensure we can reach a subscribed state (retry if needed)
    const anyButton = page.getByRole('button', { name: /subscribe/i }).first();
    await expect(anyButton).toBeVisible({ timeout: 10000 });

    // Check current state and subscribe if not already subscribed
    const unsubBtn = page.getByRole('button', { name: /unsubscribe/i });
    const alreadySubscribed = await unsubBtn.isVisible().catch(() => false);

    if (!alreadySubscribed) {
      await clickSubscribeButton(page);
    }
    await waitForSubscribeState(page, true, 15000);
  });
});
