import { test, expect } from '../fixtures/test-base';
import { navigateToGroupOperation } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Operations - Toggle Group Todo', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToGroupOperation(page, TEST_ENTITY_IDS.GROUP);
  });

  test('should toggle task completion via checkbox', async ({ authenticatedPage: page }) => {
    // Wait for the tasks section to load
    const taskCheckboxes = page.getByRole('checkbox');

    if ((await taskCheckboxes.count()) === 0) {
      test.skip();
      return;
    }

    const firstCheckbox = taskCheckboxes.first();
    const wasChecked = await firstCheckbox.isChecked();

    // Toggle
    await firstCheckbox.click();

    // Verify toast
    const toast = page.getByText('Status updated!');
    await expect(toast).toBeVisible({ timeout: 5000 });

    // Verify toggled state
    if (wasChecked) {
      await expect(firstCheckbox).not.toBeChecked();
    } else {
      await expect(firstCheckbox).toBeChecked();
    }
  });

  test('should update task status via dropdown', async ({ authenticatedPage: page }) => {
    // Look for status dropdown on a task card
    const statusSelects = page.locator('select, [role="combobox"]').filter({
      hasText: /pending|in progress|completed|cancelled/i,
    });

    if ((await statusSelects.count()) === 0) {
      test.skip();
      return;
    }

    // Click to open the dropdown
    await statusSelects.first().click();

    // Select a new status
    const inProgressOption = page.getByRole('option', { name: /in progress/i });
    if ((await inProgressOption.count()) > 0) {
      await inProgressOption.click();

      const toast = page.getByText('Status updated!');
      await expect(toast).toBeVisible({ timeout: 5000 });
    }
  });
});
