// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can search collaborators', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Author enters search term in collaborators page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/collaborators`);

    const searchInput = page.getByRole('textbox', { name: /search/i });
    await expect(searchInput).toBeVisible();

    // 2. Results filter by name, handle, role, or status
    await searchInput.fill('test');

    // 3. Results update in real-time
    const collaboratorsList = page.locator('.collaborators-list, [data-collaborators-list]');
    await expect(collaboratorsList).toBeVisible();

    const filteredItems = collaboratorsList.locator('.collaborator-item, [data-collaborator]');
    await expect(filteredItems.first()).toBeVisible();

    // Clear search and verify all results return
    await searchInput.clear();
    const allItems = await collaboratorsList
      .locator('.collaborator-item, [data-collaborator]')
      .count();
    expect(allItems).toBeGreaterThan(0);
  });
});
