// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Event Participation - Calendar Integration', () => {
  test('Participated events appear in calendar', async ({ authenticatedPage: page, eventFactory, mainUserId }) => {
    test.setTimeout(60000);
    const eventTitle = `Test Event ${Date.now()}`;
    // Create event with today's date so it appears in the default "day" calendar view
    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours later
    const event = await eventFactory.createEvent(mainUserId, {
      title: eventTitle,
      startDate,
      endDate,
    });

    // 1. Navigate to calendar page directly (user is already organizer/participant via factory)
    await page.goto('/calendar');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // 3. Verify event appears in calendar (search for the specific title)
    const eventInCalendar = page.getByText(eventTitle).first();
    await expect(eventInCalendar).toBeVisible({ timeout: 15000 });
  });
});
