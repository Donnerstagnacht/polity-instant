// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Close Voting', () => {
  test('Organizer sees close voting button during active voting', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Check for active voting phase
    const votingActive = page.getByText(/voting active/i);
    if ((await votingActive.count()) > 0) {
      // 4. Close Voting button should be visible to organizer
      const closeButton = page.getByRole('button', { name: /close voting/i });
      await expect(closeButton).toBeVisible();
    }
  });
});
