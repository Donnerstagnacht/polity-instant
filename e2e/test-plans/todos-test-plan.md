# Todos Feature Test Plan

## Overview

Comprehensive test plan for the task management system covering todo creation, status management, priority levels, assignments, filtering, sorting, and both kanban and list views.

## Test Scenarios

### 1. Load Todos Page

- **Scenario**: User accesses the todos page
- **Steps**:
  1. User navigates to /todos
  2. Page loads with todos list
  3. Default kanban view displays
  4. Tabs visible for status filtering
  5. Create new todo button visible
- **Expected Result**: Todos page loads with kanban view

### 2. View Todos Kanban Board

- **Scenario**: User views todos in kanban board layout
- **Steps**:
  1. User on todos page
  2. Kanban view selected
  3. Columns: Pending, In Progress, Completed, Cancelled
  4. Todos organized in appropriate columns
  5. Can drag and drop between columns
- **Expected Result**: Kanban board displays todos by status

### 3. View Todos List View

- **Scenario**: User switches to list view
- **Steps**:
  1. User clicks list view icon
  2. View changes to vertical list
  3. All todos shown with checkboxes
  4. Priority indicators visible
  5. Due dates displayed
- **Expected Result**: List view shows todos linearly

### 4. Toggle View Mode

- **Scenario**: User switches between kanban and list views
- **Steps**:
  1. User in kanban view
  2. Clicks list view icon
  3. View changes to list
  4. Clicks kanban icon
  5. View returns to kanban
  6. Filter and sort settings preserved
- **Expected Result**: View toggle works without losing state

### 5. Create New Todo

- **Scenario**: User creates a new todo task
- **Steps**:
  1. User clicks "New Todo" button
  2. Dialog opens with creation form
  3. User enters title "Complete project documentation"
  4. User enters description
  5. User sets priority to "high"
  6. User sets due date to next week
  7. User clicks Create
  8. Todo appears in Pending column/section
- **Expected Result**: New todo created successfully

### 6. Quick Create Todo

- **Scenario**: User quickly creates todo with minimal fields
- **Steps**:
  1. User enters title in quick add input
  2. User presses Enter
  3. Todo created with default values
  4. Title entered, status "pending", priority "medium"
  5. Todo appears immediately
- **Expected Result**: Quick create works with defaults

### 7. Edit Todo

- **Scenario**: User edits existing todo
- **Steps**:
  1. User clicks on todo
  2. Edit dialog opens
  3. User changes title
  4. User updates description
  5. User changes priority
  6. User saves changes
  7. Todo updates in view
- **Expected Result**: Todo editing works correctly

### 8. Change Todo Status

- **Scenario**: User updates todo status
- **Steps**:
  1. User has todo in "Pending"
  2. User drags to "In Progress" (kanban)
  3. Or clicks status dropdown (list view)
  4. Status updates immediately
  5. Todo moves to appropriate section
  6. updatedAt timestamp updates
- **Expected Result**: Status changes reflected instantly

### 9. Mark Todo as Complete

- **Scenario**: User completes a todo
- **Steps**:
  1. User clicks checkbox on pending todo
  2. Todo marked as completed
  3. Visual strike-through or checkmark
  4. Moves to Completed section
  5. completedAt timestamp recorded
  6. Completion celebration animation (optional)
- **Expected Result**: Todo completion is satisfying and clear

### 10. Uncomplete Todo

- **Scenario**: User unmarks completed todo
- **Steps**:
  1. User has completed todo
  2. User clicks checkbox to uncheck
  3. Todo status changes to "pending"
  4. Moves back to Pending section
  5. completedAt cleared
- **Expected Result**: Uncompleting works bidirectionally

### 11. Cancel Todo

- **Scenario**: User cancels a todo that won't be done
- **Steps**:
  1. User selects todo
  2. User changes status to "cancelled"
  3. Todo moves to Cancelled section
  4. Visually muted appearance
  5. Can be uncancelled if needed
- **Expected Result**: Cancelled todos tracked separately

### 12. Delete Todo

- **Scenario**: User permanently deletes todo
- **Steps**:
  1. User clicks delete icon on todo
  2. Confirmation dialog appears
  3. User confirms deletion
  4. Todo removed from all views
  5. Action cannot be undone (or has undo window)
- **Expected Result**: Todo deletion requires confirmation

### 13. Set Todo Priority

- **Scenario**: User assigns priority level to todo
- **Steps**:
  1. User creates or edits todo
  2. User selects priority: Low, Medium, High, Urgent
  3. Priority badge displays on todo
  4. Color-coded: Low (gray), Medium (blue), High (orange), Urgent (red)
  5. Priority affects sorting
- **Expected Result**: Priority levels visually distinct

### 14. Set Todo Due Date

- **Scenario**: User sets deadline for todo
- **Steps**:
  1. User clicks due date field
  2. Calendar picker opens
  3. User selects date
  4. Due date displays on todo
  5. Overdue todos highlighted in red
  6. Approaching deadlines in yellow
- **Expected Result**: Due dates help with time management

### 15. Assign Todo to User

- **Scenario**: User assigns todo to themselves or others
- **Steps**:
  1. User creates or edits todo
  2. User clicks "Assign to" field
  3. User search dialog opens
  4. User selects assignee(s)
  5. Avatars of assignees shown on todo
  6. Assignees can view todo in their list
- **Expected Result**: Todo assignment works for collaboration

### 16. Filter Todos by Status

- **Scenario**: User filters todos by completion status
- **Steps**:
  1. User clicks status filter tabs
  2. Options: All, Pending, In Progress, Completed, Cancelled
  3. User selects "Pending"
  4. Only pending todos display
  5. Count badges show number in each status
- **Expected Result**: Status filtering works accurately

### 17. Filter Todos by Priority

- **Scenario**: User filters by priority level
- **Steps**:
  1. User opens priority filter dropdown
  2. Selects "High"
  3. Only high priority todos shown
  4. Filter can be cleared to show all
  5. Multiple priorities can be selected
- **Expected Result**: Priority filtering narrows results

### 18. Search Todos

- **Scenario**: User searches todos by keyword
- **Steps**:
  1. User types in search box
  2. Results filter in real-time
  3. Searches title, description, tags
  4. Matching todos highlighted
  5. Clear search shows all todos again
- **Expected Result**: Search finds relevant todos quickly

### 19. Sort Todos by Due Date

- **Scenario**: User sorts todos by deadline
- **Steps**:
  1. User clicks sort dropdown
  2. Selects "Due Date"
  3. Todos sorted with soonest due first
  4. Overdue todos at top
  5. No due date todos at bottom
- **Expected Result**: Due date sorting helps prioritization

### 20. Sort Todos by Priority

- **Scenario**: User sorts by priority level
- **Steps**:
  1. User selects "Priority" from sort dropdown
  2. Todos sorted: Urgent, High, Medium, Low
  3. Equal priorities sorted by due date
  4. Sort order maintained across views
- **Expected Result**: Priority sorting surfaces important tasks

### 21. Sort Todos by Created Date

- **Scenario**: User sorts by creation date
- **Steps**:
  1. User selects "Created Date" sort
  2. Newest todos appear first
  3. Can toggle to oldest first
  4. Helps track recent additions
- **Expected Result**: Creation date sorting works

### 22. Sort Todos by Title

- **Scenario**: User sorts alphabetically
- **Steps**:
  1. User selects "Title" sort option
  2. Todos sorted A-Z
  3. Can toggle to Z-A
  4. Ignores case in sorting
- **Expected Result**: Alphabetical sorting available

### 23. Drag and Drop in Kanban

- **Scenario**: User drags todos between kanban columns
- **Steps**:
  1. User in kanban view
  2. User grabs todo card
  3. Drags to different status column
  4. Drops todo in new column
  5. Status updates automatically
  6. Smooth animation
- **Expected Result**: Drag and drop feels responsive

### 24. Reorder Todos in Kanban

- **Scenario**: User reorders todos within a column
- **Steps**:
  1. User drags todo up or down in same column
  2. Other todos shift to make space
  3. Drop to reorder
  4. Order persists
  5. Custom sort order saved
- **Expected Result**: Manual reordering works smoothly

### 25. Add Tags to Todo

- **Scenario**: User adds tags for organization
- **Steps**:
  1. User edits todo
  2. User clicks tags field
  3. User types tag name
  4. Tag appears as chip/badge
  5. Can add multiple tags
  6. Can remove tags
  7. Todos filterable by tag
- **Expected Result**: Tags aid in organization

### 26. View Only User's Todos

- **Scenario**: User sees todos they created or are assigned to
- **Steps**:
  1. Todos page loads
  2. Only shows todos where:
     - User is creator, OR
     - User is assignee
  3. Other users' todos not visible
  4. Filter applies automatically
- **Expected Result**: User sees only relevant todos

### 27. Overdue Todos Highlighting

- **Scenario**: Overdue todos are visually distinct
- **Steps**:
  1. Todo has due date in the past
  2. Todo card has red border or background
  3. Overdue badge or icon visible
  4. Stands out in list/kanban view
  5. Urgent visual priority
- **Expected Result**: Overdue todos immediately noticeable

### 28. Todo Completion Stats

- **Scenario**: User views productivity statistics
- **Steps**:
  1. Dashboard shows completion rate
  2. Displays: X completed, Y pending, Z overdue
  3. Progress bar or chart
  4. Can filter stats by date range
  5. Motivational metrics
- **Expected Result**: Stats provide insights and motivation

### 29. Bulk Operations on Todos

- **Scenario**: User performs actions on multiple todos
- **Steps**:
  1. User enables selection mode
  2. Checkboxes appear on todos
  3. User selects multiple todos
  4. User clicks "Mark as Complete"
  5. All selected todos completed
  6. Also works for delete, change priority, etc.
- **Expected Result**: Bulk actions save time

### 30. Todo Notifications/Reminders

- **Scenario**: User receives reminder for upcoming todos
- **Steps**:
  1. Todo has due date tomorrow
  2. User receives notification
  3. Notification shows todo title and due date
  4. Clicking opens todo detail
  5. User can snooze or complete from notification
- **Expected Result**: Reminders help users stay on track

## Test Coverage Summary

### Unit Tests (Vitest)

- Status change logic
- Priority sorting
- Due date calculations
- Search/filter algorithms
- Assignment validation

### E2E Tests (Playwright)

- Todo CRUD operations
- Kanban drag and drop
- Status filtering and updates
- Priority management
- View mode switching

## Edge Cases Covered

1. Very long todo titles
2. Todos without due dates
3. Todos with past due dates
4. Multiple assignees
5. Todos with many tags
6. Empty kanban columns
7. Rapid status changes
8. Concurrent edits by multiple users
9. Deleted assignee users
10. Browser refresh during drag operation
