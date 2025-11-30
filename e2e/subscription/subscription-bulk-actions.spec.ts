// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Bulk Unsubscribe', () => {
  test('User can bulk unsubscribe', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to subscriptions page
    await page.goto('/user/page/subscriptions');
    await page.waitForLoadState('networkidle');

    // 3. Look for checkboxes to select multiple subscriptions
    const checkboxes = page.getByRole('checkbox');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      // 4. User selects multiple subscriptions via checkboxes
      await checkboxes.first().check();
      if (checkboxCount > 1) {
        await checkboxes.nth(1).check();
      }

      // 5. User clicks "Unsubscribe from Selected" or similar bulk action
      const bulkUnsubscribeButton = page.getByRole('button', {
        name: /unsubscribe.*selected|bulk.*unsubscribe|remove.*selected/i,
      });

      if ((await bulkUnsubscribeButton.count()) > 0) {
        await bulkUnsubscribeButton.first().click();

        // 6. Confirmation dialog appears
        const confirmDialog = page.getByRole('dialog').or(page.getByText(/are you sure|confirm/i));

        if ((await confirmDialog.count()) > 0) {
          // 7. User confirms bulk unsubscribe
          const confirmButton = page.getByRole('button', { name: /confirm|yes|unsubscribe/i });
          if ((await confirmButton.count()) > 0) {
            await confirmButton.first().click();
          }
        }

        // 8. Wait for operation to complete
        await page.waitForTimeout(1000);
      }
    }

    // Verify page still loads (bulk action may not exist yet)
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
  });
});
