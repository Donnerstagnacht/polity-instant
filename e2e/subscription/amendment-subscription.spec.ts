// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import {
  navigateToAmendment,
  clickSubscribeButton,
  clickSubscribeAndWait,
  waitForSubscribeState,
  getSubscriberCount,
  ensureNotSubscribed,
  ensureSubscribed,
} from '../helpers/subscription';

test.describe('Subscribe to Amendment', () => {
  test('User can subscribe to amendment', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    test.setTimeout(90000);
    const amendment = await amendmentFactory.createAmendment(mainUserId, { title: `Sub Amendment ${Date.now()}` });

    await navigateToAmendment(page, amendment.id);

    // 3. Ensure we start unsubscribed
    await ensureNotSubscribed(page);

    // 4. Get initial subscriber count
    const initialCount = await getSubscriberCount(page);

    // 5. Click "Subscribe" button and wait for toggle
    await clickSubscribeAndWait(page, true);

    // 7. Verify subscriber count increases
    const newCount = await getSubscriberCount(page);
    expect(newCount).toBeGreaterThanOrEqual(initialCount + 1);
  });

  test('User can unsubscribe from amendment', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    test.setTimeout(90000);
    const amendment = await amendmentFactory.createAmendment(mainUserId, { title: `Unsub Amendment ${Date.now()}` });

    await navigateToAmendment(page, amendment.id);

    // 3. Ensure we're subscribed first — retry with reload if transact fails under load
    try {
      await ensureSubscribed(page);
    } catch {
      await page.reload({ waitUntil: 'networkidle' });
      await ensureSubscribed(page);
    }

    // 4. Get subscriber count
    const initialCount = await getSubscriberCount(page);

    // 5. Click "Unsubscribe" button and wait for toggle
    await clickSubscribeAndWait(page, false);

    // 7. Verify subscriber count decreases
    const newCount = await getSubscriberCount(page);
    expect(newCount).toBeLessThan(initialCount);
  });
});
