import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Operations - Add Group Todo', () => {
  test('should display Add Task button for authorized users', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Task Display Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addTaskButton = page.getByRole('button', { name: /add task/i });
    await expect(addTaskButton).toBeVisible({ timeout: 10000 });
  });

  test('should open Add New Task dialog with form fields', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Task Dialog Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addTaskButton = page.getByRole('button', { name: /add task/i });
    await expect(addTaskButton).toBeVisible({ timeout: 10000 });
    await addTaskButton.click();

    // Dialog should appear
    await expect(page.getByText('Add New Task')).toBeVisible();

    // Form fields
    await expect(page.locator('#todo-title')).toBeVisible();
    await expect(page.locator('#todo-description')).toBeVisible();
  });

  test('should add a new task via the dialog', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Add Task Group' });
    await gotoWithRetry(page, `/group/${group.id}/operation`);

    const addTaskButton = page.getByRole('button', { name: /add task/i });
    await expect(addTaskButton).toBeVisible({ timeout: 10000 });
    await addTaskButton.click();
    await expect(page.getByText('Add New Task')).toBeVisible();

    // Fill in title
    await page.locator('#todo-title').fill('E2E Test Task');

    // Fill in description
    await page.locator('#todo-description').fill('Task created by E2E test');

    // Submit
    const submitButton = page.getByRole('button', { name: /add task/i }).last();
    await submitButton.click();

    // Verify success toast
    const toast = page.getByText(/todo added/i);
    await expect(toast).toBeVisible({ timeout: 5000 });
  });
});
