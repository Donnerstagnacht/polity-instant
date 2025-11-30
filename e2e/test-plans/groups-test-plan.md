# Groups Feature - Comprehensive Test Plan

## Application Overview

The Groups feature in Polity is a comprehensive organization management system that enables users to create, join, and manage community groups. Key functionality includes:

- **Group Creation & Management**: Create groups with rich details (name, description, location, tags, visibility, social media)
- **Membership System**: Request/invite members, accept/decline invitations, track membership status
- **Role Management**: Custom roles with granular permissions, role assignments
- **Group Hierarchy**: Parent-child group relationships with rights inheritance
- **Positions**: Create and manage elected/appointed positions within groups
- **Group Linking**: Link groups with specific rights (information, amendment, voting, speaking rights)
- **Social Features**: Subscribe to groups, share groups, view member lists
- **Content Association**: Groups can have events, amendments, blogs, todos, meetings
- **Operations**: Financial tracking, payments, links management
- **Integration**: Groups appear in search, timeline, and user profiles

## Test Scenarios

### 1. Create Basic Group

**Seed:** `e2e/seed.spec.ts`

#### 1.1 Create Public Group with Required Fields

**Steps:**

1. Navigate to `/create` page
2. Select "Group" entity type
3. Enter group name "Tech Community Berlin"
4. Enter description
5. Set group as public
6. Click "Create" button

**Expected Results:**

- Group is created with unique ID
- User redirected to group page
- Group appears with entered details
- User automatically set as owner
- Group visible in public listings

#### 1.2 Create Private Group with Full Details

**Steps:**

1. Navigate to create page
2. Select Group type
3. Enter all fields: name, description, location, region, country
4. Upload group image
5. Set visibility to private
6. Add hashtags
7. Add social media links (WhatsApp, Instagram, Twitter, Facebook)
8. Click Create

**Expected Results:**

- Group created with all metadata
- Image uploaded successfully
- Group only visible to members
- Hashtags associated
- Social media links saved

### 2. Group Visibility and Access Control

#### 2.1 Public Group Visibility

**Steps:**

1. Create public group as authenticated user
2. Log out
3. Navigate to group URL directly
4. Attempt to view group details

**Expected Results:**

- Public group details visible to unauthenticated users
- Membership requires authentication
- Subscribe/action buttons disabled or prompt login
- Basic information accessible

#### 2.2 Private Group Access Restriction

**Steps:**

1. Create private group
2. Log out or switch to different user
3. Attempt to access group URL

**Expected Results:**

- Non-members cannot view private group
- Access denied message displayed
- Group not visible in search results for non-members
- Redirect to appropriate page

#### 2.3 Authenticated-Only Group Access

**Steps:**

1. Create group with "authenticated" visibility
2. Log out
3. Attempt to access group
4. Log in as different user
5. Access group

**Expected Results:**

- Unauthenticated users cannot access
- Any authenticated user can view group
- Membership still requires request/approval
- Content visibility controlled separately

### 3. Group Membership Flow

**Note:** Detailed membership flow scenarios (request to join, cancel request, accept invitation, leave group) are covered comprehensively in [group-membership-test-plan.md](group-membership-test-plan.md).

**Reference:** See group-membership-test-plan.md for:

- Request to join group flow
- Cancel membership request
- Accept group invitation
- Leave group voluntarily
- Admin approve/reject requests
- Admin invite members
- Admin promote/demote members
- Admin remove members
- Admin withdraw invitations
- Member role management

### 4. Group Details and Information

#### 4.1 Display Group Details

**Steps:**

1. Navigate to group page
2. View group information

**Expected Results:**

- Name, description displayed correctly
- Location, region, country shown if provided
- Owner information displayed
- Public/private badge visible
- Social media links clickable

#### 4.2 Group Image Display

**Steps:**

1. Create group with uploaded image
2. View group page

**Expected Results:**

- Image displayed prominently
- Image properly sized and cropped
- Image loads efficiently
- Fallback if image missing

#### 4.3 Group Stats Bar

**Steps:**

1. View group with members, subscribers, events, amendments
2. Check stats bar

**Expected Results:**

- Member count accurate
- Subscriber count accurate
- Events count shown
- Amendments count shown
- Stats update in real-time

#### 4.4 Group Hashtags Display

**Steps:**

1. Create group with hashtags
2. View group page

**Expected Results:**

- Hashtags displayed with # prefix
- Hashtags are clickable
- Clicking hashtag searches by tag
- Hashtags centered under title

### 5. Group Subscription

#### 5.1 Subscribe to Group

**Steps:**

1. Navigate to group page (not subscribed)
2. Click "Subscribe" button

**Expected Results:**

- Subscription created
- Button changes to "Unsubscribe"
- Subscriber count increases
- Group content appears in user's subscribed feed

#### 5.2 Unsubscribe from Group

**Steps:**

1. User is subscribed to group
2. Click "Unsubscribe" button

**Expected Results:**

- Subscription deleted
- Button changes to "Subscribe"
- Subscriber count decreases
- Group removed from subscribed feed

#### 5.3 Subscribe vs Member Distinction

**Steps:**

1. Subscribe to group without joining as member
2. Check access permissions

**Expected Results:**

- Subscription doesn't grant member access
- User receives updates but not member features
- Clear distinction in UI
- Both actions can be taken independently

### 6. Group Hierarchy and Relationships

#### 6.1 Create Parent-Child Group Relationship

**Steps:**

1. Navigate to parent group
2. Click "Link Group" button
3. Search for child group
4. Select rights to grant (information, amendment, voting, speaking)
5. Confirm link

**Expected Results:**

- Relationship created
- Rights properly configured
- Child group appears in parent's child groups section
- Parent appears in child's parent groups section
- Rights enforceable

#### 6.2 View Child Groups

**Steps:**

1. Navigate to group with child relationships
2. View child groups section

**Expected Results:**

- All child groups displayed
- Each shows granted rights
- Clickable to navigate to child
- Shows child group stats (members, events, amendments)

#### 6.3 View Parent Groups

**Steps:**

1. Navigate to child group
2. View parent groups section

**Expected Results:**

- All parent groups displayed
- Shows inherited rights
- Clickable to navigate to parent
- Clear visual hierarchy

#### 6.4 Remove Group Relationship

**Steps:**

1. Admin navigates to linked groups
2. Click "Unlink" for a relationship
3. Confirm removal

**Expected Results:**

- Relationship deleted
- Rights revoked
- Group removed from child/parent lists
- No access retained through link

### 7. Group Positions Management

#### 7.1 Create Position

**Steps:**

1. Admin navigates to group positions
2. Click "Create Position"
3. Enter title, description, term length, start date
4. Save position

**Expected Results:**

- Position created
- Appears in positions list
- Available for assignment
- Displayed on group page

#### 7.2 Assign Current Holder to Position

**Steps:**

1. Admin selects position
2. Click "Assign Holder"
3. Search and select user
4. Confirm assignment

**Expected Results:**

- User assigned to position
- User displayed as current holder
- User gains position permissions
- Timeline event created

#### 7.3 Remove Current Holder from Position

**Steps:**

1. Admin views position with current holder
2. Click "Remove Holder"
3. Confirm removal

**Expected Results:**

- User removed from position
- Position marked as vacant
- User loses position permissions
- Timeline event created

#### 7.4 Delete Position

**Steps:**

1. Admin selects position
2. Click "Delete Position"
3. Confirm deletion

**Expected Results:**

- Position deleted
- Current holder notified if assigned
- Position removed from displays
- Cannot delete if has historical significance

### 8. Group Content Association

#### 8.1 Create Event for Group

**Steps:**

1. Navigate to group page
2. Click "Create Event" or create event and link to group
3. Event associated with group

**Expected Results:**

- Event linked to group
- Event appears in group's events section
- Group displayed on event page
- Event count incremented

#### 8.2 Create Amendment for Group

**Steps:**

1. Create amendment
2. Link to group during creation or editing
3. Save amendment

**Expected Results:**

- Amendment associated with group
- Amendment appears in group's amendments list
- Group affiliation shown on amendment
- Amendment count incremented

#### 8.3 Create Blog for Group

**Steps:**

1. Create blog
2. Link to group
3. Save blog

**Expected Results:**

- Blog associated with group
- Blog appears in group's blogs section
- Blog cards displayed with gradients
- Clickable to view full blog

#### 8.4 View Group Content Tabs

**Steps:**

1. Navigate to group with various content
2. Switch between content tabs/sections

**Expected Results:**

- Events tab shows all group events
- Amendments tab shows all amendments
- Blogs tab shows all blog posts
- Each tab properly filtered
- Counts accurate

### 9. Group Roles and Permissions

#### 9.1 Create Custom Group Role

**Steps:**

1. Admin navigates to roles tab
2. Click "Add Role"
3. Enter role name and description
4. Set permissions/action rights
5. Save role

**Expected Results:**

- Role created and available
- Role appears in assignment dropdown
- Permissions properly configured
- Role can be assigned to members

#### 9.2 Assign Custom Role to Member

**Steps:**

1. Admin views member list
2. Click role dropdown for member
3. Select custom role

**Expected Results:**

- Member role updated
- Permissions applied immediately
- Role displayed in member card
- Timeline event created

#### 9.3 Configure Action Rights for Role

**Steps:**

1. Admin edits role
2. Toggle action rights checkboxes:
   - Update group
   - Manage events
   - Create amendments
   - Manage members
   - Etc.
3. Save changes

**Expected Results:**

- Permissions saved
- Members with role gain/lose permissions
- Permissions enforced in UI and backend
- Changes logged

#### 9.4 Delete Custom Role

**Steps:**

1. Admin navigates to roles tab
2. Click delete for custom role
3. Confirm deletion

**Expected Results:**

- Role deleted
- Members with role reverted to default
- Role removed from dropdown
- Cannot delete system roles (Owner, Admin, Member)

### 10. Group Operations (Financial)

#### 10.1 View Group Operations Page

**Steps:**

1. Navigate to `/group/[id]/operation`
2. View operations dashboard

**Expected Results:**

- Links displayed
- Payments displayed (income/expenses)
- Todos displayed
- Summary statistics shown

#### 10.2 Track Income Payments

**Steps:**

1. Create payment with group as receiver
2. View in operations

**Expected Results:**

- Payment appears in income section
- Amount and source shown
- Green indicator for income
- Total income calculated

#### 10.3 Track Expense Payments

**Steps:**

1. Create payment with group as payer
2. View in operations

**Expected Results:**

- Payment appears in expenses section
- Amount and recipient shown
- Red indicator for expense
- Total expenses calculated

#### 10.4 Net Balance Calculation

**Steps:**

1. View operations with both income and expenses
2. Check balance calculation

**Expected Results:**

- Net balance = income - expenses
- Displayed prominently
- Color coded (green/red)
- Updates in real-time

### 11. Group Search and Discovery

#### 11.1 Search Groups by Name

**Steps:**

1. Navigate to `/search`
2. Type group name in search
3. Filter by "Groups" type

**Expected Results:**

- Matching groups displayed
- Results sorted by relevance
- Group cards show key info
- Clicking navigates to group

#### 11.2 Filter Groups by Hashtag

**Steps:**

1. Click hashtag on group page
2. View search results

**Expected Results:**

- All groups with that hashtag shown
- Results filterable
- Public groups visible to all
- Private groups hidden appropriately

#### 11.3 Filter Groups by Location

**Steps:**

1. Search for groups in specific location
2. Apply location filter

**Expected Results:**

- Groups in that location shown
- Location hierarchy respected (city > region > country)
- Map view option if available
- Distance sorting if geolocation enabled

### 12. Group Social Media Integration

#### 12.1 Display Social Media Links

**Steps:**

1. Create group with social media links
2. View group page social bar

**Expected Results:**

- All configured platforms displayed
- Icons clickable and open correct URLs
- Links open in new tab
- Graceful handling if link invalid

#### 12.2 Add/Update Social Media Links

**Steps:**

1. Admin edits group
2. Add/modify social media URLs
3. Save changes

**Expected Results:**

- URLs validated
- Changes saved successfully
- Social bar updates immediately
- Invalid URLs rejected

### 13. Group Member Count Accuracy

#### 13.1 Accurate Member Count

**Steps:**

1. Create group
2. Add/remove members
3. Monitor count

**Expected Results:**

- Only counts status "member" and "admin"
- Excludes "invited" and "requested"
- Updates in real-time
- Matches actual member list

#### 13.2 Subscriber Count Accuracy

**Steps:**

1. Add/remove subscribers
2. Monitor subscriber count

**Expected Results:**

- Counts all active subscriptions
- Updates immediately
- Independent of membership
- Displayed correctly in stats bar

### 14. Group Editing and Updates

#### 14.1 Edit Group Details (Admin)

**Steps:**

1. Login as group admin
2. Navigate to group page
3. Click settings/edit button
4. Modify group details
5. Save changes

**Expected Results:**

- Only admins can edit
- Changes saved successfully
- All members notified of changes
- Timeline event created for update
- Updated timestamp changed

#### 14.2 Non-Admin Cannot Edit

**Steps:**

1. Login as regular member
2. Navigate to group page
3. Look for edit options

**Expected Results:**

- Edit button not visible
- Direct URL access to edit page denied
- Error message if attempted
- Group details remain unchanged

### 15. Group Loading States

#### 15.1 Group Page Loading

**Steps:**

1. Navigate to group page
2. Observe loading state

**Expected Results:**

- Loading indicator displayed
- Skeleton UI shown
- Smooth transition to loaded state
- No layout shift

#### 15.2 Membership Action Loading

**Steps:**

1. Click "Request to Join"
2. Observe loading state

**Expected Results:**

- Button shows loading spinner
- Button disabled during request
- Success/error feedback
- Smooth state transition

### 16. Group Error Handling

#### 16.1 Group Not Found

**Steps:**

1. Navigate to non-existent group ID
2. View error page

**Expected Results:**

- Clear "Group Not Found" message
- Explanation text
- Link to groups listing or home
- No broken UI elements

#### 16.2 Permission Denied

**Steps:**

1. Non-member tries to access private group
2. View error message

**Expected Results:**

- "Access Denied" message
- Explanation of visibility settings
- Option to request membership
- Redirect to appropriate page

### 17. Group Timeline Integration

#### 17.1 Group Creation Timeline Event

**Steps:**

1. Create new group
2. Check timeline feed

**Expected Results:**

- Timeline event created
- Event type: "created"
- Entity type: "group"
- Displayed in creator's timeline
- Visible to followers

#### 17.2 Membership Timeline Event

**Steps:**

1. User joins group
2. Check timeline

**Expected Results:**

- Timeline event for membership
- Event type: "member_joined"
- Visible to user's followers
- Links to group

#### 17.3 Group Update Timeline Event

**Steps:**

1. Admin updates group details
2. Check timeline

**Expected Results:**

- Timeline event created
- Event type: "group_update"
- Shows what changed
- Visible to group subscribers

### 18. Group Sharing

#### 18.1 Share Group

**Steps:**

1. Click share button on group
2. View share options

**Expected Results:**

- Share URL generated
- Social media options available
- Copy link functionality
- Share includes group details/image

### 19. Group Deletion

#### 19.1 Delete Group (Owner)

**Steps:**

1. Owner navigates to group settings
2. Click "Delete Group"
3. Confirm deletion with warning

**Expected Results:**

- Group and all related data deleted
- Members notified
- Associated content orphaned or reassigned
- Group removed from search
- Cannot be recovered

#### 19.2 Prevent Deletion with Active Content

**Steps:**

1. Attempt to delete group with active events/amendments
2. View warning

**Expected Results:**

- Warning about associated content
- Option to reassign or delete content
- Confirmation required
- Clear consequences explained

### 20. Group Info Tabs

#### 20.1 View About Tab

**Steps:**

1. Navigate to group
2. Click "About" tab

**Expected Results:**

- Description displayed
- Formatted properly
- Supports markdown/rich text
- Links clickable

#### 20.2 View Contact Tab

**Steps:**

1. Navigate to group
2. Click "Contact" tab

**Expected Results:**

- Location, region, country shown
- Contact information displayed
- Map integration if available
- Social media links

### 21. Group Image Management

#### 21.1 Upload Group Image

**Steps:**

1. Create/edit group
2. Upload image file
3. Save group

**Expected Results:**

- Image uploaded successfully
- Image preview shown
- Image stored and retrievable
- Image URL saved to group

#### 21.2 Change Group Image

**Steps:**

1. Edit group with existing image
2. Upload new image
3. Save changes

**Expected Results:**

- Old image replaced
- New image displayed
- Previous image removed from storage
- Update reflected immediately

### 22. Group Member Search and Filter

#### 22.1 Search Members by Name

**Steps:**

1. Admin navigates to members page
2. Enter search term
3. View results

**Expected Results:**

- Matching members displayed
- Search works on name and handle
- Results update in real-time
- Clear search functionality

#### 22.2 Filter Members by Role

**Steps:**

1. View members list
2. Apply role filter (Admin/Member/Custom)
3. View filtered results

**Expected Results:**

- Only members with selected role shown
- Multiple role selection supported
- Filter persists during session
- Clear filter option

#### 22.3 Filter Members by Status

**Steps:**

1. View all memberships (including pending)
2. Filter by status (invited/requested/member/admin)

**Expected Results:**

- Status filter works correctly
- Pending requests separated
- Active members highlighted
- Status badges visible

### 23. Group Duplicate Prevention

#### 23.1 Prevent Duplicate Group Names

**Steps:**

1. Create group with specific name
2. Attempt to create another with same name

**Expected Results:**

- Warning shown
- Suggestions to view existing group
- Still allows creation if intentional
- Clear messaging

### 24. Group Tags and Categories

#### 24.1 Add Tags to Group

**Steps:**

1. Create/edit group
2. Add multiple tags/hashtags
3. Save group

**Expected Results:**

- Tags stored
- Tags displayed as badges
- Tags are searchable
- Tag suggestions appear

### 25. Group Multiple Admins Coordination

#### 25.1 Multiple Admins Manage Simultaneously

**Steps:**

1. Group has multiple admins
2. Each performs admin actions concurrently

**Expected Results:**

- No conflicts in actions
- Changes sync in real-time
- All admins have equal permissions
- Audit trail maintained

#### 25.2 Prevent Last Admin Removal

**Steps:**

1. Group has single admin
2. Attempt to demote self

**Expected Results:**

- Action prevented
- Error message shown
- Must promote another first
- Group always has admin

### 26. Group Visibility Changes

#### 26.1 Change from Public to Private

**Steps:**

1. Admin edits public group
2. Change visibility to private
3. Save changes

**Expected Results:**

- Visibility updated
- Non-members lose access
- Group removed from public listings
- Members notified of change

#### 26.2 Change from Private to Public

**Steps:**

1. Admin edits private group
2. Change visibility to public
3. Save changes

**Expected Results:**

- Visibility updated
- Group appears in public listings
- Non-members can view basic info
- Members notified of change

### 27. Group Linking Rights Management

#### 27.1 Grant Information Right

**Steps:**

1. Link child group with information right
2. Verify access

**Expected Results:**

- Child group can view parent info
- Access to public documents
- Cannot modify parent
- Clear right indication

#### 27.2 Grant Amendment Right

**Steps:**

1. Link child group with amendment right
2. Verify access

**Expected Results:**

- Child group can propose amendments to parent
- Amendment process available
- Parent can approve/reject
- Right displayed clearly

#### 27.3 Grant Voting Right (Active)

**Steps:**

1. Link child group with active voting right
2. Verify functionality

**Expected Results:**

- Child group members can vote in parent elections
- Voting power configured
- Vote delegation if applicable
- Right tracked in system

#### 27.4 Grant Speaking Right

**Steps:**

1. Link child group with speaking right
2. Verify access

**Expected Results:**

- Child group can participate in parent discussions
- Speaking time allocated if applicable
- Agenda item access
- Right visible in UI

### 28. Group Ownership Transfer

#### 28.1 Transfer Group Ownership

**Steps:**

1. Owner navigates to settings
2. Select "Transfer Ownership"
3. Choose new owner from admins
4. Confirm transfer

**Expected Results:**

- Ownership transferred
- New owner gains full control
- Previous owner becomes admin
- All members notified
- Cannot be undone without new owner's action

### 29. Group Archive/Deactivate

#### 29.1 Archive Group

**Steps:**

1. Admin archives group
2. Group marked as inactive

**Expected Results:**

- Group still viewable but read-only
- No new members can join
- Existing members retain access
- Marked as "Archived"
- Can be reactivated

## Test Coverage Summary

### Unit Tests (Vitest)

- `useGroupMembership.test.ts`: Hook logic for all membership operations
- `useSubscribeGroup.test.ts`: Group subscription functionality
- `GroupWiki.test.tsx`: Group display component
- `groups.store.test.ts`: Group store filtering and search
- `LinkGroupDialog.test.tsx`: Group linking functionality

### E2E Tests (Playwright)

- `group-creation.spec.ts`: Group creation flows
- `group-membership.spec.ts`: All membership scenarios (existing)
- `group-admin-management.spec.ts`: Admin actions
- `group-visibility.spec.ts`: Access control and visibility
- `group-hierarchy.spec.ts`: Parent-child relationships
- `group-positions.spec.ts`: Position management
- `group-operations.spec.ts`: Financial tracking

## Edge Cases Covered

1. Multiple admins coordinating actions
2. Simultaneous membership requests
3. Group deletion with active content
4. Visibility changes while users viewing
5. Ownership transfer edge cases
6. Circular group relationships prevention
7. Rights conflict resolution
8. Orphaned content handling
9. Duplicate group name prevention
10. Social media link validation
11. Image upload size/format limits
12. Location autocomplete failures
13. Concurrent edits by multiple admins
14. Notification flood prevention
15. Member limit enforcement (if applicable)

## Future Test Considerations

1. Group merge functionality
2. Group federation/networking
3. Advanced financial reporting
4. Member role history tracking
5. Group analytics dashboard
6. Automated membership rules
7. Group templates for quick creation
8. Bulk member import/export
9. Integration with external platforms
10. Advanced search with multiple filters
