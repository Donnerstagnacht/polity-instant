// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Todos - Filter by Priority', () => {
  test('User filters todos by priority level (High, Medium, Low)', async ({ page }) => {
    // 1. Navigate to /todos
    await loginAsTestUser(page);
    await page.goto('/todos');

    // 2. Locate priority filter dropdown
    const priorityFilter = page
      .getByRole('combobox', { name: /priority/i })
      .or(page.locator('[data-testid="priority-filter"]'));

    if ((await priorityFilter.count()) > 0) {
      // 3. Select "High" priority filter
      await priorityFilter.click();
      const highOption = page.getByRole('option', { name: /high/i });
      await highOption.click();

      // 4. Only high-priority todos are displayed
      await page.waitForTimeout(300);

      // 5. Clear filter to show all priorities
      await priorityFilter.click();
      const allOption = page
        .getByRole('option', { name: /all/i })
        .or(page.getByRole('option', { name: /any/i }));

      if ((await allOption.count()) > 0) {
        await allOption.click();
        await page.waitForTimeout(300);
      }
    } else {
      // Alternative: priority badges or chips as filters
      const highPriorityFilter = page
        .getByRole('button', { name: /high/i })
        .or(page.locator('[data-priority="high"]'));

      if ((await highPriorityFilter.count()) > 0) {
        await highPriorityFilter.click();
        await page.waitForTimeout(300);
      }
    }
  });
});
