# Timeline Feature Test Plan

## Overview

Comprehensive test plan for the subscription-based timeline/feed system that displays updates from subscribed users, groups, events, blogs, and amendments.

## Test Scenarios

### 1. Load Timeline Page

- **Scenario**: Authenticated user loads home page with timeline
- **Steps**:
  1. User logs in
  2. User navigates to home page (/)
  3. Timeline component loads
  4. Shows "Your Timeline" or "Subscription Feed" heading
  5. Loading indicator appears while fetching
- **Expected Result**: Timeline page loads successfully

### 2. View Subscription-Based Timeline

- **Scenario**: User sees timeline events from their subscriptions
- **Steps**:
  1. User has subscriptions to users, groups, events
  2. Timeline displays updates from all subscribed entities
  3. Events sorted by most recent first
  4. Each event shows type, actor, entity, and timestamp
- **Expected Result**: Timeline shows relevant subscription updates

### 3. Empty Timeline - No Subscriptions

- **Scenario**: User with no subscriptions sees empty state
- **Steps**:
  1. New user with zero subscriptions loads timeline
  2. Empty state displays
  3. Message like "Subscribe to users, groups, or events to see updates"
  4. Suggestions to discover and subscribe
  5. Links to search or featured entities
- **Expected Result**: Helpful empty state encourages subscriptions

### 4. Timeline Event - New Blog Post

- **Scenario**: Timeline shows when subscribed user publishes blog
- **Steps**:
  1. User subscribed to another user
  2. That user creates new blog post
  3. Timeline event appears
  4. Shows blog title, excerpt, author, timestamp
  5. User can click to read full blog
- **Expected Result**: Blog creation events appear in timeline

### 5. Timeline Event - New Amendment

- **Scenario**: Timeline shows new amendment from subscription
- **Steps**:
  1. User subscribed to group or user
  2. Subscribed entity creates amendment
  3. Timeline event shows amendment creation
  4. Shows amendment title, author, timestamp
  5. Clicking navigates to amendment
- **Expected Result**: Amendment creation in timeline

### 6. Timeline Event - Group Update

- **Scenario**: Timeline shows updates from subscribed groups
- **Steps**:
  1. User subscribed to group
  2. Group has update (new member, role change, etc.)
  3. Timeline event appears
  4. Shows group name, update type, timestamp
  5. User can click to view group
- **Expected Result**: Group updates appear in timeline

### 7. Timeline Event - Event Update

- **Scenario**: Timeline shows updates from subscribed events
- **Steps**:
  1. User subscribed to event or participating in event
  2. Event details change (time, location, etc.)
  3. Timeline event shows update
  4. Shows event name, what changed, timestamp
  5. User can click to view updated event
- **Expected Result**: Event updates in timeline

### 8. Timeline Event - User Activity

- **Scenario**: Timeline shows activity from subscribed users
- **Steps**:
  1. User follows another user
  2. Followed user creates statement, joins group, etc.
  3. Timeline shows activity
  4. Activity type clearly indicated
  5. User can interact with activity
- **Expected Result**: User activity updates appear

### 9. Timeline Event Types Filtering

- **Scenario**: User filters timeline by event type
- **Steps**:
  1. User clicks filter dropdown
  2. Options: All, Blogs, Amendments, Groups, Events, Users
  3. User selects "Blogs"
  4. Timeline shows only blog-related events
  5. User can clear filter to see all
- **Expected Result**: Filtering works by event type

### 10. Timeline Infinite Scroll

- **Scenario**: User scrolls to load more timeline events
- **Steps**:
  1. User views initial timeline events
  2. User scrolls to bottom
  3. Loading indicator appears
  4. Next batch of older events loads
  5. User can continue scrolling
  6. Smooth loading without page jump
- **Expected Result**: Infinite scroll loads more events

### 11. Pull to Refresh Timeline

- **Scenario**: User refreshes timeline to see latest updates
- **Steps**:
  1. User pulls down on mobile or clicks refresh button
  2. Loading indicator shows
  3. Timeline fetches latest events
  4. New events appear at top
  5. User's scroll position maintained
- **Expected Result**: Pull to refresh updates timeline

### 12. Timeline Event Card Click

- **Scenario**: User clicks timeline event to navigate
- **Steps**:
  1. User sees blog post event in timeline
  2. User clicks anywhere on event card
  3. User navigated to full blog post
  4. Navigation is smooth
  5. Back button returns to timeline
- **Expected Result**: Clicking events navigates to entity

### 13. Timeline Event Actor Information

- **Scenario**: Events show who performed the action
- **Steps**:
  1. Timeline event displays actor avatar
  2. Actor name shown
  3. Actor handle (if applicable)
  4. Clicking actor navigates to their profile
  5. Default avatar if none set
- **Expected Result**: Actor information clear and clickable

### 14. Timeline Event Timestamps

- **Scenario**: Events show when they occurred
- **Steps**:
  1. Recent events show "Xm ago" or "Xh ago"
  2. Today's events show time
  3. Older events show date
  4. Timestamps update in real-time
  5. Hover shows exact timestamp
- **Expected Result**: Timestamps are relative and clear

### 15. Timeline Event Icons

- **Scenario**: Different event types have distinct icons
- **Steps**:
  1. Blog events show book/document icon
  2. Amendment events show scale/document icon
  3. Group events show users/group icon
  4. Event updates show calendar icon
  5. User activities show person icon
  6. Icons color-coded by type
- **Expected Result**: Icons help identify event types

### 16. Timeline Real-Time Updates

- **Scenario**: New events appear without page refresh
- **Steps**:
  1. User viewing timeline
  2. Subscribed entity creates new content
  3. New event appears at top of timeline immediately
  4. Subtle animation draws attention
  5. No page reload needed
- **Expected Result**: Real-time updates work instantly

### 17. Timeline Event Actions

- **Scenario**: User can interact with timeline events
- **Steps**:
  1. Timeline event has action buttons
  2. User can like/upvote from timeline
  3. User can comment from timeline
  4. User can share event
  5. Actions update immediately
- **Expected Result**: Quick actions work from timeline

### 18. Timeline Subscribe from Event

- **Scenario**: User subscribes to entity from timeline event
- **Steps**:
  1. Timeline shows event from non-subscribed entity
  2. Subscribe button visible on event card
  3. User clicks subscribe
  4. Subscription created
  5. Future events from entity appear in timeline
- **Expected Result**: Easy subscription from timeline

### 19. Timeline Unsubscribe Effect

- **Scenario**: Unsubscribing removes events from timeline
- **Steps**:
  1. User subscribed to entity
  2. Timeline shows events from that entity
  3. User unsubscribes from entity
  4. Future events no longer appear
  5. Existing events remain (or are filtered)
- **Expected Result**: Unsubscribe affects timeline content

### 20. Timeline Mixed Content

- **Scenario**: Timeline shows diverse content from multiple sources
- **Steps**:
  1. User subscribed to users, groups, events, blogs
  2. Timeline interleaves content from all sources
  3. Chronological ordering maintained
  4. Content types visually distinct
  5. Easy to scan and navigate
- **Expected Result**: Mixed content is organized and readable

### 21. Timeline Date Separators

- **Scenario**: Timeline groups events by date
- **Steps**:
  1. User has events from multiple days
  2. Date separators show "Today", "Yesterday", "This week"
  3. Older events grouped by date
  4. Separators improve scanability
- **Expected Result**: Date grouping aids navigation

### 22. Timeline Loading States

- **Scenario**: UI shows loading indicators appropriately
- **Steps**:
  1. Initial load shows skeleton or spinner
  2. Infinite scroll shows bottom loader
  3. Refresh shows top loader
  4. Loading doesn't block interaction unnecessarily
- **Expected Result**: Loading states provide clear feedback

### 23. Timeline Error Handling

- **Scenario**: Timeline handles fetch errors gracefully
- **Steps**:
  1. Network error occurs during fetch
  2. Error message displays
  3. Retry button appears
  4. User can retry loading
  5. Previous content preserved if possible
- **Expected Result**: Errors handled without breaking UI

### 24. Timeline Cache and Performance

- **Scenario**: Timeline uses caching for better performance
- **Steps**:
  1. User loads timeline
  2. Events cached locally
  3. User navigates away and returns
  4. Timeline loads instantly from cache
  5. Background refresh for new content
- **Expected Result**: Caching improves perceived performance

### 25. Timeline Bookmark/Save Event

- **Scenario**: User saves timeline event for later
- **Steps**:
  1. User sees interesting event in timeline
  2. User clicks bookmark/save icon
  3. Event saved to user's saved items
  4. Visual indicator shows saved status
  5. User can access saved items later
- **Expected Result**: Bookmarking works from timeline

### 26. Timeline Hide/Mute Event

- **Scenario**: User hides unwanted timeline event
- **Steps**:
  1. User sees event they don't want to see
  2. User clicks hide/mute option
  3. Event removed from timeline
  4. Option to undo immediately after
  5. Preference remembered
- **Expected Result**: Users can curate their timeline

### 27. Timeline Share Event

- **Scenario**: User shares timeline event
- **Steps**:
  1. User clicks share button on event
  2. Share dialog opens
  3. Options to copy link, share to social
  4. User copies link
  5. Link works when pasted elsewhere
- **Expected Result**: Sharing from timeline is easy

### 28. Timeline Notification Integration

- **Scenario**: Timeline events related to notifications
- **Steps**:
  1. User receives notification
  2. Clicks notification
  3. Navigates to timeline
  4. Related event highlighted
  5. User can see context around event
- **Expected Result**: Timeline and notifications integrate

### 29. Timeline Trending/Highlights

- **Scenario**: Timeline shows trending content
- **Steps**:
  1. Timeline has "Trending" section
  2. Shows most engaged events
  3. User can switch between "Following" and "Trending"
  4. Trending updates based on activity
- **Expected Result**: Trending content discoverable

### 30. Timeline Personalization

- **Scenario**: Timeline learns user preferences
- **Steps**:
  1. User interacts with certain types of events more
  2. Algorithm shows more of preferred content
  3. Less relevant content de-prioritized
  4. User sees more engaging timeline
  5. Personalization can be reset/adjusted
- **Expected Result**: Timeline becomes more relevant over time

## Test Coverage Summary

### Unit Tests (Vitest)

- Event sorting logic
- Filtering by type
- Timestamp formatting
- Actor information extraction
- Subscription filtering logic

### E2E Tests (Playwright)

- Timeline loading and display
- Infinite scroll
- Event navigation
- Subscribe/unsubscribe from timeline
- Real-time updates

## Edge Cases Covered

1. No subscriptions (empty timeline)
2. Very large number of events
3. Deleted subscribed entities
4. Orphaned timeline events
5. Rapid event creation
6. Concurrent updates from multiple entities
7. Very old timeline events
8. Mixed event types in quick succession
9. Browser refresh mid-scroll
10. Network interruption during load
