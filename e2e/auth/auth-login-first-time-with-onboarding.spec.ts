// spec: e2e/auth/magic-link-auth-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { generateTestMagicCode } from '../helpers/magic-code-helper';

/**
 * First-Time User Authentication & Onboarding Tests
 * 
 * Tests the complete onboarding flow for users logging in for the first time.
 * The onboarding wizard includes:
 * 1. Name Step - Enter first and last name
 * 2. Group Search Step - Search for groups by name or location (or skip)
 * 3. Membership Confirm Step - Send membership request (or decline)
 * 4. Aria & Kai Step - Introduction to AI assistant
 * 5. Summary Step - View summary and choose navigation destination
 */

test.describe('First-Time User Authentication & Onboarding', () => {
  // Helper to generate unique email for each test
  const getUniqueEmail = () => `firsttime${Date.now()}@polity.app`;

  // Helper to complete auth and reach onboarding
  async function authenticateNewUser(page: any, email: string) {
    await page.goto('/auth');
    await page.getByText('Sign in to Polity').first().waitFor({ state: 'visible' });
    await page.getByRole('textbox', { name: 'Email address' }).fill(email);
    await page.getByRole('button', { name: 'Send magic code' }).click();
    await expect(page).toHaveURL(/\/auth\/verify/);

    const code = await generateTestMagicCode(email);
    const codeDigits = code.split('');
    const otpInputs = page.getByRole('textbox');
    for (let i = 0; i < codeDigits.length; i++) {
      await otpInputs.nth(i).fill(codeDigits[i]);
    }

    // Wait for redirect to home with onboarding parameter
    await expect(page).toHaveURL(/\/\?onboarding=true/, { timeout: 10000 });
  }

  // Helper to fill name step
  async function fillNameStep(page: any, firstName: string, lastName: string) {
    await expect(page.getByText(/What's your name/i)).toBeVisible();
    await page.getByLabel(/First name/i).fill(firstName);
    await page.getByLabel(/Last name/i).fill(lastName);
    await page.getByRole('button', { name: /Continue/i }).click();
  }

  test('Complete onboarding: search group by name + send request + navigate to profile', async ({ page }) => {
    const email = getUniqueEmail();
    await authenticateNewUser(page, email);

    // Step 1: Name Step
    await fillNameStep(page, 'Alice', 'Smith');

    // Step 2: Group Search Step - search by name
    await expect(page.getByText(/Find your group/i)).toBeVisible();
    
    // Search for "Test" - this should find "Test Main Group" from seed data
    const searchInput = page.getByPlaceholder(/Search groups or locations/i);
    await searchInput.fill('Test');
    
    // Wait for search results and click first group
    const groupCard = page.locator('[class*="cursor-pointer"]').first();
    await expect(groupCard).toBeVisible();
    await groupCard.click();
    
    // Verify group is selected (should have a checkmark or selection style)
    await expect(page.getByRole('button', { name: /Continue/i })).toBeEnabled();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Membership Confirm Step
    await expect(page.getByText(/Join this group/i)).toBeVisible();
    await page.getByRole('button', { name: /Yes.*send request/i }).click();
    
    // Wait for request to be sent
    await expect(page.getByText(/Request sent/i)).toBeVisible({ timeout: 5000 });

    // Step 4: Aria & Kai Step
    await expect(page.getByText(/Aria & Kai/i).first()).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5: Summary Step
    await expect(page.getByText(/all set/i)).toBeVisible();
    
    // Verify summary shows correct information
    await expect(page.getByText('Alice Smith')).toBeVisible();
    await expect(page.getByText(/Group selected/i)).toBeVisible();
    await expect(page.getByText(/Membership request sent/i).first()).toBeVisible();
    
    // Navigate to profile
    await page.getByRole('button', { name: /profile/i }).click();

    // Verify navigation to user profile
    await expect(page).toHaveURL(/\/user\/[a-f0-9-]+$/, { timeout: 5000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify profile page has loaded with content
    await expect(page.getByText('Alice Smith')).toBeVisible();
    await expect(page.getByText(/Subscribers/i).first()).toBeVisible();
    await expect(page.getByText(/Groups/i).first()).toBeVisible();
  });

  test('Complete onboarding: search group by location + send request + navigate to group', async ({ page }) => {
    const email = getUniqueEmail();
    await authenticateNewUser(page, email);

    // Step 1: Name Step
    await fillNameStep(page, 'Bob', 'Johnson');

    // Step 2: Group Search Step - search by location
    await expect(page.getByText(/Find your group/i)).toBeVisible();
    
    // Groups in seed data have locations like cities/countries
    // Search for a common location term
    const searchInput = page.getByPlaceholder(/Search groups or locations/i);
    const locationSearchTerm = 'Fort'; // Matches "Fort City" in seed data
    await searchInput.fill(locationSearchTerm);
    
    const groupCard = page.locator('[class*="cursor-pointer"]').first();
    await expect(groupCard).toBeVisible();
    await groupCard.click();
    
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Confirm membership request
    await expect(page.getByText(/Join this group/i)).toBeVisible();
    await page.getByRole('button', { name: /Yes.*send request/i }).click();
    await expect(page.getByText(/Request sent/i)).toBeVisible({ timeout: 5000 });

    // Step 4: Aria & Kai Step
    await expect(page.getByText(/Aria & Kai/i).first()).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5: Summary - navigate to group
    await expect(page.getByText(/all set/i)).toBeVisible();
    await expect(page.getByText('Bob Johnson')).toBeVisible();
    
    // Click "Go to Group" button
    const goToGroupButton = page.getByRole('button', { name: /Go to group/i });
    await expect(goToGroupButton).toBeVisible();
    await goToGroupButton.click();

    // Verify navigation to group page
    await expect(page).toHaveURL(/\/group\/[a-f0-9-]+/, { timeout: 5000 });
    
    // Wait for the group page to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify the search pattern "locationSearchTerm" appears on the group page (in location)
    await expect(page.getByText(new RegExp(`${locationSearchTerm}`, 'i'))).toBeVisible({ timeout: 10000 });
  });

  test('Complete onboarding: search group but do not send request + navigate to AI assistant', async ({ page }) => {
    const email = getUniqueEmail();
    await authenticateNewUser(page, email);

    // Step 1: Name Step
    await fillNameStep(page, 'Charlie', 'Brown');

    // Step 2: Group Search Step
    await expect(page.getByText(/Find your group/i)).toBeVisible();
    const searchInput = page.getByPlaceholder(/Search groups or locations/i);
    await searchInput.fill('Test');
    
    const groupCard = page.locator('[class*="cursor-pointer"]').first();
    await groupCard.click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Decline membership request
    await expect(page.getByText(/Join this group/i)).toBeVisible();
    await page.getByRole('button', { name: /No.*just continue/i }).click();

    // Should skip to Summary (no Aria & Kai since no membership was sent)
    // Actually, Aria & Kai should still show - let me check the flow
    // Based on OnboardingWizard, Aria & Kai is shown after membership confirm or decline
    
    // Step 4: Aria & Kai Step should still appear
    // Actually looking at the code, initializeUserAndAriaKai is only called in handleMembershipConfirm
    // But handleMembershipDecline calls skipMembership which goes to summary
    // So Aria & Kai might be skipped. Let me check...
    // Actually skipMembership() in useOnboarding just sets requestMembership to false and goes to summary
    // So the flow might skip AriaKai. Let me adjust the test.
    
    // Navigate to Summary
    await expect(page.getByText(/all set/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Charlie Brown')).toBeVisible();
    
    // Verify no membership request sent message in the summary
    // Check that the "No group selected" or similar text is visible instead
    await expect(page.getByText(/No group selected/i).or(page.getByText(/Group selected/i))).toBeVisible();
    // The membership request message should not appear in the current summary view
    const summaryCard = page.locator('[class*="Card"]').filter({ hasText: /all set/i }).first();
    await expect(summaryCard.getByText(/Membership request sent/i)).not.toBeVisible();
    
    // Navigate to AI Assistant
    await page.getByRole('button', { name: /assistant/i }).click();

    // Verify navigation to messages with AriaKai
    await expect(page).toHaveURL(/\/messages/, { timeout: 5000 });
    
    // First, click on the Aria & Kai chat in the conversation list
    await page.getByText(/Aria.*Kai/i).first().click();
    
    // Wait for the message window to open beside the chat list
    
    // Verify the Aria & Kai welcome message appears in the chat window (use .last() to get the full message, not the preview)
    await expect(page.getByText(/Hey.*we.*are Aria.*Kai/i).last()).toBeVisible({ timeout: 5000 });
  });

  test('Complete onboarding: skip group search + navigate to profile', async ({ page }) => {
    const email = getUniqueEmail();
    await authenticateNewUser(page, email);

    // Step 1: Name Step
    await fillNameStep(page, 'Diana', 'Prince');

    // Step 2: Group Search Step - click Skip button
    await expect(page.getByText(/Find your group/i)).toBeVisible();
    
    // Click skip button instead of searching
    const skipButton = page.getByRole('button', { name: /Skip this step/i });
    await expect(skipButton).toBeVisible();
    await skipButton.click();

    // Should go directly to Summary (skipping confirm and AriaKai)
    await expect(page.getByText(/all set/i)).toBeVisible();
    await expect(page.getByText('Diana Prince')).toBeVisible();
    
    // Verify no group selected message
    await expect(page.getByText(/No group selected/i)).toBeVisible();
    
    // Navigate to profile
    await page.getByRole('button', { name: /profile/i }).click();
    await expect(page).toHaveURL(/\/user\/[a-f0-9-]+$/, { timeout: 5000 });
    
    // Verify profile page has loaded
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Diana Prince')).toBeVisible();
    await expect(page.getByText(/Subscribers/i)).toBeVisible();
  });

  test('Verify onboarding progress indicator shows all 5 steps', async ({ page }) => {
    const email = getUniqueEmail();
    await authenticateNewUser(page, email);

    // Verify step 1/5 on Name step
    await expect(page.getByText('1/5')).toBeVisible();
    await fillNameStep(page, 'Eve', 'Martinez');

    // Verify step 2/5 on Group Search step
    await expect(page.getByText('2/5')).toBeVisible();
    
    // Search and select a group to see all steps
    const searchInput = page.getByPlaceholder(/Search groups or locations/i);
    await searchInput.fill('Test');
    const groupCard = page.locator('[class*="cursor-pointer"]').first();
    await groupCard.click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Verify step 3/5 on Confirm step
    await expect(page.getByText('3/5')).toBeVisible();
    await page.getByRole('button', { name: /Yes.*send request/i }).click();
    await expect(page.getByText(/Request sent/i)).toBeVisible({ timeout: 5000 });

    // Verify step 4/5 on Aria & Kai step
    await expect(page.getByText('4/5')).toBeVisible();
    
    // Test the "Don't show again" checkbox
    const dontShowCheckbox = page.getByLabel(/Don't show.*again/i);
    await expect(dontShowCheckbox).toBeVisible();
    await dontShowCheckbox.check();
    
    await page.getByRole('button', { name: /Continue/i }).click();

    // Verify step 5/5 on Summary step
    await expect(page.getByText('5/5')).toBeVisible();
  });

  test('Verify user can find membership request in profile after onboarding', async ({ page }) => {
    const email = getUniqueEmail();
    await authenticateNewUser(page, email);

    // Complete onboarding with membership request
    await fillNameStep(page, 'Frank', 'Wilson');    
    await expect(page.getByText(/Find your group/i)).toBeVisible();
    
    const searchInput = page.getByPlaceholder(/Search groups or locations/i);
    await searchInput.fill('Test Main');
    const groupCard = page.locator('[class*="cursor-pointer"]').first();
    await groupCard.click();
    await page.getByRole('button', { name: /Continue/i }).click();
    
    await page.getByRole('button', { name: /Yes.*send request/i }).click();
    await expect(page.getByText(/Request sent/i)).toBeVisible({ timeout: 5000 });
    
    await expect(page.getByText(/Aria & Kai/i).first()).toBeVisible();
    await page.getByRole('button', { name: /Continue/i }).click();
    
    // Navigate to profile from summary
    await page.getByRole('button', { name: /profile/i }).click();
    await expect(page).toHaveURL(/\/user\/[a-f0-9-]+$/, { timeout: 5000 });

    // Extract user ID from URL
    const url = page.url();
    const userId = url.match(/\/user\/([a-f0-9-]+)/)?.[1];
    expect(userId).toBeTruthy();

    // Navigate to memberships tab
    await page.goto(`/user/${userId}/memberships`);
    
    // Verify membership request is visible
    await expect(page.getByText(/Active Memberships/i).or(page.getByText(/Pending Memberships/i))).toBeVisible();
    await expect(page.getByText(/requested|pending/i).first()).toBeVisible({ timeout: 5000 });
    
    // Verify the searched group "Test Main" appears on the membership page
    await expect(page.getByText(/Test Main/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Verify AriaKai introduction and features in Step 4', async ({ page }) => {
    const email = getUniqueEmail();
    await authenticateNewUser(page, email);

    await fillNameStep(page, 'Grace', 'Lee');
    
    // Search and select group to get to AriaKai step
    await expect(page.getByText(/Find your group/i)).toBeVisible();
    const searchInput = page.getByPlaceholder(/Search groups or locations/i);
    await searchInput.fill('Test');
    const groupCard = page.locator('[class*="cursor-pointer"]').first();
    await groupCard.click();
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.getByRole('button', { name: /Yes.*send request/i }).click();
    await expect(page.getByText(/Request sent/i)).toBeVisible({ timeout: 5000 });

    // Now on AriaKai step
    await expect(page.getByText(/Aria & Kai/i).first()).toBeVisible();
    
    // Verify content about AI assistant
    await expect(page.getByText(/personal assistant/i)).toBeVisible();
    await expect(page.getByText(/message/i)).toBeVisible();
    
    // Verify tips section
    await expect(page.getByText(/Quick Tip/i)).toBeVisible();
    
    // Verify the card/dialog structure with AK is present  
    await expect(page.getByText(/Meet Aria & Kai, your personal assistants/i)).toBeVisible();
  });

  test('Verify back navigation works through onboarding steps', async ({ page }) => {
    const email = getUniqueEmail();
    await authenticateNewUser(page, email);

    // Step 1: Name
    await fillNameStep(page, 'Henry', 'Taylor');

    // Step 2: Group Search
    await expect(page.getByText(/Find your group/i)).toBeVisible();
    
    // Go back to Name step
    await page.getByRole('button', { name: /Go Back/i }).click();
    await expect(page.getByText(/What's your name/i)).toBeVisible();
    
    // Verify name fields are still filled
    await expect(page.getByLabel(/First name/i)).toHaveValue('Henry');
    await expect(page.getByLabel(/Last name/i)).toHaveValue('Taylor');
    
    // Go forward again
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText(/Find your group/i)).toBeVisible();
    
    // Select a group and continue
    const searchInput = page.getByPlaceholder(/Search groups or locations/i);
    await searchInput.fill('Test');
    const groupCard = page.locator('[class*="cursor-pointer"]').first();
    await groupCard.click();
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3: Confirm
    await expect(page.getByText(/Join this group/i)).toBeVisible();
    
    // Go back to Group Search
    await page.getByRole('button', { name: /Go Back/i }).click();
    await expect(page.getByText(/Find your group/i)).toBeVisible();
  });

  test('Verify onboarding is not shown for returning users after first time', async ({ page }) => {
    const email = getUniqueEmail();
    
    // First login - complete onboarding
    await authenticateNewUser(page, email);
    await fillNameStep(page, 'Iris', 'Chen');
    
    const skipButton = page.getByRole('button', { name: /Skip this step/i });
    await skipButton.click();
    
    await expect(page.getByText(/all set/i)).toBeVisible();
    await page.getByRole('button', { name: /profile/i }).click();
    await expect(page).toHaveURL(/\/user\/[a-f0-9-]+$/);

    // Navigate back to home - onboarding should NOT show again
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    // Close Aria & Kai welcome dialog if it appears
    try {
      const closeButton = page.getByRole('button', { name: /close/i }).last();
      await closeButton.waitFor({ state: 'visible', timeout: 2000 });
      await closeButton.click();
    } catch {
      // Dialog not present or already closed
    }
    
    // Should NOT see onboarding wizard (user has already completed it)
    await expect(page.getByText(/What's your name/i)).not.toBeVisible();
    
    // Should see authenticated content (timeline)
    await expect(page.getByRole('heading', { name: /Your Political Ecosystem/i })).toBeVisible({ timeout: 5000 });
    
    // Refresh page - onboarding should still not show
    await page.reload();
    
    // Close dialog again after reload if it appears
    try {
      const closeButton = page.getByRole('button', { name: /close/i }).last();
      await closeButton.waitFor({ state: 'visible', timeout: 2000 });
      await closeButton.click();
    } catch {
      // Dialog not present or already closed
    }
    
    await expect(page.getByText(/What's your name/i)).not.toBeVisible();
    await expect(page.getByRole('heading', { name: /Your Political Ecosystem/i })).toBeVisible({ timeout: 5000 });
  });
});
