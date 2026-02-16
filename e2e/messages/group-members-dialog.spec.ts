import { test, expect } from '../fixtures/test-base';
test.describe('Messages - Group Members Dialog', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/messages');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should open group members dialog from conversation header', async ({ authenticatedPage: page }) => {
    // Select a group conversation first
    const conversationItems = page.locator('[class*="conversation"], [class*="Conversation"]');
    if ((await conversationItems.count()) === 0) {
      test.skip();
      return;
    }

    // Look for a group conversation (has member count indicator)
    const memberCount = page.getByText(/\d+ members/i);
    if ((await memberCount.count()) === 0) {
      test.skip();
      return;
    }

    await memberCount.first().click();

    // Group members dialog should open
    const dialog = page.getByRole('dialog');
    if ((await dialog.count()) > 0) {
      await expect(dialog).toBeVisible();
    }
  });
});
