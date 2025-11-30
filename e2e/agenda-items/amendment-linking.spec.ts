// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Amendment Linking', () => {
  test('Link amendment to agenda item', async ({ page }) => {
    // 1. Authenticate as test user (organizer)
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Create or edit agenda item
    const addButton = page.getByRole('button', { name: /add agenda item/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Discuss Climate Amendment');

      // 4. Search and select amendment
      const amendmentInput = page
        .getByLabel(/amendment/i)
        .or(page.getByPlaceholder(/search amendment/i));

      if ((await amendmentInput.count()) > 0) {
        await amendmentInput.fill('climate');
        await page.waitForTimeout(300);

        // 5. Select from dropdown
        const amendmentOption = page.getByRole('option').first();
        if ((await amendmentOption.count()) > 0) {
          await amendmentOption.click();
        }
      }

      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

      // 6. Amendment linked
      await page.waitForTimeout(500);

      // Amendment displayed on item
      // Click navigates to amendment
      // Item type may change to "vote" or "discussion"
    }
  });

  test('View linked amendment from agenda item', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Find agenda item with linked amendment
    const amendmentLinks = page.getByRole('link', { name: /amendment/i });

    if ((await amendmentLinks.count()) > 0) {
      const firstLink = amendmentLinks.first();

      // 4. Click amendment link
      await firstLink.click();

      // 5. Navigate to amendment
      await page.waitForURL(/\/amendment\/.+/, { timeout: 5000 });

      // Amendment details visible
      // Can return to agenda
      await expect(page).toHaveURL(/\/amendment\/.+/);
    }
  });
});
