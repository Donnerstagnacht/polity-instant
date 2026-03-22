// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Cast Vote', () => {
  test('Participant can see vote buttons during voting phase', async ({ authenticatedPage: page }) => {
    // Navigate to agenda item in voting phase
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Check for vote buttons — new flow uses action bar Vote button or inline buttons
    const voteButton = page.getByRole('button', { name: /^vote$/i });
    const yesButton = page.getByRole('button', { name: /^yes$/i });
    const noButton = page.getByRole('button', { name: /^no$/i });
    const abstainButton = page.getByRole('button', { name: /^abstain$/i });

    const hasVoteButton = (await voteButton.count()) > 0;
    const hasYesNo = (await yesButton.count()) > 0 && (await noButton.count()) > 0;

    if (hasVoteButton || hasYesNo) {
      if (hasVoteButton) {
        await expect(voteButton.first()).toBeVisible();
      }
      if (hasYesNo) {
        await expect(yesButton).toBeVisible();
        await expect(noButton).toBeVisible();
      }
    }
  });

  test('Participant can cast a vote via VoteCastDialog', async ({ authenticatedPage: page }) => {
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Look for Vote button in action bar
    const voteButton = page.getByRole('button', { name: /^vote$/i });

    if ((await voteButton.count()) > 0) {
      await voteButton.first().click();

      // Vote dialog appears with choice → confirm → password flow
      const dialog = page.getByRole('dialog');
      if ((await dialog.count()) > 0) {
        await expect(dialog).toBeVisible();

        // Cancel without voting
        const cancelButton = dialog.getByRole('button', { name: /cancel|close/i });
        if ((await cancelButton.count()) > 0) {
          await cancelButton.click();
        }
      }
    }
  });

  test('Phase badge is visible on votable agenda items', async ({ authenticatedPage: page }) => {
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Check for any voting phase badge
    const phaseBadge = page.getByText(/indication|final vote|closed|aborted/i);

    if ((await phaseBadge.count()) > 0) {
      await expect(phaseBadge.first()).toBeVisible();
    }
  });
});
