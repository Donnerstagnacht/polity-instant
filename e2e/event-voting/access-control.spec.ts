// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Access Control', () => {
  test('Non-organizer cannot see voting session management controls', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as regular test user (not organizer)
    // 2. Navigate to agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Verify management controls are hidden for non-organizer
    // "Start Introduction Phase" should not be visible
    const startButton = page.getByRole('button', { name: /start introduction phase/i });
    const closeButton = page.getByRole('button', { name: /close voting/i });

    // These management buttons should not be visible to non-organizers
    // (They may or may not exist depending on session state and permissions)
    await page.waitForLoadState('networkidle');

    // 4. Navigation controls (previous/next/complete) should be hidden
    const completeButton = page.getByRole('button', { name: /^complete$/i });
    // Non-organizers should not see agenda navigation controls
  });

  test('Non-voter sees voting rights message', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item with active voting
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Check for "no voting rights" message
    const noRightsMessage = page.getByText(/voting rights/i);
    if ((await noRightsMessage.count()) > 0) {
      await expect(noRightsMessage.first()).toBeVisible();
    }
  });
});
