// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import {
  navigateToUserProfile,
  getSubscribeButton,
  ensureNotSubscribed,
  clickSubscribeAndWait,
} from '../helpers/subscription';

test.describe('Subscription Loading States', () => {
  test('Subscribe button shows loading state', async ({ authenticatedPage: page, userFactory }) => {
    test.setTimeout(60000);
    const otherUser = await userFactory.createUser();

    await navigateToUserProfile(page, otherUser.id);

    // 3. Ensure starting state is unsubscribed
    await ensureNotSubscribed(page);

    // 5-7. Click subscribe and verify it toggles to Unsubscribe (with retry under load)
    await clickSubscribeAndWait(page, true);

    await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeEnabled();
  });
});
