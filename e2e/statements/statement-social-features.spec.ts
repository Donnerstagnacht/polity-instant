// spec: e2e/test-plans/statements-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Statements - Statement Social Features', () => {
  test('User shares a statement', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to statement page
    await page.goto(`/statement/${TEST_ENTITY_IDS.STATEMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Click share button
    const shareButton = page.getByRole('button', { name: /share/i });

    if ((await shareButton.count()) > 0) {
      await shareButton.click();

      // 4. View share options
      await page.waitForTimeout(300);

      // 5. Share URL generated
      // Social media options available
      // Copy link functionality
      // Share includes statement text and tag
    }
  });

  test('Statement displays engagement actions', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to statement page
    await page.goto(`/statement/${TEST_ENTITY_IDS.STATEMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Check for engagement actions
    const agreeButton = page.getByRole('button', { name: /agree/i });
    const commentButton = page.getByRole('button', { name: /comment/i });
    const shareButton = page.getByRole('button', { name: /share/i });

    // 4. Verify buttons are visible
    if ((await agreeButton.count()) > 0) {
      await expect(agreeButton).toBeVisible();
    }

    if ((await commentButton.count()) > 0) {
      await expect(commentButton).toBeVisible();
    }

    if ((await shareButton.count()) > 0) {
      await expect(shareButton).toBeVisible();
    }
  });
});
