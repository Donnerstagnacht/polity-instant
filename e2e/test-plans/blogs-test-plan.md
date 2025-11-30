# Blogs Feature - Comprehensive Test Plan

## Application Overview

The Blogs feature in Polity provides a comprehensive blogging platform that enables users to create, manage, and engage with blog content. Key functionality includes:

- **Blog Creation & Management**: Create blogs with title, description, date, visibility settings
- **Blogger Management**: Invite/manage co-bloggers, assign roles (owner, writer)
- **Comments System**: Nested comments with voting (upvote/downvote), reply functionality
- **Social Features**: Subscribe to blogs, share blogs, like blogs
- **Content Organization**: Hashtags, categorization, search integration
- **Visibility Control**: Public, authenticated-only, or private blogs
- **Integration**: Blogs can be associated with groups, appear in timelines and search
- **Rich Content**: Support for formatted text, images, and media

## Test Scenarios

### 1. Create Basic Blog

**Seed:** `e2e/seed.spec.ts`

#### 1.1 Create Public Blog with Required Fields

**Steps:**

1. Navigate to `/create` page
2. Select "Blog" entity type
3. Enter blog title "Tech Insights Weekly"
4. Enter description
5. Set visibility to public
6. Click "Create" button

**Expected Results:**

- Blog is created with unique ID
- User redirected to blog page
- Blog appears with entered details
- User automatically set as owner/blogger
- Blog visible in public listings

#### 1.2 Create Private Blog with Full Details

**Steps:**

1. Navigate to create page
2. Select Blog type
3. Enter all fields: title, description, date
4. Set visibility to private
5. Add hashtags
6. Click Create

**Expected Results:**

- Blog created with all metadata
- Blog only visible to authorized users
- Hashtags associated
- Date properly formatted

### 2. Blog Visibility and Access Control

#### 2.1 Public Blog Visibility

**Steps:**

1. Create public blog
2. Log out
3. Navigate to blog URL
4. View blog content

**Expected Results:**

- Public blog visible to unauthenticated users
- Comments require authentication
- Subscribe/action buttons prompt login
- Content fully readable

#### 2.2 Private Blog Access Restriction

**Steps:**

1. Create private blog
2. Log out or switch user
3. Attempt to access blog URL

**Expected Results:**

- Non-authorized users cannot view
- Access denied message
- Blog not in search results for unauthorized
- Redirect to appropriate page

#### 2.3 Authenticated-Only Blog Access

**Steps:**

1. Create blog with "authenticated" visibility
2. Log out and attempt access
3. Log in as different user
4. Access blog

**Expected Results:**

- Unauthenticated users blocked
- Any authenticated user can view
- Clear messaging about access requirements

### 3. Blogger Management

#### 3.1 Invite Co-Blogger

**Steps:**

1. Blog owner navigates to blog settings
2. Click "Invite Blogger"
3. Search for user
4. Select user and set role (writer/owner)
5. Send invitation

**Expected Results:**

- BlogBlogger record created with status "invited"
- User receives notification
- User can accept/decline invitation
- Invitation appears in pending list

#### 3.2 Accept Blogger Invitation

**Steps:**

1. User receives blogger invitation
2. Navigate to blog or invitations page
3. Click "Accept Invitation"

**Expected Results:**

- BlogBlogger status changes to "writer" or "owner"
- User gains writing permissions
- User can create/edit blog posts
- User appears in bloggers list

#### 3.3 Request to Be Blogger

**Steps:**

1. User navigates to blog
2. Click "Request to Write" button
3. Request submitted

**Expected Results:**

- BlogBlogger created with status "requested"
- Owner receives notification
- Request appears in pending list
- Button changes to "Request Pending"

#### 3.4 Owner Approves Blogger Request

**Steps:**

1. Owner views pending blogger requests
2. Click "Accept" for a request
3. Assign role (writer/owner)

**Expected Results:**

- Status changes to assigned role
- User gains permissions
- User notified of approval
- User can contribute to blog

#### 3.5 Owner Rejects Blogger Request

**Steps:**

1. Owner views pending requests
2. Click "Reject" for a request

**Expected Results:**

- Request deleted
- User notified of rejection
- User can request again
- No permissions granted

#### 3.6 Remove Blogger

**Steps:**

1. Owner navigates to bloggers management
2. Select blogger to remove
3. Click "Remove Blogger"
4. Confirm action

**Expected Results:**

- BlogBlogger record deleted
- User loses writing permissions
- User removed from bloggers list
- User notified of removal

#### 3.7 Change Blogger Role

**Steps:**

1. Owner selects blogger
2. Change role from writer to owner (or vice versa)
3. Save changes

**Expected Results:**

- Role updated
- Permissions adjusted immediately
- User notified of role change
- Timeline event created

### 4. Blog Comments System

#### 4.1 Add Top-Level Comment

**Steps:**

1. Navigate to blog page
2. Click "Add Comment" button
3. Enter comment text
4. Click "Post Comment"

**Expected Results:**

- Comment created with unique ID
- Comment appears in comments list
- Comment count increases
- User shown as comment creator
- Timestamp displayed

#### 4.2 Reply to Comment

**Steps:**

1. View existing comment
2. Click "Reply" button
3. Enter reply text
4. Post reply

**Expected Results:**

- Reply created linked to parent comment
- Reply appears nested under parent
- Indentation shows thread hierarchy
- Reply notification sent to original commenter

#### 4.3 Upvote Comment

**Steps:**

1. View comment
2. Click upvote arrow
3. Verify vote registered

**Expected Results:**

- CommentVote created with vote: 1
- Vote count increases
- Upvote arrow highlighted/colored
- Cannot upvote same comment twice
- Can change vote to downvote

#### 4.4 Downvote Comment

**Steps:**

1. View comment
2. Click downvote arrow
3. Verify vote registered

**Expected Results:**

- CommentVote created with vote: -1
- Vote count decreases
- Downvote arrow highlighted/colored
- Cannot downvote same comment twice
- Can change vote to upvote

#### 4.5 Change Vote on Comment

**Steps:**

1. User has upvoted comment
2. Click downvote arrow
3. Verify vote changed

**Expected Results:**

- Existing vote updated from 1 to -1
- Score changes by 2 (from +1 to -1)
- UI updates to show new vote
- Only one vote per user per comment

#### 4.6 Remove Vote on Comment

**Steps:**

1. User has voted on comment
2. Click same vote arrow again
3. Vote removed

**Expected Results:**

- CommentVote deleted
- Vote arrow no longer highlighted
- Score adjusted
- Can vote again

#### 4.7 Sort Comments by Votes

**Steps:**

1. View blog with multiple comments
2. Select "Sort by Votes" option
3. View sorted list

**Expected Results:**

- Highest voted comments appear first
- Score calculated as upvotes - downvotes
- Sorting updates immediately
- Preference saved

#### 4.8 Sort Comments by Date

**Steps:**

1. View blog with multiple comments
2. Select "Sort by Date" option
3. View sorted list

**Expected Results:**

- Newest comments appear first
- Timestamp used for sorting
- Sorting updates immediately
- Preference saved

#### 4.9 Delete Own Comment

**Steps:**

1. User views own comment
2. Click "Delete" button
3. Confirm deletion

**Expected Results:**

- Comment deleted
- Replies handled (deleted or orphaned)
- Comment count decreases
- Cannot be recovered

#### 4.10 Edit Own Comment

**Steps:**

1. User views own comment
2. Click "Edit" button
3. Modify text
4. Save changes

**Expected Results:**

- Comment text updated
- Updated timestamp shown
- Edit history tracked if applicable
- "Edited" indicator displayed

### 5. Blog Subscription

#### 5.1 Subscribe to Blog

**Steps:**

1. Navigate to blog page (not subscribed)
2. Click "Subscribe" button

**Expected Results:**

- Subscription created
- Button changes to "Unsubscribe"
- Subscriber count increases
- Blog posts appear in user's feed

#### 5.2 Unsubscribe from Blog

**Steps:**

1. User is subscribed to blog
2. Click "Unsubscribe" button

**Expected Results:**

- Subscription deleted
- Button changes to "Subscribe"
- Subscriber count decreases
- Blog removed from feed

### 6. Blog Content Display

#### 6.1 Display Blog Header

**Steps:**

1. Navigate to blog page
2. View header section

**Expected Results:**

- Title displayed prominently
- Creator/author info shown with avatar
- Date displayed
- Hashtags visible
- Public/private badge shown

#### 6.2 Display Blog Stats Bar

**Steps:**

1. View blog with engagement
2. Check stats bar

**Expected Results:**

- Subscriber count accurate
- Like count accurate
- Comment count accurate
- Stats update in real-time

#### 6.3 Display Blog Content

**Steps:**

1. View blog page
2. Read content section

**Expected Results:**

- Content formatted properly
- Rich text rendered correctly
- Images displayed
- Links clickable
- Readable typography

### 7. Blog Hashtags

#### 7.1 Add Hashtags to Blog

**Steps:**

1. Create/edit blog
2. Add multiple hashtags
3. Save blog

**Expected Results:**

- Hashtags stored
- Hashtags displayed with # prefix
- Hashtags are clickable
- Hashtag suggestions appear during typing

#### 7.2 Search by Hashtag

**Steps:**

1. Click hashtag on blog
2. View search results

**Expected Results:**

- All blogs with hashtag shown
- Other entities with hashtag included
- Results filterable by type
- Clear search query indicator

### 8. Blog Social Features

#### 8.1 Share Blog

**Steps:**

1. Click share button on blog
2. View share options

**Expected Results:**

- Share URL generated
- Social media options available
- Copy link functionality
- Share preview with blog details

#### 8.2 Like Blog (Legacy Feature)

**Steps:**

1. View blog page
2. Click like button if available

**Expected Results:**

- Like count increases
- User's like recorded
- Button state changes
- Can unlike

### 9. Blog Search and Discovery

#### 9.1 Search Blogs by Title

**Steps:**

1. Navigate to `/search`
2. Type blog title
3. Filter by "Blogs" type

**Expected Results:**

- Matching blogs displayed
- Results sorted by relevance
- Blog cards show key info
- Clicking navigates to blog

#### 9.2 View Group Blogs

**Steps:**

1. Navigate to group page
2. View blogs section

**Expected Results:**

- All group blogs listed
- Blog cards with gradient backgrounds
- Clickable to view full blog
- Sorted by date

### 10. Blog Loading States

#### 10.1 Blog Page Loading

**Steps:**

1. Navigate to blog page
2. Observe loading state

**Expected Results:**

- Loading indicator displayed
- Skeleton UI shown
- Smooth transition when loaded
- No layout shift

#### 10.2 Comments Loading

**Steps:**

1. Navigate to blog with many comments
2. Observe comments loading

**Expected Results:**

- Comments load efficiently
- Loading spinner if needed
- Pagination if many comments
- Smooth rendering

### 11. Blog Error Handling

#### 11.1 Blog Not Found

**Steps:**

1. Navigate to non-existent blog ID
2. View error page

**Expected Results:**

- "Blog Not Found" message
- Explanation text
- Link to blogs listing
- No broken UI

#### 11.2 Permission Denied

**Steps:**

1. Non-authorized user accesses private blog
2. View error message

**Expected Results:**

- "Access Denied" message
- Explanation of visibility
- Login prompt if applicable
- Redirect option

### 12. Blog Editing and Updates

#### 12.1 Edit Blog (Owner/Writer)

**Steps:**

1. Blogger navigates to blog
2. Click edit button
3. Modify content
4. Save changes

**Expected Results:**

- Only authorized bloggers can edit
- Changes saved successfully
- Subscribers notified
- Timeline event created
- Updated timestamp changed

#### 12.2 Non-Blogger Cannot Edit

**Steps:**

1. Regular user views blog
2. Look for edit options

**Expected Results:**

- Edit button not visible
- Direct URL access denied
- Error message if attempted
- Blog remains unchanged

### 13. Blog Deletion

#### 13.1 Delete Blog (Owner)

**Steps:**

1. Owner navigates to blog settings
2. Click "Delete Blog"
3. Confirm deletion

**Expected Results:**

- Blog and comments deleted
- Subscribers notified
- Blog removed from search
- Associated data cleaned up
- Cannot be recovered

### 14. Blog and Group Association

#### 14.1 Create Blog for Group

**Steps:**

1. Create blog
2. Associate with group
3. View on group page

**Expected Results:**

- Blog linked to group
- Appears in group's blogs section
- Group affiliation shown on blog
- Group members can access

### 15. Blog Comment Notifications

#### 15.1 Comment on Blog Notification

**Steps:**

1. User comments on blog
2. Blog owner checks notifications

**Expected Results:**

- Owner receives notification
- Notification type: "comment_added"
- Contains commenter info and snippet
- Links to blog
- Marked as unread

#### 15.2 Reply to Comment Notification

**Steps:**

1. User replies to another user's comment
2. Original commenter checks notifications

**Expected Results:**

- Original commenter notified
- Notification shows reply text
- Links to specific comment
- Distinguishes from top-level comments

### 16. Blog Timeline Integration

#### 16.1 Blog Creation Timeline Event

**Steps:**

1. Create new blog
2. Check timeline feed

**Expected Results:**

- Timeline event created
- Event type: "created"
- Entity type: "blog"
- Visible to creator's followers

#### 16.2 Blog Update Timeline Event

**Steps:**

1. Update blog content
2. Check timeline

**Expected Results:**

- Timeline event for update
- Shows what changed
- Visible to subscribers
- Links to blog

### 17. Blog Stats and Analytics

#### 17.1 View Blog Statistics

**Steps:**

1. Owner views blog analytics
2. Check metrics

**Expected Results:**

- View count tracked
- Comment count accurate
- Subscriber count shown
- Like count displayed
- Engagement rate calculated

### 18. Blog Comment Threading

#### 18.1 Deep Comment Threading

**Steps:**

1. Reply to comment
2. Reply to reply
3. Continue nesting

**Expected Results:**

- Threading depth appropriate
- Visual indentation shows hierarchy
- Performance maintained
- Collapse/expand functionality

### 19. Blog Multiple Co-Bloggers

#### 19.1 Multiple Writers Collaborate

**Steps:**

1. Blog has multiple writers
2. Each creates/edits content
3. Check attribution

**Expected Results:**

- All writers can contribute
- Authorship tracked per edit
- No conflicts
- Activity log maintained

### 20. Blog Visibility Changes

#### 20.1 Change Blog Visibility

**Steps:**

1. Owner changes from public to private
2. Save changes

**Expected Results:**

- Visibility updated
- Access immediately restricted
- Subscribers notified
- Search results updated

### 21. Blog Comment Pagination

#### 21.1 Paginate Comments

**Steps:**

1. Blog with 100+ comments
2. View comments section

**Expected Results:**

- Comments paginated
- Load more functionality
- Performance optimized
- Scroll position maintained

### 22. Blog Date Display

#### 22.1 Display Publication Date

**Steps:**

1. Create blog with specific date
2. View date display

**Expected Results:**

- Date formatted correctly
- Locale-aware formatting
- Time shown if applicable
- Relative time option (e.g., "2 days ago")

### 23. Blog Hashtag Display

#### 23.1 Display Hashtags on Blog

**Steps:**

1. View blog with hashtags
2. Check hashtag display

**Expected Results:**

- Hashtags centered under title
- Clickable hashtags
- Hashtag component used
- Color coded if applicable

### 24. Blog Owner Transfer

#### 24.1 Transfer Blog Ownership

**Steps:**

1. Owner transfers to another blogger
2. Confirm transfer

**Expected Results:**

- Ownership transferred
- New owner gains full control
- Previous owner becomes writer
- All bloggers notified

### 25. Blog Blogger Role Permissions

#### 25.1 Writer Permissions

**Steps:**

1. User is writer (not owner)
2. Attempt various actions

**Expected Results:**

- Can create/edit content
- Cannot delete blog
- Cannot manage bloggers
- Cannot transfer ownership

#### 25.2 Owner Permissions

**Steps:**

1. User is owner
2. Access all features

**Expected Results:**

- Full control over blog
- Can manage bloggers
- Can delete blog
- Can transfer ownership

### 26. Blog Comment Moderation

#### 26.1 Delete Comment as Blog Owner

**Steps:**

1. Owner views inappropriate comment
2. Click delete on any comment
3. Confirm deletion

**Expected Results:**

- Owner can delete any comment
- Comment removed
- Replies handled appropriately
- User notified if applicable

### 27. Blog Search Within Comments

#### 27.1 Search Comments

**Steps:**

1. Blog with many comments
2. Use search to find specific comment
3. View results

**Expected Results:**

- Matching comments highlighted
- Search within comment text
- Results navigable
- Clear search results

### 28. Blog Comment Count Accuracy

#### 28.1 Accurate Comment Count

**Steps:**

1. Add/remove comments
2. Monitor count

**Expected Results:**

- Count includes all comments and replies
- Updates in real-time
- Displayed in multiple locations consistently
- Deleted comments decremented

### 29. Blog Avatar and Creator Display

#### 29.1 Display Creator Info

**Steps:**

1. View blog page
2. Check creator section

**Expected Results:**

- Creator avatar displayed
- Creator name shown
- Creator handle shown
- Clickable to profile
- "Created by" label

### 30. Blog Action Bar

#### 30.1 Use Action Bar

**Steps:**

1. View blog page
2. Check action bar buttons

**Expected Results:**

- Subscribe button visible
- Comment button visible
- Share button visible
- All buttons functional
- Proper spacing and alignment

## Test Coverage Summary

### Unit Tests (Vitest)

- `useSubscribeBlog.test.ts`: Blog subscription functionality
- `BlogPage.test.tsx`: Blog display component
- `CommentItem.test.tsx`: Comment component with voting
- `blogs.store.test.ts`: Blog store and filtering

### E2E Tests (Playwright)

- `blog-creation.spec.ts`: Blog creation flows
- `blog-blogger-management.spec.ts`: Blogger invitation and management
- `blog-comments.spec.ts`: All comment scenarios
- `blog-voting.spec.ts`: Comment voting functionality
- `blog-visibility.spec.ts`: Access control
- `blog-subscription.spec.ts`: Subscribe/unsubscribe flows

## Edge Cases Covered

1. Blog with no comments
2. Blog with deeply nested comment threads
3. Comment voting conflicts
4. Multiple bloggers editing simultaneously
5. Blog deletion with active comments
6. Visibility changes with active viewers
7. Comment spam prevention
8. Long blog titles/content
9. Special characters in comments
10. Image upload failures
11. Hashtag validation
12. Owner transfer edge cases
13. Orphaned blogs (deleted creator)
14. Comment notification flood
15. Search indexing delays

## Future Test Considerations

1. Blog post scheduling
2. Draft management
3. Blog categories/tags advanced filtering
4. RSS feed generation
5. Blog analytics dashboard
6. Comment reporting/flagging
7. Blog templates
8. Multi-author attribution per paragraph
9. Blog version history
10. Advanced rich text editing features
