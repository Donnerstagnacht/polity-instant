# Comments Feature - Comprehensive Test Plan

## Application Overview

The Comments feature in Polity provides a comprehensive commenting and discussion system across various entity types (blogs, statements, amendments, events, groups, etc.). Key functionality includes:

- **Comment Creation**: Add comments with text, creator attribution, timestamps
- **Threaded Discussions**: Reply to comments, nested comment threads
- **Voting System**: Upvote/downvote comments, score calculation
- **Sorting Options**: Sort by votes (score) or date (recency)
- **Parent-Child Relationships**: Support for reply chains and threading
- **Multi-Entity Support**: Comments on blogs, statements, amendments, suggestions, change requests
- **Real-Time Updates**: Live comment updates, notification system
- **Moderation**: Edit, delete, flag comments
- **Integration**: Timeline events, notifications, search

## Test Scenarios

### 1. Create Basic Comment

**Seed:** `e2e/seed.spec.ts`

#### 1.1 Create Top-Level Comment

**Steps:**

1. Navigate to blog/statement/entity page
2. Click "Add Comment" button
3. Enter comment text "Great insights on this topic!"
4. Click "Post Comment"

**Expected Results:**

- Comment created with unique ID
- Linked to entity (blog/statement/etc.)
- Creator info saved
- Timestamp recorded
- Comment appears in list

#### 1.2 Create Comment with Long Text

**Steps:**

1. Add comment
2. Enter multiple paragraphs
3. Post

**Expected Results:**

- Full text saved
- Formatting preserved
- Displays correctly
- No truncation in detail view

#### 1.3 Create Comment with Special Characters

**Steps:**

1. Add comment with emojis, unicode, special chars
2. Post

**Expected Results:**

- All characters preserved
- Displayed correctly
- No encoding issues
- Searchable

### 2. Reply to Comments (Threading)

#### 2.1 Reply to Top-Level Comment

**Steps:**

1. View existing comment
2. Click "Reply" button
3. Enter reply text
4. Post reply

**Expected Results:**

- Reply created
- Linked as parentComment
- Displayed nested under parent
- Indentation shows hierarchy
- Parent commenter notified

#### 2.2 Reply to Reply (Deep Threading)

**Steps:**

1. Reply to an existing reply
2. Create multiple levels of nesting
3. View thread

**Expected Results:**

- Deep threading supported
- Visual hierarchy clear
- Indentation increases with depth
- Performance maintained
- Max depth enforced if applicable

#### 2.3 View Reply Chain

**Steps:**

1. Comment has multiple replies
2. View full thread

**Expected Results:**

- All replies visible
- Chronological order within thread
- Clear parent-child relationships
- Collapse/expand functionality if applicable

### 3. Comment Voting System

#### 3.1 Upvote Comment

**Steps:**

1. View comment
2. Click upvote arrow
3. Verify vote

**Expected Results:**

- CommentVote created with vote: 1
- Upvote count increases
- Score increases by 1
- Upvote arrow highlighted
- Cannot upvote twice

#### 3.2 Downvote Comment

**Steps:**

1. View comment
2. Click downvote arrow
3. Verify vote

**Expected Results:**

- CommentVote created with vote: -1
- Downvote count increases
- Score decreases by 1
- Downvote arrow highlighted
- Cannot downvote twice

#### 3.3 Change Vote from Upvote to Downvote

**Steps:**

1. User has upvoted comment
2. Click downvote arrow
3. Vote changed

**Expected Results:**

- Existing vote updated from 1 to -1
- Score changes by 2 (from +1 to -1)
- UI updates to show downvote
- Only one vote per user maintained

#### 3.4 Remove Vote

**Steps:**

1. User has voted (up or down)
2. Click same arrow again
3. Vote removed

**Expected Results:**

- CommentVote deleted
- Score adjusted back
- Arrow no longer highlighted
- User can vote again

#### 3.5 View Comment Score

**Steps:**

1. Comment has upvotes and downvotes
2. Check score display

**Expected Results:**

- Score = upvotes - downvotes
- Displayed prominently
- Color coded (positive/negative/neutral)
- Updates in real-time

### 4. Comment Sorting

#### 4.1 Sort by Votes (Top Comments)

**Steps:**

1. View comments section
2. Select "Sort by Votes" option
3. View sorted list

**Expected Results:**

- Highest scored comments first
- Score calculation accurate
- Negative scores at bottom
- Sorting updates immediately

#### 4.2 Sort by Date (Newest First)

**Steps:**

1. View comments section
2. Select "Sort by Date" option
3. View sorted list

**Expected Results:**

- Newest comments first
- Based on createdAt timestamp
- Chronological order maintained
- Sorting preference saved

#### 4.3 Default Sort Order

**Steps:**

1. Navigate to entity with comments
2. Check default sort

**Expected Results:**

- Default sort applied (typically by votes)
- User preference respected if set
- Consistent across entities
- Clear sort indicator

### 5. Comment Display

#### 5.1 Display Comment Card

**Steps:**

1. View comment in list
2. Check all displayed elements

**Expected Results:**

- Creator avatar shown
- Creator name and handle displayed
- Comment text visible
- Timestamp shown
- Vote buttons and score visible
- Reply button available

#### 5.2 Display Nested Replies

**Steps:**

1. Comment with replies
2. View thread structure

**Expected Results:**

- Replies indented under parent
- Clear visual hierarchy
- Border/line connecting threads
- Depth limits respected

#### 5.3 Empty State for No Comments

**Steps:**

1. Entity with no comments
2. View comments section

**Expected Results:**

- "No comments yet" message
- Encouragement to comment
- Add comment button prominent
- Clean UI

### 6. Comment Creator Attribution

#### 6.1 Display Creator Info

**Steps:**

1. View comment
2. Check creator section

**Expected Results:**

- Avatar displayed
- Name shown
- Handle shown if available
- Clickable to profile
- Verified badge if applicable

#### 6.2 Anonymous Comment Handling

**Steps:**

1. If system allows anonymous comments
2. View anonymous comment

**Expected Results:**

- "Anonymous" label
- No profile link
- Still votable and replyable
- Timestamp shown

### 7. Comment Editing

#### 7.1 Edit Own Comment

**Steps:**

1. User views own comment
2. Click "Edit" button
3. Modify text
4. Save changes

**Expected Results:**

- Comment text updated
- UpdatedAt timestamp changed
- "Edited" indicator displayed
- Edit history tracked if applicable

#### 7.2 Cannot Edit Others' Comments

**Steps:**

1. User views another user's comment
2. Look for edit option

**Expected Results:**

- Edit button not visible
- Access denied if attempted
- Error message clear
- Comment unchanged

#### 7.3 Edit Time Limit

**Steps:**

1. Comment created >24 hours ago
2. Attempt to edit

**Expected Results:**

- Edit restricted after time limit
- Clear message about time limit
- Prevents abuse
- Moderator can still edit

### 8. Comment Deletion

#### 8.1 Delete Own Comment

**Steps:**

1. User clicks "Delete" on own comment
2. Confirm deletion

**Expected Results:**

- Comment deleted
- Removed from list
- Replies handled (deleted or orphaned)
- Cannot be recovered
- Timeline updated

#### 8.2 Cannot Delete Others' Comments

**Steps:**

1. User attempts to delete another's comment
2. Check access

**Expected Results:**

- Delete button not visible
- Access denied if attempted
- Comment remains
- Clear error message

#### 8.3 Moderator Delete Comment

**Steps:**

1. Moderator/admin deletes inappropriate comment
2. Confirm deletion

**Expected Results:**

- Comment deleted
- Creator notified if applicable
- Reason logged
- Moderation action tracked

#### 8.4 Delete Comment with Replies

**Steps:**

1. Delete comment that has replies
2. Handle reply chain

**Expected Results:**

- Option to delete all replies or orphan them
- Clear warning about replies
- Consistent handling
- User choice respected

### 9. Comment Timestamps

#### 9.1 Display Creation Time

**Steps:**

1. View comment
2. Check timestamp

**Expected Results:**

- Timestamp formatted (e.g., "2 hours ago" or full date)
- Locale-aware formatting
- Relative time updates
- Hover shows exact time

#### 9.2 Display Updated Time

**Steps:**

1. Comment has been edited
2. Check updated timestamp

**Expected Results:**

- "Edited" indicator shown
- Updated time displayed
- Distinct from created time
- Tooltip with exact edit time

### 10. Comment Notifications

#### 10.1 Notify of New Comment

**Steps:**

1. User comments on blog
2. Blog creator checks notifications

**Expected Results:**

- Creator receives notification
- Notification type: "comment_added"
- Contains commenter info and snippet
- Link to comment

#### 10.2 Notify of Reply

**Steps:**

1. User replies to comment
2. Original commenter checks notifications

**Expected Results:**

- Original commenter notified
- Notification type: "comment_reply"
- Shows reply text
- Link to specific comment

#### 10.3 Notify of Vote Milestone

**Steps:**

1. Comment reaches vote threshold (e.g., 10 upvotes)
2. Creator notified

**Expected Results:**

- Notification sent
- Encourages engagement
- Shows achievement
- Optional feature

### 11. Comment Timeline Integration

#### 11.1 Comment Creation Timeline Event

**Steps:**

1. User creates comment
2. Check timeline

**Expected Results:**

- Timeline event created
- Event type: "comment_added"
- Visible to user's followers
- Links to entity and comment

### 12. Comment Search

#### 12.1 Search Comments by Text

**Steps:**

1. Search for specific keyword
2. Filter by comments
3. View results

**Expected Results:**

- Matching comments shown
- Text highlighted
- Links to parent entity
- Context provided

### 13. Comment Moderation

#### 13.1 Flag Inappropriate Comment

**Steps:**

1. User flags comment as inappropriate
2. Moderator reviews
3. Action taken

**Expected Results:**

- Flag recorded
- Moderator notified
- Comment marked for review
- Can be hidden or deleted

#### 13.2 Hide Comment

**Steps:**

1. Moderator hides comment
2. Comment collapsed/hidden

**Expected Results:**

- Comment hidden from public
- "[Comment removed]" placeholder
- Moderator can unhide
- Creator notified

### 14. Comment Reactions (Future/Alternative to Voting)

#### 14.1 React to Comment with Emoji

**Steps:**

1. Click reaction button
2. Select emoji
3. Reaction recorded

**Expected Results:**

- Reaction saved
- Emoji count shown
- Multiple reactions allowed
- Can remove reaction

### 15. Comment Mentions

#### 15.1 Mention User in Comment

**Steps:**

1. Type @ followed by username
2. Select user from suggestions
3. Post comment

**Expected Results:**

- User mentioned
- Mention highlighted in text
- Mentioned user notified
- Clickable to profile

### 16. Comment Links

#### 16.1 Include Link in Comment

**Steps:**

1. Add comment with URL
2. Post

**Expected Results:**

- URL auto-linked
- Clickable link
- Opens in new tab
- Link preview if applicable

### 17. Comment Spam Prevention

#### 17.1 Rate Limiting

**Steps:**

1. User posts multiple comments rapidly
2. Check rate limit

**Expected Results:**

- Rate limit enforced
- Error message after limit
- Prevents spam
- Reasonable limits

#### 17.2 Duplicate Comment Detection

**Steps:**

1. User posts identical comment twice
2. Check detection

**Expected Results:**

- Duplicate detected
- Warning shown
- Can still post if intentional
- Reduces accidental duplicates

### 18. Comment Pagination

#### 18.1 Paginate Comments

**Steps:**

1. Entity with 100+ comments
2. View comments section

**Expected Results:**

- Comments paginated
- Load more button or infinite scroll
- Performance optimized
- Scroll position maintained

#### 18.2 Load More Comments

**Steps:**

1. Click "Load More" or scroll
2. Additional comments load

**Expected Results:**

- Next batch loads
- Smooth loading
- No duplicate comments
- Maintains sort order

### 19. Comment Export

#### 19.1 Export Comments

**Steps:**

1. Admin exports all comments on entity
2. Select format (CSV/JSON)
3. Download

**Expected Results:**

- All comments included
- Replies nested appropriately
- Metadata included
- Proper formatting

### 20. Comment Collapse/Expand

#### 20.1 Collapse Comment Thread

**Steps:**

1. Long comment with many replies
2. Click collapse button
3. Thread collapses

**Expected Results:**

- Thread hidden
- Placeholder shows reply count
- Expand button available
- Remembers state

#### 20.2 Expand Collapsed Thread

**Steps:**

1. Collapsed thread
2. Click expand
3. Thread expands

**Expected Results:**

- All replies visible
- Smooth animation
- Scroll to position
- State remembered

### 21. Comment Anchor Links

#### 21.1 Direct Link to Comment

**Steps:**

1. Share link to specific comment
2. Click link
3. Navigate to comment

**Expected Results:**

- Page loads
- Scrolls to comment
- Comment highlighted
- Context visible

### 22. Comment Translation

#### 22.1 Translate Comment

**Steps:**

1. Comment in foreign language
2. Click "Translate" button
3. View translation

**Expected Results:**

- Translation displayed
- Original still accessible
- Language detected
- Translation service integrated

### 23. Comment Vote Controversy Indicator

#### 23.1 Display Controversial Comments

**Steps:**

1. Comment has many upvotes and downvotes
2. Check indicator

**Expected Results:**

- "Controversial" badge shown
- Indicates divided opinion
- Helps identify heated discussions
- Optional feature

### 24. Comment Word Count

#### 24.1 Display Comment Length

**Steps:**

1. Write long comment
2. Check word/character count

**Expected Results:**

- Count displayed while typing
- Limits enforced if applicable
- Clear limit indicator
- User aware of length

### 25. Comment Preview

#### 25.1 Preview Comment Before Posting

**Steps:**

1. Write comment with formatting
2. Click preview
3. View formatted output

**Expected Results:**

- Preview shown
- Formatting applied
- Can edit before posting
- Prevents errors

### 26. Comment Accessibility

#### 26.1 Screen Reader Support

**Steps:**

1. Use screen reader to navigate comments
2. Read comments and replies

**Expected Results:**

- All content accessible
- Proper ARIA labels
- Logical navigation
- Vote buttons describable

### 27. Comment Mobile Responsiveness

#### 27.1 View Comments on Mobile

**Steps:**

1. Access entity with comments on mobile
2. View and interact

**Expected Results:**

- Layout responsive
- Vote buttons accessible
- Reply easy to access
- Threading clear

### 28. Comment Real-Time Updates

#### 28.1 Live Comment Updates

**Steps:**

1. User A adds comment
2. User B viewing same entity
3. Comment appears for User B

**Expected Results:**

- New comment appears without refresh
- Real-time or near real-time
- Smooth insertion
- Notification/indicator shown

### 29. Comment Drafts

#### 29.1 Save Comment Draft

**Steps:**

1. Start writing comment
2. Navigate away
3. Return to page

**Expected Results:**

- Draft saved locally
- Draft restored when return
- Can discard draft
- Auto-save enabled

### 30. Comment Rich Text Formatting

#### 30.1 Format Comment Text

**Steps:**

1. Write comment with bold, italic, lists
2. Post

**Expected Results:**

- Formatting preserved
- Rendered correctly
- Markdown or WYSIWYG
- Preview available

## Test Coverage Summary

### Unit Tests (Vitest)

- `useComments.test.ts`: Comment management logic
- `CommentItem.test.tsx`: Comment display component
- `CommentVoting.test.tsx`: Voting functionality
- `comments.store.test.ts`: Filtering and sorting

### E2E Tests (Playwright)

- `comment-creation.spec.ts`: Comment creation flows
- `comment-threading.spec.ts`: Reply and threading
- `comment-voting.spec.ts`: All voting scenarios
- `comment-sorting.spec.ts`: Sort functionality
- `comment-moderation.spec.ts`: Edit, delete, flag

## Edge Cases Covered

1. Comment with no votes
2. Very deeply nested threads (max depth)
3. Comment on deleted entity
4. Concurrent vote changes
5. Edit during vote change
6. Delete with pending replies
7. Very long single-word comment (breaks layout)
8. Rapid comment posting (spam)
9. Vote on own comment (allowed/disallowed)
10. Comment by deleted user
11. Pagination during live updates
12. Translation of emoji/special chars
13. Anchor link to deleted comment
14. Draft recovery after crash
15. Real-time update conflicts

## Future Test Considerations

1. Comment sentiment analysis
2. AI-powered moderation
3. Comment quality scoring
4. Verified commenter badges
5. Comment awards/highlights
6. Advanced threading (branch merging)
7. Comment bookmarking
8. Private comment drafts
9. Collaborative comment editing
10. Integration with external commenting systems (Disqus, etc.)
