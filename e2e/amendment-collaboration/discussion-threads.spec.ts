// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Collaborators can discuss suggestions', async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/text`);

    // 1. User makes suggestion
    const editor = page.locator('[contenteditable="true"]').first();
    await expect(editor).toBeVisible();
    await editor.click();
    await editor.type('Suggestion to discuss');

    // 2. Other collaborator adds comment to suggestion
    const suggestion = page.locator('.suggestion, [data-suggestion]').first();
    await expect(suggestion).toBeVisible();
    await suggestion.click();

    const commentButton = page.getByRole('button', { name: /comment|discuss/i });
    await commentButton.click();

    // 3. Discussion thread appears
    const discussionThread = page.locator('.discussion-thread, [data-discussion]');
    await expect(discussionThread).toBeVisible();

    const commentInput = discussionThread.getByRole('textbox');
    await commentInput.fill('This is a comment on the suggestion');

    const submitButton = discussionThread.getByRole('button', { name: /submit|post/i });
    await submitButton.click();

    // 4. Multiple collaborators can participate
    // 5. Avatars and names are shown
    await expect(discussionThread.getByText(/this is a comment/i)).toBeVisible();
    await expect(discussionThread.locator('.avatar, [data-avatar]')).toBeVisible();
  });
});
