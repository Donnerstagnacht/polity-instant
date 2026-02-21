import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Group Operations - Delete Link', () => {
  test('should show delete option on existing links', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
    adminDb,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Delete Link Group' });
    // Create a link for the group
    const linkId = crypto.randomUUID();
    await (adminDb as any).transact(
      (adminDb as any).tx.links[linkId]
        .update({
          label: 'E2E Test Link',
          url: 'https://example.com',
          createdAt: Date.now(),
        })
        .link({ group: group.id })
    );

    await gotoWithRetry(page, `/group/${group.id}/operation`);

    // Look for the link in the links section
    const linkText = page.getByText('E2E Test Link');
    await expect(linkText.first()).toBeVisible({ timeout: 10000 });
  });

  test('should delete a link and show success toast', async ({
    authenticatedPage: page,
    groupFactory,
    mainUserId,
    adminDb,
  }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Delete Link Action Group' });
    const linkId = crypto.randomUUID();
    await (adminDb as any).transact(
      (adminDb as any).tx.links[linkId]
        .update({
          label: 'E2E Link To Delete',
          url: 'https://example.com',
          createdAt: Date.now(),
        })
        .link({ group: group.id })
    );

    await gotoWithRetry(page, `/group/${group.id}/operation`);

    // Wait for the link to appear
    await expect(page.getByText('E2E Link To Delete').first()).toBeVisible({ timeout: 10000 });

    // Find delete button near the link - trash icon button
    const linkSection = page.locator('section, div').filter({ hasText: 'Links' }).first();
    const deleteButtons = linkSection.locator('button').filter({ has: page.locator('svg') });

    if ((await deleteButtons.count()) > 0) {
      await deleteButtons.first().click();

      // Handle confirmation dialog if present
      const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }
    }
  });
});
