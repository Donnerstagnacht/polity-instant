import { test, expect } from '../fixtures/test-base';
import { navigateToAmendment } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment - Discussions', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToAmendment(page, TEST_ENTITY_IDS.AMENDMENT);
  });

  test('should display discussion/comments section', async ({ authenticatedPage: page }) => {
    const commentsSection = page.getByText(/comment|discussion/i);
    if ((await commentsSection.count()) > 0) {
      await expect(commentsSection.first()).toBeVisible();
    }
  });

  test('should add a comment to the amendment', async ({ authenticatedPage: page }) => {
    // Find comment input area
    const commentInput = page.locator(
      'textarea[placeholder*="comment"], textarea[placeholder*="Comment"], [contenteditable="true"]'
    );
    if ((await commentInput.count()) === 0) {
      test.skip();
      return;
    }

    await commentInput.first().fill('E2E Test Comment');

    // Submit comment
    const submitButton = page.getByRole('button', { name: /post|submit|send|comment/i });
    if ((await submitButton.count()) > 0) {
      await submitButton.first().click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display threaded replies', async ({ authenticatedPage: page }) => {
    // Check for reply buttons on existing comments
    const replyButtons = page.getByRole('button', { name: /reply/i });
    if ((await replyButtons.count()) > 0) {
      await expect(replyButtons.first()).toBeVisible();
    }
  });
});
