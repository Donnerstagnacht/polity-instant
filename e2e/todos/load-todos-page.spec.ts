// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Todos - Load Todos Page', () => {
  test('User accesses the todos page', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /todos
    await page.goto('/todos');

    // 3. Page loads with default view
    await expect(page.getByRole('heading', { name: /todos/i })).toBeVisible();

    // 4. View mode toggle buttons visible (Kanban/List)
    await expect(page.getByRole('tab', { name: /kanban/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /list/i })).toBeVisible();

    // 5. Create Todo button visible
    const createButton = page
      .getByRole('button', { name: /create/i })
      .or(page.getByRole('button', { name: /new todo/i }));
    await expect(createButton.first()).toBeVisible();
  });
});
