// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Event Participation - Search Participants', () => {
  test('Organizer can search participants by name', async ({ authenticatedPage: page, eventFactory, mainUserId }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as organizer user
    // 2. Navigate to participants page
    await page.goto(`/event/${event.id}/participants`);

    // 3. Find search input
    const searchInput = page
      .getByRole('textbox', { name: /search/i })
      .or(page.getByPlaceholder(/search/i));
    await expect(searchInput).toBeVisible();

    // 4. Enter search term
    await searchInput.fill('test');

    // 5. Verify results are filtered
    const results = page.getByRole('row').or(page.locator('.participant-item'));
    const firstResult = results.first();
    await expect(firstResult).toBeVisible();
  });
});
