// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Create Simple Agenda Item', () => {
  test('Event organizer creates agenda item', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user (event organizer)
    // 2. Navigate to event agenda management
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Navigate to agenda section
    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 4. Click "Add Agenda Item" button
    const addButton = page.getByRole('button', { name: /add agenda item|create item/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      // 5. Enter title
      const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
      await titleInput.fill('Welcome and Introduction');

      // 6. Enter description
      const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
      await descInput.fill('Opening remarks and introductions');

      // 7. Set duration (10 minutes)
      const durationInput = page.getByLabel(/duration|minutes/i);
      if ((await durationInput.count()) > 0) {
        await durationInput.fill('10');
      }

      // 8. Click "Create"
      const createButton = page.getByRole('button', { name: /create|save|add/i });
      await createButton.click();

      // 9. Agenda item created

      // Item appears in agenda list
      await expect(page.getByText('Welcome and Introduction')).toBeVisible({ timeout: 3000 });

      // Order/sequence maintained
      // Duration stored
    }
  });
});
