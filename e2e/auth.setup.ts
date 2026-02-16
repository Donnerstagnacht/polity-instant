/**
 * Playwright Auth Setup Project
 *
 * Runs before all test projects to authenticate the main test user
 * and save the browser storage state to a file. Subsequent test projects
 * reuse this state, skipping the login flow on every test.
 *
 * See: https://playwright.dev/docs/auth
 */

import { test as setup, expect } from '@playwright/test';
import { login } from './helpers/auth';

const AUTH_FILE = './e2e/.auth/user.json';

setup('authenticate main test user', async ({ page }) => {
  await login(page, 'polity.live@gmail.com');

  // Verify we're logged in by checking we're on the homepage
  await expect(page).toHaveURL('/');

  // Save storage state (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });
});
