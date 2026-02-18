// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendments - Edit Amendment Metadata', () => {
  test('Author edits amendment title and subtitle', async ({
    authenticatedPage: page,
    amendmentFactory,
    mainUserId,
  }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Edit Title Test ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}/edit`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Verify edit form is visible
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await expect(titleInput.first()).toBeVisible({ timeout: 10000 });

    // 4. Update title
    await titleInput.first().clear();
    await titleInput.first().fill('Updated Amendment Title');

    // 5. Update subtitle
    const subtitleInput = page.getByLabel(/subtitle/i).or(page.getByPlaceholder(/subtitle/i));
    if ((await subtitleInput.count()) > 0) {
      await subtitleInput.first().clear();
      await subtitleInput.first().fill('Updated subtitle text');
    }

    // 6. Save changes
    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // 7. Verify changes persisted
    await expect(page.getByText('Updated Amendment Title')).toBeVisible({ timeout: 5000 });
  });

  test('Author edits amendment status', async ({
    authenticatedPage: page,
    amendmentFactory,
    mainUserId,
  }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Status Edit Test ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}/edit`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Find and change status select
    const statusSelect = page.getByLabel(/status/i).or(page.locator('#status'));
    if ((await statusSelect.count()) > 0) {
      await statusSelect.first().click();
      const option = page.getByRole('option', { name: /drafting|under review/i });
      if ((await option.count()) > 0) {
        await option.first().click();
      }
    }

    // 4. Save changes
    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();
  });

  test('Author adds hashtags to amendment', async ({
    authenticatedPage: page,
    amendmentFactory,
    mainUserId,
  }) => {
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Hashtag Test ${Date.now()}`,
    });

    await page.goto(`/amendment/${amendment.id}/edit`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Find tag input
    const tagInput = page.getByPlaceholder(/tag/i).or(page.getByPlaceholder(/hashtag/i));
    if ((await tagInput.count()) > 0) {
      await tagInput.first().fill('climate');
      const addButton = page.getByRole('button', { name: /add/i });
      await addButton.click();

      // 4. Verify tag appears
      await expect(page.getByText('climate')).toBeVisible();
    }
  });
});
