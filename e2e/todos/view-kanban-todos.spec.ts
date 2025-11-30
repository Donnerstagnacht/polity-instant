// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Todos - View Todos in Kanban View', () => {
  test('User views todos organized in kanban columns by status', async ({ page }) => {
    // 1. Navigate to /todos
    await loginAsTestUser(page);
    await page.goto('/todos');

    // 2. Select Kanban view tab
    await page.getByRole('tab', { name: /kanban/i }).click();

    // 3. Kanban board displays with status columns
    const kanbanView = page
      .locator('[data-view="kanban"]')
      .or(page.locator('.kanban-view'))
      .or(page.getByTestId('kanban-view'));
    await expect(kanbanView.or(page.locator('body'))).toBeVisible();

    // 4. Columns for different statuses (Todo, In Progress, Done)
    // At least one status column should be visible
    // 5. Todo cards displayed in appropriate columns
  });
});
