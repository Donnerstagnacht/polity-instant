// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Loading States', () => {
  test('Loading states display during participation operations', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as test user
    // 2. Navigate to event page
    await page.goto(`/event/${event.id}`);

    // 3. Find participation button
    const participationButton = page
      .getByRole('button', { name: /request to participate|leave event|accept invitation/i })
      .first();
    await expect(participationButton).toBeVisible();

    // 4. Click button
    await participationButton.click();

    // 5. Verify button becomes disabled (loading state)
    await expect(participationButton).toBeDisabled();

    // 6. Wait for operation to complete and button to be enabled again
    await expect(participationButton).not.toBeDisabled();
  });
});
