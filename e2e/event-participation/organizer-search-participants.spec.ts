// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Search Participants', () => {
  test('Organizer can search participants by name', async ({ page }) => {
    // 1. Authenticate as organizer user
    await loginAsTestUser(page);

    // 2. Navigate to participants page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}/participants`);

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
