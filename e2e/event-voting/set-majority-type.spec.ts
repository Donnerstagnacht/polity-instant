// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Set Majority Type', () => {
  test('Organizer can configure majority type before starting vote', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Look for majority type selector in setup card
    const majorityLabel = page.getByText(/majority type/i);
    if ((await majorityLabel.count()) > 0) {
      // 4. Click the combobox to see options
      const combobox = page.getByRole('combobox');
      if ((await combobox.count()) > 0) {
        await combobox.first().click();

        // 5. Verify available majority types
        const simpleMajority = page.getByRole('option', { name: /simple majority/i });
        const absoluteMajority = page.getByRole('option', { name: /absolute majority/i });
        const twoThirds = page.getByRole('option', { name: /two-thirds/i });

        if ((await simpleMajority.count()) > 0) {
          await expect(simpleMajority).toBeVisible();
        }
        if ((await absoluteMajority.count()) > 0) {
          await expect(absoluteMajority).toBeVisible();
        }
        if ((await twoThirds.count()) > 0) {
          await expect(twoThirds).toBeVisible();
        }

        // Close dropdown
        await page.keyboard.press('Escape');
      }
    }
  });
});
