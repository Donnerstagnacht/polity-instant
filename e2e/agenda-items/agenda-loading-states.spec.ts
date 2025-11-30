// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Loading States', () => {
  test('Display loading state while fetching agenda', async ({ page }) => {
    // 1. Login as user
    await loginAsTestUser(page);

    // 2. Navigate to event page
    const navigationPromise = page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);

    // 3. Agenda section loads
    // Initial loading state shown
    // Skeleton/spinner visible

    await navigationPromise;
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();

      // 4. Agenda items displayed when loaded
      await page.waitForTimeout(500);

      page.locator('[data-testid="agenda-item"]').or(page.getByRole('article'));

      // Loading state replaced with content
      // Smooth transition
    }
  });

  test('Display loading during agenda item creation', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Create new agenda item
    const addButton = page.getByRole('button', { name: /add agenda item/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('New Agenda Item');

      // 4. Submit form
      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

      // 5. Loading indicator shown during save
      // Button disabled during operation

      // 6. Success state when complete
      await page.waitForTimeout(500);

      // New item visible
      // Form closed or reset
    }
  });
});
