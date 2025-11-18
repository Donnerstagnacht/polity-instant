# Magic Link Authentication - Comprehensive Test Plan

## Application Overview

The Polity application uses a passwordless authentication system based on magic links with One-Time Password (OTP) codes. This test plan covers the complete authentication flow from email entry through verification and successful login.

**Authentication Flow:**

1. User enters email address on `/auth` page
2. System sends magic code to email
3. User navigates to `/auth/verify` page
4. User enters 6-digit OTP code
5. System verifies code and authenticates user
6. User redirected to home page `/`

**Technical Components:**

- **Magic Code Generation**: Uses InstantDB admin SDK to generate test codes
- **Email Entry**: Single input field with validation on `/auth`
- **OTP Verification**: 6 separate input fields for each digit on `/auth/verify`
- **Auto-submit**: Form submits automatically when all 6 digits are entered
- **Helper Function**: `generateTestMagicCode(email)` generates valid codes for testing

**Test User:**

- Email: `tobias.hassebrock@gmail.com`

## Test Scenarios

### 1. Email Entry and Magic Code Request

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify the initial step of authentication where users enter their email address.

#### 1.1 Load Authentication Page

**Steps:**

1. Navigate to `/auth` using `page.goto('/auth')`
2. Wait for network to be idle: `page.waitForLoadState('networkidle')`
3. Verify heading containing "sign in to polity" is visible (case insensitive)
4. Verify email input with placeholder matching `/enter your email/i` exists
5. Verify "Send code" button is present
6. Check initial button state (should be disabled until valid email entered)

**Expected Results:**

- Auth page loads within reasonable time
- Page title contains "Polity"
- Clear heading identifies the page as login/sign-in
- Email input field is visible and focused
- Send button is present (disabled initially)
- No error messages displayed on initial load

#### 1.2 Enter Valid Email Address

**Steps:**

1. Navigate to `/auth` and wait for page load
2. Locate email input using `page.getByPlaceholder(/enter your email/i)`
3. Fill input with test email: `tobias.hassebrock@gmail.com`
4. Verify email is displayed in the input field
5. Check that "Send code" button becomes enabled
6. Verify no validation errors are shown for valid email

**Expected Results:**

- Email input accepts text entry
- Entered email is visible in field
- Send button enables when valid email is present
- Email format validation accepts standard email addresses
- Input field properly labeled for accessibility

#### 1.3 Validate Email Format (Invalid Email)

**Steps:**

1. Navigate to `/auth`
2. Locate email input field
3. Enter invalid email: `invalid-email` (no @ symbol)
4. Locate submit button: `page.getByRole('button', { name: /send code/i })`
5. Click the submit button
6. Capture HTML5 validation message using:
   ```javascript
   const validationMessage = await emailInput.evaluate(
     (el: HTMLInputElement) => el.validationMessage
   );
   ```
7. Verify validation message is not empty

**Expected Results:**

- Browser HTML5 validation prevents submission
- Validation message indicates email format error
- Form does not submit with invalid email
- User receives immediate feedback
- Input field highlights the error

#### 1.4 Send Magic Code Successfully

**Steps:**

1. Navigate to `/auth` and wait for load
2. Verify heading "Sign in to Polity" is visible
3. Fill email input with `tobias.hassebrock@gmail.com`
4. Click "Send code" button
5. Wait for navigation to `/auth/verify` (timeout: 10 seconds)
6. Verify URL contains `/auth/verify`
7. Verify heading matching `/enter.*code|verify/i` is visible
8. Check console logs for confirmation message

**Expected Results:**

- Button click triggers code sending
- Automatic navigation to verify page
- Navigation completes within 10 seconds
- Verify page displays appropriate heading
- Console may log code sending confirmation
- No error messages displayed

#### 1.5 Verify Transition Messaging

**Steps:**

1. Navigate to `/auth`
2. Enter valid email address
3. Click "Send code" button
4. Immediately check for intermediate message display
5. Look for message like "Code sent!" or "We sent a verification code to {email}"
6. Verify email address is displayed in confirmation message
7. Check for "Change email address" button
8. Verify clear instructions about checking email

**Expected Results:**

- Confirmation message appears after clicking send
- User's email address is shown in confirmation
- Instructions guide user to next step
- Option to change email is available
- Professional, encouraging messaging

### 2. OTP Code Verification

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify the OTP entry and verification process works correctly with valid and invalid codes.

#### 2.1 Display OTP Input Interface

**Steps:**

1. Navigate through email entry (steps from 1.4)
2. Wait for `/auth/verify` page to load
3. Verify heading contains "enter" and "code" OR "verify" (case insensitive)
4. Locate all OTP input fields using:
   ```javascript
   const inputs = page.locator('input[type="text"][inputmode="numeric"]');
   ```
5. Count the number of input fields
6. Verify exactly 6 input fields are present
7. Check that first input field is focused

**Expected Results:**

- Verify page displays clear heading
- Exactly 6 input fields for OTP digits
- Input fields are properly formatted (numeric input)
- First field is auto-focused for immediate entry
- Clear visual distinction between input fields
- Accessible labels for screen readers

#### 2.2 Enter Valid OTP Code

**Steps:**

1. Navigate to `/auth/verify` (via email entry flow)
2. Generate test magic code using:
   ```javascript
   const code = await generateTestMagicCode('tobias.hassebrock@gmail.com');
   ```
3. Log the generated code: `console.log(\`🔐 Generated magic code: \${code}\`)`
4. Split code into digits: `const codeDigits = code.split('')`
5. Locate all OTP inputs
6. For each digit (i from 0 to 5):
   - Fill `inputs.nth(i)` with `codeDigits[i]`
   - Verify digit is displayed in field
7. Observe auto-submission behavior

**Expected Results:**

- Magic code generation succeeds
- Each digit fills corresponding input field
- Cursor automatically advances to next field
- All 6 digits can be entered successfully
- Visual feedback for filled fields
- No manual submit button click required

#### 2.3 Verify Automatic Authentication

**Steps:**

1. Complete steps from 2.2 (enter valid OTP)
2. Wait for automatic form submission
3. Wait for URL change to `/` (home page) with timeout: 10 seconds
4. Verify final URL is exactly `/`
5. Check that authentication succeeded by looking for:
   - User-specific navigation elements
   - No login/sign-in buttons
   - User avatar or profile link
6. Verify no error messages are displayed

**Expected Results:**

- Form auto-submits when 6th digit entered
- Successful authentication within 10 seconds
- Redirect to home page (`/`)
- User is now logged in
- Authentication state persists
- Session cookies are set

#### 2.4 Test Invalid OTP Code

**Steps:**

1. Navigate to `/auth/verify` via email flow
2. DO NOT generate valid code
3. Enter invalid 6-digit code: `123456`
4. Wait for form submission
5. Check for error message display
6. Verify error message indicates invalid or expired code
7. Verify user remains on `/auth/verify` page
8. Verify input fields are cleared or highlighted

**Expected Results:**

- Invalid code is rejected
- Clear error message displayed to user
- No authentication occurs
- User can retry with correct code
- Error message is user-friendly
- No redirect to home page

### 3. OTP Resend Functionality

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify users can request a new code if needed.

#### 3.1 Locate and Click Resend Button

**Steps:**

1. Navigate to `/auth/verify` via email flow
2. Verify page is loaded with OTP inputs visible
3. Locate resend button using:
   ```javascript
   const resendButton = page.getByRole('button', { name: /resend/i });
   ```
4. Verify resend button is visible
5. Note initial state (may be disabled for cooldown period)
6. If enabled, click resend button
7. Verify action occurs (inputs clear or confirmation message)

**Expected Results:**

- Resend button is clearly visible
- Button label clearly indicates resend action
- Clicking resend triggers new code generation
- User feedback confirms resend action
- Cooldown period may prevent immediate resend

#### 3.2 Verify Resend Behavior

**Steps:**

1. Navigate to verify page
2. Fill in 1-2 digits of OTP code
3. Click resend button
4. Verify input fields are cleared: `firstInput.toHaveValue('')`
5. Verify new code is sent (check console or confirmation message)
6. Verify user can enter new code
7. Original code should no longer work

**Expected Results:**

- Resend clears any partially entered code
- New code is generated and sent
- Previous code is invalidated
- User can successfully use new code
- Clear confirmation of resend action

### 4. Navigation and Flow Control

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify users can navigate back and control the authentication flow.

#### 4.1 Navigate Back to Email Entry

**Steps:**

1. Complete email entry to reach verify page
2. Locate back button using:
   ```javascript
   const backButton = page.getByRole('button', { name: /back/i });
   ```
3. Verify back button is visible
4. Click back button
5. Verify navigation to `/auth` page
6. Verify email input field contains previously entered email OR is empty
7. Verify user can re-enter email and restart flow

**Expected Results:**

- Back button is clearly visible and accessible
- Clicking back returns to email entry page
- Email may or may not be pre-filled
- User can change email address
- Flow can be restarted from beginning

#### 4.2 Direct URL Access to Verify Page

**Steps:**

1. Do NOT go through email flow
2. Navigate directly to `/auth/verify` using `page.goto('/auth/verify')`
3. Observe page behavior
4. Check if page:
   - Displays error message about missing email
   - Redirects back to `/auth`
   - Allows OTP entry anyway (may fail verification)
5. Document behavior

**Expected Results:**

- Application handles direct access appropriately
- Either redirects to email entry or shows error
- Clear messaging if email context is missing
- No application crash or error state

### 5. Complete Authentication Flow End-to-End

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify the entire authentication process works seamlessly from start to finish.

#### 5.1 Full Magic Link Authentication Flow

**Steps:**

1. Start at home page `/` (unauthenticated)
2. Navigate to `/auth`
3. Wait for page load (networkidle)
4. Enter email: `tobias.hassebrock@gmail.com`
5. Click "Send code" button
6. Wait for navigation to `/auth/verify`
7. Generate magic code: `const code = await generateTestMagicCode(email)`
8. Split code into digits
9. Fill all 6 OTP input fields
10. Wait for auto-submission and redirect
11. Verify final URL is `/`
12. Verify heading or user element is visible on home page
13. Verify authentication successful

**Expected Results:**

- Complete flow executes without errors
- Each step transitions smoothly to next
- Total time < 15 seconds (excluding code generation)
- User lands on home page authenticated
- Session persists across page refreshes
- No console errors during flow

#### 5.2 Verify Authenticated Session Persistence

**Steps:**

1. Complete full authentication flow (5.1)
2. Verify user is on home page `/`
3. Refresh the page using `page.reload()`
4. Wait for page to reload
5. Verify user remains authenticated
6. Check for user-specific elements (avatar, profile link)
7. Navigate to protected route (e.g., `/user`)
8. Verify no re-authentication required

**Expected Results:**

- Authentication persists after page refresh
- Session cookies remain valid
- No logout on page refresh
- Protected routes remain accessible
- User experience is seamless

### 6. Error Handling and Edge Cases

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Test error scenarios and edge cases in the authentication flow.

#### 6.1 Test Empty Email Submission

**Steps:**

1. Navigate to `/auth`
2. Do NOT enter any email
3. Attempt to click "Send code" button
4. Verify button is disabled OR submission is prevented
5. Verify validation message if form submits

**Expected Results:**

- Button disabled when email is empty
- HTML5 validation prevents empty submission
- Clear indication that email is required
- User cannot proceed without email

#### 6.2 Test Incomplete OTP Entry

**Steps:**

1. Navigate to verify page via email flow
2. Enter only 3-4 digits of OTP code
3. Wait 5 seconds
4. Verify no auto-submission occurs
5. Verify user can continue entering digits
6. Verify no error message for incomplete entry

**Expected Results:**

- Partial code entry is allowed
- No premature submission
- User can complete entry at their pace
- Visual indicator of how many digits entered
- No timeout on entry

#### 6.3 Test Special Characters in Email

**Steps:**

1. Navigate to `/auth`
2. Test email addresses with special characters:
   - `test+tag@example.com` (plus sign)
   - `test.user@example.com` (period)
   - `test_user@example.com` (underscore)
3. For each, enter email and click send
4. Verify all valid formats are accepted

**Expected Results:**

- RFC-compliant email addresses are accepted
- Special characters in local part work correctly
- Validation follows email standards
- Common email formats all work

#### 6.4 Test Code Expiration (If Implemented)

**Steps:**

1. Navigate to verify page
2. Generate magic code but do NOT enter it
3. Wait for expiration period (typically 10-15 minutes)
4. Attempt to use expired code
5. Verify error message about expiration
6. Verify option to request new code

**Expected Results:**

- Expired codes are rejected
- Clear error message indicates expiration
- User can easily request new code
- No security bypass with old codes

**Note:** This test may require extended wait time or time manipulation.

### 7. Accessibility and User Experience

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify the authentication flow is accessible and user-friendly.

#### 7.1 Keyboard Navigation Through OTP Fields

**Steps:**

1. Navigate to verify page
2. Ensure first input field is focused
3. Type first digit
4. Verify focus moves to second field automatically
5. Press Backspace
6. Verify focus returns to previous field
7. Complete entry using only keyboard
8. Verify successful submission

**Expected Results:**

- Auto-focus progression as digits are entered
- Backspace navigates to previous field
- Tab key navigates between fields
- Enter key submits (if all digits entered)
- Full keyboard accessibility

#### 7.2 Verify Screen Reader Labels

**Steps:**

1. Inspect email input field
2. Verify proper `aria-label` or `<label>` element
3. Check OTP input fields for labels
4. Verify button labels are descriptive
5. Check error messages have `role="alert"` or similar
6. Verify heading hierarchy is logical (h1, h2, h3)

**Expected Results:**

- All form fields have accessible labels
- Error messages are announced to screen readers
- Heading structure is semantic
- ARIA attributes used appropriately
- WCAG 2.1 compliance

## Helper Function Integration

### Using `login()` Helper

The `e2e/helpers/auth.ts` file provides a comprehensive login helper:

```typescript
await login(page, 'tobias.hassebrock@gmail.com', true);
```

**Parameters:**

- `page`: Playwright page object
- `email`: User email address
- `generateCode`: Whether to generate fresh code (default: true)

**What it does:**

1. Navigates to `/auth`
2. Enters email and clicks send
3. Waits for `/auth/verify` navigation
4. Generates magic code using admin SDK
5. Fills all 6 OTP inputs
6. Waits for redirect to `/`
7. Verifies authentication success

### Using `loginAsTestUser()` Helper

Simplified wrapper for common test user:

```typescript
await loginAsTestUser(page);
```

This uses the predefined `TEST_USERS.main.email` configuration.

## Known Issues and Notes

1. **Magic Code Generation**: Requires `INSTANT_ADMIN_TOKEN` environment variable
2. **Email Validation**: Uses HTML5 validation - may vary by browser
3. **Auto-submit**: Timing depends on input field implementation
4. **Code Expiration**: Time limit not explicitly tested
5. **Rate Limiting**: Resend functionality may have cooldown period

## Success Criteria

**All tests passing indicates:**

- ✅ Email entry works with proper validation
- ✅ Magic code sending succeeds
- ✅ OTP verification accepts valid codes
- ✅ Invalid codes are properly rejected
- ✅ Resend functionality works correctly
- ✅ Navigation between auth pages is smooth
- ✅ Complete flow authenticates user successfully
- ✅ Session persists after authentication
- ✅ Error handling is robust and user-friendly
- ✅ Accessibility standards are met

## Test Execution Notes

**Before Running Tests:**

1. Ensure `.env.local` contains:
   - `NEXT_PUBLIC_INSTANT_APP_ID`
   - `INSTANT_ADMIN_TOKEN`
2. Verify development server running on `http://localhost:3000`
3. Clear browser cookies/cache for clean state
4. Ensure test user exists in database

**During Tests:**

1. Monitor console for magic code logs
2. Watch for network errors or timeouts
3. Verify redirects complete within timeouts
4. Check for any unhandled promise rejections

**After Running Tests:**

1. Verify no authentication state persists between tests
2. Review any failed assertions
3. Check for console errors or warnings
4. Document any timing issues or flaky tests

**Test Data Cleanup:**

- Authentication tests generally don't modify data
- Session cookies can be cleared between tests
- Test user should remain in database for future tests
