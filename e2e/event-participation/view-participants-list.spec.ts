// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Event Participation - View Participants', () => {
  test('User can view participants list', async ({ authenticatedPage: page, eventFactory, mainUserId }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as test user
    // 2. Navigate to event page
    await page.goto(`/event/${event.id}`);

    // 3. Verify participant count is visible
    const participantCount = page.locator('text=/\\d+\\s*participant/i').first();
    await expect(participantCount).toBeVisible();

    // 4. Participant avatars and names should be displayed (if public)
    const participantAvatars = page.locator('img[alt*="avatar"], [class*="avatar"]');
    const avatarCount = await participantAvatars.count();

    // If event is public, avatars should be visible
    if (avatarCount > 0) {
      await expect(participantAvatars.first()).toBeVisible();
    }
  });
});
