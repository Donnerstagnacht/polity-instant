# Statements Feature - Comprehensive Test Plan

## Application Overview

The Statements feature in Polity provides a simple yet powerful system for users to express and tag their opinions, beliefs, and positions on various topics. Key functionality includes:

- **Statement Creation**: Create statements with tag and text
- **Tagging System**: Categorize statements with tags
- **Visibility Control**: Public, authenticated-only, or private statements
- **User Attribution**: Link statements to creators
- **Discovery**: Search and filter statements by tags
- **Social Features**: View related statements, explore by category
- **Integration**: Statements appear in user profiles, search results, timeline

## Test Scenarios

### 1. Create Basic Statement

**Seed:** `e2e/seed.spec.ts`

#### 1.1 Create Public Statement

**Steps:**

1. Navigate to `/create` page
2. Select "Statement" entity type
3. Select or enter tag (e.g., "Climate Change")
4. Enter statement text: "We need urgent action on climate change"
5. Set visibility to public
6. Click "Create" button

**Expected Results:**

- Statement created with unique ID
- User redirected to statement page
- Statement visible in public listings
- Tag associated correctly
- Creator info displayed

#### 1.2 Create Private Statement

**Steps:**

1. Navigate to create page
2. Select Statement type
3. Enter tag and text
4. Set visibility to private
5. Click Create

**Expected Results:**

- Statement created
- Only creator can view
- Not visible in public searches
- Privacy indicator shown

### 2. Statement Visibility Control

#### 2.1 Public Statement Visibility

**Steps:**

1. Create public statement
2. Log out
3. Navigate to statement URL

**Expected Results:**

- Statement visible to unauthenticated users
- Full text readable
- Creator info shown
- Tag visible and clickable

#### 2.2 Private Statement Access

**Steps:**

1. Create private statement
2. Switch to different user
3. Attempt to access statement URL

**Expected Results:**

- Access denied
- Clear error message
- Statement not in search results
- Redirect to appropriate page

#### 2.3 Authenticated-Only Statement

**Steps:**

1. Create with "authenticated" visibility
2. Log out and attempt access
3. Log in and access

**Expected Results:**

- Unauthenticated users blocked
- Any authenticated user can view
- Clear messaging about requirements

### 3. Statement Display

#### 3.1 View Statement Page

**Steps:**

1. Navigate to statement page
2. Observe layout and content

**Expected Results:**

- Tag displayed prominently with badge
- Statement text in quotes
- Creator avatar and name shown
- Creation date displayed
- Visibility indicator present

#### 3.2 Creator Information Display

**Steps:**

1. View statement
2. Check creator section

**Expected Results:**

- Avatar displayed
- Name clickable to profile
- Handle shown if available
- "Created by" label present

### 4. Statement Tagging

#### 4.1 Assign Tag to Statement

**Steps:**

1. Create statement
2. Select tag from predefined list or enter custom tag
3. Save

**Expected Results:**

- Tag saved correctly
- Tag displayed on statement
- Statement searchable by tag
- Tag clickable

#### 4.2 View Statements by Tag

**Steps:**

1. Click on statement tag
2. View filtered results

**Expected Results:**

- All public statements with that tag shown
- Results sorted (by date/popularity)
- Tag highlighted in UI
- Other entity types with tag also shown

#### 4.3 Browse Tag Categories

**Steps:**

1. Navigate to statements exploration page
2. Browse available tags

**Expected Results:**

- Tag cloud or list displayed
- Tags sorted by popularity or alphabetically
- Click navigates to tag results
- Tag counts shown if applicable

### 5. Related Statements

#### 5.1 View Related Statements

**Steps:**

1. View statement page
2. Check "Related Statements" section

**Expected Results:**

- Statements with same tag shown
- Limited to reasonable number (e.g., 5-10)
- Clickable to view full statement
- Relevant statements prioritized

#### 5.2 No Related Statements

**Steps:**

1. View statement with unique tag
2. Check related section

**Expected Results:**

- "No related statements found" message
- Suggestion to explore other tags
- Clean empty state

### 6. Statement Search

#### 6.1 Search Statements by Text

**Steps:**

1. Navigate to `/search`
2. Enter keywords from statement text
3. Filter by "Statements" type

**Expected Results:**

- Matching statements shown
- Text highlighted if applicable
- Results sorted by relevance
- Snippet with match context

#### 6.2 Search Statements by Tag

**Steps:**

1. Search using tag as keyword
2. View results

**Expected Results:**

- Statements with tag shown
- Tag-based results prioritized
- Clear tag indicator
- Filterable

### 7. Statement User Profile Integration

#### 7.1 View User's Statements on Profile

**Steps:**

1. Navigate to user profile
2. View statements section/tab

**Expected Results:**

- User's statements listed
- Public statements visible to all
- Private statements only to creator
- Sorted by date
- Clickable to view full statement

### 8. Statement Creation Variations

#### 8.1 Create Statement with Long Text

**Steps:**

1. Create statement
2. Enter very long text (multiple paragraphs)
3. Save

**Expected Results:**

- Full text saved
- Display formatted properly
- Readable on statement page
- May truncate in list views with "Read more"

#### 8.2 Create Statement with Special Characters

**Steps:**

1. Create statement
2. Use special characters, emojis, unicode
3. Save

**Expected Results:**

- All characters preserved
- Displayed correctly
- No encoding issues
- Searchable

### 9. Statement Editing

#### 9.1 Edit Own Statement

**Steps:**

1. Creator navigates to statement
2. Click "Edit" button (if available)
3. Modify text or tag
4. Save changes

**Expected Results:**

- Changes saved successfully
- Updated timestamp shown
- Edit history tracked if applicable
- "Edited" indicator displayed

#### 9.2 Cannot Edit Others' Statements

**Steps:**

1. User views another user's statement
2. Look for edit option

**Expected Results:**

- Edit button not visible
- Direct URL access denied
- Error if attempted
- Statement unchanged

### 10. Statement Deletion

#### 10.1 Delete Own Statement

**Steps:**

1. Creator navigates to statement
2. Click "Delete" button
3. Confirm deletion

**Expected Results:**

- Statement deleted
- Removed from all listings
- Removed from search
- Cannot be recovered
- Timeline updated

#### 10.2 Cannot Delete Others' Statements

**Steps:**

1. User views another user's statement
2. Look for delete option

**Expected Results:**

- Delete button not visible
- Access denied if attempted
- Statement remains intact

### 11. Statement Timeline Integration

#### 11.1 Statement Creation Timeline Event

**Steps:**

1. Create statement
2. Check timeline feed

**Expected Results:**

- Timeline event created
- Event type: "created"
- Entity type: "statement"
- Visible to followers
- Links to statement

### 12. Statement Social Features

#### 12.1 Share Statement

**Steps:**

1. View statement
2. Click share button
3. View share options

**Expected Results:**

- Share URL generated
- Social media options available
- Copy link functionality
- Share includes statement text and tag

### 13. Statement Loading States

#### 13.1 Statement Page Loading

**Steps:**

1. Navigate to statement page
2. Observe loading state

**Expected Results:**

- Loading indicator shown
- Skeleton UI displayed
- Smooth transition to loaded state
- No layout shift

### 14. Statement Error Handling

#### 14.1 Statement Not Found

**Steps:**

1. Navigate to invalid statement ID
2. View error page

**Expected Results:**

- "Statement Not Found" message
- Explanation text
- Navigation to statements listing
- No broken UI

#### 14.2 Permission Denied

**Steps:**

1. Access private statement as other user
2. View error

**Expected Results:**

- "Access Denied" message
- Explanation of privacy settings
- Login prompt if applicable
- Redirect option

### 15. Statement Tag Validation

#### 15.1 Valid Tag Format

**Steps:**

1. Create statement
2. Enter valid tag (alphanumeric, spaces)
3. Save

**Expected Results:**

- Tag accepted
- Statement created
- Tag formatted consistently

#### 15.2 Invalid Tag Handling

**Steps:**

1. Create statement
2. Enter invalid tag (too long, special chars)
3. Attempt to save

**Expected Results:**

- Validation error shown
- Suggestions provided
- Statement not created until fixed
- Clear error message

### 16. Statement Text Validation

#### 16.1 Minimum Text Length

**Steps:**

1. Create statement
2. Enter very short text (1-2 words)
3. Attempt to save

**Expected Results:**

- Validation checks minimum length
- Error message if too short
- Suggested minimum
- Clear requirements

#### 16.2 Maximum Text Length

**Steps:**

1. Create statement
2. Enter extremely long text
3. Attempt to save

**Expected Results:**

- Validation enforces maximum
- Character count shown
- Error if exceeded
- Clear limit indicator

### 17. Statement Visibility Toggle

#### 17.1 Change Statement Visibility

**Steps:**

1. Creator edits statement
2. Change from public to private
3. Save changes

**Expected Results:**

- Visibility updated immediately
- Non-creators lose access
- Removed from public search
- Creator notified

### 18. Statement Duplicate Detection

#### 18.1 Warn About Similar Statements

**Steps:**

1. Create statement
2. Enter text very similar to existing statement
3. Check for warning

**Expected Results:**

- System detects similarity
- Warning or suggestion shown
- Can still create if intentional
- Links to similar statements

### 19. Statement Tag Autocomplete

#### 19.1 Tag Suggestions

**Steps:**

1. Begin creating statement
2. Start typing tag
3. View suggestions

**Expected Results:**

- Popular tags suggested
- Recently used tags shown
- Click to select
- Can still enter custom tag

### 20. Statement Analytics

#### 20.1 View Statement Stats

**Steps:**

1. Creator views own statement
2. Check analytics if available

**Expected Results:**

- View count shown
- Share count tracked
- Related statement count
- Engagement metrics

### 21. Statement Reactions (Future Feature)

#### 21.1 React to Statement

**Steps:**

1. View statement
2. Click reaction button (agree/disagree/etc.)
3. Reaction recorded

**Expected Results:**

- Reaction saved
- Count updated
- User's reaction highlighted
- Can change reaction

### 22. Statement Comments (Future Feature)

#### 22.1 Comment on Statement

**Steps:**

1. View statement
2. Add comment
3. Post

**Expected Results:**

- Comment added
- Comment count increases
- Comment displayed below statement
- Threaded discussions supported

### 23. Statement Explore Page

#### 23.1 Browse All Statements

**Steps:**

1. Navigate to statements explore page
2. View statement listings

**Expected Results:**

- Statements displayed in grid/list
- Sorted by date or popularity
- Filterable by tag
- Pagination if many statements

### 24. Statement Tag Cloud

#### 24.1 View Tag Cloud

**Steps:**

1. Navigate to tag cloud/explore
2. View visual representation

**Expected Results:**

- Tags sized by frequency
- Clickable tags
- Visual hierarchy clear
- Popular tags prominent

### 25. Statement in Search Results

#### 25.1 Statement Search Result Card

**Steps:**

1. Search for statements
2. View result cards

**Expected Results:**

- Tag displayed
- Statement text snippet
- Creator info
- Creation date
- Clickable to full view

### 26. Statement Moderation (Admin Feature)

#### 26.1 Flag Inappropriate Statement

**Steps:**

1. User flags statement
2. Admin reviews

**Expected Results:**

- Flag recorded
- Admin notified
- Statement marked for review
- Can be removed if violates policy

### 27. Statement Export

#### 27.1 Export User's Statements

**Steps:**

1. User requests export of all statements
2. Download data

**Expected Results:**

- All statements included
- JSON or CSV format
- Includes all metadata
- Privacy respected

### 28. Statement Import

#### 28.1 Import Statements from File

**Steps:**

1. User uploads statements file
2. System processes import

**Expected Results:**

- Statements created
- Tags preserved
- Creator attributed
- Duplicates handled

### 29. Statement Versioning

#### 29.1 Track Statement Edits

**Steps:**

1. Edit statement multiple times
2. View edit history

**Expected Results:**

- All versions tracked
- Timestamps recorded
- Can view previous versions
- Restore if needed

### 30. Statement Cross-Entity References

#### 30.1 Link Statement to Other Entities

**Steps:**

1. Reference statement in amendment/blog/comment
2. Link created

**Expected Results:**

- Reference tracked
- Backlinks shown on statement
- Clickable references
- Context preserved

## Test Coverage Summary

### Unit Tests (Vitest)

- `StatementPage.test.tsx`: Statement display component
- `statements.store.test.ts`: Statement filtering and search
- `StatementCard.test.tsx`: Statement card component
- `useStatements.test.ts`: Statement management hook

### E2E Tests (Playwright)

- `statement-creation.spec.ts`: Statement creation flows
- `statement-visibility.spec.ts`: Access control and visibility
- `statement-tagging.spec.ts`: Tag system
- `statement-search.spec.ts`: Search and discovery
- `statement-editing-deletion.spec.ts`: Edit and delete flows

## Edge Cases Covered

1. Very long statement text
2. Special characters and unicode
3. Empty or whitespace-only text
4. Duplicate tags (case sensitivity)
5. Tag with no statements
6. User with no statements
7. Statement with deleted creator
8. Concurrent edits by creator
9. Visibility changes while viewing
10. Tag name changes
11. Mass statement deletion
12. Search with no results
13. Related statements circular references
14. Tag autocomplete performance
15. Statement export with large datasets

## Future Test Considerations

1. Statement reactions/endorsements
2. Statement comments and discussions
3. Statement collections/playlists
4. Advanced filtering (date range, creator, multiple tags)
5. Statement trending/popularity algorithm
6. Statement recommendation engine
7. Statement notifications for tag followers
8. Collaborative statements
9. Statement templates
10. Integration with external opinion platforms
