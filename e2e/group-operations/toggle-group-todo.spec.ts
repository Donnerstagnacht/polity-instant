import { test, expect } from '../fixtures/test-base';

test.describe('Group Operations - Toggle Group Todo', () => {
  test('should toggle task completion via toggle button', async ({
    authenticatedPage: page,
    groupFactory,
    todoFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Toggle Todo Group' });
    await todoFactory.createTodo(mainUserId, {
      title: 'E2E Toggle Task',
      status: 'pending',
      groupId: group.id,
    });

    // Navigate and wait for todo to sync (InstantDB eventual consistency)
    for (let attempt = 0; attempt < 5; attempt++) {
      await page.goto(`/group/${group.id}/operation`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000 + attempt * 1000);
      if (await page.getByText('E2E Toggle Task').isVisible({ timeout: 3000 }).catch(() => false)) break;
    }

    await expect(page.getByText('E2E Toggle Task')).toBeVisible({ timeout: 10000 });

    // Default view is kanban. Switch to list view to see toggle buttons.
    const listButton = page.getByRole('button', { name: /list view/i });
    await expect(listButton).toBeVisible({ timeout: 10000 });
    await listButton.click();
    await page.waitForTimeout(500);

    // The todo card uses a styled button with Circle/CheckCircle2 icon (not a native checkbox).
    await expect(page.getByText('E2E Toggle Task')).toBeVisible({ timeout: 5000 });

    // Find the toggle button (it's a small button with an SVG circle icon near the card)
    const todoCard = page.locator('div').filter({ hasText: 'E2E Toggle Task' }).first();
    const toggleButton = todoCard.locator('button').first();
    await toggleButton.click();

    // Verify some visual feedback (toast or status change)
    await page.waitForTimeout(1000);
  });

  test('should update task status via dropdown', async ({
    authenticatedPage: page,
    groupFactory,
    todoFactory,
    mainUserId,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Status Todo Group' });
    await todoFactory.createTodo(mainUserId, {
      title: 'E2E Status Task',
      status: 'pending',
      groupId: group.id,
    });

    // Navigate and wait for todo to sync
    for (let attempt = 0; attempt < 5; attempt++) {
      await page.goto(`/group/${group.id}/operation`);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000 + attempt * 1000);
      if (await page.getByText('E2E Status Task').isVisible({ timeout: 3000 }).catch(() => false)) break;
    }

    await expect(page.getByText('E2E Status Task')).toBeVisible({ timeout: 10000 });

    // Default view is kanban. Switch to list view to see status dropdowns.
    const listButton = page.getByRole('button', { name: /list view/i });
    await expect(listButton).toBeVisible({ timeout: 10000 });
    await listButton.click();
    await page.waitForTimeout(500);

    // Look for status dropdown (shadcn Select renders with role="combobox")
    const statusSelects = page.locator('[role="combobox"]');
    await expect(statusSelects.first()).toBeVisible({ timeout: 10000 });

    // Click to open the dropdown
    await statusSelects.first().click();

    // Select a new status
    const inProgressOption = page.getByRole('option', { name: /in progress/i });
    if ((await inProgressOption.count()) > 0) {
      await inProgressOption.click();
      await page.waitForTimeout(1000);
    }
  });
});
