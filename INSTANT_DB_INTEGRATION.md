# User Wiki Instant DB Integration

## Changes Made

### 1. Profile Navigation Fix

**File**: `src/components/auth/UserMenu.tsx`

- Updated `handleProfileClick` to navigate to `/user/${user.id}` instead of `/user`
- Now uses the logged-in user's ID from the auth store

### 2. Schema Updates

**File**: `instant.schema.ts`

- Added `follows` entity to track user following relationships
- Added two links:
  - `userFollowers`: Links followers to users (one-to-many)
  - `userFollowing`: Links followees to users (one-to-many)

### 3. New Hooks Created

#### `useUserData` Hook

**File**: `src/features/user/hooks/useUserData.ts`

- Fetches user profile data from Instant DB
- Queries related data: stats, statements, blogs, groups, amendments
- Transforms database structure to match the User type interface
- Returns loading and error states

#### `useFollowUser` Hook

**File**: `src/features/user/hooks/useFollowUser.ts`

- Manages follow/unfollow functionality
- Tracks following state and follower count in real-time
- Provides `follow()`, `unfollow()`, and `toggleFollow()` functions
- Uses Instant DB transactions for data updates

### 4. Wiki Component Updates

**File**: `src/features/user/wiki.tsx`

- Integrated `useUserData` hook to fetch user data from database
- Integrated `useFollowUser` hook for real-time following functionality
- Added loading and error states with proper UI feedback
- Falls back to mock data if no database user is found (for development)
- Follower count now dynamically updates from the database

## How It Works

### User Profile Display

1. When navigating to `/user/[id]`, the UserWiki component receives the userId
2. `useUserData` queries Instant DB for the user's profile and all related data
3. Data is transformed to match the existing User type interface
4. If no data is found, falls back to mock data for development

### Following System

1. `useFollowUser` checks if the current user is following the profile user
2. Displays real-time follower count from the database
3. When the follow button is clicked:
   - Creates a new `follows` record in the database (if following)
   - Deletes the existing `follows` record (if unfollowing)
   - Updates happen via Instant DB transactions
   - UI updates automatically through reactive queries

### Profile Navigation

1. Click on user avatar/menu in navigation
2. Select "Profile" from dropdown
3. Navigates to `/user/{currentUserId}` where `currentUserId` is the logged-in user's ID

## Schema Structure

### Users and Profiles

- `$users` entity contains core authentication data
- `profiles` entity contains extended user profile information
- One-to-one relationship via `userProfiles` link

### User Content

- `stats`: User statistics (followers, following, amendments, etc.)
- `statements`: User's political statements
- `blogs`: User's blog posts
- `amendments`: User's proposed amendments
- `groups`: User groups (renamed from userGroups)
- All linked via one-to-many relationships

### Social Features

- `follows`: Tracks following relationships
- Each follow record links a follower to a followee
- Allows querying both followers and following lists

## Usage Example

```tsx
// In any component, fetch and display a user's profile
import { UserWiki } from '@/features/user/wiki';

function ProfilePage({ userId }: { userId: string }) {
  return <UserWiki userId={userId} />;
}
```

## Future Enhancements

1. **Add Following Count**: Query the number of users the profile user is following
2. **Network Stats**: Calculate and display network statistics
3. **Real-time Updates**: Add optimistic UI updates for instant feedback
4. **Pagination**: Add pagination for blogs, amendments, and groups
5. **Search Integration**: Use the searchFilters prop to filter content
6. **Profile Editing**: Add ability to edit own profile
7. **Avatar Upload**: Integrate with Instant's file upload system

## Testing

To test the integration:

1. Start the development server: `npm run dev`
2. Log in with a user account
3. Click on your avatar → "Profile"
4. You should see your profile at `/user/{yourUserId}`
5. Try following/unfollowing (creates/deletes records in DB)
6. Check the Instant DB dashboard to see the data changes

## Notes

- Mock data fallback ensures the app works even without database records
- All database operations are type-safe with TypeScript
- Real-time updates happen automatically through Instant DB's reactive queries
- Schema changes have been pushed to the database successfully
