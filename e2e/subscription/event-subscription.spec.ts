// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';
import {
  navigateToEvent,
  clickSubscribeButton,
  waitForSubscribeState,
  getSubscriberCount,
  ensureNotSubscribed,
  ensureSubscribed,
} from '../helpers/subscription';

const TEST_EVENT_ID = TEST_ENTITY_IDS.testEvent1;

test.describe('Subscribe to Event', () => {
  test('User can subscribe to event', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page
    await navigateToEvent(page, TEST_EVENT_ID);

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

  test('User can unsubscribe from event', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page
    await navigateToEvent(page, TEST_EVENT_ID);

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
