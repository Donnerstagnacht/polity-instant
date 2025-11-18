# Profile Feature (Unauthenticated) - Comprehensive Test Plan

## Application Overview

This test plan covers the behavior of profile-related features when users are **not authenticated**. The Polity application enforces authentication requirements for certain profile actions while potentially allowing public viewing of user profiles.

**Key Behaviors to Test:**

- **Access Control**: Verification that protected routes redirect to authentication
- **Public Profiles**: Determine if user profiles are viewable without login
- **Edit Protection**: Ensure edit functionality requires authentication
- **Navigation Guards**: Proper handling of unauthorized access attempts
- **User Experience**: Clear messaging and appropriate redirects

**Technical Context:**

- Tests run without authentication setup
- Uses direct URL navigation to test access control
- Validates redirect behavior to `/auth` page
- Test user ID from seed data: `f598596e-d379-413e-9c6e-c218e5e3cf17`

## Test Scenarios

### 1. Access Control for Edit Pages

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify that unauthenticated users cannot access profile edit functionality and are properly redirected.

#### 1.1 Attempt to Access Edit Page Without Authentication

**Steps:**

1. Do NOT authenticate (start with fresh browser context)
2. Navigate directly to `/user/f598596e-d379-413e-9c6e-c218e5e3cf17/edit`
3. Wait for page to load or redirect (timeout: 5 seconds)
4. Check current page URL using `page.url()`
5. Verify URL contains `/auth` path
6. Verify authentication page heading is visible

**Expected Results:**

- Automatic redirect to `/auth` page occurs
- No edit form is displayed to unauthenticated users
- User sees authentication/login interface
- Redirect happens within reasonable time (< 5 seconds)
- No console errors related to authorization

#### 1.2 Attempt to Access Own Profile Route Without Authentication

**Steps:**

1. Do NOT authenticate
2. Navigate to `/user` (generic route that redirects to own profile when authenticated)
3. Wait for page load or redirect (timeout: 5 seconds)
4. Check final URL
5. Verify redirect to `/auth` page OR display of login required message

**Expected Results:**

- Route either redirects to authentication or shows login prompt
- No user profile data is exposed
- Clear indication that authentication is required
- Appropriate HTTP status code (401 or 302)

#### 1.3 Verify No Edit Button on Public Profile (If Accessible)

**Steps:**

1. Do NOT authenticate
2. Navigate to `/user/f598596e-d379-413e-9c6e-c218e5e3cf17`
3. If profile page loads (public profiles enabled):
   - Look for edit button using `page.getByRole('link', { name: /edit/i })`
   - Look for edit button using `page.getByRole('button', { name: /edit/i })`
   - Verify edit button is NOT present
4. If redirected to auth page, skip edit button check

**Expected Results:**

- Edit controls not visible to unauthenticated users
- Public profile (if viewable) shows read-only content
- No admin or modification controls exposed

### 2. Public Profile Viewing

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Determine application policy for public profile visibility and verify consistent behavior.

#### 2.1 Attempt to View User Profile Without Authentication

**Steps:**

1. Do NOT authenticate
2. Navigate to `/user/f598596e-d379-413e-9c6e-c218e5e3cf17` (known test user)
3. Wait for page to fully load (timeout: 5 seconds)
4. Check current URL using `page.url()`
5. Determine which scenario occurs:
   - **Scenario A**: URL contains `/auth` (requires authentication)
   - **Scenario B**: URL still on `/user/...` (public profiles allowed)
6. For Scenario A:
   - Verify heading contains "sign in" text
   - Verify authentication form is visible
7. For Scenario B:
   - Verify profile heading (h1) is visible
   - Verify profile content loads
   - Check that NO edit controls are present

**Expected Results:**

- Application has consistent policy (always redirect OR always allow viewing)
- If authentication required:
  - Immediate redirect to `/auth`
  - Clear messaging about login requirement
- If public viewing allowed:
  - Profile content displays correctly
  - No modification capabilities exposed
  - Read-only viewing experience

#### 2.2 Verify Public Profile Content Limitations

**Steps:**

1. Do NOT authenticate
2. Navigate to test user profile
3. If profile is viewable publicly:
   - Check for presence of personal contact information
   - Verify email addresses are NOT displayed
   - Verify phone numbers are NOT displayed
   - Check if bio and public information IS displayed
   - Verify social stats (followers, following) visibility
4. If redirected to auth, mark as N/A

**Expected Results:**

- Public profiles (if enabled) show limited information
- Private/sensitive data is hidden
- Public information (name, bio, public posts) may be visible
- Clear distinction between public and private data

### 3. Navigation Behavior While Unauthenticated

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify navigation guards and redirect logic throughout the application.

#### 3.1 Access Subscriptions Page Without Authentication

**Steps:**

1. Do NOT authenticate
2. Navigate directly to `/user/f598596e-d379-413e-9c6e-c218e5e3cf17/subscriptions`
3. Wait for page load or redirect (timeout: 5 seconds)
4. Verify current URL
5. Expected: Redirect to `/auth` page
6. Verify authentication interface is displayed

**Expected Results:**

- Subscriptions page requires authentication
- Automatic redirect to login page
- No subscription data exposed to unauthenticated users
- Clear authentication prompt displayed

#### 3.2 Test Multiple Profile Routes Without Authentication

**Steps:**

1. Do NOT authenticate
2. Test the following routes in sequence:
   - `/user` (own profile route)
   - `/user/f598596e-d379-413e-9c6e-c218e5e3cf17` (specific user)
   - `/user/f598596e-d379-413e-9c6e-c218e5e3cf17/edit` (edit page)
   - `/user/f598596e-d379-413e-9c6e-c218e5e3cf17/subscriptions` (subscriptions)
3. For each route:
   - Note the final URL after load
   - Check if redirected to `/auth`
   - Verify no protected content is visible
4. Document consistent behavior pattern

**Expected Results:**

- All protected routes redirect consistently
- Same authentication prompt for all protected resources
- No route bypasses security checks
- Redirect behavior is predictable

### 4. Authentication State Detection

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify the application correctly detects and responds to unauthenticated state.

#### 4.1 Verify Unauthenticated Header/Navigation

**Steps:**

1. Do NOT authenticate
2. Navigate to home page `/`
3. Wait for page to fully load
4. Check navigation header for:
   - "Sign In" or "Log In" button/link
   - No user avatar present
   - No user menu present
5. Verify authentication CTA is prominently displayed

**Expected Results:**

- Header displays login/signup options
- No authenticated user controls visible
- Clear call-to-action for authentication
- Consistent unauthenticated UI state

#### 4.2 Verify Session/Cookie Absence

**Steps:**

1. Do NOT authenticate
2. Navigate to any page
3. Check browser cookies using `page.context().cookies()`
4. Verify no authentication tokens are present
5. Verify no session cookies exist

**Expected Results:**

- No authentication cookies set
- No session storage with user data
- Clean unauthenticated browser context
- No residual authentication state

### 5. Error Handling and User Feedback

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Ensure unauthenticated users receive clear feedback and proper error messages.

#### 5.1 Verify Authentication Redirect Messaging

**Steps:**

1. Do NOT authenticate
2. Navigate to `/user/f598596e-d379-413e-9c6e-c218e5e3cf17/edit`
3. After redirect to `/auth`, check for:
   - Clear heading explaining login requirement
   - User-friendly messaging (not technical errors)
   - No error codes or stack traces visible
4. Verify page provides path forward (login form)

**Expected Results:**

- Professional, user-friendly messaging
- Clear explanation of why authentication is needed
- No technical jargon or error codes
- Smooth user experience despite restriction

#### 5.2 Test Invalid User ID Access

**Steps:**

1. Do NOT authenticate
2. Navigate to `/user/invalid-user-id-12345`
3. Wait for page response
4. Verify one of the following occurs:
   - Redirect to `/auth` (if authentication required for profiles)
   - Display "User not found" or 404 page
   - Display appropriate error message
5. Verify no application crash or unhandled errors

**Expected Results:**

- Graceful handling of invalid user IDs
- Appropriate error page or redirect
- No console errors or crashes
- User can navigate away from error state

### 6. Return URL Preservation (Deep Link)

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify that users are redirected to intended destination after authentication.

#### 6.1 Test Deep Link Preservation

**Steps:**

1. Do NOT authenticate
2. Navigate to `/user/f598596e-d379-413e-9c6e-c218e5e3cf17`
3. If redirected to `/auth`, check URL for return/redirect parameter
4. Look for query parameters like `?redirect=`, `?returnUrl=`, or `?next=`
5. Note the presence and value of return URL parameter

**Expected Results:**

- Application may preserve intended destination URL
- After authentication, user redirected to original requested page
- Return URL properly encoded and secure
- No open redirect vulnerabilities

**Note:** Full verification requires authentication flow - this test only checks parameter presence.

## Edge Cases and Security Considerations

### 7.1 Rapid Route Switching

**Steps:**

1. Do NOT authenticate
2. Rapidly navigate between:
   - `/user/f598596e-d379-413e-9c6e-c218e5e3cf17`
   - `/user/f598596e-d379-413e-9c6e-c218e5e3cf17/edit`
   - `/user`
3. Verify consistent redirect behavior
4. Check for race conditions or exposed content

**Expected Results:**

- Consistent authentication enforcement
- No flickering of protected content
- No race condition exploits
- Stable redirect behavior

### 7.2 Test with Expired/Invalid Session

**Steps:**

1. Start with no authentication
2. Manually set invalid authentication cookie
3. Navigate to profile pages
4. Verify invalid authentication is detected
5. Verify proper re-authentication flow

**Expected Results:**

- Invalid authentication tokens are rejected
- User prompted to re-authenticate
- No partial access with invalid credentials
- Session validation is thorough

## Known Issues and Notes

1. **Public Profile Policy**: Application behavior depends on whether profiles are public or private
2. **Test User ID**: Uses known user ID from seed data
3. **Redirect Timing**: Some redirects may have slight delays
4. **Error Pages**: 404 vs auth redirect behavior may vary by route

## Success Criteria

**All tests passing indicates:**

- ✅ Protected routes properly enforce authentication
- ✅ Edit functionality is completely inaccessible without login
- ✅ Public profile viewing follows consistent policy
- ✅ Navigation guards work across all profile routes
- ✅ User receives clear feedback for unauthorized access
- ✅ No security vulnerabilities or data exposure
- ✅ Deep linking preserves intended destination (if implemented)

## Test Execution Notes

**Before Running Tests:**

1. Ensure development server is running
2. Clear browser cache and cookies
3. Start with fresh browser context (no prior authentication)
4. Verify test user exists in database

**During Tests:**

1. Do NOT call any authentication helper functions
2. Start each test with clean, unauthenticated state
3. Monitor console for errors
4. Verify redirects complete within timeout periods

**After Running Tests:**

1. Document which routes are public vs protected
2. Note any inconsistent redirect behavior
3. Report any exposed sensitive information
4. Verify no session state persists
