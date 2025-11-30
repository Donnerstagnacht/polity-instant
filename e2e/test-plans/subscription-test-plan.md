# Subscription Test Plan

## Overview

Comprehensive test plan for the subscription system covering all entity types (users, groups, events, blogs, amendments) and user flows.

## Test Scenarios

### 1. Subscribe to User

- **Scenario**: User subscribes to another user to receive updates
- **Steps**:
  1. User navigates to another user's profile page
  2. User clicks "Subscribe" button
  3. Subscription is created in database
  4. Button changes to "Unsubscribe"
  5. Subscriber count increases by 1
  6. User starts receiving updates from subscribed user
- **Expected Result**: Subscription is created and user receives updates
- **Covered in**: `user-subscription.spec.ts` - "User can subscribe to another user"

### 2. Unsubscribe from User

- **Scenario**: User unsubscribes from another user
- **Steps**:
  1. User is subscribed to another user
  2. User clicks "Unsubscribe" button
  3. Subscription is deleted from database
  4. Button changes to "Subscribe"
  5. Subscriber count decreases by 1
  6. User stops receiving updates from unsubscribed user
- **Expected Result**: Subscription is removed and updates stop
- **Covered in**: `user-subscription.spec.ts` - "User can unsubscribe from user"

### 3. Subscribe to Group

- **Scenario**: User subscribes to a group to receive updates
- **Steps**:
  1. User navigates to group page
  2. User clicks "Subscribe" button
  3. Subscription is created in database
  4. Button changes to "Unsubscribe"
  5. Subscriber count increases by 1
  6. User receives group activity updates
- **Expected Result**: Subscription is created and user receives group updates
- **Covered in**: `group-subscription.spec.ts` - "User can subscribe to group"

### 4. Unsubscribe from Group

- **Scenario**: User unsubscribes from a group
- **Steps**:
  1. User is subscribed to a group
  2. User clicks "Unsubscribe" button
  3. Subscription is deleted from database
  4. Button changes to "Subscribe"
  5. Subscriber count decreases by 1
  6. User stops receiving group updates
- **Expected Result**: Subscription is removed and updates stop
- **Covered in**: `group-subscription.spec.ts` - "User can unsubscribe from group"

### 5. Subscribe to Event

- **Scenario**: User subscribes to an event to receive updates
- **Steps**:
  1. User navigates to event page
  2. User clicks "Subscribe" button
  3. Subscription is created in database
  4. Button changes to "Unsubscribe"
  5. Subscriber count increases by 1
  6. User receives event updates (time changes, cancellations, etc.)
- **Expected Result**: Subscription is created and user receives event updates
- **Covered in**: `event-subscription.spec.ts` - "User can subscribe to event"

### 6. Unsubscribe from Event

- **Scenario**: User unsubscribes from an event
- **Steps**:
  1. User is subscribed to an event
  2. User clicks "Unsubscribe" button
  3. Subscription is deleted from database
  4. Button changes to "Subscribe"
  5. Subscriber count decreases by 1
  6. User stops receiving event updates
- **Expected Result**: Subscription is removed and updates stop
- **Covered in**: `event-subscription.spec.ts` - "User can unsubscribe from event"

### 7. Subscribe to Blog

- **Scenario**: User subscribes to a blog to receive new post notifications
- **Steps**:
  1. User navigates to blog page
  2. User clicks "Subscribe" button
  3. Subscription is created in database
  4. Button changes to "Unsubscribe"
  5. Subscriber count increases by 1
  6. User receives notifications for new blog posts
- **Expected Result**: Subscription is created and user receives blog updates
- **Covered in**: `blog-subscription.spec.ts` - "User can subscribe to blog"

### 8. Unsubscribe from Blog

- **Scenario**: User unsubscribes from a blog
- **Steps**:
  1. User is subscribed to a blog
  2. User clicks "Unsubscribe" button
  3. Subscription is deleted from database
  4. Button changes to "Subscribe"
  5. Subscriber count decreases by 1
  6. User stops receiving blog post notifications
- **Expected Result**: Subscription is removed and updates stop
- **Covered in**: `blog-subscription.spec.ts` - "User can unsubscribe from blog"

### 9. Subscribe to Amendment

- **Scenario**: User subscribes to an amendment to receive updates
- **Steps**:
  1. User navigates to amendment page
  2. User clicks "Subscribe" button
  3. Subscription is created in database
  4. Button changes to "Unsubscribe"
  5. Subscriber count increases by 1
  6. User receives amendment updates (discussions, votes, changes)
- **Expected Result**: Subscription is created and user receives amendment updates
- **Covered in**: `amendment-subscription.spec.ts` - "User can subscribe to amendment"

### 10. Unsubscribe from Amendment

- **Scenario**: User unsubscribes from an amendment
- **Steps**:
  1. User is subscribed to an amendment
  2. User clicks "Unsubscribe" button
  3. Subscription is deleted from database
  4. Button changes to "Subscribe"
  5. Subscriber count decreases by 1
  6. User stops receiving amendment updates
- **Expected Result**: Subscription is removed and updates stop
- **Covered in**: `amendment-subscription.spec.ts` - "User can unsubscribe from amendment"

### 11. View Subscription Timeline

- **Scenario**: User views aggregated timeline of subscribed content
- **Steps**:
  1. User navigates to their subscriptions page
  2. Timeline displays recent activity from all subscriptions
  3. Activity includes: user posts, group updates, event changes, blog posts, amendment updates
  4. Items are sorted by timestamp (newest first)
  5. User can filter by entity type (users, groups, events, blogs, amendments)
- **Expected Result**: User sees combined feed of all subscription activity
- **Covered in**: `subscription-timeline.spec.ts` - "User can view subscription timeline"

### 12. Filter Subscription Timeline

- **Scenario**: User filters subscription timeline by entity type
- **Steps**:
  1. User navigates to subscriptions page
  2. User selects filter (e.g., "Groups only")
  3. Timeline updates to show only group activity
  4. User can toggle multiple filters
  5. User can clear filters to see all activity
- **Expected Result**: Timeline shows only selected entity types
- **Covered in**: `subscription-timeline.spec.ts` - "User can filter subscription timeline"

### 13. View Subscriptions List

- **Scenario**: User views list of all their subscriptions
- **Steps**:
  1. User navigates to subscriptions page
  2. User sees organized lists by entity type
  3. Lists show: Users, Groups, Events, Blogs, Amendments
  4. Each item shows basic info and subscriber count
  5. User can unsubscribe directly from list
- **Expected Result**: User sees all their subscriptions organized by type
- **Covered in**: `subscription-list.spec.ts` - "User can view all subscriptions"

### 14. Subscriber Count Accuracy

- **Scenario**: Subscriber count displays correctly
- **Steps**:
  1. Subscribe to an entity
  2. Subscriber count increases by 1
  3. Unsubscribe from entity
  4. Subscriber count decreases by 1
  5. Count updates in real-time across all instances
- **Expected Result**: Accurate subscriber count at all times
- **Covered in**: `subscription-counts.spec.ts` - "Subscriber count updates correctly"

### 15. Prevent Duplicate Subscriptions

- **Scenario**: System prevents duplicate subscriptions
- **Steps**:
  1. User subscribes to an entity
  2. User attempts to subscribe again
  3. System detects existing subscription
  4. No duplicate created
  5. Button remains in "Unsubscribe" state
- **Expected Result**: Only one subscription exists per user-entity pair
- **Covered in**: `subscription-validation.spec.ts` - "Cannot create duplicate subscriptions"

### 16. Subscribe to Own Content

- **Scenario**: User attempts to subscribe to their own content
- **Steps**:
  1. User navigates to their own profile/group/blog/etc.
  2. Subscribe button is hidden or disabled
  3. User cannot subscribe to their own content
- **Expected Result**: Self-subscription is prevented
- **Covered in**: `subscription-validation.spec.ts` - "Cannot subscribe to own content"

### 17. Subscription Permissions

- **Scenario**: Subscription respects entity visibility
- **Steps**:
  1. User attempts to subscribe to private entity
  2. If no access permission, subscription is denied
  3. If user gains permission, can then subscribe
  4. If permission revoked, subscription may be removed
- **Expected Result**: Subscriptions follow access control rules
- **Covered in**: `subscription-permissions.spec.ts` - "Subscription respects permissions"

### 18. Batch Subscribe from Search

- **Scenario**: User subscribes to multiple entities from search results
- **Steps**:
  1. User performs search for groups/users/etc.
  2. Search results show subscribe buttons
  3. User clicks subscribe on multiple items
  4. Subscriptions are created
  5. Buttons update to "Unsubscribe"
- **Expected Result**: User can subscribe without leaving search page
- **Covered in**: `subscription-search.spec.ts` - "User can subscribe from search results"

### 19. Subscription Notifications

- **Scenario**: User receives notifications from subscriptions
- **Steps**:
  1. User is subscribed to entity
  2. Entity has new activity
  3. User receives notification
  4. Notification includes: entity name, activity type, timestamp
  5. User can click notification to view activity
- **Expected Result**: User receives timely notifications
- **Covered in**: `subscription-notifications.spec.ts` - "User receives subscription notifications"

### 20. Subscription Activity Preferences

- **Scenario**: User customizes notification preferences per subscription
- **Steps**:
  1. User navigates to subscription settings
  2. User can set preferences: all activity, important only, none
  3. User can set delivery method: in-app, email, both
  4. Settings are saved per subscription
  5. Notifications respect user preferences
- **Expected Result**: User receives notifications according to preferences
- **Covered in**: `subscription-preferences.spec.ts` - "User can set subscription preferences"

### 21. Unauthenticated Subscription Attempt

- **Scenario**: Unauthenticated user attempts to subscribe
- **Steps**:
  1. Unauthenticated user views entity page
  2. User clicks subscribe button
  3. User is redirected to login page
  4. After login, user is returned to entity page
  5. User can then subscribe
- **Expected Result**: User must authenticate before subscribing
- **Covered in**: `subscription-auth.spec.ts` - "Unauthenticated user cannot subscribe"

### 22. Subscription Analytics

- **Scenario**: Content creator views subscriber analytics
- **Steps**:
  1. User views their own group/blog/amendment
  2. User accesses analytics/stats section
  3. User sees: total subscribers, growth over time, engagement metrics
  4. User can export subscriber list (if permitted)
- **Expected Result**: Creator can track subscription metrics
- **Covered in**: `subscription-analytics.spec.ts` - "Creator can view subscriber analytics"

### 23. Bulk Unsubscribe

- **Scenario**: User unsubscribes from multiple entities at once
- **Steps**:
  1. User navigates to subscriptions page
  2. User selects multiple subscriptions via checkboxes
  3. User clicks "Unsubscribe from Selected"
  4. Confirmation dialog appears
  5. User confirms bulk unsubscribe
  6. All selected subscriptions are removed
- **Expected Result**: Multiple subscriptions removed efficiently
- **Covered in**: `subscription-bulk-actions.spec.ts` - "User can bulk unsubscribe"

### 24. Subscription on Entity Deletion

- **Scenario**: Entity is deleted while user is subscribed
- **Steps**:
  1. User is subscribed to entity
  2. Entity is deleted by owner
  3. Subscription is automatically removed
  4. User receives notification about deletion
  5. Subscription no longer appears in user's list
- **Expected Result**: Orphaned subscriptions are cleaned up
- **Covered in**: `subscription-cleanup.spec.ts` - "Subscriptions removed when entity deleted"

### 25. Subscribe via Share Link

- **Scenario**: User subscribes to entity via shared link
- **Steps**:
  1. User receives share link for entity
  2. User clicks link and navigates to entity page
  3. User sees subscribe button
  4. User clicks subscribe
  5. Subscription is created
- **Expected Result**: User can discover and subscribe via links
- **Covered in**: `subscription-sharing.spec.ts` - "User can subscribe via share link"

### 26. Subscription Loading States

- **Scenario**: UI shows loading states during subscription operations
- **Steps**:
  1. User clicks subscribe button
  2. Button shows loading spinner
  3. Button is disabled during operation
  4. Operation completes
  5. Button updates to new state (Unsubscribe)
- **Expected Result**: User gets feedback during async operations
- **Covered in**: `subscription-ui.spec.ts` - "Subscribe button shows loading state"

### 27. Subscription Error Handling

- **Scenario**: System handles subscription errors gracefully
- **Steps**:
  1. User attempts to subscribe
  2. Network error or server error occurs
  3. User sees error message
  4. Button returns to previous state
  5. User can retry operation
- **Expected Result**: Errors are communicated clearly
- **Covered in**: `subscription-errors.spec.ts` - "Subscription errors are handled"

### 28. Cross-Entity Subscription Discovery

- **Scenario**: User discovers related content to subscribe to
- **Steps**:
  1. User subscribes to a group
  2. System suggests related groups, events, amendments
  3. User sees "You might also like" section
  4. User can subscribe to suggestions
- **Expected Result**: User discovers relevant content
- **Covered in**: `subscription-discovery.spec.ts` - "User sees subscription recommendations"

### 29. Subscription Export

- **Scenario**: User exports their subscription list
- **Steps**:
  1. User navigates to subscriptions page
  2. User clicks "Export Subscriptions"
  3. User selects format (CSV, JSON)
  4. File is downloaded with all subscription data
  5. File includes: entity type, entity name, subscription date
- **Expected Result**: User can backup subscription list
- **Covered in**: `subscription-export.spec.ts` - "User can export subscriptions"

### 30. Subscription Import

- **Scenario**: User imports subscription list
- **Steps**:
  1. User navigates to subscriptions page
  2. User clicks "Import Subscriptions"
  3. User uploads file (CSV, JSON)
  4. System validates entities exist
  5. Valid subscriptions are created
  6. User sees summary of imported subscriptions
- **Expected Result**: User can restore subscriptions from backup
- **Covered in**: `subscription-import.spec.ts` - "User can import subscriptions"

## Test Coverage Summary

### Unit Tests (Vitest)

- `useSubscription.test.ts`: Tests subscription hook logic for all entity types
- `SubscribeButton.test.tsx`: Tests button component states and actions
- `SubscriptionTimeline.test.tsx`: Tests timeline filtering and sorting
- `subscription-store.test.ts`: Tests subscription state management

### E2E Tests (Playwright)

- `user-subscription.spec.ts`: Tests user subscription flows
- `group-subscription.spec.ts`: Tests group subscription flows
- `event-subscription.spec.ts`: Tests event subscription flows
- `blog-subscription.spec.ts`: Tests blog subscription flows
- `amendment-subscription.spec.ts`: Tests amendment subscription flows
- `subscription-timeline.spec.ts`: Tests subscription feed/timeline
- `subscription-list.spec.ts`: Tests subscription management UI
- `subscription-bulk-actions.spec.ts`: Tests bulk operations
- `subscription-notifications.spec.ts`: Tests notification delivery

## Edge Cases Covered

1. Duplicate subscription prevention
2. Self-subscription prevention
3. Subscription to deleted entities
4. Subscription permission validation
5. Concurrent subscription/unsubscription
6. Network failure during subscription
7. Subscription count accuracy with concurrent users
8. Unauthenticated subscription attempts
9. Subscription state synchronization across tabs
10. Subscription cleanup on entity deletion
11. Real-time subscription count updates
12. Subscription button state consistency
13. Timeline pagination with large datasets
14. Filter persistence across sessions
15. Notification rate limiting

## Entity-Specific Considerations

### User Subscriptions

- Privacy settings (can users disable subscriptions?)
- Verified user badge display
- Following vs subscribing distinction
- Mutual subscription indicators

### Group Subscriptions

- Public vs private group access
- Member vs subscriber distinction
- Group category-based recommendations
- Subscription vs membership clarification

### Event Subscriptions

- Past event subscription handling
- Event cancellation notifications
- Event time change alerts
- Calendar integration

### Blog Subscriptions

- Per-blog vs per-author subscription
- Blog post frequency considerations
- Blog category filtering
- RSS feed integration

### Amendment Subscriptions

- Amendment stage notifications
- Vote reminder notifications
- Discussion activity alerts
- Amendment status change updates

## Future Test Considerations

1. Subscription limit enforcement (if applicable)
2. Premium features for subscribers
3. Subscriber-only content access
4. Subscription tiers/levels
5. Automated subscription based on interests
6. Subscription recommendations using ML
7. Social subscription features (subscribe with friends)
8. Subscription streaks and engagement tracking
9. Email digest of subscription activity
10. Mobile push notifications for subscriptions
11. Subscription analytics dashboard
12. A/B testing for subscription features
13. Subscription onboarding flow
14. Re-engagement campaigns for inactive subscribers
15. Subscription health metrics and monitoring
