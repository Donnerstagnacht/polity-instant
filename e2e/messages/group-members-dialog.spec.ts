import { test, expect } from '../fixtures/test-base';

test.describe('Messages - Group Members Dialog', () => {
  test('should open group members dialog from conversation header', async ({
    authenticatedPage: page,
    conversationFactory,
    userFactory,
    groupFactory,
    mainUserId,
  }) => {
    // Create a group conversation with multiple members
    const otherUser = await userFactory.createUser({ name: 'E2E Group Member User' });
    const group = await groupFactory.createGroup(mainUserId, { name: 'E2E Group Conv Test' });
    await groupFactory.addMember(group.id, otherUser.id, group.memberRoleId);
    const groupConv = await groupFactory.createGroupConversation(
      group.id,
      'E2E Group Conv Test',
      [mainUserId, otherUser.id],
      mainUserId
    );

    await page.goto('/messages');
    await page.waitForLoadState('networkidle');

    // Click the group conversation
    const convItem = page.getByText('E2E Group Conv Test').first();
    await expect(convItem).toBeVisible({ timeout: 10000 });
    await convItem.click();
    await page.waitForLoadState('networkidle');

    // Look for a member count button in the conversation header
    const memberCount = page.getByText(/\d+ member/i);
    await expect(memberCount).toBeVisible({ timeout: 10000 });
    await memberCount.click();

    // Group members dialog should open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });
});
