// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import {
  navigateToEvent,
  clickSubscribeButton,
  waitForSubscribeState,
  getSubscriberCount,
  ensureNotSubscribed,
  ensureSubscribed,
} from '../helpers/subscription';

test.describe('Subscribe to Event', () => {
  test('User can subscribe to event', async ({ authenticatedPage: page, eventFactory, mainUserId }) => {
    test.setTimeout(60000);
    const event = await eventFactory.createEvent(mainUserId, { title: `Sub Event ${Date.now()}` });

    await navigateToEvent(page, event.id);

    // 3. Ensure we start unsubscribed
    await ensureNotSubscribed(page);

    // 4. Get initial subscriber count
    const initialCount = await getSubscriberCount(page);

    // 5. Click "Subscribe" button
    await clickSubscribeButton(page);

    // 6. Verify button is now "Unsubscribe"
    await waitForSubscribeState(page, true);

    // 7. Verify subscriber count increases by 1
    const newCount = await getSubscriberCount(page);
    expect(newCount).toBe(initialCount + 1);
  });

  test('User can unsubscribe from event', async ({ authenticatedPage: page, eventFactory, mainUserId }) => {
    test.setTimeout(60000);
    const event = await eventFactory.createEvent(mainUserId, { title: `Unsub Event ${Date.now()}` });

    await navigateToEvent(page, event.id);

    // 3. Ensure we're subscribed first
    await ensureSubscribed(page);

    // 4. Get subscriber count
    const initialCount = await getSubscriberCount(page);

    // 5. Click "Unsubscribe" button
    await clickSubscribeButton(page);

    // 6. Verify button changes to "Subscribe"
    await waitForSubscribeState(page, false);

    // 7. Verify subscriber count decreased
    const newCount = await getSubscriberCount(page);
    expect(newCount).toBeLessThan(initialCount);
  });
});
