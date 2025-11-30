# Calendar Feature Test Plan

## Overview

Comprehensive test plan for the calendar system covering event display, meeting slots, view modes (day/week/month), event creation, participation tracking, and calendar navigation.

## Test Scenarios

### 1. Load Calendar Page

- **Scenario**: User accesses the calendar page
- **Steps**:
  1. User navigates to /calendar
  2. Page loads with default day view
  3. Current date selected
  4. Events for today displayed
  5. View mode toggle buttons visible
- **Expected Result**: Calendar page loads with today's events

### 2. Day View

- **Scenario**: User views calendar in day mode
- **Steps**:
  1. User in day view
  2. Shows hourly time slots (e.g., 9 AM - 5 PM)
  3. Events displayed in time slots
  4. Current time indicator line
  5. All-day events shown at top
  6. Can scroll through hours
- **Expected Result**: Day view shows detailed hourly schedule

### 3. Week View

- **Scenario**: User views calendar in week mode
- **Steps**:
  1. User clicks "Week" view button
  2. Shows 7 days (Sunday - Saturday)
  3. Events distributed across days
  4. Time slots for each day
  5. Can see weekly schedule at a glance
- **Expected Result**: Week view shows 7-day overview

### 4. Month View

- **Scenario**: User views calendar in month mode
- **Steps**:
  1. User clicks "Month" view button
  2. Shows full month calendar grid
  3. Each day shows event count or dots
  4. Current day highlighted
  5. Previous/next month days visible
  6. Can click day to see day view
- **Expected Result**: Month view shows entire month layout

### 5. Switch Between Views

- **Scenario**: User toggles between day/week/month views
- **Steps**:
  1. User in day view
  2. Clicks week view
  3. View changes smoothly
  4. Clicks month view
  5. Returns to day view
  6. Selected date maintained across views
- **Expected Result**: View switching is seamless

### 6. Navigate to Previous Day/Week/Month

- **Scenario**: User navigates backward in time
- **Steps**:
  1. User clicks "Previous" arrow
  2. In day view: shows previous day
  3. In week view: shows previous week
  4. In month view: shows previous month
  5. Events for new time period load
- **Expected Result**: Backward navigation works in all views

### 7. Navigate to Next Day/Week/Month

- **Scenario**: User navigates forward in time
- **Steps**:
  1. User clicks "Next" arrow
  2. In day view: shows next day
  3. In week view: shows next week
  4. In month view: shows next month
  5. Future events displayed
- **Expected Result**: Forward navigation works correctly

### 8. Go to Today

- **Scenario**: User quickly returns to current date
- **Steps**:
  1. User navigated to different date
  2. User clicks "Today" button
  3. Calendar jumps to current date
  4. Current date highlighted
  5. Today's events displayed
- **Expected Result**: "Today" button provides quick navigation

### 9. Select Specific Date

- **Scenario**: User clicks on a date to view it
- **Steps**:
  1. User in month view
  2. User clicks on specific date
  3. View switches to day view for that date
  4. Events for selected date displayed
  5. Date highlighted in calendar
- **Expected Result**: Date selection navigates to day view

### 10. View User's Events

- **Scenario**: Calendar shows events user is involved in
- **Steps**:
  1. User loads calendar
  2. Shows events where user is:
     - Organizer, OR
     - Participant
  3. Both types visible in calendar
  4. Different styling for organizer vs participant
- **Expected Result**: All relevant events displayed

### 11. View Meeting Slots

- **Scenario**: Calendar shows meeting slots alongside events
- **Steps**:
  1. User has meeting slots created
  2. Meeting slots appear in calendar
  3. Distinguished from regular events (different color/icon)
  4. Shows meeting title, time, participants
  5. Both owned and booked meetings shown
- **Expected Result**: Meeting slots integrated with events

### 12. Event Details on Hover

- **Scenario**: User hovers over event for quick info
- **Steps**:
  1. User hovers mouse over event card
  2. Tooltip or popover appears
  3. Shows event name, time, location
  4. Shows organizer and participant count
  5. Disappears when mouse leaves
- **Expected Result**: Hover provides quick event info

### 13. Click Event to View Details

- **Scenario**: User clicks event to see full details
- **Steps**:
  1. User clicks on event card
  2. Navigates to event detail page
  3. Or modal opens with event info
  4. Can see full description, participants, location
  5. Can join/leave event from detail view
- **Expected Result**: Clicking event shows complete information

### 14. Create Event from Calendar

- **Scenario**: User creates new event from calendar
- **Steps**:
  1. User clicks on empty time slot
  2. Create event dialog opens
  3. Time pre-filled based on slot
  4. User enters event details
  5. User saves event
  6. Event appears in calendar immediately
- **Expected Result**: Quick event creation from calendar

### 15. Multi-Day Events

- **Scenario**: Events spanning multiple days display correctly
- **Steps**:
  1. Event has start and end on different days
  2. In week/month view, event spans across days
  3. In day view, shows on start day
  4. Duration clearly indicated
  5. Can see full span in week/month
- **Expected Result**: Multi-day events rendered properly

### 16. All-Day Events

- **Scenario**: All-day events shown at top of day
- **Steps**:
  1. Event marked as all-day
  2. Appears in special all-day section
  3. Not tied to specific time slot
  4. Visible in day and week views
  5. Shows as colored bar in month view
- **Expected Result**: All-day events don't clutter time slots

### 17. Overlapping Events

- **Scenario**: Multiple events at same time displayed clearly
- **Steps**:
  1. Two events scheduled at same time
  2. Both events visible in calendar
  3. Cards stacked or side-by-side
  4. Both are clickable
  5. Visual indication of overlap
- **Expected Result**: Overlapping events both accessible

### 18. Event Color Coding

- **Scenario**: Events color-coded by type or category
- **Steps**:
  1. Regular events one color
  2. Meeting slots another color
  3. Events from different groups different colors
  4. Color legend available
  5. User can customize colors (optional)
- **Expected Result**: Colors help distinguish event types

### 19. Filter Events by Type

- **Scenario**: User filters calendar to show specific events
- **Steps**:
  1. User opens filter menu
  2. Options: All Events, Only Meetings, Only Group Events
  3. User selects "Only Group Events"
  4. Calendar shows only filtered events
  5. Filter can be cleared
- **Expected Result**: Filtering helps focus on specific events

### 20. Search Events in Calendar

- **Scenario**: User searches for specific event
- **Steps**:
  1. User types in search box
  2. Calendar highlights matching events
  3. Non-matching events dimmed
  4. Can navigate to found events
  5. Search clears to show all
- **Expected Result**: Search finds events quickly

### 21. Event Participation Status

- **Scenario**: Calendar shows user's participation status
- **Steps**:
  1. Events show if user is:
     - Organizer (special badge/icon)
     - Confirmed participant (green checkmark)
     - Pending invitation (yellow indicator)
  2. Status visible on event card
  3. Can change status from calendar
- **Expected Result**: Participation status clear at a glance

### 22. Calendar Export

- **Scenario**: User exports calendar to external format
- **Steps**:
  1. User clicks export button
  2. Options: iCal, Google Calendar, Outlook
  3. User selects format
  4. File downloads or calendar link provided
  5. Can import into external calendar
- **Expected Result**: Calendar export works for integration

### 23. Calendar Sync

- **Scenario**: Calendar syncs with external calendars
- **Steps**:
  1. User connects external calendar (Google, Outlook)
  2. Events sync bidirectionally
  3. Changes reflected in both calendars
  4. Conflicts handled gracefully
- **Expected Result**: Sync keeps calendars in sync

### 24. Recurring Events

- **Scenario**: Events that repeat display correctly
- **Steps**:
  1. Weekly meeting set to recur
  2. Event appears on all future weeks
  3. Can edit single instance or all
  4. Deleting one doesn't delete all
  5. Recurrence pattern editable
- **Expected Result**: Recurring events handled properly

### 25. Event Reminders

- **Scenario**: User receives reminders before events
- **Steps**:
  1. Event has reminder set for 1 hour before
  2. Notification sent at reminder time
  3. Notification shows event details
  4. Can snooze or dismiss
  5. Multiple reminders supported
- **Expected Result**: Reminders help users not miss events

### 26. Time Zone Support

- **Scenario**: Calendar handles different time zones
- **Steps**:
  1. Event created in different time zone
  2. Time converted to user's local time zone
  3. Original time zone shown in details
  4. User can see event in both time zones
- **Expected Result**: Time zones handled correctly

### 27. Calendar Print View

- **Scenario**: User prints calendar for offline use
- **Steps**:
  1. User clicks print button
  2. Print-friendly layout appears
  3. Shows selected view (day/week/month)
  4. Includes event details
  5. User can print or save as PDF
- **Expected Result**: Print view is clean and useful

### 28. Empty Calendar State

- **Scenario**: User with no events sees helpful message
- **Steps**:
  1. New user or selected date has no events
  2. Empty state message displays
  3. "No events scheduled" with icon
  4. Prompt to create event
  5. Link to upcoming events
- **Expected Result**: Empty state encourages engagement

### 29. Calendar Loading States

- **Scenario**: UI shows loading indicators
- **Steps**:
  1. User changes view or date
  2. Loading spinner or skeleton appears
  3. Events load progressively
  4. Smooth transition when loaded
  5. No layout shift
- **Expected Result**: Loading provides clear feedback

### 30. Mobile Calendar View

- **Scenario**: Calendar responsive on mobile devices
- **Steps**:
  1. User opens calendar on mobile
  2. Day view default on mobile
  3. Swipe gestures to change days
  4. Tap to view event details
  5. Create button accessible
  6. Simplified layout for small screen
- **Expected Result**: Mobile calendar is touch-friendly

## Test Coverage Summary

### Unit Tests (Vitest)

- Date navigation logic
- View switching
- Event filtering
- Time slot calculations
- Overlap detection

### E2E Tests (Playwright)

- View mode switching
- Event display in different views
- Navigation between dates
- Event creation from calendar
- Participation status updates

## Edge Cases Covered

1. Events at midnight
2. Very long event titles
3. Events spanning months
4. Many overlapping events
5. Time zone edge cases
6. Daylight saving time transitions
7. Leap year dates
8. Past events vs future events
9. Deleted events still in calendar cache
10. Browser time vs server time mismatch
