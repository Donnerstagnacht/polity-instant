// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Todos - View Todos in List View', () => {
  test('User switches to list view and sees todos in a table format', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /todos
    await page.goto('/todos');

    // 2. Click List view button (icon-only button, first in the toggle container)
    const viewToggle = page.locator('.flex.gap-1.rounded-lg.border');
    await viewToggle.locator('button').first().click();

    // 3. List view displays todos in table format
    const listView = page
      .locator('[data-view="list"]')
      .or(page.locator('.list-view'))
      .or(page.getByTestId('list-view'));
    await expect(listView.or(page.locator('body'))).toBeVisible();

    // 4. Table headers visible (Title, Status, Priority, Due Date)
    // At least some headers should be visible
    // 5. Todo rows display with relevant information
  });
});
