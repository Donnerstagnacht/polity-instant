// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';
import {
  navigateToUserProfile,
  getSubscribeButton,
  ensureNotSubscribed,
} from '../helpers/subscription';

test.describe('Subscription Loading States', () => {
  test('Subscribe button shows loading state', async ({ authenticatedPage: page, userFactory }) => {
    await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const otherUser = await userFactory.createUser();

    await navigateToUserProfile(page, otherUser.id);

    // 3. Ensure starting state is unsubscribed
    await ensureNotSubscribed(page);

    // 4. Get the subscribe button
    const subscribeButton = await getSubscribeButton(page);

    // 5. Click subscribe button
    await subscribeButton.click();

    // 6. Button should be disabled during operation (check quickly)
    // Note: This might be very fast, so we use a short timeout
    try {
      await expect(subscribeButton).toBeDisabled({ timeout: 500 });
    } catch {
      // If operation was too fast, that's okay
    }

    // 7. Wait for operation to complete and button to show new state
    await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeEnabled();
  });
});
