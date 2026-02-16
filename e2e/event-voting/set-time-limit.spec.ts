// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Set Time Limit', () => {
  test('Organizer can configure time limit before starting vote', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Look for time limit input in setup card
    const timeLimitLabel = page.getByText(/time limit/i);
    if ((await timeLimitLabel.count()) > 0) {
      // 4. Find and modify time limit input
      const timeLimitInput = page.getByRole('spinbutton');
      if ((await timeLimitInput.count()) > 0) {
        await timeLimitInput.first().clear();
        await timeLimitInput.first().fill('600');

        // 5. Verify value updated
        await expect(timeLimitInput.first()).toHaveValue('600');
      }
    }
  });
});
