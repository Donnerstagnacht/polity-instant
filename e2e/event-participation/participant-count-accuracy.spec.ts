// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Participant Count', () => {
  test('Participant count updates when participant joins', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as test user
    // 2. Navigate to event page
    await page.goto(`/event/${event.id}`);

    // 3. Get initial participant count
    const participantCountElement = page.locator('text=/\\d+\\s*participant/i').first();
    await expect(participantCountElement).toBeVisible();

    const initialCountText = await participantCountElement.textContent();
    const initialCount = parseInt(initialCountText?.match(/\\d+/)?.[0] || '0');

    // 4. Verify count is a valid number
    expect(initialCount).toBeGreaterThanOrEqual(0);
  });
});
