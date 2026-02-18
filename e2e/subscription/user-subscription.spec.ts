// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import {
  navigateToUserProfile,
  clickSubscribeAndWait,
  getSubscriberCount,
  ensureNotSubscribed,
  ensureSubscribed,
} from '../helpers/subscription';

test.describe('Subscribe to User', () => {
  test('User can subscribe to another user', async ({ authenticatedPage: page, userFactory }) => {
    test.setTimeout(60000);
    const otherUser = await userFactory.createUser();

    await navigateToUserProfile(page, otherUser.id);

    // 3. Ensure we start unsubscribed
    await ensureNotSubscribed(page);

    // 4. Get initial subscriber count
    const initialCount = await getSubscriberCount(page);

    // 5-6. Click "Subscribe" and wait for toggle
    await clickSubscribeAndWait(page, true);

    // 7. Verify subscriber count increases
    const newCount = await getSubscriberCount(page);
    expect(newCount).toBeGreaterThanOrEqual(initialCount + 1);
  });

  test('User can unsubscribe from user', async ({ authenticatedPage: page, userFactory }) => {
    test.setTimeout(60000);
    const otherUser = await userFactory.createUser();

    await navigateToUserProfile(page, otherUser.id);

    // 3. Ensure we're subscribed first
    await ensureSubscribed(page);

    // 4. Get subscriber count
    const initialCount = await getSubscriberCount(page);

    // 5-6. Click "Unsubscribe" and wait for toggle
    await clickSubscribeAndWait(page, false);

    // 7. Verify subscriber count decreases
    const newCount = await getSubscriberCount(page);
    expect(newCount).toBeLessThan(initialCount);
  });
});
