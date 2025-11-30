# Events Feature - Comprehensive Test Plan

## Application Overview

The Events feature in Polity is a comprehensive event management system that allows users to create, organize, participate in, and track events. Key functionality includes:

- **Event Creation & Management**: Create events with rich details (title, description, dates, location, capacity, tags, visibility)
- **Participation System**: Request/invite participants, accept/decline invitations, track participation status
- **Role Management**: Organizers can promote/demote participants, assign custom roles with permissions
- **Event Details**: Event image, date/time, location, capacity, hashtags, public/private visibility
- **Social Features**: Subscribe to events, share events, view participant lists
- **Agenda Items**: Create and manage agenda items for structured events
- **Integration**: Events linked to groups, appear in calendars, generate timeline events
- **Live Streaming**: Support for live event streaming with agenda item tracking

## Test Scenarios

### 1. Create Basic Event

**Seed:** `e2e/seed.spec.ts`

#### 1.1 Create Public Event with Required Fields

**Steps:**

1. Navigate to `/create` page
2. Select "Event" entity type
3. Enter event title "Community Meetup"
4. Enter description "Monthly community gathering"
5. Select start date (future date)
6. Set event as public
7. Click "Create" button

**Expected Results:**

- Event is created with unique ID
- User is redirected to event page
- Event appears with entered details
- User is automatically set as organizer
- Event is visible in public event listings

#### 1.2 Create Private Event with Full Details

**Steps:**

1. Navigate to create page
2. Select Event type
3. Enter all fields: title, description, start/end dates, location, capacity, tags
4. Upload event image
5. Set visibility to private
6. Add hashtags
7. Click Create

**Expected Results:**

- Event created with all metadata
- Image uploaded successfully
- Event only visible to authenticated users
- Hashtags associated with event
- Capacity limit stored

### 2. Event Visibility and Access Control

#### 2.1 Public Event Visibility

**Steps:**

1. Create public event as authenticated user
2. Log out
3. Navigate to event URL directly
4. Attempt to view event details

**Expected Results:**

- Public event details visible to unauthenticated users
- Participation requires authentication
- Subscribe/action buttons disabled or prompt login

#### 2.2 Private Event Access Restriction

**Steps:**

1. Create private event
2. Log out or switch to different user
3. Attempt to access event URL

**Expected Results:**

- Non-participants cannot view private event
- Access denied message displayed
- Event not visible in search results for non-participants

#### 2.3 Authenticated-Only Event Access

**Steps:**

1. Create event with "authenticated" visibility
2. Log out
3. Attempt to access event
4. Log in as different user
5. Access event

**Expected Results:**

- Unauthenticated users cannot access
- Any authenticated user can view event
- Participation may still require request/approval

### 3. Event Participation Flow

**Note:** Detailed participation flow scenarios (request to participate, cancel request, accept invitation, leave event) are covered comprehensively in [event-participation-test-plan.md](event-participation-test-plan.md).

**Reference:** See event-participation-test-plan.md for:

- Request to participate flow
- Cancel participation request
- Accept event invitation
- Leave event voluntarily
- Organizer approve/reject requests
- Organizer invite participants
- Organizer promote/demote participants
- Organizer remove participants
- Organizer withdraw invitations
- Participant role management

### 4. Event Details and Information

#### 4.1 Display Event Details

**Steps:**

1. Navigate to event page
2. View event information

**Expected Results:**

- Title, description displayed correctly
- Date and time formatted properly
- Location shown if provided
- Organizer information displayed
- Group affiliation shown if linked
- Public/private badge visible

#### 4.2 Event Image Display

**Steps:**

1. Create event with uploaded image
2. View event page

**Expected Results:**

- Image displayed prominently
- Image properly sized and cropped
- Image loads efficiently
- Fallback if image missing

#### 4.3 Event Stats Bar

**Steps:**

1. View event with participants and subscribers
2. Check stats bar

**Expected Results:**

- Participant count accurate
- Subscriber count accurate
- Stats update in real-time
- Only counts "member" status participants

#### 4.4 Event Hashtags Display

**Steps:**

1. Create event with hashtags
2. View event page

**Expected Results:**

- Hashtags displayed with # prefix
- Hashtags are clickable
- Clicking hashtag searches by tag
- Hashtags centered under title

### 5. Event Subscription

#### 5.1 Subscribe to Event

**Steps:**

1. Navigate to event page (not subscribed)
2. Click "Subscribe" button

**Expected Results:**

- Subscription created
- Button changes to "Unsubscribe"
- Subscriber count increases
- Event appears in user's subscribed feed

#### 5.2 Unsubscribe from Event

**Steps:**

1. User is subscribed to event
2. Click "Unsubscribe" button

**Expected Results:**

- Subscription deleted
- Button changes to "Subscribe"
- Subscriber count decreases
- Event removed from subscribed feed

#### 5.3 Subscribe vs Participate Distinction

**Steps:**

1. Subscribe to event without participating
2. Check access permissions

**Expected Results:**

- Subscription doesn't grant participant access
- User receives updates but not participant features
- Clear distinction in UI
- Both actions can be taken independently

### 6. Event Calendar Integration

#### 6.1 Event Appears in Calendar

**Steps:**

1. User participates in event
2. Navigate to `/calendar`
3. Navigate to event date

**Expected Results:**

- Event appears on calendar on correct date
- Event shows participation status
- Clicking event navigates to event page
- Color coding by event type/status

#### 6.2 Multi-Day Event Display

**Steps:**

1. Create event with start and end dates spanning multiple days
2. View in calendar

**Expected Results:**

- Event appears on all days between start/end
- Event marked as multi-day
- Duration clearly indicated
- Proper spanning visualization

### 7. Event Editing and Updates

#### 7.1 Edit Event Details (Organizer)

**Steps:**

1. Login as event organizer
2. Navigate to event page
3. Click settings/edit button
4. Modify event details
5. Save changes

**Expected Results:**

- Only organizers can edit
- Changes saved successfully
- All participants notified of changes
- Timeline event created for update
- Updated timestamp changed

#### 7.2 Non-Organizer Cannot Edit

**Steps:**

1. Login as regular participant
2. Navigate to event page
3. Look for edit options

**Expected Results:**

- Edit button not visible
- Direct URL access to edit page denied
- Error message if attempted
- Event details remain unchanged

### 8. Event Capacity Management

#### 8.1 Enforce Event Capacity

**Steps:**

1. Create event with capacity of 5
2. Have 5 users participate
3. Additional user attempts to join

**Expected Results:**

- Participation request allowed but marked as waitlist
- UI shows event full
- Organizer can still add participants
- Clear messaging about capacity

#### 8.2 Capacity Indicator Display

**Steps:**

1. View event with capacity set
2. Check capacity indicator

**Expected Results:**

- Shows "X / Y participants"
- Visual indicator (progress bar or percentage)
- Color changes when near/at capacity
- Updates in real-time

### 9. Event Search and Discovery

#### 9.1 Search Events by Title

**Steps:**

1. Navigate to `/search`
2. Type event title in search
3. Filter by "Events" type

**Expected Results:**

- Matching events displayed
- Results sorted by relevance
- Event cards show key info
- Clicking navigates to event

#### 9.2 Filter Events by Hashtag

**Steps:**

1. Click hashtag on event page
2. View search results

**Expected Results:**

- All events with that hashtag shown
- Results filterable by date
- Public events visible to all
- Private events hidden appropriately

#### 9.3 Discover Events by Group

**Steps:**

1. Navigate to group page
2. View events section

**Expected Results:**

- All group events listed
- Upcoming events highlighted
- Past events available
- Events sorted by date

### 10. Event Roles and Permissions

#### 10.1 Create Custom Event Role

**Steps:**

1. Organizer navigates to roles tab
2. Click "Add Role"
3. Enter role name and description
4. Set permissions
5. Save role

**Expected Results:**

- Role created and available
- Role appears in assignment dropdown
- Permissions properly configured
- Role can be assigned to participants

#### 10.2 Assign Custom Role to Participant

**Steps:**

1. Organizer views participant list
2. Click role dropdown for participant
3. Select custom role

**Expected Results:**

- Participant role updated
- Permissions applied immediately
- Role displayed in participant card
- Timeline event created

#### 10.3 Delete Custom Role

**Steps:**

1. Organizer navigates to roles tab
2. Click delete for custom role
3. Confirm deletion

**Expected Results:**

- Role deleted
- Participants with role reverted to default
- Role removed from dropdown
- Cannot delete system roles

### 11. Event Agenda Items

#### 11.1 Create Agenda Item

**Steps:**

1. Organizer navigates to event agenda
2. Click "Add Agenda Item"
3. Enter title, description, duration, order
4. Link amendment if applicable
5. Save

**Expected Results:**

- Agenda item created
- Item appears in agenda list
- Order/sequence maintained
- Duration calculated

#### 11.2 Reorder Agenda Items

**Steps:**

1. View agenda with multiple items
2. Drag and drop items to reorder

**Expected Results:**

- Order updated in real-time
- Sequence numbers recalculated
- Times adjusted if scheduled
- Changes saved automatically

#### 11.3 Mark Agenda Item Complete

**Steps:**

1. During event, view agenda
2. Mark item as complete

**Expected Results:**

- Status changes to complete
- Next item becomes active
- Visual indicator updated
- Timeline shows progression

### 12. Event Live Stream

#### 12.1 Start Live Stream

**Steps:**

1. Organizer navigates to event stream page
2. Click "Start Stream"
3. Stream begins

**Expected Results:**

- Stream URL generated
- Participants can join
- Current agenda item highlighted
- Chat/discussion enabled

#### 12.2 Navigate Agenda During Stream

**Steps:**

1. Stream is live
2. Organizer advances to next agenda item

**Expected Results:**

- Current item updates for all viewers
- Timer resets for new item
- Visual transition smooth
- Participants notified

### 13. Event Notifications

#### 13.1 Event Invitation Notification

**Steps:**

1. User is invited to event
2. Check notifications

**Expected Results:**

- Notification appears
- Contains event details
- Click navigates to event
- Accept/decline actions available

#### 13.2 Event Update Notification

**Steps:**

1. User is participant/subscriber
2. Organizer updates event details
3. Check notifications

**Expected Results:**

- Notification sent to all participants/subscribers
- Shows what changed
- Link to event
- Marked as "event_update" type

#### 13.3 Participation Approved Notification

**Steps:**

1. User requests participation
2. Organizer approves
3. Check notifications

**Expected Results:**

- User receives approval notification
- Contains event details
- Encourages engagement
- Link to event page

### 14. Event Social Features

#### 14.1 Share Event

**Steps:**

1. Click share button on event
2. View share options

**Expected Results:**

- Share URL generated
- Social media options available
- Copy link functionality
- Share includes event details/image

#### 14.2 View Participant List

**Steps:**

1. Navigate to event
2. View participants section

**Expected Results:**

- List of all participants displayed
- Participant roles shown
- Avatars and names visible
- Organizers highlighted

### 15. Event Date and Time

#### 15.1 Display Event Date and Time

**Steps:**

1. View event with start/end times
2. Check date/time display

**Expected Results:**

- Formatted correctly for locale
- Timezone handled properly
- End time shown if provided
- Date in readable format (e.g., "Monday, January 15, 2024")

#### 15.2 Past Event Indication

**Steps:**

1. View event with past date
2. Check UI indicators

**Expected Results:**

- Marked as "Past Event"
- Different styling/badge
- Cannot request participation
- Can still view details

#### 15.3 Upcoming Event Countdown

**Steps:**

1. View event with future date
2. Check countdown/time until

**Expected Results:**

- Shows time until event (e.g., "In 5 days")
- Updates dynamically
- Different messaging for imminent events
- Visual urgency indicators

### 16. Event and Group Relationship

#### 16.1 Create Event for Group

**Steps:**

1. Navigate to group page
2. Click "Create Event" for group
3. Event auto-linked to group

**Expected Results:**

- Event associated with group
- Group displayed on event page
- Event appears in group's events list
- Group members can see event

#### 16.2 Event Visibility Inherits from Group

**Steps:**

1. Create event for private group
2. Check event visibility

**Expected Results:**

- Event visibility matches group setting
- Only group members can view
- Clear indication of group affiliation
- Group permissions apply

### 17. Event Tags and Categories

#### 17.1 Add Tags to Event

**Steps:**

1. Create/edit event
2. Add multiple tags
3. Save event

**Expected Results:**

- Tags stored as JSON array
- Tags displayed as badges
- Tags are searchable
- Tag suggestions appear

#### 17.2 Search by Tag

**Steps:**

1. Click on event tag
2. View search results

**Expected Results:**

- All events with tag shown
- Results filterable
- Tag search works across events
- Other entity types with tag also shown

### 18. Event Deletion and Archiving

#### 18.1 Delete Event (Organizer)

**Steps:**

1. Organizer navigates to event settings
2. Click "Delete Event"
3. Confirm deletion

**Expected Results:**

- Event and all related data deleted
- Participants notified
- Event removed from calendars
- Event removed from search
- Cannot be recovered

#### 18.2 Cancel Event (Soft Delete)

**Steps:**

1. Organizer marks event as cancelled
2. Event status changes

**Expected Results:**

- Event marked as cancelled
- Participants notified
- Event still viewable but marked
- Can be un-cancelled
- Remains in history

### 19. Event Loading States

#### 19.1 Event Page Loading

**Steps:**

1. Navigate to event page
2. Observe loading state

**Expected Results:**

- Loading indicator displayed
- Skeleton UI shown
- Smooth transition to loaded state
- No layout shift

#### 19.2 Participation Action Loading

**Steps:**

1. Click "Request to Participate"
2. Observe loading state

**Expected Results:**

- Button shows loading spinner
- Button disabled during request
- Success/error feedback
- Smooth state transition

### 20. Event Error Handling

#### 20.1 Event Not Found

**Steps:**

1. Navigate to non-existent event ID
2. View error page

**Expected Results:**

- Clear "Event Not Found" message
- Explanation text
- Link to events listing or home
- No broken UI elements

#### 20.2 Permission Denied

**Steps:**

1. Non-participant tries to access private event
2. View error message

**Expected Results:**

- "Access Denied" message
- Explanation of visibility settings
- Option to request participation
- Redirect to appropriate page

### 21. Event Participant Count Accuracy

#### 21.1 Accurate Participant Count

**Steps:**

1. Create event
2. Add/remove participants
3. Monitor count

**Expected Results:**

- Only counts status "member"
- Excludes "invited" and "requested"
- Updates in real-time
- Matches actual participant list

#### 21.2 Subscriber Count Accuracy

**Steps:**

1. Add/remove subscribers
2. Monitor subscriber count

**Expected Results:**

- Counts all active subscriptions
- Updates immediately
- Independent of participation
- Displayed correctly in stats bar

### 22. Event Location Features

#### 22.1 Display Event Location

**Steps:**

1. Create event with location
2. View event page

**Expected Results:**

- Location displayed with map pin icon
- Location in dedicated section
- Location formatted properly
- Link to map if applicable

#### 22.2 Location Search/Autocomplete

**Steps:**

1. Enter location in create form
2. Use autocomplete

**Expected Results:**

- Location suggestions appear
- Selecting populates correctly
- Recent locations saved
- Common locations suggested

### 23. Event Image Management

#### 23.1 Upload Event Image

**Steps:**

1. Create/edit event
2. Upload image file
3. Save event

**Expected Results:**

- Image uploaded successfully
- Image preview shown
- Image stored and retrievable
- Image URL saved to event

#### 23.2 Change Event Image

**Steps:**

1. Edit event with existing image
2. Upload new image
3. Save changes

**Expected Results:**

- Old image replaced
- New image displayed
- Previous image removed from storage
- Update reflected immediately

### 24. Event Timeline Integration

#### 24.1 Event Creation Timeline Event

**Steps:**

1. Create new event
2. Check timeline feed

**Expected Results:**

- Timeline event created
- Event type: "created"
- Entity type: "event"
- Displayed in creator's timeline
- Visible to subscribers

#### 24.2 Participation Timeline Event

**Steps:**

1. User joins event
2. Check timeline

**Expected Results:**

- Timeline event for participation
- Event type: "participant_joined"
- Visible to user's followers
- Links to event

### 25. Event Search and Filter

#### 25.1 Filter Events by Date Range

**Steps:**

1. Navigate to events search/listing
2. Apply date range filter
3. View results

**Expected Results:**

- Only events in range shown
- Filter applied correctly
- Past/future toggle works
- Clear filter option

#### 25.2 Sort Events by Date

**Steps:**

1. View events list
2. Sort by date (ascending/descending)

**Expected Results:**

- Events reordered correctly
- Upcoming events first by default
- Sort persists during session
- Visual sort indicator

### 26. Event Organizer Management

#### 26.1 Multiple Organizers

**Steps:**

1. Event has multiple organizers
2. Each performs organizer actions

**Expected Results:**

- All organizers have full permissions
- No conflicts in actions
- Equal access to management
- Can manage other organizers

#### 26.2 Prevent Last Organizer Removal

**Steps:**

1. Event has single organizer
2. Attempt to demote self

**Expected Results:**

- Action prevented
- Error message shown
- Must promote another first
- Event always has organizer

### 27. Event Capacity Waiting List

#### 27.1 Join Waiting List

**Steps:**

1. Event at full capacity
2. User requests participation
3. Request marked as waitlist

**Expected Results:**

- Request created with waitlist flag
- User notified of waitlist status
- Organizer sees waitlist separately
- User can cancel waitlist request

#### 27.2 Promote from Waiting List

**Steps:**

1. Participant leaves full event
2. Spot becomes available
3. Waitlist user notified

**Expected Results:**

- First waitlist user offered spot
- Notification sent
- User can accept/decline
- Spot offered to next if declined

### 28. Event Recurrence (Future Feature)

#### 28.1 Create Recurring Event

**Steps:**

1. Create event with recurrence pattern
2. Specify frequency (daily/weekly/monthly)
3. Set end date or count

**Expected Results:**

- Multiple event instances created
- Each has unique ID but linked
- All appear in calendar
- Can edit series or instance

### 29. Event Analytics and Insights

#### 29.1 View Event Analytics

**Steps:**

1. Organizer navigates to event analytics
2. View participation stats

**Expected Results:**

- Total participants over time graph
- Acceptance rate displayed
- Most active participants
- Engagement metrics shown

## Test Coverage Summary

### Unit Tests (Vitest)

- `useEventParticipation.test.ts`: Hook logic for all participation operations
- `useSubscribeEvent.test.ts`: Event subscription functionality
- `EventWiki.test.tsx`: Event display component
- `events.store.test.ts`: Event store filtering and search

### E2E Tests (Playwright)

- `event-creation.spec.ts`: Event creation flows
- `event-participation.spec.ts`: All participation scenarios
- `event-organizer-management.spec.ts`: Organizer actions
- `event-visibility.spec.ts`: Access control and visibility
- `event-agenda.spec.ts`: Agenda item management
- `event-calendar-integration.spec.ts`: Calendar functionality

## Edge Cases Covered

1. Event capacity limits and waiting lists
2. Multiple organizers coordination
3. Simultaneous participation requests
4. Event deletion with active participants
5. Visibility changes while users viewing
6. Timezone handling for events
7. Multi-day event display
8. Past event access restrictions
9. Orphaned events (deleted group/organizer)
10. Duplicate event prevention
11. Event image upload size/format limits
12. Location autocomplete failures
13. Concurrent edits by multiple organizers
14. Notification flood prevention
15. Calendar sync conflicts

## Future Test Considerations

1. Event check-in/check-out functionality
2. Event attendance tracking
3. Event feedback and ratings
4. Event cost/ticketing integration
5. Event reminders and notifications
6. Event export to external calendars (iCal)
7. Event duplication/templates
8. Event series management
9. Virtual event platform integration
10. Event analytics and reporting enhancements
