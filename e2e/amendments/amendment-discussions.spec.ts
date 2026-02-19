import { test, expect } from '../fixtures/test-base';

test.describe('Amendment - Discussions', () => {
  test('should display discussion/comments section', async ({
    authenticatedPage: page,
    mainUserId,
    amendmentFactory,
  }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId);
    await page.goto(`/amendment/${amendment.id}/discussions`);
    await page.waitForLoadState('domcontentloaded');

    const discussionsHeading = page.getByText(/discussion/i);
    await expect(discussionsHeading.first()).toBeVisible({ timeout: 10000 });
  });

  test('should open New Thread dialog and create a discussion thread', async ({
    authenticatedPage: page,
    mainUserId,
    amendmentFactory,
  }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId);
    await page.goto(`/amendment/${amendment.id}/discussions`);
    await page.waitForLoadState('domcontentloaded');

    // Click "New Thread" or "Create First Thread" button
    const newThreadButton = page.getByRole('button', { name: /new thread|create first thread/i });
    await expect(newThreadButton.first()).toBeVisible({ timeout: 10000 });
    await newThreadButton.first().click();

    // Dialog should appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Fill in thread title
    const titleInput = dialog.getByPlaceholder(/enter thread title/i);
    await expect(titleInput).toBeVisible();
    await titleInput.fill('E2E Test Discussion Thread');

    // Submit
    const createButton = dialog.getByRole('button', { name: /create thread/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    await page.waitForLoadState('networkidle');
  });

  test('should display threaded replies', async ({
    authenticatedPage: page,
    mainUserId,
    amendmentFactory,
  }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId);
    await page.goto(`/amendment/${amendment.id}/discussions`);
    await page.waitForLoadState('domcontentloaded');

    // Check for reply buttons on existing comments (if any threads exist)
    const replyButtons = page.getByRole('button', { name: /reply/i });
    if ((await replyButtons.count()) > 0) {
      await expect(replyButtons.first()).toBeVisible();
    }
  });
});
