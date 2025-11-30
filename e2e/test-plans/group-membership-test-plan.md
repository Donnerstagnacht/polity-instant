# Group Membership Test Plan

## Overview

Comprehensive test plan for the group membership system covering all user flows and edge cases.

## Test Scenarios

### 1. Request to Join Flow

- **Scenario**: User requests to join a public/private group
- **Steps**:
  1. User navigates to group page
  2. User clicks "Request to Join" button
  3. Request is created with status "requested"
  4. Button changes to "Request Pending"
  5. Admin receives notification (future feature)
- **Expected Result**: Membership request is created and user sees pending status
- **Covered in**: `group-membership.spec.ts` - "User can request to join a group"

### 2. Cancel Pending Request

- **Scenario**: User cancels their pending membership request
- **Steps**:
  1. User has pending request
  2. User clicks "Request Pending" button
  3. Request is deleted
  4. Button changes back to "Request to Join"
- **Expected Result**: Request is removed and user can request again
- **Covered in**: `group-membership.spec.ts` - "User can cancel pending request"

### 3. Accept Invitation

- **Scenario**: User accepts an invitation to join a group
- **Steps**:
  1. User is invited to group (status: "invited")
  2. User navigates to group page
  3. User sees "Accept Invitation" button
  4. User clicks button
  5. Status changes to "member"
  6. Button changes to "Leave Group"
- **Expected Result**: User becomes a member and gains access to member features
- **Covered in**: `group-membership.spec.ts` - "User can accept group invitation"

### 4. Leave Group

- **Scenario**: Member leaves a group voluntarily
- **Steps**:
  1. User is a member of group
  2. User clicks "Leave Group" button
  3. Membership is deleted
  4. Button changes to "Request to Join"
  5. User loses access to member-only content
- **Expected Result**: Membership is removed and user is no longer a member
- **Covered in**: `group-membership.spec.ts` - "Member can leave group"

### 5. Admin Approves Request

- **Scenario**: Admin approves a pending membership request
- **Steps**:
  1. Admin navigates to memberships management page
  2. Admin sees list of pending requests
  3. Admin clicks "Accept" for a request
  4. User status changes to "member"
  5. User appears in active members list
  6. Member count increases
- **Expected Result**: Request is approved and user becomes a member
- **Covered in**: `group-membership.spec.ts` - "Admin can approve membership request"

### 6. Admin Rejects Request

- **Scenario**: Admin rejects a pending membership request
- **Steps**:
  1. Admin navigates to memberships management page
  2. Admin sees list of pending requests
  3. Admin clicks "Remove" for a request
  4. Request is deleted
  5. User disappears from pending list
- **Expected Result**: Request is rejected and removed
- **Covered in**: `group-membership.spec.ts` - "Admin can reject membership request"

### 7. Admin Invites User

- **Scenario**: Admin invites a user to join the group
- **Steps**:
  1. Admin clicks "Invite Member" button
  2. Dialog opens with user search
  3. Admin searches for user
  4. Admin selects user(s) from results
  5. Admin clicks "Invite" button
  6. Membership created with status "invited"
  7. User receives notification (future feature)
- **Expected Result**: Invitation is created and user can accept it
- **Covered in**: `group-membership.spec.ts` - "Admin can invite new members"

### 8. Admin Promotes to Admin

- **Scenario**: Admin promotes a member to board member (admin)
- **Steps**:
  1. Admin navigates to memberships page
  2. Admin finds member in active members list
  3. Admin clicks "Promote to Board Member"
  4. Member's role changes to "Board Member"
  5. Member gains admin permissions
- **Expected Result**: Member becomes admin with full permissions
- **Covered in**: `group-membership.spec.ts` - "Admin can promote member to admin"

### 9. Admin Demotes to Member

- **Scenario**: Admin demotes a board member to regular member
- **Steps**:
  1. Admin navigates to memberships page
  2. Admin finds board member in active members list
  3. Admin clicks "Demote to Member"
  4. Member's role changes to "Member"
  5. Member loses admin permissions
- **Expected Result**: Admin becomes regular member with limited permissions
- **Covered in**: `group-membership.spec.ts` - "Admin can demote admin to member"

### 10. Admin Removes Member

- **Scenario**: Admin removes a member from the group
- **Steps**:
  1. Admin navigates to memberships page
  2. Admin finds member in active members list
  3. Admin clicks "Remove" button
  4. Membership is deleted
  5. Member loses access to group
  6. Member count decreases
- **Expected Result**: Member is removed and loses all access
- **Covered in**: `group-membership.spec.ts` - "Admin can remove member from group"

### 11. Admin Changes Role

- **Scenario**: Admin assigns a custom role to a member
- **Steps**:
  1. Admin navigates to memberships page
  2. Admin finds member in active members list
  3. Admin clicks role dropdown
  4. Admin selects new role (e.g., "Moderator")
  5. Member's role is updated
  6. Member gains role-specific permissions
- **Expected Result**: Member's role is changed and permissions updated
- **Covered in**: `group-membership.spec.ts` - "Admin can change member role"

### 12. Admin Withdraws Invitation

- **Scenario**: Admin withdraws a pending invitation
- **Steps**:
  1. Admin navigates to memberships page
  2. Admin sees pending invitations list
  3. Admin clicks "Withdraw Invitation"
  4. Invitation is deleted
  5. User can no longer accept invitation
- **Expected Result**: Invitation is removed
- **Covered in**: `group-membership.spec.ts` - "Admin can withdraw invitation"

### 13. Role Creation

- **Scenario**: Admin creates a new custom role
- **Steps**:
  1. Admin navigates to Roles tab
  2. Admin clicks "Add Role"
  3. Dialog opens
  4. Admin enters role name and description
  5. Admin clicks "Create Role"
  6. Role appears in roles list
  7. Role available for assignment to members
- **Expected Result**: New role is created and can be assigned
- **Covered in**: `group-membership.spec.ts` - "Admin can create new role"

### 14. Role Deletion

- **Scenario**: Admin deletes a custom role
- **Steps**:
  1. Admin navigates to Roles tab
  2. Admin finds role to delete
  3. Admin clicks delete icon
  4. Role is removed
  5. Members with that role are updated (need to verify behavior)
- **Expected Result**: Role is deleted
- **Covered in**: `group-membership.spec.ts` - "Admin can delete role"

### 15. Action Rights Assignment

- **Scenario**: Admin assigns action rights to a role
- **Steps**:
  1. Admin navigates to Roles tab
  2. Admin sees action rights matrix
  3. Admin toggles checkboxes for specific permissions
  4. Permissions are saved
  5. Members with that role gain/lose permissions
- **Expected Result**: Role permissions are updated
- **Covered in**: `group-membership.spec.ts` - "Admin can assign action rights to role"

### 16. Multiple Memberships Handling

- **Scenario**: System handles duplicate memberships correctly
- **Steps**:
  1. User somehow has multiple memberships (edge case)
  2. System detects multiple memberships
  3. System prioritizes: Board Member > Member > Invited > Requested
  4. User sees correct status and permissions
  5. Admin can clean up duplicates
- **Expected Result**: System handles gracefully with prioritization
- **Covered in**: `useGroupMembership.test.ts` - "Multiple Memberships Handling"

### 17. Member Count Accuracy

- **Scenario**: Member count displays correctly
- **Steps**:
  1. Count only includes status "member" and role "Board Member"
  2. Excludes "invited" and "requested" statuses
  3. Updates in real-time when members join/leave
- **Expected Result**: Accurate member count at all times
- **Covered in**: `group-membership.spec.ts` - "Member count updates when member joins"

### 18. Access Control

- **Scenario**: Non-admins cannot access admin features
- **Steps**:
  1. Non-admin user tries to access /group/[id]/memberships
  2. Access is denied
  3. User sees "Access Denied" message
  4. Admin buttons are not visible to non-admins
- **Expected Result**: Admin features are protected
- **Covered in**: `group-membership.spec.ts` - "Non-admin cannot access membership management page"

### 19. Search and Filter

- **Scenario**: Admin searches for members
- **Steps**:
  1. Admin enters search term
  2. Results filter by name, handle, role, or status
  3. Results update in real-time
- **Expected Result**: Relevant members are shown
- **Covered in**: `group-membership.spec.ts` - "Admin can search members by name"

### 20. Loading States

- **Scenario**: UI shows loading states during operations
- **Steps**:
  1. User performs action (join, leave, etc.)
  2. Button shows loading state
  3. Button is disabled during operation
  4. Loading completes and UI updates
- **Expected Result**: User gets feedback during async operations
- **Covered in**: `useGroupMembership.test.ts` - "Loading States"

## Test Coverage Summary

### Unit Tests (Vitest)

- `useGroupMembership.test.ts`: Tests hook logic for all membership operations
- `GroupMembershipButton.test.tsx`: Tests button component states and actions
- `groups.store.test.ts`: Tests group store filtering and search
- `membership-integration.test.ts`: Placeholder for integration tests

### E2E Tests (Playwright)

- `group-membership.spec.ts`: Tests all user-facing flows end-to-end

## Edge Cases Covered

1. Multiple memberships for same user
2. Unauthenticated user access
3. Non-admin access restrictions
4. Duplicate request prevention
5. Member count accuracy
6. Role assignment to members
7. Permission inheritance from roles
8. Invitation acceptance/decline
9. Request cancellation
10. Admin self-demotion (should be prevented)

## Future Test Considerations

1. Email notifications for invitations
2. Push notifications for request approvals
3. Group visibility settings (public/private)
4. Bulk invitation of multiple users
5. Import members from CSV
6. Member activity tracking
7. Role hierarchy and inheritance
8. Temporary memberships with expiration
9. Payment-required memberships
10. Member approval workflows
