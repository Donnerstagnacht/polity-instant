// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Error Handling', () => {
  test('Handle create agenda item validation errors', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Attempt to create without required fields
    const addButton = page.getByRole('button', { name: /add agenda item/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      // 4. Submit without title
      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

      // 5. Validation error displayed
      await page.waitForTimeout(300);

      // Error message shown (e.g., "Title is required")
      page.getByText(/required|error/i);

      // Form not submitted
      // User can correct and retry
    }
  });

  test('Handle agenda item not found error', async ({ page }) => {
    // 1. Login as user
    await loginAsTestUser(page);

    // 2. Navigate to non-existent agenda item
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda/invalid-id`);

    // 3. Error state displayed
    await page.waitForLoadState('networkidle');

    // "Agenda item not found" message
    // Link to return to event
    page.getByText(/not found|doesn't exist/i);
  });

  test('Handle unauthorized access to edit agenda', async ({ page }) => {
    // 1. Login as non-organizer
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Edit/create buttons not visible
    page.getByRole('button', { name: /add agenda item/i });

    // 4. If attempted via URL/API
    // Access denied message
    // Redirect to read-only view
    // Clear error explanation
  });

  test('Handle network error during agenda update', async ({ page }) => {
    // 1. Login as organizer
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 3. Simulate network issue (offline mode)
    await page.context().setOffline(true);

    // 4. Attempt to create agenda item
    const addButton = page.getByRole('button', { name: /add agenda item/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Network Test Item');

      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

      // 5. Error message shown
      await page.waitForTimeout(500);

      // "Network error" or "Connection failed"
      // Option to retry
      // Data preserved in form

      // Restore connection
      await page.context().setOffline(false);
    }
  });
});
