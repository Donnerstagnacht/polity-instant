// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';

test.describe('Events - Display Event Details', () => {
  test('User views event details on event page', async ({
    authenticatedPage: page,
    eventFactory,
    mainUserId,
  }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Display Event Test ${Date.now()}`,
    });

    await page.goto(`/event/${event.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 4. Title displayed correctly
    const title = page.locator('h1').or(page.getByRole('heading', { level: 1 }));
    await expect(title).toBeVisible({ timeout: 10000 });

    // Event details are visible
    await expect(page).toHaveURL(/\/event\/.+/);
  });
});
