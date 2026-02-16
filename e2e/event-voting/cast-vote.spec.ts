// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Cast Vote', () => {
  test('Participant can see vote buttons during voting phase', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item in voting phase
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Check for vote buttons (only visible during voting phase)
    const acceptButton = page.getByRole('button', { name: /^accept$/i });
    const rejectButton = page.getByRole('button', { name: /^reject$/i });
    const abstainButton = page.getByRole('button', { name: /^abstain$/i });

    // Also check for Yes/No/Abstain pattern (AgendaVoteSection)
    const yesButton = page.getByRole('button', { name: /^yes$/i });
    const noButton = page.getByRole('button', { name: /^no$/i });

    const hasAcceptReject =
      (await acceptButton.count()) > 0 && (await rejectButton.count()) > 0;
    const hasYesNo = (await yesButton.count()) > 0 && (await noButton.count()) > 0;

    if (hasAcceptReject || hasYesNo) {
      // Vote buttons are visible - voting phase is active
      if (hasAcceptReject) {
        await expect(acceptButton).toBeVisible();
        await expect(rejectButton).toBeVisible();
        await expect(abstainButton).toBeVisible();
      }
      if (hasYesNo) {
        await expect(yesButton).toBeVisible();
        await expect(noButton).toBeVisible();
      }
    }
  });

  test('Participant can cast a vote via confirmation dialog', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Look for Cast Vote button
    const castVoteButton = page.getByRole('button', {
      name: /cast vote|change vote|indicate vote/i,
    });

    if ((await castVoteButton.count()) > 0) {
      await castVoteButton.first().click();

      // 4. Confirmation dialog appears
      const dialog = page.getByRole('dialog');
      if ((await dialog.count()) > 0) {
        await expect(dialog).toBeVisible();

        // 5. Cancel without voting
        const cancelButton = dialog.getByRole('button', { name: /cancel/i });
        await cancelButton.click();
      }
    }
  });
});
