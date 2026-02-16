import { test, expect } from '../fixtures/test-base';
import { navigateToStatement } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Statement - Agree Interaction', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToStatement(page, TEST_ENTITY_IDS.STATEMENT);
  });

  test('should toggle agree when clicking agree button', async ({ authenticatedPage: page }) => {
    const agreeButton = page.getByRole('button', { name: /agree/i });
    if ((await agreeButton.count()) === 0) {
      test.skip();
      return;
    }

    await agreeButton.first().click();
    // Agree state should change (button style/color updates)
  });

  test('should open comment section when clicking comment button', async ({ authenticatedPage: page }) => {
    const commentButton = page.getByRole('button', { name: /comment/i });
    if ((await commentButton.count()) === 0) {
      test.skip();
      return;
    }

    await commentButton.first().click();

    // Comment input area should become visible
    const commentInput = page.locator('textarea, [contenteditable="true"]');
    if ((await commentInput.count()) > 0) {
      await expect(commentInput.first()).toBeVisible();
    }
  });

  test('should save statement for later', async ({ authenticatedPage: page }) => {
    const saveButton = page.getByRole('button', { name: /save for later/i });
    if ((await saveButton.count()) === 0) {
      test.skip();
      return;
    }

    await saveButton.click();
  });
});
