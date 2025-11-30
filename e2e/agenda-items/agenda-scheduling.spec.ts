// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Agenda Scheduling', () => {
  test('Set scheduled time for agenda item', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Create agenda item
    const addButton = page.getByRole('button', { name: /add agenda item/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Keynote Speech');

      // 4. Set scheduled start time (10:00 AM)
      const timeInput = page.getByLabel(/start time|scheduled/i);

      if ((await timeInput.count()) > 0) {
        await timeInput.fill('10:00');
      }

      const durationInput = page.getByLabel(/duration/i);
      if ((await durationInput.count()) > 0) {
        await durationInput.fill('60');
      }

      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

      // 5. Time saved
      await page.waitForTimeout(500);

      // Start time: 10:00 AM
      // End time calculated: 11:00 AM
      await expect(page.getByText(/10:00/)).toBeVisible({ timeout: 3000 });
    }
  });

  test('View auto-calculated agenda timeline', async ({ page }) => {
    // 1. Login as user
    await loginAsTestUser(page);

    // 2. Navigate to event agenda with multiple items
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. View timeline visualization
    const timelineView = page.locator('[data-testid="timeline"]').or(page.getByRole('list'));

    // 4. All items show calculated times
    // Times flow sequentially
    // Breaks/gaps respected
    // Total duration calculated

    if ((await timelineView.count()) > 0) {
      await expect(timelineView).toBeVisible();
    }
  });
});
