// spec: e2e/test-plans/amendment-collaboration-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendment Collaboration', () => {
  test('Author can search collaborators', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}/collaborators`);

    // Search input is visible
    const searchInput = page.getByPlaceholder(/search collaborators/i);
    await expect(searchInput).toBeVisible();

    // Enter search term
    await searchInput.fill('test');

    // Results section is visible
    await expect(page.getByRole('heading', { name: /Active Collaborators/i })).toBeVisible();

    // Clear search and verify results show
    await searchInput.clear();
    await expect(page.getByRole('heading', { name: /Active Collaborators/i })).toBeVisible();
  });
});
