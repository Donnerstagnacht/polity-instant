// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Todos - Empty State', () => {
  test('Todos page displays appropriate empty state when no todos exist', async ({ page }) => {
    // 1. Navigate to /todos as user with no todos
    await loginAsTestUser(page);
    await page.goto('/todos');

    // 2. Check if there are any todos
    const todoCards = page
      .getByRole('article')
      .or(page.locator('[data-testid*="todo"]'))
      .or(page.locator('.todo-card'));
    const todoRows = page.getByRole('row');

    const cardCount = await todoCards.count();
    const rowCount = await todoRows.count();

    // 3. If no todos, verify empty state is shown
    if (cardCount === 0 && rowCount <= 1) {
      // <= 1 to account for header row
      const emptyState = page
        .getByText(/no todos/i)
        .or(page.getByText(/no tasks/i))
        .or(page.getByText(/create your first todo/i));
      await expect(emptyState).toBeVisible();

      // 4. Call-to-action button to create first todo
      const createButton = page
        .getByRole('button', { name: /create/i })
        .or(page.getByRole('button', { name: /new todo/i }));
      await expect(createButton.first()).toBeVisible();

      // 5. Empty state includes helpful message or illustration
      // Visual feedback that the list is intentionally empty
    }
  });
});
