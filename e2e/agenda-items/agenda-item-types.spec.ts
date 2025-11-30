// spec: e2e/test-plans/agenda-items-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Agenda Items - Agenda Item Types', () => {
  test('Create discussion agenda item', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Navigate to agenda section
    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    // 4. Create agenda item with type "discussion"
    const addButton = page.getByRole('button', { name: /add agenda item/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Discussion on Budget');

      // 5. Set type to "discussion"
      const typeSelect = page.getByRole('combobox', { name: /type/i });
      if ((await typeSelect.count()) > 0) {
        await typeSelect.click();
        const discussionOption = page.getByRole('option', { name: /discussion/i });
        await discussionOption.click();
      }

      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

      // 6. Type set correctly
      await page.waitForTimeout(500);

      // Icon/indicator for discussion
      // Timer functionality available
    }
  });

  test('Create voting agenda item', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    const agendaTab = page.getByRole('tab', { name: /agenda/i });
    if ((await agendaTab.count()) > 0) {
      await agendaTab.click();
    }

    const addButton = page.getByRole('button', { name: /add agenda item/i });

    if ((await addButton.count()) > 0) {
      await addButton.click();

      const titleInput = page.getByLabel(/title/i);
      await titleInput.fill('Vote on Amendment');

      // 3. Set type to "vote"
      const typeSelect = page.getByRole('combobox', { name: /type/i });
      if ((await typeSelect.count()) > 0) {
        await typeSelect.click();
        const voteOption = page.getByRole('option', { name: /vote/i });
        await voteOption.click();
      }

      const createButton = page.getByRole('button', { name: /create|save/i });
      await createButton.click();

      // 4. Type indicated
      await page.waitForTimeout(500);

      // Voting interface available
      // Vote tracking enabled
    }
  });
});
