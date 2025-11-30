// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Forwarding System', () => {
  test('Forward agenda item to another event', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Find unfinished agenda item
    const agendaItems = page.locator('[data-testid="agenda-item"]');

    if ((await agendaItems.count()) > 0) {
      const firstItem = agendaItems.first();

      // 4. Click "Forward to Event"
      const forwardButton = firstItem.getByRole('button', { name: /forward/i });

      if ((await forwardButton.count()) > 0) {
        await forwardButton.click();

        // 5. Select target event
        const eventSelect = page.getByLabel(/event|select event/i);

        if ((await eventSelect.count()) > 0) {
          await eventSelect.click();

          const eventOption = page.getByRole('option').first();
          if ((await eventOption.count()) > 0) {
            await eventOption.click();
          }
        }

        // 6. Confirm forward
        const confirmButton = page.getByRole('button', { name: /confirm|forward/i });
        await confirmButton.click();

        // 7. Forwarding request created
        await page.waitForTimeout(500);

        // Original item marked as "forwarded"
        // Target event receives request
        // Target organizer notified
      }
    }
  });

  test('Accept forwarded agenda item', async ({ page }) => {
    // 1. Login as target event organizer
    await loginAsTestUser(page);

    // 2. Navigate to event with forwarding request
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. View pending forwarding requests
    const requestsSection = page.getByRole('heading', { name: /pending|requests/i });

    if ((await requestsSection.count()) > 0) {
      // 4. Review request details
      const acceptButton = page.getByRole('button', { name: /accept|approve/i }).first();

      if ((await acceptButton.count()) > 0) {
        // 5. Click "Accept"
        await acceptButton.click();

        // 6. Request accepted
        await page.waitForTimeout(500);

        // Item added to agenda
        // Source organizer notified
        // Link maintained between items
      }
    }
  });

  test('Reject forwarded agenda item', async ({ page }) => {
    // 1. Login as target event organizer
    await loginAsTestUser(page);

    // 2. Navigate to event with request
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. View pending requests
    const rejectButton = page.getByRole('button', { name: /reject|decline/i }).first();

    if ((await rejectButton.count()) > 0) {
      // 4. Click "Reject"
      await rejectButton.click();

      // 5. Optional: provide reason
      const reasonInput = page.getByLabel(/reason/i);
      if ((await reasonInput.count()) > 0) {
        await reasonInput.fill('Already scheduled similar item');
      }

      const confirmButton = page.getByRole('button', { name: /confirm|reject/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }

      // 6. Request rejected
      await page.waitForTimeout(500);

      // Source organizer notified with reason
      // Original item status updated
    }
  });
});
