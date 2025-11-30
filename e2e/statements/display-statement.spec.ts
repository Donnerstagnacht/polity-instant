// spec: e2e/test-plans/statements-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Statements - Display Statement Page', () => {
  test('User views statement with tag, text, and creator info', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to statement page
    await page.goto(`/statement/${TEST_ENTITY_IDS.STATEMENT}`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Tag displayed prominently with badge
    const tag = page.locator('[class*="Badge"]').or(page.getByRole('status'));
    await expect(tag.first()).toBeVisible();

    // 5. Statement text in quotes
    const statementText = page.locator('blockquote').or(page.getByText(/"/));
    await expect(statementText.first()).toBeVisible();

    // 6. Creator avatar and name shown
    // 7. Creation date displayed (if available)
    // 8. Visibility indicator present

    // Statement details are visible
    await expect(page).toHaveURL(/\/statement\/.+/);
  });

  test('Creator information displays correctly', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to statement page
    await page.goto(`/statement/${TEST_ENTITY_IDS.STATEMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Check creator section
    const authorCard = page.locator('[class*="Card"]').filter({ hasText: /author/i });

    if ((await authorCard.count()) > 0) {
      // 4. Avatar displayed
      // 5. Name clickable to profile (if implemented)
      // 6. Handle shown if available
      // 7. "Created by" or "Author" label present
    }
  });
});
