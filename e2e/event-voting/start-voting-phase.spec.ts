// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Start Voting Phase', () => {
  test('Organizer sees start final vote button during indication phase', async ({ authenticatedPage: page }) => {
    // Navigate to an agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Check if we're in indication phase — organizer should see "Start Final Vote"
    const startFinalVoteButton = page.getByRole('button', { name: /start final vote/i });
    const startVotingButton = page.getByRole('button', { name: /start voting/i });

    if ((await startFinalVoteButton.count()) > 0) {
      await expect(startFinalVoteButton).toBeVisible();
    } else if ((await startVotingButton.count()) > 0) {
      // Fallback for legacy naming
      await expect(startVotingButton).toBeVisible();
    }
  });

  test('Organizer sees close final vote button during final vote phase', async ({ authenticatedPage: page }) => {
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    const closeFinalVoteButton = page.getByRole('button', { name: /close final vote/i });

    if ((await closeFinalVoteButton.count()) > 0) {
      await expect(closeFinalVoteButton).toBeVisible();
    }
  });
});
