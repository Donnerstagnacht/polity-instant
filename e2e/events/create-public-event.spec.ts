// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Events - Create Public Event with Required Fields', () => {
  test('User creates public event with required fields', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /create/event directly
    await page.goto('/create/event');
    await page.waitForLoadState('domcontentloaded');

    // 2. Step 1: Enter event title
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    await titleInput.fill('Community Meetup');

    // 3. Enter description if available
    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    if ((await descInput.count()) > 0) {
      await descInput.fill('Monthly community gathering');
    }

    // 4. Click Next through wizard steps
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click();

    // Keep clicking Next until we reach the Create/Submit step
    for (let i = 0; i < 5; i++) {
      const createButton = page.getByRole('button', { name: /create/i });
      if ((await createButton.count()) > 0 && await createButton.isEnabled()) {
        await createButton.click();
        break;
      }
      if ((await nextButton.count()) > 0 && await nextButton.isEnabled()) {
        await nextButton.click();
      }
    }

    // 5. Verify redirect to event page
    await page.waitForURL(/\/event\/.+/, { timeout: 10000 });

    // 6. Verify event details displayed
    await expect(page.getByText('Community Meetup')).toBeVisible({ timeout: 5000 });
  });
});
