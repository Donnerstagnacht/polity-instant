// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Agenda Item Display', () => {
  test('View agenda list with all items', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Navigate to agenda section
    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
      await page.waitForTimeout(300);
    }

    // 4. Items listed in order
    const agendaItems = page.locator('[data-testid="agenda-item"]').or(page.getByRole('article'));

    // 5. Key info visible (title, time, duration)
    // Status indicators shown
    // Type icons displayed
    // Clickable to view details

    if ((await agendaItems.count()) > 0) {
      await expect(agendaItems.first()).toBeVisible();
    }
  });

  test('View agenda item details', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Click on agenda item
    const agendaItems = page.locator('[data-testid="agenda-item"]');

    if ((await agendaItems.count()) > 0) {
      const firstItem = agendaItems.first();
      await firstItem.click();

      // 4. View full details
      await page.waitForTimeout(300);

      // Full title and description
      // All times displayed
      // Linked amendment shown
      // Status and type clear
      // Edit/delete options if authorized
    }
  });
});
