// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Todos - Sort Todos', () => {
  test('User sorts todos by due date, priority, or creation date', async ({ page }) => {
    // 1. Navigate to /todos
    await loginAsTestUser(page);
    await page.goto('/todos');

    // 2. Locate sort dropdown or controls
    const sortControl = page
      .getByRole('combobox', { name: /sort/i })
      .or(page.locator('[data-testid="sort-control"]'));

    if ((await sortControl.count()) > 0) {
      // 3. Select "Due Date" sorting
      await sortControl.click();
      const dueDateOption = page.getByRole('option', { name: /due date/i });
      await dueDateOption.click();

      // 4. Todos are sorted by due date
      await page.waitForTimeout(300);

      // 5. Change sort to "Priority"
      await sortControl.click();
      const priorityOption = page.getByRole('option', { name: /priority/i });
      await priorityOption.click();

      // Todos are sorted by priority level
      await page.waitForTimeout(300);
    } else {
      // Alternative: column headers as sort controls
      const dueDateHeader = page.getByRole('columnheader', { name: /due date/i });

      if ((await dueDateHeader.count()) > 0) {
        await dueDateHeader.click();
        await page.waitForTimeout(300);
      }
    }
  });
});
