# Amendments Feature - Comprehensive Test Plan

## Application Overview

The Amendments feature in Polity is a comprehensive legislative document management system. It supports collaborative document editing, change request workflows, voting systems, version control, and process management. Key functionality includes:

- **Amendment Creation**: Create amendments with title, subtitle, code, dates, visibility
- **Collaboration System**: Request/invite collaborators, roles (author/admin/collaborator), access control
- **Document Editing**: Rich text editor with three modes (suggest/edit/view), real-time collaboration
- **Change Requests**: Propose changes requiring voting, discussion threads, vote tracking
- **Voting System**: Accept/reject/abstain votes, thresholds, automatic decisions
- **Version Control**: Save versions, restore previous versions, version history
- **Process Flow**: Link to groups/events, target group selection, status tracking
- **Discussion**: Comment threads on suggestions and change requests
- **Integration**: Timeline events, search, calendar, group association

## Test Scenarios

### 1. Create Basic Amendment

**Seed:** `e2e/seed.spec.ts`

#### 1.1 Create Amendment with Required Fields

**Steps:**

1. Navigate to `/create` page
2. Select "Amendment" entity type
3. Enter title "Climate Action Amendment 2024"
4. Enter subtitle
5. Click "Create" button

**Expected Results:**

- Amendment created with unique ID
- User redirected to amendment page
- User automatically set as author
- Document created and linked
- Amendment visible based on visibility settings

#### 1.2 Create Amendment with Full Details

**Steps:**

1. Create amendment
2. Enter all fields: title, subtitle, code, date, tags
3. Upload image
4. Set visibility
5. Add hashtags
6. Click Create

**Expected Results:**

- Amendment created with all metadata
- Image uploaded successfully
- Visibility enforced
- Code stored for reference
- Tags associated

### 2. Amendment Visibility Control

#### 2.1 Public Amendment Access

**Steps:**

1. Create public amendment
2. Log out
3. Access amendment URL

**Expected Results:**

- Amendment visible to all
- Document viewable in read-only mode
- Collaboration requires authentication
- Clear public indicator

#### 2.2 Private Amendment Access

**Steps:**

1. Create private amendment
2. Switch to non-collaborator user
3. Attempt access

**Expected Results:**

- Access denied
- Clear error message
- Not visible in search
- Only collaborators can access

#### 2.3 Authenticated-Only Amendment

**Steps:**

1. Create with "authenticated" visibility
2. Test access levels

**Expected Results:**

- Unauthenticated users blocked
- Any authenticated user can view
- Collaboration still requires approval

### 3. Collaboration Management

**Note:** Detailed collaboration flow scenarios (request to collaborate, cancel request, accept invitation, leave collaboration, author management actions) and document editing modes are covered comprehensively in [amendment-collaboration-test-plan.md](amendment-collaboration-test-plan.md).

**Reference:** See amendment-collaboration-test-plan.md for:

- Request to collaborate flow
- Cancel collaboration request
- Accept collaboration invitation
- Leave collaboration
- Author approve/reject collaboration requests
- Author invite collaborators
- Author promote/demote collaborators
- Author remove collaborators
- Author withdraw invitations
- Document editing modes (suggest/edit/view)
- Mode switching

### 4. Change Request System

#### 4.1 Create Change Request

**Steps:**

1. Navigate to `/amendment/[id]/change-requests`
2. Click "Create Change Request"
3. Enter title, description, proposed change, justification
4. Set voting parameters
5. Submit

**Expected Results:**

- ChangeRequest created
- Status: "pending"
- Voting configured
- Collaborators notified
- Appears in change requests list

#### 4.2 Vote Accept on Change Request

**Steps:**

1. Collaborator views change request
2. Click "Accept" vote
3. Confirm vote

**Expected Results:**

- ChangeRequestVote created with vote: "accept"
- Vote count updated
- Vote visible to all
- Cannot vote again

#### 4.3 Vote Reject on Change Request

**Steps:**

1. Collaborator views change request
2. Click "Reject" vote

**Expected Results:**

- Vote created with vote: "reject"
- Rejection count increases
- Vote recorded
- User cannot vote again

#### 4.4 Vote Abstain on Change Request

**Steps:**

1. Collaborator clicks "Abstain"
2. Confirm abstention

**Expected Results:**

- Vote created with vote: "abstain"
- Abstain count increases
- Not counted in decision
- Can change vote

#### 4.5 Change Vote

**Steps:**

1. User has voted "accept"
2. Click "Reject" instead
3. Vote updated

**Expected Results:**

- Existing vote updated
- Counts adjusted
- Only one vote per user
- Change reflected immediately

#### 4.6 Auto-Accept Unanimous

**Steps:**

1. All collaborators vote "accept"
2. Check change request status

**Expected Results:**

- Status automatically changes to "accepted"
- Change can be applied
- Collaborators notified
- Timeline event created

#### 4.7 Auto-Reject Majority

**Steps:**

1. Majority vote "reject"
2. Voting threshold reached

**Expected Results:**

- Status changes to "rejected"
- Change not applied
- Voting closed
- Collaborators notified

#### 4.8 View Vote Status

**Steps:**

1. View change request
2. Check vote breakdown

**Expected Results:**

- Accept/Reject/Abstain counts shown
- Percentage calculated
- Threshold indicator
- Who voted what (if transparent)
- Time remaining if deadline set

### 5. Discussion Threads

#### 5.1 Comment on Suggestion

**Steps:**

1. View suggestion in document
2. Click discussion icon
3. Add comment
4. Post

**Expected Results:**

- Comment added to suggestion's thread
- Comment count increases
- Participants notified
- Comment timestamped

#### 5.2 Reply to Comment in Thread

**Steps:**

1. View existing comment
2. Click reply
3. Post reply

**Expected Results:**

- Reply nested under comment
- Thread hierarchy maintained
- Original commenter notified
- Discussion continues

#### 5.3 Resolve Discussion

**Steps:**

1. Author marks discussion as resolved
2. Confirm resolution

**Expected Results:**

- Discussion marked resolved
- Collapsed by default
- Can be reopened
- Resolution noted in timeline

### 6. Version Control

#### 6.1 Save Version

**Steps:**

1. Navigate to version control
2. Click "Save Version"
3. Enter version name/description
4. Save

**Expected Results:**

- Version created with snapshot
- Timestamp recorded
- Version appears in history
- Document state preserved

#### 6.2 View Version History

**Steps:**

1. Open version history panel
2. Browse versions

**Expected Results:**

- All versions listed chronologically
- Version metadata shown (name, author, date)
- Comparison available
- Restore option visible

#### 6.3 Restore Previous Version

**Steps:**

1. Select version from history
2. Click "Restore"
3. Confirm restoration

**Expected Results:**

- Document reverted to selected version
- New version created (restore event)
- All collaborators notified
- Undo option available

### 7. Amendment Process Flow

#### 7.1 Navigate Process Flow

**Steps:**

1. Navigate to `/amendment/[id]/process`
2. View network visualization
3. Select target group

**Expected Results:**

- Group network displayed
- Selection interface clear
- Target group saved
- Process status updated

#### 7.2 Link to Event

**Steps:**

1. In process flow
2. Select event for amendment
3. Confirm linkage

**Expected Results:**

- Amendment linked to event
- Appears in event agenda
- Timeline updated
- Scheduling coordinated

### 8. Amendment Search and Discovery

#### 8.1 Search Amendments by Title

**Steps:**

1. Navigate to search
2. Type amendment title
3. Filter by "Amendments"

**Expected Results:**

- Matching amendments shown
- Results sorted by relevance
- Amendment cards with key info
- Clickable to view

#### 8.2 Filter by Hashtag

**Steps:**

1. Click hashtag on amendment
2. View results

**Expected Results:**

- All amendments with tag shown
- Other entities also shown
- Filterable by type
- Tag highlighted

#### 8.3 Filter by Group

**Steps:**

1. Navigate to group page
2. View amendments section

**Expected Results:**

- Group's amendments listed
- Sorted by date/status
- Clickable cards
- Count accurate

### 9. Amendment Status Management

#### 9.1 Update Amendment Status

**Steps:**

1. Author updates status field
2. Change from "draft" to "submitted"

**Expected Results:**

- Status updated
- Visual indicator changes
- Collaborators notified
- Timeline event created
- Search filters updated

### 10. Collaborator Count Accuracy

#### 10.1 Accurate Count

**Steps:**

1. Add/remove collaborators
2. Monitor count

**Expected Results:**

- Only counts status "member" and "admin"
- Excludes "invited" and "requested"
- Updates in real-time
- Matches actual list

### 11. Amendment Text Auto-Save

#### 11.1 Auto-Save Document Changes

**Steps:**

1. Edit document text
2. Wait for auto-save
3. Refresh page

**Expected Results:**

- Changes saved automatically
- No data loss
- Save indicator shown
- Debounced saves (not every keystroke)

### 12. Change Request Voting Thresholds

#### 12.1 Custom Threshold

**Steps:**

1. Create change request with 75% threshold
2. Have collaborators vote

**Expected Results:**

- Threshold enforced correctly
- Decision made when threshold reached
- Partial progress shown
- Clear threshold indicator

### 13. Amendment Deletion

#### 13.1 Delete Amendment

**Steps:**

1. Author navigates to settings
2. Click "Delete Amendment"
3. Confirm with warning

**Expected Results:**

- Amendment and all data deleted
- Collaborators notified
- Removed from search
- Associated documents deleted
- Cannot be recovered

### 14. Amendment Timeline Integration

#### 14.1 Creation Timeline Event

**Steps:**

1. Create amendment
2. Check timeline

**Expected Results:**

- Timeline event created
- Event type: "created"
- Visible to followers
- Links to amendment

#### 14.2 Update Timeline Event

**Steps:**

1. Update amendment
2. Check timeline

**Expected Results:**

- Update event created
- Shows what changed
- Visible to subscribers

### 15. Amendment Supporter Tracking

#### 15.1 Track Supporters

**Steps:**

1. Users support amendment
2. Check supporter count

**Expected Results:**

- Count increments
- Supporters listed
- Support can be withdrawn
- Count accurate

### 16. Amendment Code System

#### 16.1 Assign Amendment Code

**Steps:**

1. Create/edit amendment
2. Enter code (e.g., "A-2024-001")
3. Save

**Expected Results:**

- Code stored
- Code displayed prominently
- Searchable by code
- Unique validation if applicable

### 17. Amendment Role Permissions

#### 17.1 Author Permissions

**Steps:**

1. Author accesses all features
2. Verify full control

**Expected Results:**

- Can edit in all modes
- Can manage collaborators
- Can delete amendment
- Can manage change requests

#### 17.2 Admin Permissions

**Steps:**

1. Admin user tests permissions
2. Verify capabilities

**Expected Results:**

- Can edit in edit mode
- Can manage some collaborators
- Cannot delete amendment
- Can manage change requests

#### 17.3 Collaborator Permissions

**Steps:**

1. Regular collaborator tests access
2. Verify limitations

**Expected Results:**

- Can only suggest edits
- Cannot manage collaborators
- Cannot delete
- Can vote on change requests

### 18. Amendment Loading States

#### 18.1 Amendment Page Loading

**Steps:**

1. Navigate to amendment
2. Observe loading

**Expected Results:**

- Loading indicator shown
- Skeleton UI displayed
- Smooth transition
- No layout shift

#### 18.2 Document Loading

**Steps:**

1. Open document editor
2. Wait for content load

**Expected Results:**

- Editor loads smoothly
- Content rendered properly
- Controls available when ready
- No flickering

### 19. Amendment Error Handling

#### 19.1 Amendment Not Found

**Steps:**

1. Access invalid amendment ID
2. View error page

**Expected Results:**

- Clear error message
- Explanation
- Navigation options
- No broken UI

#### 19.2 Permission Denied

**Steps:**

1. Non-collaborator accesses private amendment
2. View error

**Expected Results:**

- Access denied message
- Explanation of privacy
- Request option shown
- Redirect available

### 20. Amendment Change Request Discussion

#### 20.1 Discuss Change Request

**Steps:**

1. View change request
2. Add discussion comment
3. Engage in thread

**Expected Results:**

- Comments appear
- Thread maintained
- Participants notified
- Influences voting

### 21. Amendment Duplicate Prevention

#### 21.1 Prevent Duplicate Requests

**Steps:**

1. User requests collaboration
2. Attempt to request again

**Expected Results:**

- System prevents duplicate
- Error message shown
- Only one request exists

### 22. Amendment Search Within Collaborators

#### 22.1 Search Collaborators

**Steps:**

1. Navigate to collaborators page
2. Use search to find collaborator

**Expected Results:**

- Search filters list
- Works on name/handle
- Results update in real-time
- Clear search functionality

### 23. Amendment Document Title Auto-Save

#### 23.1 Auto-Save Title Changes

**Steps:**

1. Edit amendment title in document
2. Wait for auto-save

**Expected Results:**

- Title saved automatically
- Amendment title updated
- Debounced save
- Save indicator shown

### 24. Amendment Process Status Tracking

#### 24.1 Track Process Progress

**Steps:**

1. View amendment process flow
2. Check status indicators

**Expected Results:**

- Current step highlighted
- Completed steps marked
- Next steps indicated
- Progress percentage shown

### 25. Amendment Voting Start/End Times

#### 25.1 Set Voting Period

**Steps:**

1. Create change request
2. Set voting start and end times
3. Monitor voting window

**Expected Results:**

- Voting only allowed in window
- Countdown shown
- Automatic close at end time
- Decision made when window closes

### 26. Amendment Visibility Toggle

#### 26.1 Change Visibility

**Steps:**

1. Author changes from public to private
2. Save changes

**Expected Results:**

- Visibility updated immediately
- Non-collaborators lose access
- Search results updated
- Collaborators notified

### 27. Amendment Hashtags Display

#### 27.1 Display Amendment Hashtags

**Steps:**

1. View amendment with hashtags
2. Check display

**Expected Results:**

- Hashtags centered
- Clickable
- Colored appropriately
- Standard format

### 28. Amendment Collaborative Conflict Resolution

#### 28.1 Handle Concurrent Edits

**Steps:**

1. Two admins edit simultaneously
2. Both save changes

**Expected Results:**

- Conflict detection
- Merge or prompt resolution
- No data loss
- Clear conflict indicator

## Test Coverage Summary

### Unit Tests (Vitest)

- `useAmendmentCollaboration.test.ts`: Collaboration hook logic
- `useChangeRequest.test.ts`: Change request and voting
- `AmendmentProcessFlow.test.tsx`: Process flow component
- `amendments.store.test.ts`: Amendment store and filtering

### E2E Tests (Playwright)

- `amendment-collaboration.spec.ts`: All collaboration scenarios (35 files created)
- `amendment-creation.spec.ts`: Amendment creation
- `amendment-editing.spec.ts`: Document editing modes
- `amendment-change-requests.spec.ts`: Change request flows
- `amendment-voting.spec.ts`: Voting system
- `amendment-version-control.spec.ts`: Version management

## Edge Cases Covered

1. Simultaneous edit conflicts
2. Voting threshold edge cases
3. Last admin demotion prevention
4. Orphaned amendments
5. Change request with no voters
6. Version history limits
7. Discussion thread depth
8. Auto-save failures
9. Concurrent collaboration requests
10. Document size limits
11. Suggestion overflow
12. Vote changing near deadline
13. Network visualization performance
14. Complex group hierarchies
15. Multi-author attribution

## Future Test Considerations

1. Amendment templates
2. Amendment comparison/diff tool
3. Advanced voting mechanisms (ranked choice, etc.)
4. Amendment import/export
5. Integration with external legislative systems
6. Automated clause numbering
7. Legal citation linking
8. Amendment dependencies/prerequisites
9. Multi-language support
10. Advanced analytics and reporting
