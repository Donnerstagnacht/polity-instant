// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';
import {
  navigateToGroup,
  clickSubscribeButton,
  waitForSubscribeState,
  getSubscriberCount,
  ensureNotSubscribed,
  ensureSubscribed,
} from '../helpers/subscription';

const TEST_GROUP_ID = TEST_ENTITY_IDS.testGroup1;

test.describe('Subscribe to Group', () => {
  test('User can subscribe to group', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await navigateToGroup(page, TEST_GROUP_ID);

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

  test('User can unsubscribe from group', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await navigateToGroup(page, TEST_GROUP_ID);

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
