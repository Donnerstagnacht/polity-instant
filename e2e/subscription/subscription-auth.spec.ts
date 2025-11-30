// spec: e2e/test-plans/subscription-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { TEST_ENTITY_IDS } from '../test-entity-ids';
import { navigateToUserProfile } from '../helpers/subscription';

const TEST_USER_ID = TEST_ENTITY_IDS.testUser1;

test.describe('Unauthenticated Subscription Attempt', () => {
  test('Unauthenticated user cannot subscribe', async ({ page }) => {
    // 1. Navigate to entity page without authentication
    await navigateToUserProfile(page, TEST_USER_ID);

    // 2. Look for subscribe button
    const subscribeButton = page.getByRole('button', { name: /subscribe/i });

    // 3. If button exists, clicking it should redirect to login
    if ((await subscribeButton.count()) > 0) {
      await subscribeButton.first().click();

      // 4. User is redirected to login page
      await expect(page).toHaveURL(/\/auth/, { timeout: 5000 });
    } else {
      // 5. Or button might be hidden for unauthenticated users
      // This is also acceptable behavior
      expect(await subscribeButton.count()).toBe(0);
    }
  });
});
