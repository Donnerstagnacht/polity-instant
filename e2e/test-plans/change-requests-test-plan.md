# Change Requests Feature - Comprehensive Test Plan

## Application Overview

The Change Requests feature in Polity provides a comprehensive system for proposing, discussing, voting on, and implementing changes to amendments. It's central to collaborative document editing with democratic oversight. Key functionality includes:

- **Change Proposal**: Create requests with title, description, proposed change, justification
- **Voting System**: Collaborators vote accept/reject/abstain with configurable thresholds
- **Status Management**: Track status (pending, accepted, rejected, applied)
- **Discussion Threads**: Comment and discuss each change request
- **Auto-Decision**: Automatic acceptance/rejection based on voting thresholds
- **Amendment Integration**: Linked to specific amendments, applied to document
- **Timeline Tracking**: Voting periods, deadlines, decision timestamps
- **Permissions**: Creator and admin management of change requests

## Test Scenarios

### 1. Create Basic Change Request

**Seed:** `e2e/seed.spec.ts`

#### 1.1 Create Change Request with Required Fields

**Steps:**

1. Navigate to `/amendment/[id]/change-requests`
2. Click "Create Change Request"
3. Enter title "Update Section 3 Wording"
4. Enter description
5. Enter proposed change text
6. Submit

**Expected Results:**

- ChangeRequest created with unique ID
- Status: "pending"
- Linked to amendment
- Appears in change requests list
- Creator can track

#### 1.2 Create Change Request with Full Details

**Steps:**

1. Create change request
2. Fill all fields: title, description, proposedChange, justification
3. Set voting parameters (requiresVoting, votingThreshold, votingStartTime, votingEndTime)
4. Save

**Expected Results:**

- All fields saved correctly
- Voting configured
- Timeline set
- Collaborators notified

### 2. Change Request Voting System

#### 2.1 Vote Accept on Change Request

**Steps:**

1. Collaborator views change request
2. Click "Accept" vote button
3. Confirm vote

**Expected Results:**

- ChangeRequestVote created with vote: "accept"
- Vote count increases
- Vote visible in UI
- User cannot vote again

#### 2.2 Vote Reject on Change Request

**Steps:**

1. Collaborator views change request
2. Click "Reject" vote button
3. Confirm vote

**Expected Results:**

- ChangeRequestVote created with vote: "reject"
- Rejection count increases
- Vote recorded
- User's vote shown

#### 2.3 Vote Abstain on Change Request

**Steps:**

1. Collaborator clicks "Abstain" button
2. Confirm abstention

**Expected Results:**

- ChangeRequestVote created with vote: "abstain"
- Abstain count increases
- Not counted toward decision threshold
- Can change vote later

#### 2.4 Change Vote

**Steps:**

1. User has voted "accept"
2. Change to "reject"
3. Confirm change

**Expected Results:**

- Existing vote updated
- Counts adjusted (accept -1, reject +1)
- Only one vote per user maintained
- Change reflected immediately

#### 2.5 Withdraw Vote

**Steps:**

1. User has voted
2. Click to withdraw vote
3. Confirm

**Expected Results:**

- ChangeRequestVote deleted
- Vote count decreases
- User can vote again
- Neutral position

### 3. Automatic Decision Making

#### 3.1 Auto-Accept on Unanimous Approval

**Steps:**

1. All collaborators vote "accept"
2. Check change request status

**Expected Results:**

- Status automatically changes to "accepted"
- All collaborators notified
- Change ready to apply
- Timeline event created

#### 3.2 Auto-Reject on Majority Rejection

**Steps:**

1. Majority vote "reject"
2. Threshold reached
3. Check status

**Expected Results:**

- Status changes to "rejected"
- Change not applied
- Voting closed
- Collaborators notified

#### 3.3 Threshold-Based Decision

**Steps:**

1. Change request has 75% threshold
2. 75% vote accept
3. Check outcome

**Expected Results:**

- Decision made when threshold reached
- Status updated accordingly
- Threshold clearly indicated during voting
- Fair decision process

#### 3.4 Deadline-Based Decision

**Steps:**

1. Voting end time reached
2. Calculate results based on votes
3. Determine outcome

**Expected Results:**

- Voting automatically closes at deadline
- Results calculated
- Status updated
- Decision final

### 4. Change Request Status Management

#### 4.1 Pending Status

**Steps:**

1. Create new change request
2. Default status is "pending"

**Expected Results:**

- Status: "pending"
- Voting available
- Collaborators can vote
- Awaiting decision

#### 4.2 Accepted Status

**Steps:**

1. Change request approved by vote
2. Status changes to "accepted"

**Expected Results:**

- Status: "accepted"
- Change can be applied
- Voting closed
- Indicator shown

#### 4.3 Rejected Status

**Steps:**

1. Change request rejected by vote
2. Status changes to "rejected"

**Expected Results:**

- Status: "rejected"
- Change not applied
- Voting closed
- Historical record kept

#### 4.4 Applied Status

**Steps:**

1. Accepted change is applied to document
2. Mark as "applied"

**Expected Results:**

- Status: "applied"
- Change incorporated
- Document updated
- Timeline shows application

### 5. Change Request Discussion

#### 5.1 Add Comment to Change Request

**Steps:**

1. View change request
2. Add comment to discussion
3. Post comment

**Expected Results:**

- Comment added
- Discussion thread created/updated
- Participants notified
- Comment count increases

#### 5.2 Reply to Discussion Comment

**Steps:**

1. View existing comment
2. Click reply
3. Post reply

**Expected Results:**

- Reply nested under comment
- Thread hierarchy maintained
- Original commenter notified
- Discussion continues

#### 5.3 Discussion Influences Voting

**Steps:**

1. Collaborators discuss change
2. Concerns raised
3. Votes reflect discussion

**Expected Results:**

- Discussion visible to all voters
- Informed voting
- Concerns addressed
- Democratic process

### 6. Change Request Voting Thresholds

#### 6.1 Simple Majority (50%+)

**Steps:**

1. Create change request with 50% threshold
2. More than half vote accept
3. Check decision

**Expected Results:**

- Decision made at >50%
- Threshold enforced correctly
- Clear indication of requirement
- Fair majority rule

#### 6.2 Supermajority (67% or 75%)

**Steps:**

1. Set threshold to 75%
2. Exactly 75% vote accept
3. Check decision

**Expected Results:**

- Decision made at threshold
- Higher bar for approval
- Threshold clearly displayed
- Protects minority views

#### 6.3 Unanimous (100%)

**Steps:**

1. Require unanimous approval
2. All but one votes accept
3. Check outcome

**Expected Results:**

- Decision pending until all vote
- No acceptance until 100%
- Clear unanimous requirement
- Ensures full consensus

### 7. Change Request Voting Period

#### 7.1 Set Voting Start Time

**Steps:**

1. Create change request
2. Set votingStartTime to future date/time
3. Check voting availability

**Expected Results:**

- Voting not available until start time
- Countdown shown
- Voters notified when voting opens
- Scheduled correctly

#### 7.2 Set Voting End Time

**Steps:**

1. Set votingEndTime
2. Monitor voting window
3. Check automatic close

**Expected Results:**

- Voting closes at end time
- No votes accepted after deadline
- Results calculated
- Final decision made

#### 7.3 Extend Voting Period

**Steps:**

1. Voting is active
2. Extend votingEndTime
3. Update period

**Expected Results:**

- New deadline set
- Voters notified of extension
- Additional time to vote
- Timeline updated

### 8. Change Request Creation Permissions

#### 8.1 Collaborator Can Create

**Steps:**

1. Login as collaborator
2. Create change request

**Expected Results:**

- Full access to create
- Can propose changes
- Can set voting parameters
- Democratic participation

#### 8.2 Non-Collaborator Cannot Create

**Steps:**

1. Non-collaborator attempts to create
2. Check access

**Expected Results:**

- Access denied
- Error message shown
- Create button not visible
- Amendment integrity protected

### 9. Change Request Editing

#### 9.1 Edit Change Request Before Voting

**Steps:**

1. Creator edits change request
2. No votes cast yet
3. Update details
4. Save

**Expected Results:**

- Changes saved successfully
- Collaborators notified
- Voting not affected
- Updated content shown

#### 9.2 Cannot Edit During Voting

**Steps:**

1. Voting has started
2. Attempt to edit change request

**Expected Results:**

- Editing restricted
- Warning message shown
- Prevents vote manipulation
- Integrity maintained

#### 9.3 Edit After Rejection

**Steps:**

1. Change request rejected
2. Creator wants to revise and resubmit
3. Edit and reopen voting

**Expected Results:**

- Can edit rejected request
- Can reset voting
- Fresh consideration
- Iterative improvement

### 10. Change Request Deletion

#### 10.1 Delete Change Request Without Votes

**Steps:**

1. Creator deletes change request
2. No votes cast
3. Confirm deletion

**Expected Results:**

- Change request deleted
- Removed from list
- No impact on amendment
- Cannot be recovered

#### 10.2 Cannot Delete with Active Votes

**Steps:**

1. Change request has votes
2. Attempt to delete

**Expected Results:**

- Deletion prevented
- Warning shown
- Suggests withdrawal instead
- Vote integrity protected

#### 10.3 Withdraw Change Request

**Steps:**

1. Creator withdraws request
2. Status changed

**Expected Results:**

- Status: "withdrawn"
- Voting closed
- Historical record kept
- Votes preserved for records

### 11. Change Request Display

#### 11.1 View Change Requests List

**Steps:**

1. Navigate to amendment change requests tab
2. View all requests

**Expected Results:**

- All change requests listed
- Key info visible (title, status, vote counts)
- Clickable to view details
- Sorted by date or status

#### 11.2 View Change Request Details

**Steps:**

1. Click on change request
2. View full details page

**Expected Results:**

- Full title, description, justification
- Proposed change text clearly shown
- Vote breakdown visible
- Discussion thread accessible
- Vote buttons available if applicable

### 12. Change Request Vote Status Display

#### 12.1 Show Vote Counts

**Steps:**

1. View change request
2. Check vote tallies

**Expected Results:**

- Accept count shown
- Reject count shown
- Abstain count shown
- Total votes displayed

#### 12.2 Show Vote Percentages

**Steps:**

1. Multiple votes cast
2. View percentages

**Expected Results:**

- Percentage of accept/reject calculated
- Visual progress bar or chart
- Threshold comparison shown
- Easy to understand

#### 12.3 Show Who Voted What (If Transparent)

**Steps:**

1. Election configured for transparent voting
2. View vote details

**Expected Results:**

- List of voters and their votes
- Transparency maintained
- Accountability clear
- Privacy settings respected

### 13. Change Request Notifications

#### 13.1 Notify of New Change Request

**Steps:**

1. User creates change request
2. Collaborators check notifications

**Expected Results:**

- Notification sent to all collaborators
- Includes change request title
- Link to view details
- Notification type: "change_request_created"

#### 13.2 Notify of Vote Deadline Approaching

**Steps:**

1. Voting end time nearing
2. Users who haven't voted notified

**Expected Results:**

- Reminder notification sent
- Time remaining indicated
- Link to vote
- Encourages participation

#### 13.3 Notify of Decision

**Steps:**

1. Change request accepted or rejected
2. All collaborators notified

**Expected Results:**

- Decision notification sent
- Outcome clearly stated
- Link to change request
- Next steps indicated

### 14. Change Request Timeline Integration

#### 14.1 Creation Timeline Event

**Steps:**

1. Change request created
2. Check timeline

**Expected Results:**

- Timeline event created
- Event type: "change_request_created"
- Visible to amendment collaborators
- Links to change request

#### 14.2 Decision Timeline Event

**Steps:**

1. Change request decided
2. Check timeline

**Expected Results:**

- Timeline event for decision
- Shows accept/reject
- Vote breakdown if applicable
- Visible to subscribers

### 15. Change Request Application to Document

#### 15.1 Apply Accepted Change

**Steps:**

1. Change request accepted
2. Admin clicks "Apply Change"
3. Change incorporated

**Expected Results:**

- Document text updated
- Change applied correctly
- Status changes to "applied"
- Version saved if applicable
- All collaborators notified

#### 15.2 Verify Change Application

**Steps:**

1. View document after application
2. Check that change is present

**Expected Results:**

- Proposed change visible in document
- Correctly formatted
- No unintended changes
- Change request linked in document

### 16. Change Request Conflicts

#### 16.1 Detect Conflicting Change Requests

**Steps:**

1. Two change requests modify same section
2. Both accepted
3. Apply in sequence

**Expected Results:**

- Conflict detected
- Warnings shown
- Manual resolution required
- Clear conflict indicators

### 17. Change Request History

#### 17.1 View Change Request History

**Steps:**

1. Navigate to amendment history
2. View all change requests

**Expected Results:**

- All requests listed (accepted, rejected, pending)
- Chronological order
- Filterable by status
- Complete audit trail

### 18. Change Request Search and Filter

#### 18.1 Search Change Requests

**Steps:**

1. Many change requests exist
2. Search by keyword
3. View results

**Expected Results:**

- Matching requests shown
- Search works on title and description
- Results highlighted
- Clear search

#### 18.2 Filter by Status

**Steps:**

1. Filter by "pending" or "accepted"
2. View filtered list

**Expected Results:**

- Only requests with selected status shown
- Filter clearly indicated
- Can clear filter
- Multiple filters combinable

### 19. Change Request Voting Analytics

#### 19.1 View Voting Participation Rate

**Steps:**

1. Check how many collaborators have voted
2. View participation metrics

**Expected Results:**

- Percentage of collaborators voted
- Who hasn't voted highlighted
- Encourages full participation
- Participation trends tracked

### 20. Change Request Justification

#### 20.1 Provide Detailed Justification

**Steps:**

1. Create change request
2. Enter comprehensive justification
3. Include reasoning and evidence

**Expected Results:**

- Justification stored
- Displayed prominently
- Helps voters understand rationale
- Improves decision quality

### 21. Change Request Proposed Change Formatting

#### 21.1 Format Proposed Change

**Steps:**

1. Enter proposed change text
2. Use formatting (bold, lists, etc.)

**Expected Results:**

- Formatting preserved
- Rendered correctly
- Clear what change proposes
- Professional presentation

### 22. Change Request Bulk Operations

#### 22.1 Bulk Approve Change Requests

**Steps:**

1. Select multiple pending requests
2. Bulk approve all
3. Confirm

**Expected Results:**

- All selected requests approved
- Statuses updated
- Collaborators notified
- Efficient management

### 23. Change Request Dependencies

#### 23.1 Set Change Request Dependencies

**Steps:**

1. Request B depends on Request A
2. Set dependency
3. Check enforcement

**Expected Results:**

- Dependency tracked
- B cannot be applied until A accepted
- Clear dependency indicator
- Logical workflow

### 24. Change Request Voting Reminders

#### 24.1 Send Reminder to Non-Voters

**Steps:**

1. Deadline approaching
2. Some collaborators haven't voted
3. Send reminder

**Expected Results:**

- Reminder sent to non-voters only
- Includes deadline
- Link to vote
- Not spammy

### 25. Change Request Quorum

#### 25.1 Enforce Voting Quorum

**Steps:**

1. Set minimum number of voters (quorum)
2. Vote without quorum
3. Check decision delay

**Expected Results:**

- Decision not made until quorum reached
- Quorum requirement clear
- Encourages participation
- Valid decision process

### 26. Change Request Revisions

#### 26.1 Revise and Resubmit

**Steps:**

1. Request rejected
2. Creator revises proposal
3. Resubmit for new vote

**Expected Results:**

- New change request created or old one updated
- Previous votes reset
- Fresh consideration
- Iteration encouraged

### 27. Change Request Impact Assessment

#### 27.1 Assess Impact of Change

**Steps:**

1. View change request
2. Check impact assessment
3. See affected sections

**Expected Results:**

- Impact clearly stated
- Affected document sections identified
- Helps informed voting
- Risk assessment if applicable

### 28. Change Request Alternative Proposals

#### 28.1 Propose Alternative

**Steps:**

1. View change request
2. Propose alternative wording
3. Voters can choose

**Expected Results:**

- Alternative tracked
- Can vote on original or alternative
- Best option selected
- Collaborative refinement

### 29. Change Request Voting Power

#### 29.1 Weighted Voting (If Applicable)

**Steps:**

1. Some voters have more weight (e.g., author)
2. Vote cast
3. Check calculation

**Expected Results:**

- Vote weighted correctly
- Weights clear and fair
- Calculation transparent
- Prevents abuse

### 30. Change Request Urgent Flag

#### 30.1 Mark Change Request as Urgent

**Steps:**

1. Creator marks request urgent
2. Priority escalated

**Expected Results:**

- Urgent indicator shown
- Notifications prioritized
- Shorter voting period if appropriate
- Collaborators alerted

## Test Coverage Summary

### Unit Tests (Vitest)

- `useChangeRequests.test.ts`: Change request management logic
- `useChangeRequestVoting.test.ts`: Voting functionality
- `changeRequests.store.test.ts`: Filtering and status management
- `autoDecision.test.ts`: Automatic decision logic

### E2E Tests (Playwright)

- `change-request-creation.spec.ts`: Creation flows
- `change-request-voting.spec.ts`: All voting scenarios
- `change-request-discussion.spec.ts`: Discussion threads
- `change-request-application.spec.ts`: Applying changes to documents
- `change-request-lifecycle.spec.ts`: Full lifecycle from creation to application

## Edge Cases Covered

1. Change request with no collaborators
2. Voting during voting period transition
3. Conflicting simultaneous applications
4. Circular dependencies
5. Threshold exactly at edge (e.g., 50.0%)
6. All collaborators abstain
7. Change request for deleted amendment
8. Concurrent vote changes
9. Voting deadline extends
10. Quorum never reached
11. Very long proposed change text
12. Special characters in proposed change
13. Impact on multiple sections
14. Revision after partial implementation
15. Notification flood prevention

## Future Test Considerations

1. AI-powered change suggestion
2. Automated conflict resolution
3. Change request templates
4. Advanced analytics on voting patterns
5. Integration with version control systems
6. Scheduled change application
7. Conditional approval (approval with modifications)
8. Delegate voting
9. Anonymous voting option
10. External stakeholder voting (with limited permissions)
