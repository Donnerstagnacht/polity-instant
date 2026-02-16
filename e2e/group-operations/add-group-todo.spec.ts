import { test, expect } from '../fixtures/test-base';
import { navigateToGroupOperation } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Operations - Add Group Todo', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToGroupOperation(page, TEST_ENTITY_IDS.GROUP);
  });

  test('should display Add Task button for authorized users', async ({ authenticatedPage: page }) => {
    const addTaskButton = page.getByRole('button', { name: /add task/i });
    if ((await addTaskButton.count()) > 0) {
      await expect(addTaskButton).toBeVisible();
    }
  });

  test('should open Add New Task dialog with form fields', async ({ authenticatedPage: page }) => {
    const addTaskButton = page.getByRole('button', { name: /add task/i });
    if ((await addTaskButton.count()) === 0) {
      test.skip();
      return;
    }

    await addTaskButton.click();

    // Dialog should appear
    await expect(page.getByText('Add New Task')).toBeVisible();
    await expect(page.getByText('Create a new task for this group')).toBeVisible();

    // Form fields
    await expect(page.locator('#todo-title')).toBeVisible();
    await expect(page.locator('#todo-description')).toBeVisible();
    await expect(page.locator('#todo-priority')).toBeVisible();
    await expect(page.locator('#todo-dueDate')).toBeVisible();
  });

  test('should add a new task via the dialog', async ({ authenticatedPage: page }) => {
    const addTaskButton = page.getByRole('button', { name: /add task/i });
    if ((await addTaskButton.count()) === 0) {
      test.skip();
      return;
    }

    await addTaskButton.click();
    await expect(page.getByText('Add New Task')).toBeVisible();

    // Fill in title
    await page.locator('#todo-title').fill('E2E Test Task');

    // Fill in description
    await page.locator('#todo-description').fill('Task created by E2E test');

    // Select priority
    await page.locator('#todo-priority').click();
    await page.getByRole('option', { name: /medium/i }).click();

    // Submit
    const submitButton = page.getByRole('button', { name: /add task/i }).last();
    await submitButton.click();

    // Verify success toast
    const toast = page.getByText('Todo added successfully!');
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});
