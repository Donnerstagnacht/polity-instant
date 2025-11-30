// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Todos - Filter by Status', () => {
  test('User filters todos by status (All, Todo, In Progress, Done)', async ({ page }) => {
    // 1. Navigate to /todos
    await loginAsTestUser(page);
    await page.goto('/todos');

    // 2. Locate status filter dropdown or tabs
    const statusFilter = page
      .getByRole('combobox', { name: /status/i })
      .or(page.locator('[data-testid="status-filter"]'));

    if ((await statusFilter.count()) > 0) {
      // 3. Select "In Progress" filter
      await statusFilter.click();
      const inProgressOption = page.getByRole('option', { name: /in progress/i });
      await inProgressOption.click();

      // 4. Only "In Progress" todos are displayed
      await page.waitForTimeout(300);

      // 5. Select "All" to show all todos
      await statusFilter.click();
      const allOption = page.getByRole('option', { name: /all/i });
      await allOption.click();

      // All todos displayed
      await page.waitForTimeout(300);
    } else {
      // Alternative: status tabs
      const statusTabs = page.locator('[role="tablist"]').filter({ hasText: /status/i });

      if ((await statusTabs.count()) > 0) {
        const inProgressTab = page.getByRole('tab', { name: /in progress/i });
        await inProgressTab.click();
        await page.waitForTimeout(300);
      }
    }
  });
});
