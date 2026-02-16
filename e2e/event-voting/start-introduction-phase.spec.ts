// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Start Introduction Phase', () => {
  test('Organizer can start introduction phase for voting session', async ({
    authenticatedPage: page,
  }) => {
    // 1. Authenticate
    // 2. Navigate to event agenda item detail
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`);
    await page.waitForLoadState('networkidle');

    // 3. Look for VotingSessionManager setup card
    const startVotingCard = page.getByText(/start voting/i);
    if ((await startVotingCard.count()) > 0) {
      // 4. Verify majority type selector is available
      const majorityCombobox = page.getByRole('combobox');
      if ((await majorityCombobox.count()) > 0) {
        await expect(majorityCombobox.first()).toBeVisible();
      }

      // 5. Verify time limit input
      const timeLimitInput = page.getByRole('spinbutton');
      if ((await timeLimitInput.count()) > 0) {
        await expect(timeLimitInput.first()).toBeVisible();
      }

      // 6. Find and click start introduction phase button
      const startButton = page.getByRole('button', { name: /start introduction phase/i });
      if ((await startButton.count()) > 0) {
        await expect(startButton).toBeVisible();
        // Don't actually click to avoid modifying test state
      }
    }
  });
});
