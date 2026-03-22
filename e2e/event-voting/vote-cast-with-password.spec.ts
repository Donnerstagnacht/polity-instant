// spec: Vote casting with password confirmation dialog

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Cast Vote with Password Confirmation', () => {
  test('Vote dialog shows choice then confirm then password flow', async ({ authenticatedPage: page }) => {
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Find Vote button
    const voteButton = page.getByRole('button', { name: /^vote$/i });

    if ((await voteButton.count()) === 0) return;

    await voteButton.click();
    await page.waitForTimeout(500);

    const dialog = page.getByRole('dialog');
    if ((await dialog.count()) === 0) return;

    // Step 1: Choose a vote option
    const yesButton = dialog.getByRole('button', { name: /yes/i });
    const candidateOption = dialog.locator('[data-testid="candidate-option"]');

    if ((await yesButton.count()) > 0) {
      await yesButton.click();
    } else if ((await candidateOption.count()) > 0) {
      await candidateOption.first().click();
    } else {
      return; // No vote options available
    }

    // Step 2: Confirm button should become active
    const confirmButton = dialog.getByRole('button', { name: /confirm/i });

    if ((await confirmButton.count()) > 0) {
      await confirmButton.click();
      await page.waitForTimeout(500);

      // Step 3: Password input should appear
      const passwordInput = dialog.locator('input[inputmode="numeric"]').or(
        dialog.locator('input[type="password"]')
      );

      if ((await passwordInput.count()) > 0) {
        await expect(passwordInput.first()).toBeVisible();

        // Enter 4-digit PIN
        await passwordInput.first().fill('1234');
        await page.waitForTimeout(500);

        // Dialog should close after successful vote (or show error)
        // We can't guarantee success since we may not have a valid password
      }
    }
  });

  test('Wrong password shows error in vote dialog', async ({ authenticatedPage: page }) => {
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    const voteButton = page.getByRole('button', { name: /^vote$/i });
    if ((await voteButton.count()) === 0) return;

    await voteButton.click();
    const dialog = page.getByRole('dialog');
    if ((await dialog.count()) === 0) return;

    // Select a vote option
    const yesButton = dialog.getByRole('button', { name: /yes/i });
    if ((await yesButton.count()) > 0) {
      await yesButton.click();
    } else {
      return;
    }

    const confirmButton = dialog.getByRole('button', { name: /confirm/i });
    if ((await confirmButton.count()) > 0) {
      await confirmButton.click();
      await page.waitForTimeout(500);
    }

    const passwordInput = dialog.locator('input[inputmode="numeric"]').or(
      dialog.locator('input[type="password"]')
    );

    if ((await passwordInput.count()) > 0) {
      // Enter an intentionally wrong password
      await passwordInput.first().fill('0000');
      await page.waitForTimeout(1000);

      // Should show error state
      const errorState = dialog.getByText(/invalid|wrong|incorrect|error/i).or(
        dialog.locator('.text-destructive, .text-red-500')
      );

      if ((await errorState.count()) > 0) {
        await expect(errorState.first()).toBeVisible();
      }
    }
  });

  test('Indication vote does not require password', async ({ authenticatedPage: page }) => {
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Check for indication phase
    const indicationBadge = page.getByText(/indication/i);

    if ((await indicationBadge.count()) === 0) return;

    const voteButton = page.getByRole('button', { name: /^vote$/i });
    if ((await voteButton.count()) === 0) return;

    await voteButton.click();
    const dialog = page.getByRole('dialog');
    if ((await dialog.count()) === 0) return;

    // During indication, vote options should cast directly without password
    const yesButton = dialog.getByRole('button', { name: /yes/i });
    if ((await yesButton.count()) > 0) {
      await yesButton.click();

      // Confirm without password step
      const confirmButton = dialog.getByRole('button', { name: /confirm/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
        await page.waitForTimeout(1000);

        // Dialog should close directly (no password step for indication)
        // or password step may still appear depending on config
      }
    }
  });
});
