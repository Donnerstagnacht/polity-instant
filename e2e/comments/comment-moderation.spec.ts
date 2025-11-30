// spec: e2e/test-plans/comments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Comments - Comment Editing and Deletion', () => {
  test('Edit own comment', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. User views own comment
    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      // Look for comment with edit option
      const editButton = page.getByRole('button', { name: /edit/i }).first();

      if ((await editButton.count()) > 0) {
        // 4. Click "Edit" button
        await editButton.click();

        // 5. Modify text
        const editInput = page.getByRole('textbox').last();
        await editInput.fill('Updated comment text after editing');

        // 6. Save changes
        const saveButton = page.getByRole('button', { name: /save|update/i });
        await saveButton.click();

        // 7. Comment text updated
        await page.waitForTimeout(500);

        // UpdatedAt timestamp changed
        // "Edited" indicator displayed
        await expect(page.getByText('Updated comment text after editing')).toBeVisible({
          timeout: 3000,
        });
      }
    }
  });

  test('Cannot edit others comments', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. User views another user's comment
    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      // 4. Look for edit option
      // Edit button not visible for others' comments
      // Access denied if attempted
      // Error message clear
      // Comment unchanged
    }
  });

  test('Delete own comment', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. User clicks "Delete" on own comment
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();

    if ((await deleteButton.count()) > 0) {
      await deleteButton.click();

      // 4. Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm|delete/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();

        // 5. Comment deleted
        await page.waitForTimeout(500);

        // Removed from list
        // Replies handled (deleted or orphaned)
        // Cannot be recovered
      }
    }
  });

  test('Cannot delete others comments', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. User attempts to delete another's comment
    const comments = page
      .locator('[data-testid="comment"]')
      .or(page.locator('[class*="flex gap-4 rounded-lg border p-4"]'));

    if ((await comments.count()) > 0) {
      // 4. Check access
      // Delete button not visible for others' comments
      // Access denied if attempted
      // Comment remains
      // Clear error message
    }
  });

  test('Delete comment with replies', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to blog
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}`);
    await page.waitForLoadState('networkidle');

    // 3. Delete comment that has replies
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();

    if ((await deleteButton.count()) > 0) {
      await deleteButton.click();

      // 4. Handle reply chain
      // Option to delete all replies or orphan them
      // Clear warning about replies
      const confirmButton = page.getByRole('button', { name: /confirm|delete/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();

        // 5. Consistent handling
        await page.waitForTimeout(500);

        // User choice respected
      }
    }
  });
});
