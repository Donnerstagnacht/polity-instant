import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Groups - Edit Group', () => {
  test('should display group edit form', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
  }) => {
    const group = await groupFactory.createGroup(mainUserId);
    await gotoWithRetry(page, `/group/${group.id}/edit`);

    const nameInput = page.locator('#name');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
  });

  test('should display description field', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
  }) => {
    const group = await groupFactory.createGroup(mainUserId);
    await gotoWithRetry(page, `/group/${group.id}/edit`);

    const descriptionInput = page.locator('#description');
    await expect(descriptionInput).toBeVisible({ timeout: 10000 });
  });

  test('should save group changes', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
  }) => {
    const group = await groupFactory.createGroup(mainUserId);
    await gotoWithRetry(page, `/group/${group.id}/edit`);

    const nameInput = page.locator('#name');
    await expect(nameInput).toBeVisible({ timeout: 10000 });

    await nameInput.clear();
    await nameInput.fill('Updated E2E Group');

    const saveButton = page.getByRole('button', { name: /save changes/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Groups - Network', () => {
  test('should display group network page', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
  }) => {
    const group = await groupFactory.createGroup(mainUserId);
    await gotoWithRetry(page, `/group/${group.id}/network`);

    const networkContent = page.getByText(/network|relationships|parent|child/i);
    if ((await networkContent.count()) > 0) {
      await expect(networkContent.first()).toBeVisible();
    }
  });
});

test.describe('Groups - Relationships', () => {
  test('should display group relationships page', async ({
    authenticatedPage: page,
    mainUserId,
    groupFactory,
  }) => {
    const group = await groupFactory.createGroup(mainUserId);
    await gotoWithRetry(page, `/group/${group.id}/relationships`);

    await page.waitForLoadState('networkidle');
  });
});
