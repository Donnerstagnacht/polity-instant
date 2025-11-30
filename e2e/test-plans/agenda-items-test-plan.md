# Agenda Items Feature - Comprehensive Test Plan

## Application Overview

The Agenda Items feature in Polity provides structured management of event agendas with comprehensive scheduling, tracking, and decision-making capabilities. Key functionality includes:

- **Agenda Item Creation**: Create items with title, description, duration, scheduled time, type
- **Ordering and Sequencing**: Maintain order, calculate start/end times, drag-and-drop reordering
- **Status Management**: Track status (pending, active, completed, skipped, forwarded)
- **Forwarding System**: Forward items to other events with approval workflow
- **Amendment Linking**: Associate amendments with agenda items for discussion/voting
- **Live Tracking**: Current item indicator, progress tracking during events
- **Integration**: Links to events, amendments, speaker lists, elections
- **Type Categorization**: Different types (discussion, vote, presentation, break, etc.)

## Test Scenarios

### 1. Create Basic Agenda Item

**Seed:** `e2e/seed.spec.ts`

#### 1.1 Create Simple Agenda Item

**Steps:**

1. Navigate to event agenda management
2. Click "Add Agenda Item"
3. Enter title "Welcome and Introduction"
4. Enter description
5. Set duration (10 minutes)
6. Set order/position
7. Click "Create"

**Expected Results:**

- Agenda item created with unique ID
- Item appears in agenda list
- Order/sequence maintained
- Duration stored
- Linked to event

#### 1.2 Create Agenda Item with All Fields

**Steps:**

1. Create agenda item
2. Fill all fields: title, description, duration, scheduledTime, type, startTime, endTime
3. Save

**Expected Results:**

- All fields saved correctly
- Times calculated if duration provided
- Type categorized properly
- Full details displayed

### 2. Agenda Item Types

#### 2.1 Create Discussion Item

**Steps:**

1. Create agenda item
2. Set type to "discussion"
3. Enter topic details

**Expected Results:**

- Type set correctly
- Icon/indicator for discussion
- Appropriate UI for discussion items
- Timer functionality available

#### 2.2 Create Voting Item

**Steps:**

1. Create agenda item
2. Set type to "vote"
3. Link to amendment or proposal

**Expected Results:**

- Type set to "vote"
- Voting interface available
- Linked entity shown
- Vote tracking enabled

#### 2.3 Create Presentation Item

**Steps:**

1. Create agenda item with type "presentation"
2. Add presenter info

**Expected Results:**

- Type indicated
- Presenter field available
- Presentation materials linkable
- Time allocation clear

#### 2.4 Create Break Item

**Steps:**

1. Create agenda item
2. Set type to "break"
3. Set duration

**Expected Results:**

- Marked as break
- Different visual styling
- Duration enforced
- Not counted in active items

### 3. Agenda Item Ordering

#### 3.1 Set Item Order

**Steps:**

1. Create multiple agenda items
2. Assign order numbers (1, 2, 3, etc.)
3. View agenda

**Expected Results:**

- Items displayed in order
- Order numbers visible
- Sequence maintained
- Clear progression

#### 3.2 Reorder Items via Drag-and-Drop

**Steps:**

1. View agenda with multiple items
2. Drag item from position 3 to position 1
3. Drop to reorder

**Expected Results:**

- Order updated immediately
- All items re-sequenced
- Order numbers recalculated
- Changes saved automatically

#### 3.3 Insert Item Between Existing Items

**Steps:**

1. Create new item
2. Set order to 2.5 or insert between 2 and 3
3. Save

**Expected Results:**

- Item inserted at correct position
- Subsequent items reordered
- Sequence remains valid
- No order conflicts

### 4. Agenda Item Scheduling

#### 4.1 Set Scheduled Time

**Steps:**

1. Create agenda item
2. Set scheduledTime to "14:30"
3. Save

**Expected Results:**

- Time saved correctly
- Displayed in agenda
- Used for timeline calculation
- Timezone handled

#### 4.2 Calculate Start and End Times

**Steps:**

1. First item starts at 14:00
2. Duration is 30 minutes
3. Check calculated times

**Expected Results:**

- startTime = 14:00
- endTime = 14:30
- Next item startTime = 14:30
- Times update when duration changes

#### 4.3 Auto-Schedule Items

**Steps:**

1. Set event start time
2. Add items with durations
3. Auto-schedule

**Expected Results:**

- All items scheduled sequentially
- No time gaps (except breaks)
- Times calculated correctly
- Adjustable if needed

### 5. Agenda Item Status Management

#### 5.1 Set Status to Pending

**Steps:**

1. Create new agenda item
2. Default status is "pending"

**Expected Results:**

- Status: "pending"
- Item not yet active
- Indicator shown
- Awaiting start

#### 5.2 Mark Item as Active

**Steps:**

1. During event, mark item as active
2. Current item highlighted

**Expected Results:**

- Status changes to "active"
- Visual highlight/indicator
- Timer starts if applicable
- Only one item active at a time

#### 5.3 Mark Item as Completed

**Steps:**

1. Active item finishes
2. Mark as completed

**Expected Results:**

- Status changes to "completed"
- Item marked with checkmark
- Next item becomes active
- Progress tracked

#### 5.4 Skip Agenda Item

**Steps:**

1. Active or pending item
2. Mark as "skipped"

**Expected Results:**

- Status changes to "skipped"
- Item crossed out or greyed
- Next item becomes current
- Can be revisited later

### 6. Agenda Item Forwarding

#### 6.1 Forward Item to Another Event

**Steps:**

1. Select agenda item
2. Click "Forward to Event"
3. Select target event
4. Submit forwarding request

**Expected Results:**

- ForwardingStatus set to "previous_decision_outstanding"
- Item linked to target event
- Target event organizer notified
- Original item status updated

#### 6.2 Approve Forwarded Item

**Steps:**

1. Target event organizer views forwarded item
2. Click "Approve Forwarding"
3. Confirm acceptance

**Expected Results:**

- ForwardingStatus changes to "approved"
- Item added to target event agenda
- Original event notified
- Item appears in target agenda

#### 6.3 Reject Forwarded Item

**Steps:**

1. Target event organizer views forwarded item
2. Click "Reject Forwarding"
3. Provide reason

**Expected Results:**

- ForwardingStatus changes to "rejected"
- Item not added to target
- Original event notified
- Reason communicated

#### 6.4 Forward Confirmation Status

**Steps:**

1. Forwarded item is approved
2. Original event confirms forwarding
3. Mark as "forward_confirmed"

**Expected Results:**

- ForwardingStatus: "forward_confirmed"
- Item removed from original agenda
- Transfer complete
- Timeline updated

### 7. Agenda Item Amendment Linking

#### 7.1 Link Amendment to Agenda Item

**Steps:**

1. Create or edit agenda item
2. Search and select amendment
3. Link amendment

**Expected Results:**

- Amendment linked
- Amendment displayed on item
- Click navigates to amendment
- Item type may change to "vote" or "discussion"

#### 7.2 Unlink Amendment

**Steps:**

1. Agenda item has linked amendment
2. Click "Unlink Amendment"
3. Confirm

**Expected Results:**

- Amendment unlinked
- Item still exists
- Amendment accessible separately
- Link removed

#### 7.3 View Amendment from Agenda Item

**Steps:**

1. Agenda item with linked amendment
2. Click amendment link
3. Navigate to amendment

**Expected Results:**

- Opens amendment page
- Amendment details visible
- Can return to agenda
- Context preserved

### 8. Agenda Item Duration Management

#### 8.1 Set Item Duration

**Steps:**

1. Create agenda item
2. Set duration to 15 minutes
3. Save

**Expected Results:**

- Duration stored
- End time calculated from start time
- Timer available during event
- Duration editable

#### 8.2 Update Duration Recalculates Times

**Steps:**

1. Item has duration 30 minutes
2. Change to 45 minutes
3. Check subsequent items

**Expected Results:**

- End time updated
- Following items' times adjusted
- Total event time updated
- Changes cascaded

#### 8.3 Extend Duration During Event

**Steps:**

1. Item is active during event
2. Extend duration by 10 minutes
3. Update

**Expected Results:**

- Timer extended
- End time updated
- Participants notified
- Schedule adjusted

### 9. Agenda Item Display

#### 9.1 View Agenda List

**Steps:**

1. Navigate to event agenda
2. View all items

**Expected Results:**

- Items listed in order
- Key info visible (title, time, duration)
- Status indicators shown
- Type icons displayed
- Clickable to view details

#### 9.2 View Agenda Item Details

**Steps:**

1. Click on agenda item
2. View full details

**Expected Results:**

- Full title and description
- All times displayed
- Linked amendment shown
- Status and type clear
- Edit/delete options if authorized

### 10. Agenda Item Live Streaming Integration

#### 10.1 Display Current Item in Stream

**Steps:**

1. Event stream is live
2. Check current agenda item display

**Expected Results:**

- Current item highlighted
- Title and description shown
- Timer displayed if active
- Progress indicator visible

#### 10.2 Navigate to Next Item in Stream

**Steps:**

1. During live stream
2. Organizer advances to next item
3. Check update

**Expected Results:**

- Current item marked complete
- Next item becomes active
- Stream interface updates
- All viewers see change

### 11. Agenda Item Permissions

#### 11.1 Organizer Can Create Items

**Steps:**

1. Login as event organizer
2. Create agenda item

**Expected Results:**

- Full access to create
- Can set all fields
- Can link amendments
- Can manage order

#### 11.2 Participant Cannot Create Items

**Steps:**

1. Login as regular participant
2. Attempt to create agenda item

**Expected Results:**

- Create button not visible
- Access denied if attempted
- Read-only view of agenda
- Can view but not modify

#### 11.3 Organizer Can Edit Items

**Steps:**

1. Organizer edits agenda item
2. Make changes
3. Save

**Expected Results:**

- Changes saved
- Participants notified if significant
- Timeline updated
- Version tracked if applicable

### 12. Agenda Item Deletion

#### 12.1 Delete Agenda Item

**Steps:**

1. Organizer selects item
2. Click "Delete"
3. Confirm deletion

**Expected Results:**

- Item deleted
- Subsequent items reordered
- Times recalculated
- Participants notified

#### 12.2 Cannot Delete Active Item

**Steps:**

1. Item is currently active
2. Attempt to delete

**Expected Results:**

- Deletion prevented
- Warning message shown
- Must complete or skip first
- Protection from accidental deletion

### 13. Agenda Item Speaker List Integration

#### 13.1 Link Speaker List to Item

**Steps:**

1. Create agenda item
2. Enable speaker list
3. Participants can request to speak

**Expected Results:**

- Speaker list created
- Linked to item
- Participants can add themselves
- Speaking order managed

### 14. Agenda Item Election Integration

#### 14.1 Link Election to Agenda Item

**Steps:**

1. Create voting agenda item
2. Link to election entity
3. Configure voting

**Expected Results:**

- Election linked
- Voting interface available
- Results tracked
- Decision recorded

### 15. Agenda Item Time Tracking

#### 15.1 Track Actual vs. Scheduled Time

**Steps:**

1. Item scheduled for 30 minutes
2. Actually takes 45 minutes
3. Track variance

**Expected Results:**

- Actual time recorded
- Variance calculated
- Analytics updated
- Future scheduling informed

### 16. Agenda Item Search and Filter

#### 16.1 Search Agenda Items

**Steps:**

1. View event agenda
2. Search by title or keyword
3. View results

**Expected Results:**

- Matching items shown
- Search works on title and description
- Results highlighted
- Clear search functionality

#### 16.2 Filter by Type

**Steps:**

1. Filter agenda by type (e.g., only "vote" items)
2. View filtered list

**Expected Results:**

- Only items of selected type shown
- Filter clearly indicated
- Can clear filter
- Multiple type selection if supported

#### 16.3 Filter by Status

**Steps:**

1. Filter by status (pending/active/completed)
2. View results

**Expected Results:**

- Only items with selected status shown
- Useful for tracking progress
- Clear filter indicator
- Can combine with other filters

### 17. Agenda Item Notifications

#### 17.1 Notify of New Agenda Item

**Steps:**

1. Organizer adds agenda item
2. Participants check notifications

**Expected Results:**

- Participants notified
- Item details in notification
- Link to agenda
- Notification type: "agenda_updated"

#### 17.2 Notify of Agenda Changes

**Steps:**

1. Organizer reorders or reschedules items
2. Participants notified

**Expected Results:**

- Notification sent
- Shows what changed
- Updated agenda accessible
- Clear messaging

### 18. Agenda Item Timeline Events

#### 18.1 Create Timeline Event for Item

**Steps:**

1. Agenda item created
2. Check timeline

**Expected Results:**

- Timeline event created
- Links to item and event
- Visible to event subscribers
- Event type: "agenda_item_created"

### 19. Agenda Item Export

#### 19.1 Export Agenda

**Steps:**

1. Organizer exports agenda
2. Select format (PDF/iCal/CSV)
3. Download

**Expected Results:**

- All items included
- Proper formatting
- Times in correct timezone
- Printable/shareable

### 20. Agenda Item Templates

#### 20.1 Create from Template

**Steps:**

1. Select agenda template (e.g., "Standard Meeting")
2. Apply to event
3. Items auto-created

**Expected Results:**

- Template items added
- Customizable after creation
- Time-efficient
- Standard structure maintained

### 21. Agenda Item Copy

#### 21.1 Copy Item to Another Event

**Steps:**

1. Select agenda item
2. Click "Copy to Event"
3. Select target event
4. Confirm

**Expected Results:**

- Item duplicated in target
- All details copied
- Independent of original
- Linked entities handled appropriately

### 22. Agenda Item Time Conflicts

#### 22.1 Detect Time Conflicts

**Steps:**

1. Schedule items with overlapping times
2. Check for conflict warning

**Expected Results:**

- Conflict detected
- Warning displayed
- Suggestions to resolve
- Prevents scheduling issues

### 23. Agenda Item Bulk Operations

#### 23.1 Bulk Update Items

**Steps:**

1. Select multiple items
2. Apply bulk action (e.g., change type, add 5 minutes)
3. Confirm

**Expected Results:**

- All selected items updated
- Changes applied consistently
- Single undo operation
- Efficient management

### 24. Agenda Item Progress Bar

#### 24.1 Display Agenda Progress

**Steps:**

1. View event with agenda
2. Check progress indicator

**Expected Results:**

- Progress bar or percentage shown
- Completed vs. total items
- Time remaining calculated
- Visual representation clear

### 25. Agenda Item Recurring Items

#### 25.1 Mark Item as Recurring

**Steps:**

1. Create item that recurs in every meeting
2. Mark as recurring
3. Auto-add to future events

**Expected Results:**

- Item marked as recurring
- Added to new events automatically
- Editable per instance
- Useful for standard items

### 26. Agenda Item Dependencies

#### 26.1 Set Item Dependencies

**Steps:**

1. Item B depends on Item A completion
2. Set dependency
3. Check enforcement

**Expected Results:**

- Dependency tracked
- Cannot start B until A complete
- Visual indicator
- Workflow enforced

### 27. Agenda Item Collaboration

#### 27.1 Multiple Organizers Edit Agenda

**Steps:**

1. Multiple organizers edit simultaneously
2. Make changes
3. Sync updates

**Expected Results:**

- Changes sync in real-time
- Conflict resolution if needed
- No data loss
- Clear update indicators

### 28. Agenda Item Visibility

#### 28.1 Control Item Visibility

**Steps:**

1. Make specific item visible only to organizers
2. Participants view agenda

**Expected Results:**

- Hidden items not shown to participants
- Organizers see all items
- Clear indicator for hidden items
- Useful for internal notes

### 29. Agenda Item Attachments

#### 29.1 Attach Documents to Item

**Steps:**

1. Edit agenda item
2. Attach files (PDFs, presentations)
3. Save

**Expected Results:**

- Files attached and stored
- Accessible from item
- Downloadable by participants
- Supports multiple files

### 30. Agenda Item Voting Results

#### 30.1 Record Vote Results on Item

**Steps:**

1. Voting item completes
2. Record results (passed/failed, vote counts)
3. Save decision

**Expected Results:**

- Results stored with item
- Decision visible in agenda
- Historical record maintained
- Timeline updated

## Test Coverage Summary

### Unit Tests (Vitest)

- `useAgendaItems.test.ts`: Agenda item management logic
- `AgendaItemCard.test.tsx`: Item display component
- `agendaItems.store.test.ts`: Ordering and filtering
- `forwardAgendaItem.test.ts`: Forwarding workflow

### E2E Tests (Playwright)

- `agenda-item-creation.spec.ts`: Item creation flows
- `agenda-item-ordering.spec.ts`: Reordering and sequencing
- `agenda-item-forwarding.spec.ts`: Forwarding workflow
- `agenda-item-live-tracking.spec.ts`: Live event integration
- `agenda-item-status-management.spec.ts`: Status transitions

## Edge Cases Covered

1. Zero-duration items
2. Very long agenda (100+ items)
3. Concurrent reordering
4. Time zone conversions
5. Forwarding to past events
6. Circular forwarding prevention
7. Amendment link to deleted amendment
8. Duration overflow (exceeds event time)
9. Duplicate order numbers
10. Negative durations
11. Missing event link
12. Status transition validation
13. Live stream interruptions
14. Export with special characters
15. Template with invalid references

## Future Test Considerations

1. AI-powered agenda suggestions
2. Automatic time optimization
3. Participant voting on agenda order
4. Real-time collaboration notes
5. Integration with external calendar systems
6. Automated reminders for upcoming items
7. Accessibility features for live tracking
8. Multi-language support for agendas
9. Advanced analytics on agenda efficiency
10. Integration with video conferencing for automatic item switching
