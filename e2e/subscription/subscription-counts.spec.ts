// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';
import {
  navigateToUserProfile,
  clickSubscribeButton,
  waitForSubscribeState,
  getSubscriberCount,
  ensureNotSubscribed,
} from '../helpers/subscription';

test.describe('Subscriber Count Accuracy', () => {
  test('Subscriber count updates correctly', async ({ authenticatedPage: page, userFactory }) => {
    await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const otherUser = await userFactory.createUser();

    await navigateToUserProfile(page, otherUser.id);

    // 3. Ensure we start unsubscribed
    await ensureNotSubscribed(page);

    // 4. Get initial count
    const initialCount = await getSubscriberCount(page);

    // 5. Subscribe to an entity
    await clickSubscribeButton(page);
    await waitForSubscribeState(page, true);

    // 6. Subscriber count increases by 1
    const afterSubscribeCount = await getSubscriberCount(page);
    expect(afterSubscribeCount).toBe(initialCount + 1);

    // 7. Unsubscribe from entity
    await clickSubscribeButton(page);
    await waitForSubscribeState(page, false);

    // 8. Subscriber count decreases by 1
    const afterUnsubscribeCount = await getSubscriberCount(page);
    expect(afterUnsubscribeCount).toBe(initialCount);

    // 9. Count updates in real-time across all instances
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    const reloadedCount = await getSubscriberCount(page);
    expect(reloadedCount).toBe(initialCount);
  });
});
