# Notifications Feature Test Plan

## Overview

Comprehensive test plan for the notifications system covering all notification types, read/unread status, filtering, navigation, and real-time updates.

## Test Scenarios

### 1. Load Notifications Page

- **Scenario**: User accesses the notifications page
- **Steps**:
  1. User navigates to /notifications
  2. Page loads with notification list
  3. Tabs visible for "All", "Unread", "Read"
  4. Mark all as read button visible
  5. Notifications sorted by most recent first
- **Expected Result**: Notifications page loads with proper layout

### 2. View All Notifications

- **Scenario**: User views all notifications
- **Steps**:
  1. User is on "All" tab
  2. All notifications display regardless of read status
  3. Unread notifications have visual indicator (bold, badge)
  4. Read notifications have muted appearance
  5. Each notification shows icon, sender, message, timestamp
- **Expected Result**: All notifications visible and properly styled

### 3. View Unread Notifications Only

- **Scenario**: User filters to unread notifications
- **Steps**:
  1. User clicks "Unread" tab
  2. Only unread notifications display
  3. Count badge shows number of unread
  4. List updates if new notification arrives
- **Expected Result**: Only unread notifications shown

### 4. View Read Notifications Only

- **Scenario**: User filters to read notifications
- **Steps**:
  1. User clicks "Read" tab
  2. Only previously read notifications display
  3. All notifications have muted styling
  4. Empty state if no read notifications
- **Expected Result**: Only read notifications shown

### 5. Mark Single Notification as Read

- **Scenario**: User marks individual notification as read
- **Steps**:
  1. User has unread notification
  2. User clicks on notification
  3. Notification marked as read immediately
  4. Visual styling changes to read state
  5. Unread count decreases by 1
  6. User navigated to related entity (if applicable)
- **Expected Result**: Individual notification marked read with navigation

### 6. Mark All Notifications as Read

- **Scenario**: User marks all notifications as read at once
- **Steps**:
  1. User has multiple unread notifications
  2. User clicks "Mark all as read" button
  3. All unread notifications marked as read
  4. Unread count becomes 0
  5. Visual styling updates for all notifications
- **Expected Result**: All notifications marked read simultaneously

### 7. Delete Single Notification

- **Scenario**: User deletes individual notification
- **Steps**:
  1. User hovers over notification
  2. Delete X button appears
  3. User clicks delete button
  4. Notification removed from list immediately
  5. No confirmation needed for single delete
- **Expected Result**: Notification deleted instantly

### 8. Notification Click Navigation - Group Invite

- **Scenario**: User clicks group invite notification
- **Steps**:
  1. User receives group invite notification
  2. Notification shows group name and inviter
  3. User clicks notification
  4. Marked as read
  5. User navigated to group page
- **Expected Result**: Navigate to group from notification

### 9. Notification Click Navigation - Event Invite

- **Scenario**: User clicks event invite notification
- **Steps**:
  1. User receives event invite notification
  2. Notification shows event name and time
  3. User clicks notification
  4. Marked as read
  5. User navigated to event page
- **Expected Result**: Navigate to event from notification

### 10. Notification Click Navigation - New Message

- **Scenario**: User clicks message notification
- **Steps**:
  1. User receives new message notification
  2. Notification shows sender and message preview
  3. User clicks notification
  4. Marked as read
  5. User navigated to messages page with conversation open
- **Expected Result**: Navigate to specific conversation

### 11. Notification Click Navigation - New Follower

- **Scenario**: User clicks follower notification
- **Steps**:
  1. User receives new follower notification
  2. Notification shows follower's name and avatar
  3. User clicks notification
  4. Marked as read
  5. User navigated to follower's profile
- **Expected Result**: Navigate to follower profile

### 12. Notification Click Navigation - Mention

- **Scenario**: User clicks mention notification
- **Steps**:
  1. User mentioned in comment/post
  2. Notification shows where they were mentioned
  3. User clicks notification
  4. Marked as read
  5. User navigated to post/comment with mention
- **Expected Result**: Navigate to mention location

### 13. Notification Click Navigation - Event Update

- **Scenario**: User clicks event update notification
- **Steps**:
  1. Event user participates in is updated
  2. Notification shows event name and what changed
  3. User clicks notification
  4. Marked as read
  5. User navigated to updated event
- **Expected Result**: Navigate to updated event

### 14. Notification Click Navigation - Group Update

- **Scenario**: User clicks group update notification
- **Steps**:
  1. Group user belongs to has update
  2. Notification shows group name and update type
  3. User clicks notification
  4. Marked as read
  5. User navigated to group page
- **Expected Result**: Navigate to updated group

### 15. Notification Icons by Type

- **Scenario**: Different notification types have appropriate icons
- **Steps**:
  1. User views notifications of different types
  2. Group invites show Users icon (blue)
  3. Event invites show Calendar icon (purple)
  4. Messages show MessageSquare icon (green)
  5. Follows show UserPlus icon (pink)
  6. Mentions show Bell icon (orange)
  7. Updates show appropriate icons
- **Expected Result**: Icons help identify notification types

### 16. Relative Timestamps

- **Scenario**: Notifications show time since received
- **Steps**:
  1. Recent notifications show "Xm ago"
  2. Older notifications show "Xh ago"
  3. Day-old notifications show "Xd ago"
  4. Week-old show date
  5. Timestamps update in real-time
- **Expected Result**: Timestamps are relative and readable

### 17. Real-Time Notification Arrival

- **Scenario**: New notifications appear immediately
- **Steps**:
  1. User is on notifications page
  2. New notification arrives
  3. Notification appears at top of list
  4. Unread count increments
  5. Visual/sound alert (if enabled)
  6. Page doesn't need refresh
- **Expected Result**: Real-time updates work instantly

### 18. Notification Badge in Navbar

- **Scenario**: Unread count shows in navbar icon
- **Steps**:
  1. User has unread notifications
  2. Bell icon in navbar shows count badge
  3. Badge shows number (e.g., "3")
  4. Badge disappears when all read
  5. Updates in real-time
- **Expected Result**: Navbar badge reflects unread count

### 19. Empty State - No Notifications

- **Scenario**: User with no notifications sees empty state
- **Steps**:
  1. New user opens notifications page
  2. Empty state illustration displays
  3. Message like "No notifications yet"
  4. Helpful text about what notifications appear here
- **Expected Result**: Friendly empty state for new users

### 20. Empty State - No Unread

- **Scenario**: Unread tab shows empty state when all read
- **Steps**:
  1. User marks all notifications as read
  2. User switches to Unread tab
  3. Empty state shows "You're all caught up!"
  4. Checkmark icon or similar positive indicator
- **Expected Result**: Positive empty state for caught-up users

### 21. Notification Grouping by Date

- **Scenario**: Notifications grouped by time period
- **Steps**:
  1. User has notifications from different days
  2. Notifications grouped under "Today", "Yesterday", "This week", "Older"
  3. Date headers separate groups
  4. Easy to scan chronologically
- **Expected Result**: Date grouping improves readability

### 22. Notification Priority Levels

- **Scenario**: Important notifications highlighted
- **Steps**:
  1. Critical notifications (mentions, invites) shown first
  2. Different styling for priority levels
  3. High priority notifications bold or highlighted
  4. Low priority notifications less prominent
- **Expected Result**: Priority helps users focus on important items

### 23. Bulk Delete Notifications

- **Scenario**: User deletes multiple notifications at once
- **Steps**:
  1. User enters selection mode
  2. Checkboxes appear on notifications
  3. User selects multiple notifications
  4. User clicks delete button
  5. Confirmation dialog appears
  6. User confirms
  7. Selected notifications deleted
- **Expected Result**: Bulk operations save time

### 24. Notification Settings

- **Scenario**: User customizes notification preferences
- **Steps**:
  1. User opens notification settings
  2. Toggles for each notification type
  3. User disables message notifications
  4. User enables event update notifications
  5. Settings saved
  6. Notifications arrive according to preferences
- **Expected Result**: User controls what notifications they receive

### 25. Browser Notifications Permission

- **Scenario**: User enables browser push notifications
- **Steps**:
  1. User clicks enable notifications button
  2. Browser permission prompt appears
  3. User grants permission
  4. New notification arrives
  5. Browser shows notification even when tab not active
- **Expected Result**: Browser notifications work when permitted

### 26. Notification Sound

- **Scenario**: Sound plays when notification arrives
- **Steps**:
  1. User has sound enabled in settings
  2. New notification arrives
  3. Notification sound plays
  4. User can toggle sound on/off
  5. Sound respects browser/system volume
- **Expected Result**: Audio feedback for new notifications

### 27. Notification Persistence

- **Scenario**: Notifications persist across sessions
- **Steps**:
  1. User receives notifications
  2. User closes browser
  3. User reopens application
  4. All previous notifications still visible
  5. Read/unread state preserved
- **Expected Result**: Notifications stored persistently

### 28. Long Notification Text

- **Scenario**: Long notification messages truncated properly
- **Steps**:
  1. Notification has very long message
  2. Text truncated with ellipsis
  3. User can click to expand or see full text
  4. Layout doesn't break
- **Expected Result**: Long text handled gracefully

### 29. Notification Links and Actions

- **Scenario**: Notifications with action buttons
- **Steps**:
  1. Group invite notification has Accept/Decline buttons
  2. User clicks Accept
  3. Action processed without page navigation
  4. Notification updates to show accepted state
  5. Group membership updated
- **Expected Result**: In-notification actions work efficiently

### 30. Notification Cleanup/Archive

- **Scenario**: Old notifications automatically archived
- **Steps**:
  1. Notifications older than 30 days move to archive
  2. User can access archived notifications
  3. Archive doesn't count toward unread
  4. User can permanently delete archived
- **Expected Result**: Old notifications don't clutter main view

## Test Coverage Summary

### Unit Tests (Vitest)

- Notification filtering logic
- Timestamp formatting
- Unread count calculation
- Icon selection by type
- Navigation URL generation

### E2E Tests (Playwright)

- Mark as read functionality
- Delete notifications
- Tab filtering
- Click navigation to entities
- Real-time updates

## Edge Cases Covered

1. Very large number of notifications
2. Rapid notification arrivals
3. Deleted related entities (broken links)
4. Missing sender information
5. Notifications from blocked users
6. Browser permission denial
7. Offline notification queuing
8. Duplicate notifications
9. Notification ordering edge cases
10. Browser refresh during mark as read
