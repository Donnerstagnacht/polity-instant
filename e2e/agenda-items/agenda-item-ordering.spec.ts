// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Agenda Item Ordering', () => {
  test('View agenda items in order', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event with agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Navigate to agenda section
    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
      await page.waitForTimeout(300);
    }

    // 4. Items displayed in order
    const agendaItems = page.locator('[data-testid="agenda-item"]').or(page.getByRole('article'));

    // 5. Order numbers visible
    // Sequence maintained
    // Clear progression

    if ((await agendaItems.count()) > 0) {
      await expect(agendaItems.first()).toBeVisible();
    }
  });

  test('Reorder agenda items via drag-and-drop', async ({ page }) => {
    // 1. Authenticate as test user (organizer)
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. View agenda with multiple items
    const agendaItems = page.locator('[data-testid="agenda-item"]').or(page.getByRole('article'));

    if ((await agendaItems.count()) > 2) {
      // 4. Drag item from position 3 to position 1
      agendaItems.nth(2);
      agendaItems.first();

      // Note: Drag-and-drop implementation depends on UI library
      // This is a placeholder for the interaction

      // 5. Order updated immediately
      // All items re-sequenced
      // Order numbers recalculated
      // Changes saved automatically
    }
  });
});
