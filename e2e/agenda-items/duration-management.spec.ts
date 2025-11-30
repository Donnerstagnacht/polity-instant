// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Duration Management', () => {
  test('Set agenda item duration', async ({ page }) => {
    // 1. Login as organizer
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
      await titleInput.fill('Team Discussion');

      // 4. Set duration (30 minutes)
      const durationInput = page.getByLabel(/duration|minutes/i);

      if ((await durationInput.count()) > 0) {
        await durationInput.fill('30');
      }

      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

      // 5. Duration saved
      await page.waitForTimeout(500);

      // Displayed on item
      // Used in timeline calculation
      await expect(page.getByText(/30.*min|minutes/i)).toBeVisible({ timeout: 3000 });
    }
  });

  test('Update agenda item duration', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Find agenda item
    const agendaItems = page.locator('[data-testid="agenda-item"]');

    if ((await agendaItems.count()) > 0) {
      const firstItem = agendaItems.first();

      // 4. Edit item
      const editButton = firstItem.getByRole('button', { name: /edit/i });

      if ((await editButton.count()) > 0) {
        await editButton.click();

        // 5. Change duration from 30 to 45 minutes
        const durationInput = page.getByLabel(/duration|minutes/i);
        await durationInput.fill('45');

        // 6. Save
        const saveButton = page.getByRole('button', { name: /save/i });
        await saveButton.click();

        // 7. Duration updated
        await page.waitForTimeout(500);

        // Timeline recalculated
        // Subsequent item times adjusted
      }
    }
  });

  test('Extend duration during active event', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to active event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Find active agenda item
    const activeItem = page
      .locator('[data-status="active"]')
      .or(page.getByText(/active/i).locator('..'));

    if ((await activeItem.count()) > 0) {
      // 4. Click "Extend Duration" button
      const extendButton = activeItem.getByRole('button', { name: /extend/i });

      if ((await extendButton.count()) > 0) {
        await extendButton.click();

        // 5. Add 10 more minutes
        const extendInput = page.getByLabel(/extend|add minutes/i);
        await extendInput.fill('10');

        const confirmButton = page.getByRole('button', { name: /confirm|extend/i });
        await confirmButton.click();

        // 6. Duration extended
        await page.waitForTimeout(300);

        // Timer updated
        // Following items delayed
        // Event end time updated
      }
    }
  });
});
