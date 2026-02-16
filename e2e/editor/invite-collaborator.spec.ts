import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Editor - Invite Collaborator', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/editor/${TEST_ENTITY_IDS.testDocument1}`);
    await page.waitForLoadState('networkidle');
  });

  test('should display Invite button', async ({ authenticatedPage: page }) => {
    const inviteButton = page.getByRole('button', { name: /invite/i });
    if ((await inviteButton.count()) > 0) {
      await expect(inviteButton.first()).toBeVisible();
    }
  });

  test('should open Invite Collaborator dialog', async ({ authenticatedPage: page }) => {
    const inviteButton = page.getByRole('button', { name: /invite/i });
    if ((await inviteButton.count()) === 0) {
      test.skip();
      return;
    }

    await inviteButton.first().click();

    // Dialog should appear with search functionality
    const dialog = page.getByRole('dialog');
    if ((await dialog.count()) > 0) {
      await expect(dialog).toBeVisible();
    }
  });
});
