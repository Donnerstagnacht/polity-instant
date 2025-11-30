# Amendment Collaboration Test Plan

## Overview

Comprehensive test plan for the amendment collaboration system covering all user flows, document editing, change requests, and voting mechanisms.

## Test Scenarios

### 1. Request to Collaborate Flow

- **Scenario**: User requests to collaborate on an amendment
- **Steps**:
  1. User navigates to amendment page
  2. User clicks "Request to Collaborate" button
  3. Request is created with status "requested"
  4. Button changes to "Request Pending"
  5. Amendment author receives notification (future feature)
- **Expected Result**: Collaboration request is created and user sees pending status
- **Covered in**: `amendment-collaboration.spec.ts` - "User can request to collaborate on amendment"

### 2. Cancel Pending Collaboration Request

- **Scenario**: User cancels their pending collaboration request
- **Steps**:
  1. User has pending request
  2. User clicks "Request Pending" button
  3. Request is deleted
  4. Button changes back to "Request to Collaborate"
- **Expected Result**: Request is removed and user can request again
- **Covered in**: `amendment-collaboration.spec.ts` - "User can cancel pending collaboration request"

### 3. Accept Collaboration Invitation

- **Scenario**: User accepts an invitation to collaborate on amendment
- **Steps**:
  1. User is invited to amendment (status: "invited")
  2. User navigates to amendment page
  3. User sees "Accept Invitation" button
  4. User clicks button
  5. Status changes to "member"
  6. Button changes to "Leave Collaboration"
- **Expected Result**: User becomes a collaborator and gains editing access
- **Covered in**: `amendment-collaboration.spec.ts` - "User can accept collaboration invitation"

### 4. Leave Collaboration

- **Scenario**: Collaborator leaves an amendment voluntarily
- **Steps**:
  1. User is a collaborator of amendment
  2. User clicks "Leave Collaboration" button
  3. Collaboration is deleted
  4. Button changes to "Request to Collaborate"
  5. User loses editing access
- **Expected Result**: Collaboration is removed and user is no longer a collaborator
- **Covered in**: `amendment-collaboration.spec.ts` - "Collaborator can leave amendment"

### 5. Author Approves Collaboration Request

- **Scenario**: Author approves a pending collaboration request
- **Steps**:
  1. Author navigates to collaborators management page
  2. Author sees list of pending requests
  3. Author clicks "Accept" for a request
  4. User status changes to "member"
  5. User appears in active collaborators list
  6. Collaborator count increases
- **Expected Result**: Request is approved and user becomes a collaborator
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can approve collaboration request"

### 6. Author Rejects Collaboration Request

- **Scenario**: Author rejects a pending collaboration request
- **Steps**:
  1. Author navigates to collaborators management page
  2. Author sees list of pending requests
  3. Author clicks "Remove" for a request
  4. Request is deleted
  5. User disappears from pending list
- **Expected Result**: Request is rejected and removed
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can reject collaboration request"

### 7. Author Invites Collaborator

- **Scenario**: Author invites a user to collaborate on the amendment
- **Steps**:
  1. Author clicks "Invite Collaborator" button
  2. Dialog opens with user search
  3. Author searches for user
  4. Author selects user(s) from results
  5. Author clicks "Invite" button
  6. Collaboration created with status "invited"
  7. User receives notification (future feature)
- **Expected Result**: Invitation is created and user can accept it
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can invite collaborators"

### 8. Author Promotes to Admin

- **Scenario**: Author promotes a collaborator to admin role
- **Steps**:
  1. Author navigates to collaborators page
  2. Author finds collaborator in active collaborators list
  3. Author clicks "Promote to Admin"
  4. Collaborator's role changes to "Admin"
  5. Collaborator gains admin permissions
- **Expected Result**: Collaborator becomes admin with full permissions
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can promote collaborator to admin"

### 9. Author Demotes to Collaborator

- **Scenario**: Author demotes an admin to regular collaborator
- **Steps**:
  1. Author navigates to collaborators page
  2. Author finds admin in active collaborators list
  3. Author clicks "Demote to Collaborator"
  4. Admin's role changes to "Collaborator"
  5. User loses admin permissions
- **Expected Result**: Admin becomes regular collaborator with limited permissions
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can demote admin to collaborator"

### 10. Author Removes Collaborator

- **Scenario**: Author removes a collaborator from the amendment
- **Steps**:
  1. Author navigates to collaborators page
  2. Author finds collaborator in active collaborators list
  3. Author clicks "Remove" button
  4. Collaboration is deleted
  5. Collaborator loses editing access
  6. Collaborator count decreases
- **Expected Result**: Collaborator is removed and loses all access
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can remove collaborator from amendment"

### 11. Document Editing - Suggest Mode

- **Scenario**: Collaborator makes suggestions in suggest mode
- **Steps**:
  1. Collaborator navigates to amendment text editor
  2. Editor is in "Suggest" mode
  3. Collaborator makes text changes
  4. Changes appear as suggestions (tracked)
  5. Suggestions are highlighted and attributed to user
- **Expected Result**: Changes are tracked as suggestions, not direct edits
- **Covered in**: `amendment-editing.spec.ts` - "Collaborator can make suggestions in suggest mode"

### 12. Document Editing - Edit Mode

- **Scenario**: Author/Admin makes direct edits in edit mode
- **Steps**:
  1. Author navigates to amendment text editor
  2. Author switches to "Edit" mode
  3. Author makes text changes
  4. Changes are applied directly
  5. No suggestion tracking
- **Expected Result**: Changes are applied directly to document
- **Covered in**: `amendment-editing.spec.ts` - "Author can make direct edits in edit mode"

### 13. Document Editing - View Mode

- **Scenario**: User views amendment in view mode
- **Steps**:
  1. User navigates to amendment text
  2. Document is in "View" mode
  3. User can read content
  4. No editing controls visible
  5. Suggestions are visible but cannot be modified
- **Expected Result**: Document is read-only in view mode
- **Covered in**: `amendment-editing.spec.ts` - "User can view document in view mode"

### 14. Mode Switching

- **Scenario**: Author/Collaborator switches between editing modes
- **Steps**:
  1. User navigates to amendment text editor
  2. User clicks mode selector
  3. User selects different mode (View/Suggest/Edit)
  4. Editor updates to selected mode
  5. Controls update based on permissions
- **Expected Result**: Mode switches successfully with appropriate controls
- **Covered in**: `amendment-editing.spec.ts` - "User can switch between editing modes"

### 15. Create Change Request from Suggestion

- **Scenario**: Collaborator creates formal change request from suggestion
- **Steps**:
  1. Collaborator makes suggestion in document
  2. Suggestion has discussion thread
  3. Collaborator clicks "Create Change Request"
  4. Dialog opens with pre-filled data
  5. Collaborator enters title, description, justification
  6. Change request is created
  7. Voting begins if required
- **Expected Result**: Change request is created and linked to suggestion
- **Covered in**: `amendment-change-requests.spec.ts` - "Collaborator can create change request from suggestion"

### 16. Vote on Change Request - Accept

- **Scenario**: Collaborator votes to accept a change request
- **Steps**:
  1. Collaborator navigates to change requests page
  2. Collaborator sees pending change request
  3. Collaborator reviews proposed changes
  4. Collaborator clicks "Accept" button
  5. Vote is recorded
  6. Vote count updates
- **Expected Result**: Vote is recorded as "accept"
- **Covered in**: `amendment-change-requests.spec.ts` - "Collaborator can vote to accept change request"

### 17. Vote on Change Request - Reject

- **Scenario**: Collaborator votes to reject a change request
- **Steps**:
  1. Collaborator navigates to change requests page
  2. Collaborator sees pending change request
  3. Collaborator reviews proposed changes
  4. Collaborator clicks "Reject" button
  5. Vote is recorded
  6. Vote count updates
- **Expected Result**: Vote is recorded as "reject"
- **Covered in**: `amendment-change-requests.spec.ts` - "Collaborator can vote to reject change request"

### 18. Vote on Change Request - Abstain

- **Scenario**: Collaborator abstains from voting on change request
- **Steps**:
  1. Collaborator navigates to change requests page
  2. Collaborator sees pending change request
  3. Collaborator clicks "Abstain" button
  4. Vote is recorded
  5. Vote count updates
- **Expected Result**: Vote is recorded as "abstain"
- **Covered in**: `amendment-change-requests.spec.ts` - "Collaborator can abstain from change request vote"

### 19. Change Vote

- **Scenario**: Collaborator changes their vote on a change request
- **Steps**:
  1. Collaborator has already voted
  2. Collaborator navigates to change request
  3. Collaborator clicks different vote option
  4. Confirm dialog appears
  5. Collaborator confirms vote change
  6. Vote is updated
- **Expected Result**: Vote is changed successfully
- **Covered in**: `amendment-change-requests.spec.ts` - "Collaborator can change vote on change request"

### 20. Automatic Change Request Resolution

- **Scenario**: Change request is automatically accepted when all collaborators vote accept
- **Steps**:
  1. Change request has 3 collaborators
  2. All 3 vote "accept"
  3. System automatically applies change to document
  4. Change request status changes to "accepted"
  5. Suggestion is marked as resolved
- **Expected Result**: Change is applied automatically and marked as accepted
- **Covered in**: `amendment-change-requests.spec.ts` - "Change request auto-applies when all vote accept"

### 21. Automatic Change Request Rejection

- **Scenario**: Change request is automatically rejected when majority vote reject
- **Steps**:
  1. Change request has 5 collaborators
  2. 3 vote "reject", 2 vote "accept"
  3. Change request status changes to "rejected"
  4. Change is not applied
  5. Suggestion remains for reference
- **Expected Result**: Change is rejected and not applied
- **Covered in**: `amendment-change-requests.spec.ts` - "Change request auto-rejects when majority vote reject"

### 22. View Change Request Vote Status

- **Scenario**: Users can view voting progress on change request
- **Steps**:
  1. User navigates to change request
  2. Vote status is displayed
  3. Shows who has voted (accept/reject/abstain)
  4. Shows who hasn't voted yet
  5. Progress bar or count is visible
- **Expected Result**: Voting status is clearly displayed
- **Covered in**: `amendment-change-requests.spec.ts` - "User can view change request vote status"

### 23. Discussion Threads on Suggestions

- **Scenario**: Collaborators can discuss suggestions
- **Steps**:
  1. User makes suggestion
  2. Other collaborator adds comment to suggestion
  3. Discussion thread appears
  4. Multiple collaborators can participate
  5. Avatars and names are shown
- **Expected Result**: Discussion threads work for collaboration
- **Covered in**: `amendment-discussions.spec.ts` - "Collaborators can discuss suggestions"

### 24. Version Control - View History

- **Scenario**: Users can view document version history
- **Steps**:
  1. User navigates to amendment text page
  2. User clicks "Version History" button
  3. List of versions appears
  4. Each version shows timestamp and author
  5. User can compare versions
- **Expected Result**: Version history is accessible
- **Covered in**: `amendment-version-control.spec.ts` - "User can view version history"

### 25. Role Creation for Amendment

- **Scenario**: Author creates custom role for amendment
- **Steps**:
  1. Author navigates to Roles tab
  2. Author clicks "Add Role"
  3. Dialog opens
  4. Author enters role name and description
  5. Author clicks "Create Role"
  6. Role appears in roles list
  7. Role available for assignment
- **Expected Result**: New role is created
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can create new role"

### 26. Role Deletion for Amendment

- **Scenario**: Author deletes a custom role
- **Steps**:
  1. Author navigates to Roles tab
  2. Author finds role to delete
  3. Author clicks delete icon
  4. Role is removed
  5. Collaborators with that role are updated
- **Expected Result**: Role is deleted
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can delete role"

### 27. Action Rights Assignment for Amendment Role

- **Scenario**: Author assigns action rights to a role
- **Steps**:
  1. Author navigates to Roles tab
  2. Author sees action rights matrix
  3. Author toggles checkboxes for permissions (view, update, delete documents, etc.)
  4. Permissions are saved
  5. Collaborators with that role gain/lose permissions
- **Expected Result**: Role permissions are updated
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can assign action rights to role"

### 28. Collaborator Count Accuracy

- **Scenario**: Collaborator count displays correctly
- **Steps**:
  1. Count only includes status "member" and "admin"
  2. Excludes "invited" and "requested" statuses
  3. Updates in real-time when collaborators join/leave
- **Expected Result**: Accurate collaborator count at all times
- **Covered in**: `amendment-collaboration.spec.ts` - "Collaborator count updates accurately"

### 29. Access Control for Non-Collaborators

- **Scenario**: Non-collaborators cannot access collaboration features
- **Steps**:
  1. Non-collaborator tries to access /amendment/[id]/collaborators
  2. Access is denied
  3. User sees "Access Denied" message
  4. Collaboration buttons are not visible
- **Expected Result**: Collaboration features are protected
- **Covered in**: `amendment-collaboration.spec.ts` - "Non-collaborator cannot access collaboration management"

### 30. Public vs Private Amendment Access

- **Scenario**: Amendment visibility controls work correctly
- **Steps**:
  1. Author creates private amendment
  2. Non-collaborator cannot view
  3. Author changes to public
  4. Non-collaborator can view (read-only)
  5. Only collaborators can edit
- **Expected Result**: Visibility controls work as expected
- **Covered in**: `amendment-collaboration.spec.ts` - "Amendment visibility controls work correctly"

### 31. Search and Filter Collaborators

- **Scenario**: Author searches for collaborators
- **Steps**:
  1. Author enters search term in collaborators page
  2. Results filter by name, handle, role, or status
  3. Results update in real-time
- **Expected Result**: Relevant collaborators are shown
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can search collaborators"

### 32. Loading States for Collaboration Actions

- **Scenario**: UI shows loading states during operations
- **Steps**:
  1. User performs action (join, leave, vote, etc.)
  2. Button shows loading state
  3. Button is disabled during operation
  4. Loading completes and UI updates
- **Expected Result**: User gets feedback during async operations
- **Covered in**: `amendment-collaboration.spec.ts` - "Loading states display during collaboration operations"

### 33. Duplicate Request Prevention

- **Scenario**: System prevents duplicate collaboration requests
- **Steps**:
  1. User requests to collaborate
  2. User tries to request again
  3. System prevents duplicate request
  4. Only one request exists
- **Expected Result**: No duplicate requests created
- **Covered in**: `amendment-collaboration.spec.ts` - "Duplicate collaboration request prevention"

### 34. Document Title Auto-Save

- **Scenario**: Document title auto-saves after editing
- **Steps**:
  1. Collaborator edits document title
  2. User pauses typing
  3. Title auto-saves after delay
  4. Save indicator appears
  5. Changes persist on page reload
- **Expected Result**: Title changes are auto-saved
- **Covered in**: `amendment-editing.spec.ts` - "Document title auto-saves"

### 35. Withdraw Invitation

- **Scenario**: Author withdraws a pending collaboration invitation
- **Steps**:
  1. Author navigates to collaborators page
  2. Author sees pending invitations list
  3. Author clicks "Withdraw Invitation"
  4. Invitation is deleted
  5. User can no longer accept invitation
- **Expected Result**: Invitation is removed
- **Covered in**: `amendment-collaboration.spec.ts` - "Author can withdraw invitation"

## Test Coverage Summary

### Unit Tests (Vitest)

- `useAmendmentCollaboration.test.ts`: Tests hook logic for all collaboration operations
- `AmendmentCollaborationButton.test.tsx`: Tests button component states and actions
- `amendments.store.test.ts`: Tests amendment store filtering and search
- `document-editor.test.tsx`: Tests document editing functionality
- `change-requests.test.ts`: Tests change request voting logic
- `discussion-threads.test.ts`: Tests discussion thread functionality

### E2E Tests (Playwright)

- `amendment-collaboration.spec.ts`: Tests collaboration flows end-to-end
- `amendment-editing.spec.ts`: Tests document editing modes
- `amendment-change-requests.spec.ts`: Tests change request creation and voting
- `amendment-discussions.spec.ts`: Tests discussion threads
- `amendment-version-control.spec.ts`: Tests version history

## Edge Cases Covered

1. Multiple collaboration requests for same user
2. Unauthenticated user access
3. Non-collaborator access restrictions
4. Duplicate request prevention
5. Collaborator count accuracy
6. Role assignment to collaborators
7. Permission inheritance from roles
8. Invitation acceptance/decline
9. Request cancellation
10. Author self-removal (should be prevented)
11. Concurrent editing conflicts
12. Vote changes after initial submission
13. Orphaned change requests
14. Suggestion without linked change request
15. Document title auto-save
16. Mode switching permissions

## Future Test Considerations

1. Email notifications for invitations and votes
2. Push notifications for change request approvals
3. Real-time collaborative editing (WebSocket)
4. Merge conflict resolution
5. Comment threading and replies
6. @mentions in discussions
7. Bulk operations on change requests
8. Export amendment as PDF/Word
9. Import amendments from external sources
10. Amendment templates
11. Scheduled auto-publish
12. Amendment versioning and branching
13. Track changes visualization
14. Compare different versions side-by-side
15. Rollback to previous version
