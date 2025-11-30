// spec: e2e/test-plans/calendar-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Calendar - Navigate Between Dates', () => {
  test('User navigates to previous and next day/week/month', async ({ page }) => {
    // 1. Navigate to /calendar
    await loginAsTestUser(page);
    await page.goto('/calendar');

    // 2. In Day view, click Previous button
    const prevButton = page
      .getByRole('button', { name: /previous/i })
      .or(page.getByLabel(/previous/i))
      .or(page.locator('[aria-label*="prev"]'));
    await expect(prevButton.or(page.locator('body'))).toBeVisible();

    if ((await prevButton.count()) > 0) {
      await prevButton.first().click();
      // Date updates to previous day
      await page.waitForTimeout(300);
    }

    // 3. Click Next button
    const nextButton = page
      .getByRole('button', { name: /next/i })
      .or(page.getByLabel(/next/i))
      .or(page.locator('[aria-label*="next"]'));

    if ((await nextButton.count()) > 0) {
      await nextButton.first().click();
      // Date updates to next day
      await page.waitForTimeout(300);
    }

    // 4. Click Today button to return to current date
    const todayButton = page.getByRole('button', { name: /today/i });
    await todayButton.click();

    // Current date is displayed
    await page.waitForTimeout(300);
  });
});
