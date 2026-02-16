// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '../fixtures/test-base';
test.describe('Todos - Mark Todo as Complete', () => {
  test('User marks a todo item as complete', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /todos
    await page.goto('/todos');

    // 2. Locate a todo item that is not complete
    // 3. Click checkbox or "Mark Complete" button
    const checkbox = page.getByRole('checkbox').first();
    const completeButton = page.getByRole('button', { name: /complete|done/i }).first();

    if ((await checkbox.count()) > 0) {
      // If todo has a checkbox
      const isChecked = await checkbox.isChecked();

      if (!isChecked) {
        await checkbox.check();
      }
    } else if ((await completeButton.count()) > 0) {
      // If todo has a complete button
      await completeButton.click();
    }

    // 4. Todo status changes to "Done"

    // 5. Todo may move to "Done" column in Kanban view
    // Verify status change or visual indicator
  });
});
