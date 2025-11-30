# Election Candidates Feature - Comprehensive Test Plan

## Application Overview

The Election Candidates feature in Polity enables comprehensive management of candidates in electoral processes. Key functionality includes:

- **Candidate Registration**: Create candidates with name, description, image, order
- **Election Association**: Link candidates to elections
- **Voting Integration**: Candidates receive votes in election voting system
- **Information Management**: Store and display candidate details, platforms, qualifications
- **Ordering and Display**: Control display order, featured candidates
- **Results Tracking**: Track votes received, win/loss status
- **Integration**: Links to elections, groups, positions, users

## Test Scenarios

### 1. Create Basic Election Candidate

**Seed:** `e2e/seed.spec.ts`

#### 1.1 Create Candidate with Required Fields

**Steps:**

1. Navigate to election management
2. Click "Add Candidate"
3. Enter name "Jane Smith"
4. Enter description/platform
5. Click "Create"

**Expected Results:**

- Candidate created with unique ID
- Linked to election
- Name and description saved
- Appears in candidates list
- Order assigned automatically

#### 1.2 Create Candidate with All Fields

**Steps:**

1. Create candidate
2. Fill all fields: name, description, imageURL, order
3. Upload candidate photo
4. Set display order
5. Save

**Expected Results:**

- All fields saved correctly
- Image uploaded and displayed
- Order position set
- Full profile available

### 2. Candidate Information Management

#### 2.1 Add Candidate Platform

**Steps:**

1. Create/edit candidate
2. Enter detailed platform description
3. Include policy positions
4. Save

**Expected Results:**

- Platform text saved
- Formatted correctly
- Displayed on candidate page
- Searchable

#### 2.2 Add Candidate Qualifications

**Steps:**

1. Edit candidate
2. Add qualifications/biography
3. Include credentials
4. Save

**Expected Results:**

- Qualifications stored
- Displayed in profile
- Enhances voter information
- Professional presentation

#### 2.3 Upload Candidate Image

**Steps:**

1. Create/edit candidate
2. Upload profile photo
3. Save

**Expected Results:**

- Image uploaded successfully
- Image displayed in candidate card
- Proper sizing and cropping
- Accessible URL stored

### 3. Candidate Ordering and Display

#### 3.1 Set Candidate Display Order

**Steps:**

1. Multiple candidates exist
2. Set order numbers (1, 2, 3, etc.)
3. View candidates list

**Expected Results:**

- Candidates displayed in order
- Order numbers visible to organizers
- Consistent ordering across views
- Order editable

#### 3.2 Reorder Candidates

**Steps:**

1. Change candidate order from 3 to 1
2. Save changes

**Expected Results:**

- Order updated
- Other candidates re-sequenced
- Display updates immediately
- Changes saved

#### 3.3 Alphabetical Ordering Option

**Steps:**

1. Toggle alphabetical ordering
2. View candidates

**Expected Results:**

- Candidates sorted by name
- Order overrides manual ordering
- Consistent sort
- Toggle clearly indicated

### 4. Candidate Voting Integration

#### 4.1 Vote for Candidate

**Steps:**

1. Voter views election
2. Select candidate
3. Cast vote
4. Confirm

**Expected Results:**

- ElectionVote created
- Linked to candidate
- Vote counted
- Voter can see vote recorded

#### 4.2 Change Vote to Different Candidate

**Steps:**

1. Voter has voted for Candidate A
2. Change vote to Candidate B
3. Confirm change

**Expected Results:**

- Previous vote updated or new vote created
- Vote count adjusted for both candidates
- Only one vote per voter (if single choice)
- Change reflected immediately

#### 4.3 Withdraw Vote for Candidate

**Steps:**

1. Voter has voted for candidate
2. Withdraw/cancel vote
3. Confirm

**Expected Results:**

- Vote deleted
- Candidate vote count decreases
- Voter can vote again
- Change tracked

### 5. Candidate Vote Counting

#### 5.1 Display Vote Count

**Steps:**

1. Multiple voters vote for candidate
2. View candidate card
3. Check vote count

**Expected Results:**

- Accurate vote count displayed
- Updates in real-time
- Count increments correctly
- No duplicate counting

#### 5.2 Calculate Vote Percentage

**Steps:**

1. Election has multiple candidates
2. Votes distributed
3. View percentages

**Expected Results:**

- Percentage calculated correctly
- Based on total valid votes
- Updates dynamically
- Visual representation (bar/pie chart)

#### 5.3 Determine Winner

**Steps:**

1. Election voting closes
2. Calculate results
3. Determine winner(s)

**Expected Results:**

- Winner identified correctly
- Based on majority type (simple, absolute, plurality)
- Ties handled appropriately
- Winner indicator displayed

### 6. Candidate Display in Election

#### 6.1 View Candidates List

**Steps:**

1. Navigate to election page
2. View candidates section

**Expected Results:**

- All candidates displayed
- Name, image, description visible
- Vote count shown (if allowed)
- Clickable to view full profile

#### 6.2 View Candidate Details

**Steps:**

1. Click on candidate card
2. View full profile

**Expected Results:**

- Full name and photo
- Complete platform/description
- Vote count if public
- Any linked documents
- Back to election button

### 7. Candidate Creation Restrictions

#### 7.1 Election Organizer Can Add Candidates

**Steps:**

1. Login as election organizer
2. Add candidate

**Expected Results:**

- Full access to create
- Can set all fields
- Can manage all candidates
- Changes immediate

#### 7.2 Non-Organizer Cannot Add Candidates

**Steps:**

1. Login as regular user/voter
2. Attempt to add candidate

**Expected Results:**

- Add button not visible
- Direct access denied
- Error message if attempted
- Election integrity protected

### 8. Candidate Editing

#### 8.1 Edit Candidate Information

**Steps:**

1. Organizer edits candidate
2. Update name, description, image
3. Save changes

**Expected Results:**

- Changes saved successfully
- Updates visible immediately
- Voters notified if significant
- Version history tracked if applicable

#### 8.2 Cannot Edit During Active Voting

**Steps:**

1. Voting is active
2. Attempt to edit candidate
3. Check restriction

**Expected Results:**

- Editing restricted or warning shown
- Prevents vote manipulation
- Clear messaging
- Edit available after voting ends

### 9. Candidate Deletion

#### 9.1 Delete Candidate Before Voting

**Steps:**

1. Organizer deletes candidate
2. No votes cast yet
3. Confirm deletion

**Expected Results:**

- Candidate deleted
- Removed from candidates list
- No impact on election
- Cannot be recovered

#### 9.2 Cannot Delete Candidate with Votes

**Steps:**

1. Candidate has received votes
2. Attempt to delete

**Expected Results:**

- Deletion prevented
- Warning message shown
- Suggests withdrawing instead
- Vote integrity protected

#### 9.3 Withdraw Candidate

**Steps:**

1. Mark candidate as withdrawn
2. Candidate removed from active voting
3. Votes handled

**Expected Results:**

- Status changed to "withdrawn"
- Not selectable for new votes
- Existing votes may be redistributed or invalidated
- Historical record maintained

### 10. Multiple Candidate Selection (Multi-Choice Elections)

#### 10.1 Select Multiple Candidates

**Steps:**

1. Election allows multiple selections
2. Voter selects 3 candidates
3. Cast vote

**Expected Results:**

- All selections recorded
- maxSelections enforced
- Cannot exceed limit
- All votes counted

#### 10.2 Enforce Maximum Selections

**Steps:**

1. Election has maxSelections: 2
2. Voter attempts to select 3
3. Check validation

**Expected Results:**

- Third selection prevented
- Error message shown
- Must deselect before adding
- Limit clearly indicated

### 11. Candidate Search and Filter

#### 11.1 Search Candidates by Name

**Steps:**

1. Election with many candidates
2. Search by name
3. View results

**Expected Results:**

- Matching candidates shown
- Search works on name
- Results highlighted
- Clear search interface

#### 11.2 Filter by Status

**Steps:**

1. Filter candidates (active/withdrawn)
2. View filtered list

**Expected Results:**

- Only candidates with selected status shown
- Filter clearly indicated
- Can clear filter
- Useful for management

### 12. Candidate Nomination Process

#### 12.1 Self-Nominate as Candidate

**Steps:**

1. User clicks "Nominate Myself"
2. Fill candidate information
3. Submit nomination

**Expected Results:**

- ElectionCandidate created with status "pending"
- Organizer receives nomination
- Appears in pending nominations
- User cannot nominate again

#### 12.2 Approve Nomination

**Steps:**

1. Organizer views pending nominations
2. Click "Approve"
3. Candidate approved

**Expected Results:**

- Status changes to "approved" or active
- Candidate appears in election
- User notified of approval
- Can now receive votes

#### 12.3 Reject Nomination

**Steps:**

1. Organizer reviews nomination
2. Click "Reject"
3. Provide reason

**Expected Results:**

- Nomination rejected
- User notified with reason
- Removed from pending
- User can re-nominate if allowed

### 13. Candidate Endorsements

#### 13.1 Endorse Candidate

**Steps:**

1. User endorses candidate
2. Endorsement recorded
3. Displayed on candidate profile

**Expected Results:**

- Endorsement saved
- Endorsement count increases
- Endorsers listed if public
- Distinguishable from votes

#### 13.2 Withdraw Endorsement

**Steps:**

1. User has endorsed candidate
2. Withdraw endorsement
3. Confirm

**Expected Results:**

- Endorsement removed
- Count decreases
- User removed from endorsers list
- Can endorse again

### 14. Candidate Comparison

#### 14.1 Compare Multiple Candidates

**Steps:**

1. Select 2+ candidates
2. Click "Compare"
3. View comparison view

**Expected Results:**

- Side-by-side comparison
- Key attributes highlighted
- Platforms compared
- Vote counts if available
- Helps informed voting

### 15. Candidate Timeline Integration

#### 15.1 Candidate Added Timeline Event

**Steps:**

1. Candidate added to election
2. Check timeline

**Expected Results:**

- Timeline event created
- Event type: "candidate_added"
- Links to election and candidate
- Visible to election subscribers

### 16. Candidate Notifications

#### 16.1 Notify of New Candidate

**Steps:**

1. Organizer adds candidate
2. Election subscribers check notifications

**Expected Results:**

- Notification sent
- Includes candidate info
- Link to election
- Notification type: "election_updated"

### 17. Candidate Image Validation

#### 17.1 Upload Valid Image

**Steps:**

1. Upload JPG/PNG image
2. Proper size
3. Save

**Expected Results:**

- Image accepted
- Displayed correctly
- Stored efficiently
- Accessible URL

#### 17.2 Reject Invalid Image

**Steps:**

1. Upload unsupported format or oversized file
2. Attempt to save

**Expected Results:**

- Validation error
- Clear error message
- Supported formats listed
- Size limit indicated

### 18. Candidate Vote Privacy

#### 18.1 Anonymous Voting

**Steps:**

1. Election configured for anonymous voting
2. User votes for candidate
3. Check vote privacy

**Expected Results:**

- Vote recorded
- Voter identity not linked publicly
- Results show counts only
- Privacy protected

#### 18.2 Public Voting

**Steps:**

1. Election configured for public voting
2. User votes for candidate
3. Check vote visibility

**Expected Results:**

- Vote and voter both visible
- Transparency maintained
- Who voted for whom shown
- User aware of public nature

### 19. Candidate Results Display

#### 19.1 Display Election Results

**Steps:**

1. Voting ends
2. View results page
3. Check candidate rankings

**Expected Results:**

- All candidates listed
- Ordered by vote count
- Percentages shown
- Winner highlighted
- Visual charts/graphs

### 20. Candidate Disqualification

#### 20.1 Disqualify Candidate

**Steps:**

1. Organizer disqualifies candidate
2. Provide reason
3. Apply disqualification

**Expected Results:**

- Status changed to "disqualified"
- Cannot receive new votes
- Existing votes handled per rules
- Historical record kept
- All voters notified

### 21. Candidate Runoff Elections

#### 21.1 Proceed to Runoff

**Steps:**

1. No candidate reaches threshold
2. Top 2 candidates selected for runoff
3. New election created

**Expected Results:**

- Runoff election created
- Only top candidates included
- Linked to original election
- New voting period

### 22. Candidate Export

#### 22.1 Export Candidate List

**Steps:**

1. Organizer exports candidates
2. Select format (CSV/PDF)
3. Download

**Expected Results:**

- All candidates included
- All details exported
- Proper formatting
- Usable for offline

### 23. Candidate Bulk Operations

#### 23.1 Bulk Add Candidates

**Steps:**

1. Upload CSV with candidate list
2. Process import
3. Validate

**Expected Results:**

- All candidates added
- Validation for duplicates
- Error handling for invalid entries
- Confirmation summary

#### 23.2 Bulk Update Candidates

**Steps:**

1. Select multiple candidates
2. Apply bulk update (e.g., add tag)
3. Confirm

**Expected Results:**

- All selected candidates updated
- Changes applied consistently
- Single undo operation
- Efficient management

### 24. Candidate Position Linkage

#### 24.1 Link Candidate to Position

**Steps:**

1. Election is for specific position
2. Link candidates to position
3. Winner gets position

**Expected Results:**

- Position linked to election
- Winner automatically assigned to position
- Position holder updated
- Transition tracked

### 25. Candidate User Linkage

#### 25.1 Link Candidate to User Account

**Steps:**

1. Create candidate
2. Link to user account
3. User can manage their candidacy

**Expected Results:**

- User linked
- User can edit their candidate info
- User receives notifications
- User profile shows candidacy

### 26. Candidate Statement/Platform Formatting

#### 26.1 Rich Text Platform

**Steps:**

1. Edit candidate platform
2. Use rich text formatting (bold, lists, links)
3. Save

**Expected Results:**

- Formatting preserved
- Rendered correctly
- Links clickable
- Professional presentation

### 27. Candidate Debate Scheduling

#### 27.1 Link Debate Event to Candidates

**Steps:**

1. Create debate event
2. Link all candidates
3. Schedule

**Expected Results:**

- Event linked to election
- All candidates invited
- Debate info on candidate pages
- Calendar integration

### 28. Candidate Withdrawal Timing

#### 28.1 Withdraw Before Voting

**Steps:**

1. Candidate withdraws before voting starts
2. Mark as withdrawn

**Expected Results:**

- Removed from ballot
- No votes can be cast
- Announcement made
- Timeline updated

#### 28.2 Withdraw During Voting

**Steps:**

1. Voting is active
2. Candidate withdraws
3. Handle votes

**Expected Results:**

- Marked as withdrawn
- No new votes
- Existing votes handled per rules
- Voters notified

### 29. Candidate Diversity Tracking

#### 29.1 Track Candidate Demographics (Optional)

**Steps:**

1. Candidates optionally provide demographic info
2. Track for diversity reporting

**Expected Results:**

- Data collected if provided
- Privacy respected
- Aggregate statistics available
- Promotes inclusivity

### 30. Candidate Accessibility Features

#### 30.1 Candidate Info for Screen Readers

**Steps:**

1. Use screen reader to navigate candidates
2. Access all information

**Expected Results:**

- All content accessible
- Proper ARIA labels
- Images have alt text
- Navigation logical
- Inclusive design

## Test Coverage Summary

### Unit Tests (Vitest)

- `useElectionCandidates.test.ts`: Candidate management logic
- `CandidateCard.test.tsx`: Candidate display component
- `electionCandidates.store.test.ts`: Filtering and ordering
- `candidateVoting.test.ts`: Voting integration

### E2E Tests (Playwright)

- `election-candidate-creation.spec.ts`: Candidate creation flows
- `election-candidate-voting.spec.ts`: Voting for candidates
- `election-candidate-results.spec.ts`: Results display
- `election-candidate-nomination.spec.ts`: Nomination process
- `election-candidate-management.spec.ts`: Organizer actions

## Edge Cases Covered

1. Candidate with no votes
2. Tie vote scenarios
3. All candidates withdrawn
4. Candidate name duplicates
5. Very long platform text
6. Missing candidate image
7. Concurrent vote changes
8. Deletion attempt with votes
9. Nomination spam prevention
10. Invalid order numbers
11. Image upload failures
12. Vote count accuracy with concurrent voting
13. Runoff with multiple ties
14. Position assignment conflicts
15. User account deletion with active candidacy

## Future Test Considerations

1. Candidate Q&A forums
2. Automated debate transcripts
3. Social media integration
4. Campaign finance tracking
5. Candidate verification/authentication
6. Advanced analytics on candidate performance
7. Voter guide generation
8. Candidate video profiles
9. Real-time polling during campaign
10. Integration with government election systems
