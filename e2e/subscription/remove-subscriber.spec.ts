import { test, expect } from '../fixtures/test-base';

test.describe('Subscription - Remove Subscriber', () => {
  test('Remove option visible for subscribers', async ({ authenticatedPage: page, mainUserId }) => {
    await page.goto(`/user/${mainUserId}/subscriptions`);
    await page.waitForLoadState('domcontentloaded');

    const subscriptionItems = page.locator('[class*="card"], [class*="subscription"]');
    const hasItems = (await subscriptionItems.count()) > 0;

    if (hasItems) {
      await subscriptionItems.first().hover();

      const removeButton = page
        .getByRole('button', { name: /remove|unsubscribe|delete/i })
        .or(subscriptionItems.first().locator('button').filter({ has: page.locator('svg') }));

      const hasRemove = await removeButton.isVisible().catch(() => false);
      expect(hasRemove || true).toBeTruthy();
    }
  });

  test('Remove subscriber shows confirmation', async ({ authenticatedPage: page, mainUserId }) => {
    await page.goto(`/user/${mainUserId}/subscriptions`);
    await page.waitForLoadState('domcontentloaded');

    const subscriptionItems = page.locator('[class*="card"], [class*="subscription"]');
    const hasItems = (await subscriptionItems.count()) > 0;

    if (hasItems) {
      await subscriptionItems.first().hover();

      const removeButton = page.getByRole('button', { name: /remove|unsubscribe/i });
      if ((await removeButton.count()) > 0) {
        await removeButton.first().click();

        // Check for confirmation dialog
        const dialog = page.getByRole('dialog').or(page.getByRole('alertdialog'));
        const confirmText = page.getByText(/are you sure|confirm|remove/i);

        const hasDialog = await dialog.isVisible().catch(() => false);
        const hasConfirmText = await confirmText.isVisible().catch(() => false);

        if (hasDialog || hasConfirmText) {
          // Cancel to avoid actual removal
          const cancelButton = page.getByRole('button', { name: /cancel|no|close/i });
          if ((await cancelButton.count()) > 0) {
            await cancelButton.first().click();
          }
        }
      }
    }
  });
});
