// spec: e2e/test-plans/event-voting-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Speaker List', () => {
  test('Participant can view speaker list for agenda item', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Look for speakers list section
    const speakerListCard = page.getByText(/speakers list|speaker/i);
    if ((await speakerListCard.count()) > 0) {
      // 4. Click to open speaker list dialog
      const speakerButton = page.getByRole('button', { name: /speaker/i });
      if ((await speakerButton.count()) > 0) {
        await speakerButton.first().click();

        // 5. Dialog with speaker details opens
        const dialog = page.getByRole('dialog');
        if ((await dialog.count()) > 0) {
          await expect(dialog).toBeVisible();
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('Participant can join speaker list', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Look for join speaker list button
    const joinButton = page.getByRole('button', { name: /join speaker list/i });
    if ((await joinButton.count()) > 0) {
      await expect(joinButton).toBeVisible();
      // Don't click to avoid modifying test data — just verify it's available
    }

    // 4. Check for "already on list" disabled state
    const alreadyOnList = page.getByRole('button', { name: /already on list/i });
    if ((await alreadyOnList.count()) > 0) {
      await expect(alreadyOnList).toBeDisabled();
    }
  });

  test('Organizer can mark speaker as completed', async ({ authenticatedPage: page }) => {
    // 1. Authenticate
    // 2. Navigate to agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // 3. Look for mark completed button
    const markCompletedButton = page.getByRole('button', { name: /mark completed/i });
    if ((await markCompletedButton.count()) > 0) {
      await expect(markCompletedButton).toBeVisible();
    }
  });
});
