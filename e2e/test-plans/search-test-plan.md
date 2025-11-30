# Search Feature Test Plan

## Overview

Comprehensive test plan for the global search system covering all searchable entity types (users, groups, statements, blogs, amendments, events), filtering, sorting, hashtag search, and result navigation.

## Test Scenarios

### 1. Load Search Page

- **Scenario**: User accesses the search page
- **Steps**:
  1. User navigates to /search
  2. Page loads with search interface
  3. Search input box prominently displayed
  4. Entity type tabs visible (All, Users, Groups, etc.)
  5. Filter options available
- **Expected Result**: Search page loads with proper layout

### 2. Global Search - Empty Query

- **Scenario**: User views search page without query
- **Steps**:
  1. User on search page with no query
  2. Shows popular/trending entities
  3. Or shows helpful message to start searching
  4. Featured content displayed
  5. Search suggestions available
- **Expected Result**: Useful content shown before search

### 3. Type-Ahead Search

- **Scenario**: Results update as user types
- **Steps**:
  1. User starts typing in search box
  2. Results appear after 2-3 characters
  3. Results update with each keystroke
  4. Debounced to avoid too many requests
  5. URL updates with query parameter
- **Expected Result**: Real-time search provides instant feedback

### 4. Search All Entity Types

- **Scenario**: User searches across all content types
- **Steps**:
  1. User on "All" tab
  2. User types "climate change"
  3. Results show mixed: users, groups, blogs, amendments, events
  4. Results grouped by entity type
  5. Can see top results from each type
- **Expected Result**: Comprehensive search across all entities

### 5. Search Users Only

- **Scenario**: User filters search to users
- **Steps**:
  1. User clicks "Users" tab
  2. User types name or handle
  3. Only user profiles shown in results
  4. Shows avatar, name, handle, bio preview
  5. Can click to view full profile
- **Expected Result**: User-only search returns profiles

### 6. Search Groups Only

- **Scenario**: User filters search to groups
- **Steps**:
  1. User selects "Groups" tab
  2. User searches for group name
  3. Only groups shown in results
  4. Shows group name, member count, public/private
  5. Can join public groups from results
- **Expected Result**: Group search shows communities

### 7. Search Statements Only

- **Scenario**: User searches statements
- **Steps**:
  1. User clicks "Statements" tab
  2. User enters search query
  3. Only statements shown
  4. Searches statement text and tags
  5. Shows statement type and author
- **Expected Result**: Statement search finds opinions/facts

### 8. Search Blogs Only

- **Scenario**: User searches blog posts
- **Steps**:
  1. User selects "Blogs" tab
  2. User types blog topic
  3. Only blogs shown in results
  4. Searches title and content
  5. Shows blog title, excerpt, author, date
- **Expected Result**: Blog search finds articles

### 9. Search Amendments Only

- **Scenario**: User searches amendments
- **Steps**:
  1. User clicks "Amendments" tab
  2. User searches amendment topic
  3. Only amendments shown
  4. Searches title, subtitle, content
  5. Shows collaborator count and status
- **Expected Result**: Amendment search finds documents

### 10. Search Events Only

- **Scenario**: User searches events
- **Steps**:
  1. User selects "Events" tab
  2. User searches event name or topic
  3. Only events shown in results
  4. Shows event name, date, location, organizer
  5. Can register for events from results
- **Expected Result**: Event search finds gatherings

### 11. Search by Hashtag

- **Scenario**: User searches using hashtag
- **Steps**:
  1. User types "#sustainability" in search
  2. Or enters "sustainability" in hashtag filter
  3. Results show entities tagged with that hashtag
  4. Works for blogs, groups, events, amendments
  5. Multiple hashtags can be combined
- **Expected Result**: Hashtag search finds tagged content

### 12. Filter Public Content Only

- **Scenario**: User filters to show only public entities
- **Steps**:
  1. User toggles "Public Only" switch
  2. Search results update
  3. Private groups/events hidden
  4. Only publicly accessible content shown
  5. Helps discover content without membership
- **Expected Result**: Public filter shows accessible content

### 13. Sort Results by Relevance

- **Scenario**: Results sorted by match quality
- **Steps**:
  1. User searches with sort set to "Relevance"
  2. Best matches appear first
  3. Exact matches prioritized
  4. Partial matches lower
  5. Algorithm considers multiple factors
- **Expected Result**: Most relevant results at top

### 14. Sort Results by Date

- **Scenario**: User sorts by most recent
- **Steps**:
  1. User selects "Most Recent" from sort dropdown
  2. Results reorder by creation date
  3. Newest entities appear first
  4. Date displayed on each result
  5. Helps find latest content
- **Expected Result**: Newest results shown first

### 15. Sort Results by Popularity

- **Scenario**: User sorts by engagement/popularity
- **Steps**:
  1. User selects "Most Popular" sort
  2. Results sorted by engagement metrics
  3. Considers members, participants, views, votes
  4. Most active/popular entities first
  5. Helps discover trending content
- **Expected Result**: Popular content surfaces first

### 16. Search Result Card - User

- **Scenario**: User search result displays profile info
- **Steps**:
  1. User result shows:
     - Avatar
     - Name and handle
     - Bio excerpt
     - Follower count
     - Hashtags
  2. Follow button available
  3. Clicking navigates to profile
- **Expected Result**: User cards have complete info

### 17. Search Result Card - Group

- **Scenario**: Group search result shows key details
- **Steps**:
  1. Group result displays:
     - Group icon/image
     - Name
     - Description excerpt
     - Member count
     - Public/Private badge
  2. Join button for public groups
  3. Request to join for private
- **Expected Result**: Group cards actionable

### 18. Search Result Card - Event

- **Scenario**: Event search result shows event details
- **Steps**:
  1. Event result shows:
     - Event image
     - Title
     - Date and time
     - Location
     - Organizer name
  2. Participate button available
  3. Add to calendar option
- **Expected Result**: Event cards informative

### 19. Search Result Card - Blog

- **Scenario**: Blog search result previews post
- **Steps**:
  1. Blog result displays:
     - Cover image
     - Title
     - Excerpt (first 150 chars)
     - Author and date
     - Hashtags
  2. Clicking opens full blog post
- **Expected Result**: Blog cards entice reading

### 20. Search Result Card - Amendment

- **Scenario**: Amendment result shows document info
- **Steps**:
  1. Amendment result shows:
     - Title and subtitle
     - Creator
     - Collaborator count
     - Hashtags
     - Status (draft/published)
  2. Can subscribe from result
  3. Clicking opens amendment
- **Expected Result**: Amendment cards show status

### 21. Empty Search Results

- **Scenario**: No results found for query
- **Steps**:
  1. User searches for non-existent term
  2. Empty state displays
  3. Message "No results found for 'xyz'"
  4. Suggestions to broaden search
  5. Related searches shown
- **Expected Result**: Helpful empty state guides user

### 22. Search Highlighting

- **Scenario**: Search terms highlighted in results
- **Steps**:
  1. User searches "climate"
  2. Word "climate" highlighted in results
  3. Bolded or background color
  4. Helps user see relevance
  5. Works in titles and descriptions
- **Expected Result**: Highlighting shows match location

### 23. Search Pagination

- **Scenario**: User navigates through many results
- **Steps**:
  1. Search returns 100+ results
  2. First 20 shown initially
  3. "Load More" button at bottom
  4. Or infinite scroll
  5. Next batch loads smoothly
  6. Can continue loading all results
- **Expected Result**: Pagination handles many results

### 24. Search Query in URL

- **Scenario**: Search query persists in URL
- **Steps**:
  1. User searches for "democracy"
  2. URL updates to /search?q=democracy
  3. User can share URL
  4. Opening URL loads search results
  5. Query pre-filled in search box
- **Expected Result**: URLs are shareable and bookmark-able

### 25. Filter Persistence

- **Scenario**: Filters maintained across navigation
- **Steps**:
  1. User sets filters (type, hashtag, public only)
  2. User navigates to result
  3. User clicks back
  4. Filters still applied
  5. URL preserves filter state
- **Expected Result**: Filter state persists

### 26. Clear Search Query

- **Scenario**: User clears search to start over
- **Steps**:
  1. User has active search
  2. User clicks X in search box
  3. Query clears
  4. Results reset to default/empty
  5. Filters can remain or reset
- **Expected Result**: Easy to clear and restart

### 27. Search from Navbar

- **Scenario**: User searches from global navbar
- **Steps**:
  1. User clicks search icon in navbar
  2. Search box expands or overlay appears
  3. User types query
  4. Quick results dropdown shows
  5. Can click result or press enter for full results
  6. Navigates to /search page
- **Expected Result**: Navbar search provides quick access

### 28. Recent Searches

- **Scenario**: User sees their recent search history
- **Steps**:
  1. User clicks in search box
  2. Dropdown shows recent searches
  3. Can click to repeat search
  4. Can clear history
  5. Recent searches saved locally
- **Expected Result**: Recent searches speed up repeat queries

### 29. Search Suggestions

- **Scenario**: System suggests search terms
- **Steps**:
  1. User types partial query
  2. Dropdown shows suggested completions
  3. Based on popular searches
  4. Or based on user's history
  5. Can select suggestion to search
- **Expected Result**: Suggestions help formulate queries

### 30. Advanced Search Filters

- **Scenario**: User applies multiple filters simultaneously
- **Steps**:
  1. User searches "education"
  2. Filters to: Groups + Events only
  3. Adds hashtag filter "#online"
  4. Sorts by most recent
  5. Public only enabled
  6. Complex query returns specific results
- **Expected Result**: Multiple filters narrow results effectively

## Test Coverage Summary

### Unit Tests (Vitest)

- Search filtering logic
- Result sorting algorithms
- Hashtag matching
- Query parsing
- Result card rendering

### E2E Tests (Playwright)

- Type-ahead search
- Entity type filtering
- Hashtag search
- Sort options
- Navigation from results
- Filter combinations

## Edge Cases Covered

1. Very long search queries
2. Special characters in query
3. Emoji in search terms
4. Searches with no results
5. Extremely large result sets
6. Deleted entities in search index
7. Permission-restricted results
8. Duplicate results
9. Search while offline
10. Concurrent search requests
11. Hashtags with special characters
12. Multiple spaces in query
13. Case sensitivity handling
14. Partial word matching
15. Plurals and variations
