// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';
import {
  navigateToBlog,
  clickSubscribeButton,
  waitForSubscribeState,
  getSubscriberCount,
  ensureNotSubscribed,
  ensureSubscribed,
} from '../helpers/subscription';

test.describe('Subscribe to Blog', () => {
  test('User can subscribe to blog', async ({ authenticatedPage: page, blogFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const blog = await blogFactory.createBlog(user.id, { title: `Sub Blog ${Date.now()}` });

    await navigateToBlog(page, blog.id);

    // 3. Ensure we start unsubscribed
    await ensureNotSubscribed(page);

    // 4. Get initial subscriber count
    const initialCount = await getSubscriberCount(page);

    // 5. Click "Subscribe" button
    await clickSubscribeButton(page);

    // 6. Verify button changes to "Unsubscribe"
    await waitForSubscribeState(page, true);

    // 7. Verify subscriber count increases by 1
    const newCount = await getSubscriberCount(page);
    expect(newCount).toBe(initialCount + 1);
  });

  test('User can unsubscribe from blog', async ({ authenticatedPage: page, blogFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const blog = await blogFactory.createBlog(user.id, { title: `Unsub Blog ${Date.now()}` });

    await navigateToBlog(page, blog.id);

    // 3. Ensure we're subscribed first
    await ensureSubscribed(page);

    // 4. Get subscriber count
    const initialCount = await getSubscriberCount(page);

    // 5. Click "Unsubscribe" button
    await clickSubscribeButton(page);

    // 6. Verify button changes to "Subscribe"
    await waitForSubscribeState(page, false);

    // 7. Verify subscriber count decreases by 1
    const newCount = await getSubscriberCount(page);
    expect(newCount).toBe(initialCount - 1);
  });
});
