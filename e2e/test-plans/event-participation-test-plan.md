# Event Participation Test Plan

## Overview

Comprehensive test plan for the event participation system covering all user flows and edge cases.

## Test Scenarios

### 1. Request to Participate Flow

- **Scenario**: User requests to participate in an event
- **Steps**:
  1. User navigates to event page
  2. User clicks "Request to Participate" button
  3. Request is created with status "requested"
  4. Button changes to "Request Pending"
  5. Organizer receives notification (future feature)
- **Expected Result**: Participation request is created and user sees pending status
- **Covered in**: `event-participation.spec.ts` - "User can request to participate in event"

### 2. Cancel Pending Participation Request

- **Scenario**: User cancels their pending participation request
- **Steps**:
  1. User has pending request
  2. User clicks "Request Pending" button
  3. Request is deleted
  4. Button changes back to "Request to Participate"
- **Expected Result**: Request is removed and user can request again
- **Covered in**: `event-participation.spec.ts` - "User can cancel pending participation request"

### 3. Accept Event Invitation

- **Scenario**: User accepts an invitation to participate in an event
- **Steps**:
  1. User is invited to event (status: "invited")
  2. User navigates to event page
  3. User sees "Accept Invitation" button
  4. User clicks button
  5. Status changes to "member"
  6. Button changes to "Leave Event"
- **Expected Result**: User becomes a participant and gains access to event features
- **Covered in**: `event-participation.spec.ts` - "User can accept event invitation"

### 4. Leave Event

- **Scenario**: Participant leaves an event voluntarily
- **Steps**:
  1. User is a participant of event
  2. User clicks "Leave Event" button
  3. Participation is deleted
  4. Button changes to "Request to Participate"
  5. User loses access to participant-only content
- **Expected Result**: Participation is removed and user is no longer a participant
- **Covered in**: `event-participation.spec.ts` - "Participant can leave event"

### 5. Organizer Approves Request

- **Scenario**: Organizer approves a pending participation request
- **Steps**:
  1. Organizer navigates to participants management page
  2. Organizer sees list of pending requests
  3. Organizer clicks "Accept" for a request
  4. User status changes to "member"
  5. User appears in active participants list
  6. Participant count increases
- **Expected Result**: Request is approved and user becomes a participant
- **Covered in**: `event-participation.spec.ts` - "Organizer can approve participation request"

### 6. Organizer Rejects Request

- **Scenario**: Organizer rejects a pending participation request
- **Steps**:
  1. Organizer navigates to participants management page
  2. Organizer sees list of pending requests
  3. Organizer clicks "Remove" for a request
  4. Request is deleted
  5. User disappears from pending list
- **Expected Result**: Request is rejected and removed
- **Covered in**: `event-participation.spec.ts` - "Organizer can reject participation request"

### 7. Organizer Invites Participant

- **Scenario**: Organizer invites a user to participate in the event
- **Steps**:
  1. Organizer clicks "Invite Participant" button
  2. Dialog opens with user search
  3. Organizer searches for user
  4. Organizer selects user(s) from results
  5. Organizer clicks "Invite" button
  6. Participation created with status "invited"
  7. User receives notification (future feature)
- **Expected Result**: Invitation is created and user can accept it
- **Covered in**: `event-participation.spec.ts` - "Organizer can invite participants"

### 8. Organizer Promotes to Organizer

- **Scenario**: Organizer promotes a participant to organizer role
- **Steps**:
  1. Organizer navigates to participants page
  2. Organizer finds participant in active participants list
  3. Organizer clicks "Promote to Organizer"
  4. Participant's role changes to "Organizer"
  5. Participant gains organizer permissions
- **Expected Result**: Participant becomes organizer with full permissions
- **Covered in**: `event-participation.spec.ts` - "Organizer can promote participant to organizer"

### 9. Organizer Demotes to Participant

- **Scenario**: Organizer demotes an organizer to regular participant
- **Steps**:
  1. Organizer navigates to participants page
  2. Organizer finds organizer in active participants list
  3. Organizer clicks "Demote to Participant"
  4. Organizer's role changes to "Participant"
  5. User loses organizer permissions
- **Expected Result**: Organizer becomes regular participant with limited permissions
- **Covered in**: `event-participation.spec.ts` - "Organizer can demote organizer to participant"

### 10. Organizer Removes Participant

- **Scenario**: Organizer removes a participant from the event
- **Steps**:
  1. Organizer navigates to participants page
  2. Organizer finds participant in active participants list
  3. Organizer clicks "Remove" button
  4. Participation is deleted
  5. Participant loses access to event
  6. Participant count decreases
- **Expected Result**: Participant is removed and loses all access
- **Covered in**: `event-participation.spec.ts` - "Organizer can remove participant from event"

### 11. Organizer Changes Participant Role

- **Scenario**: Organizer assigns a custom role to a participant
- **Steps**:
  1. Organizer navigates to participants page
  2. Organizer finds participant in active participants list
  3. Organizer clicks role dropdown
  4. Organizer selects new role (e.g., "Speaker", "Moderator")
  5. Participant's role is updated
  6. Participant gains role-specific permissions
- **Expected Result**: Participant's role is changed and permissions updated
- **Covered in**: `event-participation.spec.ts` - "Organizer can change participant role"

### 12. Organizer Withdraws Invitation

- **Scenario**: Organizer withdraws a pending invitation
- **Steps**:
  1. Organizer navigates to participants page
  2. Organizer sees pending invitations list
  3. Organizer clicks "Cancel Invitation"
  4. Invitation is deleted
  5. User can no longer accept invitation
- **Expected Result**: Invitation is removed
- **Covered in**: `event-participation.spec.ts` - "Organizer can withdraw invitation"

### 13. Role Creation for Event

- **Scenario**: Organizer creates a new custom role for event
- **Steps**:
  1. Organizer navigates to Roles tab
  2. Organizer clicks "Add Role"
  3. Dialog opens
  4. Organizer enters role name and description
  5. Organizer clicks "Create Role"
  6. Role appears in roles list
  7. Role available for assignment to participants
- **Expected Result**: New role is created and can be assigned
- **Covered in**: `event-participation.spec.ts` - "Organizer can create new role"

### 14. Role Deletion for Event

- **Scenario**: Organizer deletes a custom role
- **Steps**:
  1. Organizer navigates to Roles tab
  2. Organizer finds role to delete
  3. Organizer clicks delete icon
  4. Role is removed
  5. Participants with that role are updated
- **Expected Result**: Role is deleted
- **Covered in**: `event-participation.spec.ts` - "Organizer can delete role"

### 15. Action Rights Assignment for Event Role

- **Scenario**: Organizer assigns action rights to a role
- **Steps**:
  1. Organizer navigates to Roles tab
  2. Organizer sees action rights matrix
  3. Organizer toggles checkboxes for specific permissions
  4. Permissions are saved
  5. Participants with that role gain/lose permissions
- **Expected Result**: Role permissions are updated
- **Covered in**: `event-participation.spec.ts` - "Organizer can assign action rights to role"

### 16. Participant Count Accuracy

- **Scenario**: Participant count displays correctly
- **Steps**:
  1. Count only includes status "member" and role "Organizer"
  2. Excludes "invited" and "requested" statuses
  3. Updates in real-time when participants join/leave
- **Expected Result**: Accurate participant count at all times
- **Covered in**: `event-participation.spec.ts` - "Participant count updates when participant joins"

### 17. Access Control for Non-Organizers

- **Scenario**: Non-organizers cannot access organizer features
- **Steps**:
  1. Non-organizer user tries to access /event/[id]/participants
  2. Access is denied
  3. User sees "Access Denied" message
  4. Organizer buttons are not visible to non-organizers
- **Expected Result**: Organizer features are protected
- **Covered in**: `event-participation.spec.ts` - "Non-organizer cannot access participants management page"

### 18. Search and Filter Participants

- **Scenario**: Organizer searches for participants
- **Steps**:
  1. Organizer enters search term
  2. Results filter by name, handle, role, or status
  3. Results update in real-time
- **Expected Result**: Relevant participants are shown
- **Covered in**: `event-participation.spec.ts` - "Organizer can search participants by name"

### 19. Loading States for Participation Actions

- **Scenario**: UI shows loading states during operations
- **Steps**:
  1. User performs action (join, leave, etc.)
  2. Button shows loading state
  3. Button is disabled during operation
  4. Loading completes and UI updates
- **Expected Result**: User gets feedback during async operations
- **Covered in**: `event-participation.spec.ts` - "Loading states display during participation operations"

### 20. Duplicate Request Prevention

- **Scenario**: System prevents duplicate participation requests
- **Steps**:
  1. User requests to participate
  2. User tries to request again
  3. System prevents duplicate request
  4. Only one request exists
- **Expected Result**: No duplicate requests created
- **Covered in**: `event-participation.spec.ts` - "Duplicate participation request prevention"

### 21. View Participants List

- **Scenario**: Users can view list of event participants
- **Steps**:
  1. User navigates to event page
  2. User sees participant count
  3. User can view list of participants (if public)
  4. Participant avatars and names are displayed
- **Expected Result**: Participants are visible to authorized users
- **Covered in**: `event-participation.spec.ts` - "User can view participants list"

### 22. Calendar Integration

- **Scenario**: Participated events appear in user's calendar
- **Steps**:
  1. User participates in event
  2. User navigates to calendar page
  3. Event appears in calendar
  4. Event shows participation status
- **Expected Result**: Events are integrated with calendar
- **Covered in**: `event-participation.spec.ts` - "Participated events appear in calendar"

## Test Coverage Summary

### Unit Tests (Vitest)

- `useEventParticipation.test.ts`: Tests hook logic for all participation operations
- `EventParticipationButton.test.tsx`: Tests button component states and actions
- `events.store.test.ts`: Tests event store filtering and search

### E2E Tests (Playwright)

- `event-participation.spec.ts`: Tests all user-facing flows end-to-end

## Edge Cases Covered

1. Multiple participations for same user
2. Unauthenticated user access
3. Non-organizer access restrictions
4. Duplicate request prevention
5. Participant count accuracy
6. Role assignment to participants
7. Permission inheritance from roles
8. Invitation acceptance/decline
9. Request cancellation
10. Organizer self-demotion (should be prevented)
11. Public vs private event participation
12. Event capacity limits (future feature)

## Future Test Considerations

1. Email notifications for invitations
2. Push notifications for request approvals
3. Event capacity management
4. Waitlist functionality
5. Attendance tracking
6. Check-in/check-out functionality
7. Participant badges and achievements
8. Bulk invitation of multiple users
9. Import participants from CSV
10. Participant activity tracking
