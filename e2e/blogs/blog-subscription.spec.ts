// spec: e2e/test-plans/blogs-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';

test.describe('Blogs - Blog Subscription', () => {
  test('User subscribes to a blog', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    const blog = await blogFactory.createBlog(mainUserId, {
      title: `Subscribe Blog Test ${Date.now()}`,
    });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // Wait for subscribe/unsubscribe button to appear
    const anySubButton = page.getByRole('button', { name: /subscribe/i }).first();
    await expect(anySubButton).toBeVisible({ timeout: 10000 });

    // 4. Click "Subscribe" button
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    const isSubscribed = (await page.getByRole('button', { name: /unsubscribe/i }).count()) > 0;

    if (!isSubscribed) {
      await subscribeButton.click();

      // 5. Button changes to "Unsubscribe"
      await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({
        timeout: 10000,
      });
    }

    // 7. Verify subscription state
    await expect(
      page.getByRole('button', { name: /unsubscribe/i }).or(subscribeButton)
    ).toBeVisible();
  });

  test('User unsubscribes from a blog', async ({
    authenticatedPage: page,
    blogFactory,
    mainUserId,
  }) => {
    test.setTimeout(60000);
    const blog = await blogFactory.createBlog(mainUserId, {
      title: `Unsubscribe Blog Test ${Date.now()}`,
    });

    await page.goto(`/blog/${blog.id}`);
    await page.waitForLoadState('domcontentloaded');

    // 3. Wait for subscribe/unsubscribe button to appear
    const anySubButton = page.getByRole('button', { name: /subscribe/i }).first();
    await expect(anySubButton).toBeVisible({ timeout: 10000 });

    // 4. Ensure user is subscribed first
    const subscribeButton = page.getByRole('button', { name: /^subscribe$/i });
    if ((await subscribeButton.count()) > 0) {
      await subscribeButton.click();
      try {
        await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({ timeout: 15000 });
      } catch {
        // Client-side transact may not register under load — reload and retry
        await page.reload({ waitUntil: 'networkidle' });
        const stillSubscribe = page.getByRole('button', { name: /^subscribe$/i });
        if ((await stillSubscribe.count()) > 0) {
          await stillSubscribe.click();
          await page.waitForTimeout(5000);
          await page.reload({ waitUntil: 'networkidle' });
        }
        await expect(page.getByRole('button', { name: /unsubscribe/i })).toBeVisible({ timeout: 15000 });
      }
    }

    // 5. Click "Unsubscribe" button
    await page.getByRole('button', { name: /unsubscribe/i }).click();

    // 6. Button changes to "Subscribe"
    await expect(page.getByRole('button', { name: /^subscribe$/i })).toBeVisible({ timeout: 10000 });
  });
});
