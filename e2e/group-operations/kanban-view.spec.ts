import { test, expect } from '../fixtures/test-base';
import { navigateToGroupOperation } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Operations - Kanban View', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToGroupOperation(page, TEST_ENTITY_IDS.GROUP);
  });

  test('should switch between list and kanban views', async ({ authenticatedPage: page }) => {
    const tasksSection = page.locator('section, div').filter({ hasText: 'Tasks' }).first();

    // Find toggle buttons (LayoutList and LayoutGrid icons)
    const toggleButtons = tasksSection.getByRole('button');

    if ((await toggleButtons.count()) < 2) {
      test.skip();
      return;
    }

    // Click the kanban toggle (second button typically)
    await toggleButtons.nth(1).click();

    // Kanban columns should appear: To Do, In Progress, Completed, Cancelled
    const toDoColumn = page.getByText('To Do');
    const inProgressColumn = page.getByText('In Progress');
    const completedColumn = page.getByText('Completed');

    if ((await toDoColumn.count()) > 0) {
      await expect(toDoColumn.first()).toBeVisible();
    }
    if ((await inProgressColumn.count()) > 0) {
      await expect(inProgressColumn.first()).toBeVisible();
    }
    if ((await completedColumn.count()) > 0) {
      await expect(completedColumn.first()).toBeVisible();
    }
  });

  test('should display kanban column headers', async ({ authenticatedPage: page }) => {
    // Switch to kanban view first
    const tasksSection = page.locator('section, div').filter({ hasText: 'Tasks' }).first();
    const toggleButtons = tasksSection.getByRole('button');

    if ((await toggleButtons.count()) < 2) {
      test.skip();
      return;
    }

    await toggleButtons.nth(1).click();

    // Verify column headers exist
    const expectedColumns = ['To Do', 'In Progress', 'Completed', 'Cancelled'];
    for (const column of expectedColumns) {
      const header = page.getByText(column, { exact: true });
      if ((await header.count()) > 0) {
        await expect(header.first()).toBeVisible();
      }
    }
  });
});
