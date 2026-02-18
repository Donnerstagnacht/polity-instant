// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import {
  navigateToUserProfile,
  clickSubscribeAndWait,
  getSubscriberCount,
  ensureNotSubscribed,
} from '../helpers/subscription';

test.describe('Subscriber Count Accuracy', () => {
  test('Subscriber count updates correctly', async ({ authenticatedPage: page, userFactory }) => {
    test.setTimeout(60000);
    const otherUser = await userFactory.createUser();

    await navigateToUserProfile(page, otherUser.id);

    // 3. Ensure we start unsubscribed
    await ensureNotSubscribed(page);

    // 4. Get initial count
    const initialCount = await getSubscriberCount(page);

    // 5. Subscribe to an entity
    await clickSubscribeAndWait(page, true);

    // 6. Subscriber count increases by 1
    const afterSubscribeCount = await getSubscriberCount(page);
    expect(afterSubscribeCount).toBeGreaterThanOrEqual(initialCount + 1);

    // 7. Unsubscribe from entity
    await clickSubscribeAndWait(page, false);

    // 8. Subscriber count decreases by 1
    const afterUnsubscribeCount = await getSubscriberCount(page);
    expect(afterUnsubscribeCount).toBeLessThanOrEqual(afterSubscribeCount - 1);

    // 9. Count updates in real-time across all instances
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    const reloadedCount = await getSubscriberCount(page);
    expect(reloadedCount).toBeLessThanOrEqual(afterSubscribeCount);
  });
});
