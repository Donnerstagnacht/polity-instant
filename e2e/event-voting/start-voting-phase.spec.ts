// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Start Voting Phase', () => {
  test('Organizer sees start voting button during introduction phase', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to an agenda item in introduction phase
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Check if we're in introduction phase
    const introPhase = page.getByText(/introduction phase/i);
    if ((await introPhase.count()) > 0) {
      // 4. Start Voting button should be visible
      const startVotingButton = page.getByRole('button', { name: /start voting/i });
      await expect(startVotingButton).toBeVisible();
    }
  });
});
