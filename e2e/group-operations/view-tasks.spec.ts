import { test, expect } from '../fixtures/test-base';

test.describe('Group Operations - View Tasks', () => {
  test('should display the Tasks section', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Tasks Group Test ${Date.now()}`,
    });
    await page.goto(`/group/${group.id}/operation`);
    await page.waitForLoadState('domcontentloaded');

    const tasksHeading = page.getByText('Tasks', { exact: true });
    await expect(tasksHeading.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show list/kanban view toggle buttons', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Tasks Toggle Test ${Date.now()}`,
    });
    await page.goto(`/group/${group.id}/operation`);
    await page.waitForLoadState('domcontentloaded');

    // List and Kanban view toggle icons
    const tasksSection = page.locator('section, div').filter({ hasText: 'Tasks' }).first();
    const toggleButtons = tasksSection.getByRole('button');

    // There should be at least the view toggle buttons
    await expect(toggleButtons.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display task cards when tasks exist', async ({
    authenticatedPage: page,
    groupFactory,
    todoFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Tasks Cards Test ${Date.now()}`,
    });
    await todoFactory.createTodo(mainUserId, {
      title: 'E2E Task Card Test',
      status: 'pending',
      groupId: group.id,
    });
    await page.goto(`/group/${group.id}/operation`);
    await page.waitForLoadState('domcontentloaded');

    // Default view is kanban - task should appear in a kanban column
    await expect(page.getByText('E2E Task Card Test')).toBeVisible({ timeout: 10000 });
  });
});
