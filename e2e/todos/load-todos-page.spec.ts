// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Todos - Load Todos Page', () => {
  test('User accesses the todos page', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to /todos
    await page.goto('/todos');

    // 3. Page loads with default view
    await expect(page.getByRole('heading', { name: /my todos/i })).toBeVisible();

    // 4. View mode toggle buttons visible (Kanban/List)
    // View mode uses icon-only buttons, not tabs
    const viewToggle = page.locator('.flex.gap-1.rounded-lg.border');
    await expect(viewToggle).toBeVisible();
    // Two buttons inside the toggle: list and kanban
    await expect(viewToggle.locator('button').first()).toBeVisible();

    // 5. Create Todo button visible
    const createButton = page
      .getByRole('button', { name: /create/i })
      .or(page.getByRole('button', { name: /new todo/i }));
    await expect(createButton.first()).toBeVisible();
  });
});
