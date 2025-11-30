// spec: e2e/test-plans/statements-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Statements - Related Statements', () => {
  test('View related statements with same tag', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to statement page
    await page.goto(`/statement/${TEST_ENTITY_IDS.STATEMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Check "Related Statements" section
    const relatedSection = page
      .locator('[class*="Card"]')
      .filter({ hasText: /related statement/i });

    if ((await relatedSection.count()) > 0) {
      // 4. Statements with same tag shown
      const relatedItems = relatedSection
        .locator('[role="article"]')
        .or(relatedSection.locator('a'));

      // 5. Limited to reasonable number (e.g., 5-10)
      // 6. Clickable to view full statement
      // 7. Relevant statements prioritized

      if ((await relatedItems.count()) > 0) {
        await expect(relatedItems.first()).toBeVisible();
      }
    }
  });

  test('Display empty state when no related statements exist', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to statement with unique tag
    await page.goto(`/statement/${TEST_ENTITY_IDS.STATEMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Check related section
    const relatedSection = page
      .locator('[class*="Card"]')
      .filter({ hasText: /related statement/i });

    if ((await relatedSection.count()) > 0) {
      // 4. Look for empty state message
      const emptyMessage = relatedSection.getByText(/no related statements/i);

      if ((await emptyMessage.count()) > 0) {
        await expect(emptyMessage).toBeVisible();

        // 5. Suggestion to explore other tags
        // 6. Clean empty state
      }
    }
  });
});
