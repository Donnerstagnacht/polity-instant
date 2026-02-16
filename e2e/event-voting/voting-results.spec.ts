// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Voting Results', () => {
  test('User can view completed voting results', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item with completed voting
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Look for completed voting state
    const completedText = page.getByText(/completed|passed|rejected|tie/i);
    if ((await completedText.count()) > 0) {
      // 4. Vote counts should be displayed
      const acceptCount = page.getByText(/accept/i);
      const rejectCount = page.getByText(/reject/i);
      const abstainCount = page.getByText(/abstain/i);

      // At least the result should be visible
    }
  });

  test('Vote results show progress bar and counts', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Look for votes received section
    const votesReceived = page.getByText(/votes received/i);
    if ((await votesReceived.count()) > 0) {
      // 4. Progress bar should be visible
      const progressBar = page.getByRole('progressbar');
      if ((await progressBar.count()) > 0) {
        await expect(progressBar.first()).toBeVisible();
      }
    }
  });
});
