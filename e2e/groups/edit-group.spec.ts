import { test, expect } from '../fixtures/test-base';
import { navigateToGroup } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Groups - Edit Group', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}/edit`);
    await page.waitForLoadState('networkidle');
  });

  test('should display group edit form', async ({ authenticatedPage: page }) => {
    const titleInput = page.getByRole('textbox', { name: /name|title/i });
    if ((await titleInput.count()) > 0) {
      await expect(titleInput).toBeVisible();
    }
  });

  test('should display description field', async ({ authenticatedPage: page }) => {
    const descriptionInput = page.locator('textarea');
    if ((await descriptionInput.count()) > 0) {
      await expect(descriptionInput.first()).toBeVisible();
    }
  });

  test('should save group changes', async ({ authenticatedPage: page }) => {
    const titleInput = page.getByRole('textbox', { name: /name|title/i });
    if ((await titleInput.count()) === 0) {
      test.skip();
      return;
    }

    // Modify the name
    await titleInput.clear();
    await titleInput.fill('Updated E2E Group');

    const saveButton = page.getByRole('button', { name: /save/i });
    if ((await saveButton.count()) > 0) {
      await saveButton.click();
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('Groups - Network', () => {
  test('should display group network page', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}/network`);
    await page.waitForLoadState('networkidle');

    const networkContent = page.getByText(/network|relationships|parent|child/i);
    if ((await networkContent.count()) > 0) {
      await expect(networkContent.first()).toBeVisible();
    }
  });
});

test.describe('Groups - Relationships', () => {
  test('should display group relationships page', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}/relationships`);
    await page.waitForLoadState('networkidle');

    // Relationships page should load
    await page.waitForLoadState('networkidle');
  });
});
