# Profile Feature - Comprehensive Test Plan

## Application Overview

The Polity Profile Feature allows authenticated users to view and manage their personal profile information. The feature provides:

- **Profile Viewing**: Display user information including name, avatar, bio, location, and statistics
- **Profile Editing**: Update personal information, contact details, and profile settings
- **Avatar Management**: Upload and update profile images
- **Content Organization**: Tabbed interface for different content types
- **Social Features**: Display of followers, following, amendments, and network statistics
- **Subscriptions**: Manage user subscriptions
- **Navigation**: Seamless navigation between profile views and edit mode

**Technical Context:**

- Authentication required for accessing own profile and edit features
- Uses helper functions from `e2e/helpers/auth.ts` and `e2e/helpers/navigation.ts`
- Profile routes: `/user` (redirects to own profile), `/user/{userId}`, `/user/{userId}/edit`
- Magic code authentication via `generateTestMagicCode()` from `magic-code-helper.ts`

## Prerequisites

**Test User:**

- Email: `tobias.hassebrock@gmail.com`
- User ID: `f598596e-d379-413e-9c6e-c218e5e3cf17` (from seed data)

**Helper Functions Available:**

- `loginAsTestUser(page)` - Authenticates with main test user
- `navigateToOwnProfile(page)` - Navigates to authenticated user's profile
- `navigateToProfileEdit(page)` - Opens profile edit page
- `generateTestMagicCode(email)` - Generates valid OTP code

## Test Scenarios

### 1. View Own Profile (Authenticated)

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify that authenticated users can view their complete profile with all sections and information displayed correctly.

#### 1.1 Display Profile Basic Information

**Steps:**

1. Use `loginAsTestUser(page)` to authenticate
2. Verify redirect to home page at `/`
3. Use `navigateToOwnProfile(page)` helper
4. Verify URL matches pattern `/user/[a-f0-9-]+`
5. Verify page heading (h1) is visible
6. Verify avatar image is displayed with alt text containing "avatar" or "profile"

**Expected Results:**

- Profile page loads successfully
- User name displayed prominently as h1 heading
- Avatar image is visible
- URL contains user ID in correct format

#### 1.2 Verify Profile Statistics Display

**Steps:**

1. Authenticate and navigate to own profile (using helpers from 1.1)
2. Locate the statistics section (element with class containing "stats" or text matching "Followers|Following|Amendments|Network")
3. If stats section exists, verify it is visible
4. Check that stat values are displayed (numbers)

**Expected Results:**

- Statistics section visible if user has stats
- Stats display numerical values
- Common stats include: Followers, Following, Amendments, Network

#### 1.3 Navigate Profile Content Tabs

**Steps:**

1. Authenticate and navigate to own profile
2. Wait for tablist element with `role="tablist"` to be visible
3. Get count of all tab elements with `role="tab"`
4. Verify tab count is greater than 0
5. For each tab (minimum 3 tabs):
   - Click the tab
   - Verify tab has `aria-selected="true"` attribute
   - Verify corresponding tab panel with `role="tabpanel"` is visible
   - Log tab name for verification

**Expected Results:**

- Multiple tabs are present (typical: Posts, Amendments, Activity, etc.)
- Clicking each tab changes its selected state
- Tab panels update to show relevant content
- Only one tab is selected at a time

#### 1.4 Verify Profile Action Bar

**Steps:**

1. Authenticate and navigate to own profile
2. Check for "Share" button (if visible)
3. Verify "Edit" link or button is present and visible
4. Do not click Share button (may trigger browser dialog)
5. Note presence of any additional action buttons

**Expected Results:**

- Edit button/link is visible on own profile
- Share button may be present
- Action bar contains profile management controls
- Buttons are accessible and properly labeled

#### 1.5 Display User Hashtags

**Steps:**

1. Authenticate and navigate to own profile
2. Locate elements with class containing "hashtag"
3. If hashtag container exists, verify visibility
4. Count number of hashtags displayed (if any)

**Expected Results:**

- Hashtag container visible if user has tags
- Hashtags display as clickable/interactive elements
- Tags properly formatted with # prefix

### 2. Edit Profile Information

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify that authenticated users can successfully modify their profile information with proper validation and persistence.

#### 2.1 Navigate to Profile Edit Page

**Steps:**

1. Use `loginAsTestUser(page)` to authenticate
2. Use `navigateToOwnProfile(page)` helper
3. Locate edit button using: `page.getByRole('link', { name: /edit/i }).or(page.getByRole('button', { name: /edit/i }))`
4. Click the edit button
5. Verify URL matches pattern `/user/[a-f0-9-]+/edit`
6. Verify heading containing "edit" (case insensitive) is visible
7. Verify name input field with label matching /name/i is visible

**Expected Results:**

- Edit button is accessible from profile view
- Navigation to edit page successful
- Edit form displays with all input fields
- URL reflects edit mode

#### 2.2 Update Basic Profile Information

**Steps:**

1. Authenticate and navigate to edit page (using helpers and steps from 2.1)
2. Generate unique timestamp: `Date.now()`
3. Create test data:
   - Name: `Test User {timestamp}`
   - Subtitle: `Automated Test User`
   - Bio: `This is a test bio created by Playwright automation.`
4. Fill name field using `page.getByLabel(/name/i)`
5. If subtitle field exists and is visible, fill with test subtitle
6. If bio field exists and is visible, fill with test bio
7. Verify all entered values are displayed in their respective fields

**Expected Results:**

- All fields accept text input
- Character limits respected (if any)
- Input fields update with entered values
- No validation errors for valid data

#### 2.3 Update Contact Information

**Steps:**

1. Authenticate and navigate to edit page
2. Update basic info (from 2.2)
3. Locate email field using `page.getByLabel(/email/i)`
4. If email field visible and editable, update to `updated@test.com`
5. Locate location field using `page.getByLabel(/location/i)`
6. If location field visible, fill with `Test City, Test Country`
7. Verify both fields accept and display entered values

**Expected Results:**

- Email field validates email format
- Location field accepts free text
- Fields properly labeled for accessibility
- Input values persist during editing session

#### 2.4 Save Profile Changes

**Steps:**

1. Authenticate and navigate to edit page
2. Fill in basic information (name with timestamp for uniqueness)
3. Fill in contact information (if available)
4. Click save button using `page.getByRole('button', { name: /save|update/i })`
5. Wait for URL change to `/user/[a-f0-9-]+$` (without /edit)
6. Verify redirect occurs within 10 seconds
7. Locate heading with updated name
8. Verify heading containing the new name is visible within 5 seconds

**Expected Results:**

- Save button triggers form submission
- Successful redirect to profile view page
- Updated information displayed immediately
- No error messages shown
- Data persists across page refresh

#### 2.5 Cancel Profile Edit

**Steps:**

1. Authenticate and navigate to edit page
2. Make changes to name field (do not save)
3. Look for cancel button using `page.getByRole('button', { name: /cancel/i })`
4. If cancel button exists, click it
5. Verify navigation back to profile view page
6. Verify changes were not saved

**Expected Results:**

- Cancel button available and functional
- Navigation returns to profile view
- Unsaved changes are discarded
- Profile displays original values

### 3. Avatar Management

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify avatar upload functionality and image handling.

#### 3.1 Access Avatar Upload Interface

**Steps:**

1. Use `loginAsTestUser(page)` to authenticate
2. Use `navigateToProfileEdit(page)` helper to open edit page
3. Locate avatar upload label using `page.locator('label[for="avatar-upload"]')`
4. If label visible, verify it is displayed
5. Locate file input using `page.locator('input[type="file"][accept*="image"]')`
6. Verify file input is attached to DOM

**Expected Results:**

- Avatar upload UI is visible on edit page
- File input accepts image types
- Upload area is clickable/interactive
- Clear visual indication of upload capability

#### 3.2 Verify Avatar Upload Constraints

**Steps:**

1. Authenticate and navigate to edit page
2. Locate file input for avatar upload
3. Check `accept` attribute value
4. Verify it includes image types (e.g., `image/*`, `image/png`, `image/jpeg`)
5. Note any size constraints displayed in UI

**Expected Results:**

- File input restricted to image formats
- User informed of file size limits (if any)
- Supported formats clearly indicated
- Proper validation messages for invalid files

**Note:** Actual file upload not performed to avoid side effects. In production testing, upload test images of various formats and sizes.

### 4. Navigation and URL Handling

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify proper routing and navigation within profile features.

#### 4.1 Navigate to Subscriptions Page

**Steps:**

1. Authenticate and navigate to own profile
2. Locate subscriptions link using `page.getByRole('link', { name: /subscription/i })`
3. If link is visible:
   - Click the subscriptions link
   - Verify URL matches `/user/[a-f0-9-]+/subscriptions`
   - Verify heading containing "subscription" is visible
4. If link not visible, mark as not applicable for this user

**Expected Results:**

- Subscriptions link accessible from profile
- Navigation to subscriptions page successful
- Subscriptions page displays relevant content
- Back navigation returns to profile

#### 4.2 Direct URL Access to Own Profile

**Steps:**

1. Authenticate using `loginAsTestUser(page)`
2. Use `page.goto('/user')` to navigate
3. Verify automatic redirect occurs
4. Wait for URL matching pattern `/user/[a-f0-9-]+`
5. Verify redirect completes within 5 seconds
6. Verify profile page content loads

**Expected Results:**

- `/user` route redirects to authenticated user's profile
- Redirect includes correct user ID
- No errors during redirect
- Profile page fully loads

#### 4.3 Direct URL Access to Edit Page

**Steps:**

1. Authenticate using `loginAsTestUser(page)`
2. Get current user ID from URL after navigating to profile
3. Navigate directly to `/user/{userId}/edit`
4. Verify edit page loads
5. Verify form fields are populated with current user data

**Expected Results:**

- Direct URL access to edit page works
- User data pre-populates form fields
- Edit functionality available
- Proper authorization check (must be own profile)

### 5. Responsive Behavior and Visual Elements

**Seed:** `e2e/seed.spec.ts`

**Purpose:** Verify UI elements display correctly and respond to user interactions.

#### 5.1 Verify Avatar Display on Profile

**Steps:**

1. Authenticate and navigate to own profile
2. Locate avatar using `page.getByRole('img', { name: /avatar|profile/i }).first()`
3. Verify avatar is visible
4. Check avatar image src attribute is not empty
5. Verify avatar has appropriate alt text for accessibility

**Expected Results:**

- Avatar prominently displayed on profile
- Image loads successfully (no broken images)
- Alt text describes image purpose
- Avatar appropriately sized and positioned

#### 5.2 Verify Tab Panel Content Loading

**Steps:**

1. Authenticate and navigate to own profile
2. Wait for tablist to be visible
3. Get first tab element
4. Click first tab
5. Wait for tab panel with `role="tabpanel"` to appear
6. Verify tab panel contains content or empty state message
7. Repeat for at least 2 additional tabs

**Expected Results:**

- Tab panels load content dynamically
- Empty states displayed appropriately
- No broken layouts or overlapping content
- Smooth transitions between tabs

## Known Issues and Notes

1. **Test Data Dependency**: Tests use specific test user email `tobias.hassebrock@gmail.com`
2. **Magic Code Generation**: Requires `INSTANT_ADMIN_TOKEN` environment variable
3. **Profile Edit**: Changes persist in database - consider cleanup or use unique identifiers
4. **Avatar Upload**: File upload testing skipped to avoid side effects
5. **Dynamic Content**: Some profile sections (stats, hashtags) may not exist for all users

## Success Criteria

**All tests passing indicates:**

- ✅ Profile viewing works for authenticated users
- ✅ Profile editing successfully updates and persists data
- ✅ Navigation between profile sections functions correctly
- ✅ Avatar upload interface is accessible
- ✅ URL routing handles various access patterns
- ✅ Form validation prevents invalid data entry
- ✅ User experience is smooth and error-free

## Test Execution Notes

**Before Running Tests:**

1. Ensure development server is running on `http://localhost:3000`
2. Verify `.env.local` contains required environment variables
3. Confirm test user exists in database
4. Check that `INSTANT_ADMIN_TOKEN` is configured

**After Running Tests:**

1. Review any failed assertions
2. Check browser console for errors
3. Verify database state if needed
4. Clean up any test data modifications

**Recommended Test Order:**

1. View profile tests (read-only, safe)
2. Navigation tests (no data modification)
3. Edit profile tests (modifies data - run last)
