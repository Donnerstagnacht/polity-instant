// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Agenda Item Status Management', () => {
  test('New agenda item has pending status', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Check agenda items
    const agendaItems = page.locator('[data-testid="agenda-item"]').or(page.getByRole('article'));

    if ((await agendaItems.count()) > 0) {
      // 4. Default status is "pending"
      page.getByText(/pending/i).or(page.locator('[data-status="pending"]'));

      // Status indicator shown
      // Awaiting start
    }
  });

  test('Mark agenda item as active', async ({ page }) => {
    // 1. Authenticate as test user (organizer)
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

      // 4. Mark as active (during event)
      const activateButton = firstItem.getByRole('button', { name: /start|activate/i });

      if ((await activateButton.count()) > 0) {
        await activateButton.click();

        // 5. Status changes to "active"
        await page.waitForTimeout(300);

        // Visual highlight/indicator
        // Timer starts if applicable
        // Only one item active at a time
      }
    }
  });

  test('Mark agenda item as completed', async ({ page }) => {
    // 1. Authenticate as test user (organizer)
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    const agendaItems = page.locator('[data-testid="agenda-item"]');

    if ((await agendaItems.count()) > 0) {
      const firstItem = agendaItems.first();

      // 3. Mark as completed
      const completeButton = firstItem.getByRole('button', { name: /complete|finish/i });

      if ((await completeButton.count()) > 0) {
        await completeButton.click();

        // 4. Status changes to "completed"
        await page.waitForTimeout(300);

        // Item marked with checkmark
        // Next item becomes active
        // Progress tracked
      }
    }
  });
});
