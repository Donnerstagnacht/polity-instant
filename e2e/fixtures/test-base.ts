/**
 * E2E Test Base Fixture
 *
 * Extends Playwright's `test` with:
 * - `authenticatedPage` — a Page that's already logged in as the main test user
 * - Entity factories (auto-cleaned on teardown)
 * - `adminDb` — direct admin SDK access
 *
 * Usage:
 *   import { test, expect } from '../fixtures/test-base';
 *
 *   test('my test', async ({ authenticatedPage, todoFactory }) => {
 *     const todo = await todoFactory.createTodo(userId, { title: 'Test' });
 *     await authenticatedPage.goto('/todos');
 *     await expect(authenticatedPage.getByText('Test')).toBeVisible();
 *     // cleanup is automatic
 *   });
 */

import { test as base, type Page } from '@playwright/test';
import { type SupabaseClient } from '@supabase/supabase-js';
import { getAdminDb } from './admin-db';
import { UserFactory } from './entity-factories/user.factory';
import { GroupFactory } from './entity-factories/group.factory';
import { EventFactory } from './entity-factories/event.factory';
import { AmendmentFactory } from './entity-factories/amendment.factory';
import { BlogFactory } from './entity-factories/blog.factory';
import { TodoFactory } from './entity-factories/todo.factory';
import { ConversationFactory } from './entity-factories/conversation.factory';
import { NotificationFactory } from './entity-factories/notification.factory';
import { loginAsTestUser, login } from '../helpers/auth';

type TestFixtures = {
  adminDb: SupabaseClient;
  /** The Supabase user ID for the main test user (polity.live@gmail.com) */
  mainUserId: string;
  userFactory: UserFactory;
  groupFactory: GroupFactory;
  eventFactory: EventFactory;
  amendmentFactory: AmendmentFactory;
  blogFactory: BlogFactory;
  todoFactory: TodoFactory;
  conversationFactory: ConversationFactory;
  notificationFactory: NotificationFactory;
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  adminDb: async ({}, use) => {
    await use(getAdminDb());
  },

  mainUserId: async ({}, use) => {
    const db = getAdminDb();
    const { data } = await db.from('user').select('id').eq('email', 'polity.live@gmail.com').single();
    if (!data) throw new Error('Main test user not found in database');
    await use(data.id);
  },

  userFactory: async ({}, use) => {
    const factory = new UserFactory();
    await use(factory);
    await factory.cleanup();
  },

  groupFactory: async ({}, use) => {
    const factory = new GroupFactory();
    await use(factory);
    await factory.cleanup();
  },

  eventFactory: async ({}, use) => {
    const factory = new EventFactory();
    await use(factory);
    await factory.cleanup();
  },

  amendmentFactory: async ({}, use) => {
    const factory = new AmendmentFactory();
    await use(factory);
    await factory.cleanup();
  },

  blogFactory: async ({}, use) => {
    const factory = new BlogFactory();
    await use(factory);
    await factory.cleanup();
  },

  todoFactory: async ({}, use) => {
    const factory = new TodoFactory();
    await use(factory);
    await factory.cleanup();
  },

  conversationFactory: async ({}, use) => {
    const factory = new ConversationFactory();
    await use(factory);
    await factory.cleanup();
  },

  notificationFactory: async ({}, use) => {
    const factory = new NotificationFactory();
    await use(factory);
    await factory.cleanup();
  },

  authenticatedPage: async ({ page }, use) => {
    // Inject a fresh Supabase session to ensure reliable authentication.
    await loginAsTestUser(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';

/**
 * Helper: login as a factory-created user.
 * Use this when a test needs to act as a user created by userFactory.
 */
export async function loginAsFactoryUser(page: Page, email: string): Promise<void> {
  await login(page, email);
}
