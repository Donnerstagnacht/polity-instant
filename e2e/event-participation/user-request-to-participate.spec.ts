// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Request to Participate', () => {
  test('User can request to participate in event', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as test user
    // 2. Navigate to event page
    await page.goto(`/event/${event.id}`);

    // 3. Verify "Request to Participate" button is visible
    const requestButton = page.getByRole('button', { name: /request to participate/i });
    await expect(requestButton).toBeVisible();

    // 4. Click "Request to Participate" button
    await requestButton.click();

    // 5. Verify button changes to "Request Pending"
    const pendingButton = page.getByRole('button', { name: /request pending|pending/i });
    await expect(pendingButton).toBeVisible();
  });
});
