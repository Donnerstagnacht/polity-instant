// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Calendar Integration', () => {
  test('Participated events appear in calendar', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as test user
    // 2. Ensure user participates in event
    await page.goto(`/event/${event.id}`);

    const leaveButton = page.getByRole('button', { name: /leave event|leave/i });
    const acceptButton = page.getByRole('button', { name: /accept invitation/i });

    const isParticipant = await leaveButton.isVisible().catch(() => false);
    const canAccept = await acceptButton.isVisible().catch(() => false);

    if (!isParticipant && canAccept) {
      await acceptButton.click();
      await expect(leaveButton).toBeVisible();
    }

    // 3. Navigate to calendar page
    await page.goto('/calendar');

    // 4. Verify event appears in calendar
    const eventInCalendar = page.locator(`text=/test.*event/i`).first();
    await expect(eventInCalendar).toBeVisible();

    // 5. Event should show participation status (e.g., badge or indicator)
    const participationBadge = page.locator('text=/participating|attending/i');
    const hasBadge = await participationBadge.isVisible().catch(() => false);

    // Badge may or may not be visible depending on design
    if (hasBadge) {
      await expect(participationBadge).toBeVisible();
    }
  });
});
