// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Cancel Request', () => {
  test('User can cancel pending participation request', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as test user
    // 2. Navigate to event page
    await page.goto(`/event/${event.id}`);

    // 3. Ensure user has pending request
    const pendingButton = page.getByRole('button', { name: /request pending|pending/i });
    const requestButton = page.getByRole('button', { name: /^request to participate$/i });

    const hasPendingRequest = await pendingButton.isVisible().catch(() => false);

    if (!hasPendingRequest) {
      await requestButton.click();
      await expect(pendingButton).toBeVisible();
    }

    // 4. Click "Request Pending" button to cancel
    await pendingButton.click();

    // 5. Verify button changes back to "Request to Participate"
    await expect(requestButton).toBeVisible();
  });
});
