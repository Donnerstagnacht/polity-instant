import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Operations - Kanban View', () => {
  test('should switch between list and kanban views', async ({
    authenticatedPage: page,
    groupFactory,
    todoFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Kanban Group' });
    await todoFactory.createTodo(mainUserId, {
      title: 'E2E Kanban Task',
      status: 'pending',
      groupId: group.id,
    });

    // Navigate and wait for todo to sync (InstantDB eventual consistency)
    for (let attempt = 0; attempt < 5; attempt++) {
      await page.goto(`/group/${group.id}/operation`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000 + attempt * 1000);
      if (await page.getByText('E2E Kanban Task').isVisible({ timeout: 3000 }).catch(() => false)) break;
    }

    await expect(page.getByText('E2E Kanban Task')).toBeVisible({ timeout: 10000 });

    // Default view is kanban. Find the list toggle button
    const listButton = page.getByRole('button', { name: /list view/i });
    await expect(listButton).toBeVisible({ timeout: 10000 });

    // Click list button to switch to list view
    await listButton.click();
    await page.waitForTimeout(500);

    // The task should be visible in list view with a status select
    const statusSelect = page.locator('[role="combobox"]');
    await expect(statusSelect.first()).toBeVisible({ timeout: 5000 });

    // Switch back to kanban
    const kanbanButton = page.getByRole('button', { name: /kanban view/i });
    await kanbanButton.click();
    await page.waitForTimeout(500);
  });

  test('should display kanban column headers', async ({
    authenticatedPage: page,
    groupFactory,
    todoFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Kanban Headers Group' });
    await todoFactory.createTodo(mainUserId, {
      title: 'E2E Kanban Header Task',
      status: 'pending',
      groupId: group.id,
    });

    // Navigate and wait for todo to sync
    for (let attempt = 0; attempt < 5; attempt++) {
      await page.goto(`/group/${group.id}/operation`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000 + attempt * 1000);
      if (await page.getByText('E2E Kanban Header Task').isVisible({ timeout: 3000 }).catch(() => false)) break;
    }

    // Default view is kanban - column headers should be visible
    const toDoColumn = page.getByText(/to do/i);
    await expect(toDoColumn.first()).toBeVisible({ timeout: 10000 });
  });
});
