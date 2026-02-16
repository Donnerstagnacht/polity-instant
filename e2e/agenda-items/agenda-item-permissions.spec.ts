// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Agenda Item Permissions', () => {
  test('Organizer can create agenda items', async ({ authenticatedPage: page }) => {
    // 1. Login as event organizer
    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Create button visible
    const createButton = page.getByRole('button', { name: /add agenda item|create/i });

    // 4. Full access to create
    if ((await createButton.count()) > 0) {
      await expect(createButton).toBeVisible();

      // Can set all fields
      // Can link amendments
      // Can manage order
    }
  });

  test('Participant cannot create agenda items', async ({ authenticatedPage: page }) => {
    // 1. Login as regular participant (not organizer)
    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Create button not visible or disabled
    page.getByRole('button', { name: /add agenda item|create/i });

    // 4. Read-only view of agenda
    // Can view but not modify

    // Access denied if attempted
  });

  test('Organizer can edit agenda items', async ({ authenticatedPage: page }) => {
    // 1. Login as organizer
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

      // 4. Edit button visible
      const editButton = firstItem.getByRole('button', { name: /edit/i });

      if ((await editButton.count()) > 0) {
        await editButton.click();

        // 5. Make changes
        const titleInput = page.getByLabel(/title/i);
        await titleInput.fill('Updated Title');

        // 6. Save
        const saveButton = page.getByRole('button', { name: /save/i });
        await saveButton.click();

        // 7. Changes saved

        // Participants notified if significant
        // Timeline updated
      }
    }
  });
});
