// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Events - Create Public Event with Required Fields', () => {
  test('User creates public event with required fields', async ({ authenticatedPage: page, groupFactory, mainUserId }) => {
    test.setTimeout(120000);

    // Create a group so we can assign the event to it
    const group = await groupFactory.createGroup(mainUserId, {
      name: `Event Test Group ${Date.now()}`,
    });

    // 1. Navigate to /create/event directly
    await page.goto('/create/event');
    await page.waitForLoadState('domcontentloaded');

    // 2. Step 0: Enter event title and description
    const titleInput = page.getByRole('textbox', { name: /title/i }).first();
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    await titleInput.fill('Community Meetup');

    const descInput = page.getByRole('textbox', { name: /description/i });
    if ((await descInput.count()) > 0) {
      await descInput.first().fill('Monthly community gathering');
    }

    // 3. Click Next through wizard steps 0→6 to reach step 7 (review)
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    for (let step = 0; step < 7; step++) {
      // On each step, check if we need to select a group (step 2)
      const groupSearch = page.locator('input[placeholder]').filter({ hasText: '' });
      const searchInput = page.locator('.relative input.pl-10');
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill(group.name);
        await page.waitForTimeout(1500);
        const groupOption = page.getByText(group.name).first();
        if (await groupOption.isVisible().catch(() => false)) {
          await groupOption.click();
          await page.waitForTimeout(500);
        }
      }

      if ((await nextButton.count()) > 0 && await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500); // Wait for carousel animation
      }
    }

    // 4. On step 7 (Review), click Create Event with retry
    const createButton = page.getByRole('button', { name: /create event/i });
    await expect(createButton).toBeVisible({ timeout: 5000 });

    for (let attempt = 0; attempt < 3; attempt++) {
      await createButton.click();
      try {
        await page.waitForURL(/\/event\/.+/, { timeout: 30000 });
        break; // Redirect succeeded
      } catch {
        // db.transact may have failed under load — retry if button reappeared
        const stillVisible = await createButton.isVisible().catch(() => false);
        if (!stillVisible || attempt === 2) {
          // Last attempt — wait longer for redirect
          await page.waitForURL(/\/event\/.+/, { timeout: 30000 });
        }
        // Otherwise loop will retry the click
      }
    }

    // 5. Verify event details displayed
    await expect(page.getByText('Community Meetup')).toBeVisible({ timeout: 15000 });
  });
});
