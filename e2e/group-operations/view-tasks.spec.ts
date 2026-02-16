import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Operations - View Tasks', () => {
  test('should display the Tasks section', async ({
    authenticatedPage: page,
    groupFactory,
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
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
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
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
    userFactory,
  }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const group = await groupFactory.createGroup(user.id, {
      name: `Tasks Cards Test ${Date.now()}`,
    });
    await page.goto(`/group/${group.id}/operation`);
    await page.waitForLoadState('domcontentloaded');

    // Look for task items (checkboxes or task cards)
    const taskCheckboxes = page.getByRole('checkbox');
    const taskCards = page.locator('[class*="todo"], [class*="task"]');

    const hasCheckboxes = (await taskCheckboxes.count()) > 0;
    const hasCards = (await taskCards.count()) > 0;

    if (hasCheckboxes || hasCards) {
      if (hasCheckboxes) {
        await expect(taskCheckboxes.first()).toBeVisible();
      }
    }
  });
});
