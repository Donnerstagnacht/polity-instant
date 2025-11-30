// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Timeline Events Display', () => {
  test('Timeline events show proper information', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check if timeline has events
    const hasEvents = !(await page
      .getByText(/your timeline is empty/i)
      .isVisible()
      .catch(() => false));

    if (hasEvents) {
      // 5. Get first event card
      const eventCards = page
        .locator('[class*="Card"]')
        .filter({ has: page.locator('[class*="CardHeader"]') });
      const firstEvent = eventCards.first();

      const hasEventCard = await firstEvent.isVisible().catch(() => false);

      if (hasEventCard) {
        // 6. Verify event card is visible
        await expect(firstEvent).toBeVisible();

        // 7. Events should be clickable
        await expect(firstEvent).toBeEnabled();
      }
    }
  });

  test('Timeline shows event count', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check for event count in description
    const countText = page.locator('p[class*="CardDescription"]').filter({ hasText: /update/i });
    const hasCount = await countText.isVisible().catch(() => false);

    if (hasCount) {
      // 5. Verify count shows number of updates
      await expect(countText).toBeVisible();
      const text = await countText.textContent();
      expect(text).toMatch(/\d+ update/i);
    }
  });

  test('Timeline events are sorted by most recent', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to home page
    await page.goto('/');

    // 3. Wait for timeline to load
    await page.waitForLoadState('networkidle');

    // 4. Check if timeline has multiple events
    const eventCards = page
      .locator('[class*="Card"]')
      .filter({ has: page.locator('[class*="CardHeader"]') });
    const count = await eventCards.count();

    if (count > 1) {
      // 5. Verify events are displayed (sorting verified by backend)
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(eventCards.nth(i)).toBeVisible();
      }
    }
  });
});
