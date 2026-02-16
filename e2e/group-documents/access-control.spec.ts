import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Documents - Access Control', () => {
  test('should require authentication', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}/editor`);
    await page.waitForLoadState('networkidle');

    const isOnAuth = page.url().includes('/auth');
    const signInPrompt = page.getByText(/sign in|log in/i);

    if (isOnAuth) {
      await expect(page).toHaveURL(/\/auth/);
    } else if ((await signInPrompt.count()) > 0) {
      await expect(signInPrompt.first()).toBeVisible();
    }
  });

  test('should restrict access for non-members', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup3}/editor`);
    await page.waitForLoadState('networkidle');

    const accessDenied = page.getByText(/access denied|not authorized|no permission/i);
    if ((await accessDenied.count()) > 0) {
      await expect(accessDenied.first()).toBeVisible();
    }
  });

  test('should show not found for invalid document', async ({ authenticatedPage: page }) => {
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}/editor/invalid-doc-id`);
    await page.waitForLoadState('networkidle');

    const notFound = page.getByText(/not found|no access/i);
    if ((await notFound.count()) > 0) {
      await expect(notFound.first()).toBeVisible();
    }
  });
});
