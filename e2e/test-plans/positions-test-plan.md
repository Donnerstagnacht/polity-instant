# Positions Feature - Comprehensive Test Plan

## Application Overview

The Positions feature in Polity provides comprehensive management of elected and appointed positions within groups and organizations. Key functionality includes:

- **Position Creation**: Define positions with title, description, term length, start date
- **Current Holder Management**: Assign users to positions, track current holders
- **Term Tracking**: Monitor term lengths, start dates, term expiration
- **Election Integration**: Link positions to elections for democratic selection
- **Group Association**: Positions belong to groups, visible on group pages
- **Historical Tracking**: Maintain history of position holders over time
- **Succession Planning**: Manage transitions between holders
- **Display and Discovery**: Positions shown on group pages, searchable

## Test Scenarios

### 1. Create Basic Position

**Seed:** `e2e/seed.spec.ts`

#### 1.1 Create Position with Required Fields

**Steps:**

1. Navigate to group positions management
2. Click "Create Position"
3. Enter title "President"
4. Enter description
5. Set term length (e.g., 2 years)
6. Set first term start date
7. Click "Create"

**Expected Results:**

- Position created with unique ID
- Linked to group
- Title and description saved
- Term information stored
- Appears in positions list

#### 1.2 Create Position with All Fields

**Steps:**

1. Create position
2. Fill all fields: title, description, term, firstTermStart
3. Save

**Expected Results:**

- All fields saved correctly
- Position fully configured
- Ready for assignment
- Displayed on group page

### 2. Position Display

#### 2.1 View Position on Group Page

**Steps:**

1. Navigate to group page
2. View positions section/carousel

**Expected Results:**

- All positions displayed
- Position title shown
- Current holder if assigned
- Term information visible
- Professional card design

#### 2.2 View Position Card Details

**Steps:**

1. View position card in carousel
2. Check all displayed information

**Expected Results:**

- Title prominently displayed
- Description visible
- Current holder with avatar and name
- Term length shown
- First term start date displayed
- Vacant if no holder

#### 2.3 Empty State for No Positions

**Steps:**

1. Group has no positions
2. View positions section

**Expected Results:**

- Appropriate empty state message
- Encouragement to create positions
- Create button visible to admins
- Clean UI

### 3. Assign Current Holder

#### 3.1 Assign User to Position

**Steps:**

1. Admin navigates to position management
2. Select position
3. Click "Assign Holder"
4. Search for user
5. Select user and confirm

**Expected Results:**

- User assigned as currentHolder
- User's name and avatar displayed on position
- User receives notification
- Timeline event created

#### 3.2 Replace Current Holder

**Steps:**

1. Position has current holder
2. Assign different user
3. Confirm replacement

**Expected Results:**

- Previous holder removed
- New holder assigned
- Both users notified
- Transition tracked
- Historical record maintained

#### 3.3 Remove Current Holder

**Steps:**

1. Position has current holder
2. Click "Remove Holder"
3. Confirm removal

**Expected Results:**

- CurrentHolder link removed
- Position marked as vacant
- User notified
- Timeline event created
- Historical record kept

### 4. Position Term Management

#### 4.1 Set Term Length

**Steps:**

1. Create/edit position
2. Set term to 4 years
3. Save

**Expected Results:**

- Term length stored
- Used for term expiration calculation
- Displayed on position card
- Clear term indicator

#### 4.2 Set First Term Start Date

**Steps:**

1. Set firstTermStart to specific date
2. Save position

**Expected Results:**

- Start date saved
- Displayed on position
- Used for term expiration calculation
- Timezone handled correctly

#### 4.3 Calculate Term Expiration

**Steps:**

1. Position with term 2 years, started Jan 1, 2024
2. Check expiration date

**Expected Results:**

- Expiration calculated as Jan 1, 2026
- Expiration displayed or accessible
- Warning as expiration approaches
- Transition planning enabled

#### 4.4 Extend Term

**Steps:**

1. Position nearing expiration
2. Admin extends term
3. Update term length or start date

**Expected Results:**

- Term extended
- New expiration calculated
- Holder notified
- Changes logged

### 5. Position Vacant Status

#### 5.1 Display Vacant Position

**Steps:**

1. View position with no current holder
2. Check display

**Expected Results:**

- "Vacant Position" indicator
- No holder avatar or name
- Message encouraging assignment
- Distinct visual styling

#### 5.2 Mark Position as Vacant Intentionally

**Steps:**

1. Position with holder
2. Mark as intentionally vacant
3. Provide reason

**Expected Results:**

- Status marked as vacant
- Reason stored and displayed
- Different from unassigned
- Clear communication

### 6. Position Election Integration

#### 6.1 Link Position to Election

**Steps:**

1. Create election for position
2. Link position to election
3. Conduct election

**Expected Results:**

- Position linked to election
- Winner automatically assigned to position
- Transition handled smoothly
- Timeline updated

#### 6.2 Automatic Assignment After Election

**Steps:**

1. Election concludes
2. Winner determined
3. Check position holder

**Expected Results:**

- Winner automatically becomes current holder
- Previous holder removed if applicable
- Transition clean and automated
- All parties notified

### 7. Position Permissions

#### 7.1 Admin Can Create Positions

**Steps:**

1. Login as group admin
2. Create position

**Expected Results:**

- Full access to create
- Can set all fields
- Can assign holders
- Changes immediate

#### 7.2 Member Cannot Create Positions

**Steps:**

1. Login as regular member
2. Attempt to create position

**Expected Results:**

- Create button not visible
- Access denied if attempted
- Read-only view of positions
- Error message clear

#### 7.3 Admin Can Edit Positions

**Steps:**

1. Admin edits position
2. Update fields
3. Save changes

**Expected Results:**

- Changes saved successfully
- Position updated
- Holder notified if applicable
- Timeline event created

### 8. Position Deletion

#### 8.1 Delete Vacant Position

**Steps:**

1. Position has no current holder
2. Admin deletes position
3. Confirm deletion

**Expected Results:**

- Position deleted
- Removed from positions list
- Group updated
- Cannot be recovered

#### 8.2 Delete Position with Holder

**Steps:**

1. Position has current holder
2. Attempt to delete
3. Handle holder

**Expected Results:**

- Warning about current holder
- Option to remove holder first or notify
- Deletion proceeds after confirmation
- Holder notified
- Historical record maintained

### 9. Position Display Order

#### 9.1 Order Positions

**Steps:**

1. Multiple positions exist
2. Set display order
3. View on group page

**Expected Results:**

- Positions displayed in order
- Order configurable by admin
- Drag-and-drop reordering if available
- Consistent across views

### 10. Position Historical Tracking

#### 10.1 View Position History

**Steps:**

1. Position has had multiple holders
2. View history

**Expected Results:**

- All past holders listed
- Terms and dates shown
- Chronological order
- Complete audit trail

#### 10.2 Track Holder Transitions

**Steps:**

1. Holder changes from User A to User B
2. Check transition record

**Expected Results:**

- Transition date recorded
- Both holders in history
- Reason for transition if provided
- Timeline event created

### 11. Position Search and Discovery

#### 11.1 Search Positions by Title

**Steps:**

1. Search for position by title
2. View results

**Expected Results:**

- Matching positions shown
- Search works across all groups if global
- Results clickable
- Group affiliation shown

#### 11.2 Filter Positions by Group

**Steps:**

1. View all positions in specific group
2. Filter applied

**Expected Results:**

- Only group's positions shown
- Clear group context
- Useful for group management

### 12. Position Notifications

#### 12.1 Notify User of Assignment

**Steps:**

1. User assigned to position
2. Check notifications

**Expected Results:**

- Notification sent to user
- Contains position title and group
- Link to position/group
- Congratulatory message

#### 12.2 Notify User of Removal

**Steps:**

1. User removed from position
2. Check notifications

**Expected Results:**

- Notification sent
- Contains position and group info
- Reason if provided
- Respectful messaging

#### 12.3 Notify of Term Expiration

**Steps:**

1. Position term nearing expiration
2. Holder and admin notified

**Expected Results:**

- Reminder sent 30 days before
- Includes expiration date
- Encourages succession planning
- Link to position management

### 13. Position Timeline Integration

#### 13.1 Position Creation Timeline Event

**Steps:**

1. Create position
2. Check timeline

**Expected Results:**

- Timeline event created
- Event type: "position_created"
- Visible to group members
- Links to position

#### 13.2 Assignment Timeline Event

**Steps:**

1. User assigned to position
2. Check timeline

**Expected Results:**

- Timeline event for assignment
- Shows holder and position
- Visible to group and holder's followers
- Links to both

### 14. Position User Profile Integration

#### 14.1 Show Positions on User Profile

**Steps:**

1. User holds one or more positions
2. Navigate to user profile
3. View positions section

**Expected Results:**

- All current positions listed
- Position titles and groups shown
- Clickable to group pages
- Professional presentation

### 15. Position Export

#### 15.1 Export Positions List

**Steps:**

1. Admin exports positions
2. Select format (CSV/PDF)
3. Download

**Expected Results:**

- All positions included
- Current holders shown
- Term information included
- Properly formatted

### 16. Position Term Limits

#### 16.1 Enforce Term Limits

**Steps:**

1. Position has term limit (e.g., 2 terms max)
2. Holder reaches limit
3. Check enforcement

**Expected Results:**

- Term limit tracked
- Cannot exceed limit
- Automatic transition required
- Clear term limit indicator

### 17. Position Responsibilities

#### 17.1 Define Position Responsibilities

**Steps:**

1. Edit position
2. Add detailed responsibilities
3. Save

**Expected Results:**

- Responsibilities stored
- Displayed on position page
- Useful for candidates/holders
- Clear expectations

### 18. Position Qualifications

#### 18.1 Set Required Qualifications

**Steps:**

1. Edit position
2. Add required qualifications
3. Save

**Expected Results:**

- Qualifications listed
- Visible to potential candidates
- Enforced during assignment if applicable
- Clear requirements

### 19. Position Compensation (If Applicable)

#### 19.1 Set Position Compensation

**Steps:**

1. Edit position
2. Add compensation details
3. Save

**Expected Results:**

- Compensation information stored
- Displayed appropriately
- Privacy respected
- Transparency maintained

### 20. Position Multiple Holders

#### 20.1 Position with Multiple Holders

**Steps:**

1. Position allows multiple holders (e.g., co-chairs)
2. Assign multiple users
3. View position

**Expected Results:**

- All holders displayed
- Each holder's info shown
- Supports co-leadership
- Roles distinguished if applicable

### 21. Position Succession Planning

#### 21.1 Designate Successor

**Steps:**

1. Current holder designates successor
2. Successor prepared for transition
3. Transition occurs

**Expected Results:**

- Successor designated
- Transition smooth
- Knowledge transfer supported
- Continuity maintained

### 22. Position Analytics

#### 22.1 Track Position Metrics

**Steps:**

1. View position analytics
2. Check metrics

**Expected Results:**

- Number of holders over time
- Average term length
- Election participation if applicable
- Useful insights

### 23. Position Comparison

#### 23.1 Compare Multiple Positions

**Steps:**

1. View multiple positions in group
2. Compare terms, responsibilities
3. Analyze structure

**Expected Results:**

- Side-by-side comparison
- Helps with organizational design
- Identifies gaps or overlaps
- Informed governance

### 24. Position Visibility

#### 24.1 Control Position Visibility

**Steps:**

1. Set position as public or private
2. Save setting

**Expected Results:**

- Public positions visible to all
- Private positions only to members
- Clear visibility indicator
- Privacy respected

### 25. Position Linked to Permissions

#### 25.1 Position Grants Permissions

**Steps:**

1. Position linked to specific permissions in group
2. User assigned to position
3. Check permissions

**Expected Results:**

- User automatically gains permissions
- Permissions revoked when removed
- Clear permission association
- Role-based access control

### 26. Position Voting Rights

#### 26.1 Position Includes Voting Rights

**Steps:**

1. Position includes voting rights in group
2. Holder can vote in group decisions
3. Track voting

**Expected Results:**

- Voting rights associated with position
- Holder can participate in votes
- Rights transferred with position
- Clear governance

### 27. Position Backup/Deputy

#### 27.1 Assign Deputy to Position

**Steps:**

1. Assign deputy/vice holder
2. Deputy acts when holder unavailable
3. Track actions

**Expected Results:**

- Deputy designated
- Deputy has limited/full permissions
- Acts in holder's absence
- Accountability clear

### 28. Position Automation

#### 28.1 Auto-Assign Based on Rules

**Steps:**

1. Set rule (e.g., most senior member becomes president)
2. Rule triggers
3. Assignment automatic

**Expected Results:**

- Automation executed
- Assignment follows rule
- Manual override available
- Reduces admin burden

### 29. Position Templates

#### 29.1 Create from Position Template

**Steps:**

1. Select standard template (e.g., "Board of Directors")
2. Apply to group
3. Positions created

**Expected Results:**

- Template positions created
- Customizable after creation
- Saves setup time
- Standard structure

### 30. Position Integration with Calendar

#### 30.1 Position Events in Calendar

**Steps:**

1. Position has term start/end dates
2. View in calendar
3. Reminders set

**Expected Results:**

- Term dates appear in calendar
- Transitions planned
- Reminders sent
- Integrated workflow

## Test Coverage Summary

### Unit Tests (Vitest)

- `usePositions.test.ts`: Position management logic
- `PositionCard.test.tsx`: Position display component
- `positions.store.test.ts`: Filtering and history
- `termCalculation.test.ts`: Term expiration logic

### E2E Tests (Playwright)

- `position-creation.spec.ts`: Position creation flows
- `position-assignment.spec.ts`: Assigning holders
- `position-election-integration.spec.ts`: Election linkage
- `position-term-management.spec.ts`: Term tracking
- `position-history.spec.ts`: Historical tracking

## Edge Cases Covered

1. Position with no term limit
2. Holder assigned without term start
3. Multiple transitions same day
4. Position deletion with history
5. Election tie for position
6. Term extension during active term
7. Concurrent assignment attempts
8. Deputy acts when holder present
9. Position with historical holder but currently vacant
10. Auto-assignment rule conflicts
11. Very long position titles
12. Term in fractional years
13. Leap year term calculations
14. Position linked to deleted group
15. Holder user account deleted

## Future Test Considerations

1. Position performance reviews
2. Automated skill matching for positions
3. Position mentorship programs
4. Advanced succession pipelines
5. Position certification requirements
6. Integration with HR systems
7. Automated term limit enforcement with elections
8. Position networking (similar positions across groups)
9. Compensation transparency tools
10. AI-powered position recommendations for users
