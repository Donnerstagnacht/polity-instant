# Create Feature Test Plan

## Overview

Comprehensive test plan for the Create page covering guided mode, form mode, and all entity types that can be created (groups, events, statements, blogs, amendments, todos, agenda items, change requests, election candidates, and positions).

## Test Scenarios

### 1. Load Create Page

- **Scenario**: User accesses the create page
- **Steps**:
  1. User navigates to /create
  2. Page loads with default guided mode
  3. Mode toggle is visible showing "Guided Mode" switch
  4. Initial carousel step displays entity type selection
- **Expected Result**: Create page loads successfully in guided mode

### 2. Toggle Between Guided and Form Mode

- **Scenario**: User switches between guided mode and form mode
- **Steps**:
  1. User is on create page in guided mode
  2. User clicks the mode toggle switch
  3. Interface changes to tabbed form mode
  4. Tabs display for all entity types (Groups, Events, Statements, etc.)
  5. User toggles back to guided mode
  6. Interface changes back to carousel
- **Expected Result**: Mode toggle works bidirectionally without data loss

### 3. Guided Mode - Create Group

- **Scenario**: User creates a group using guided mode
- **Steps**:
  1. User selects "Groups" in entity type carousel
  2. Carousel advances to name field
  3. User enters group name
  4. Carousel advances to description field
  5. User enters description
  6. User selects visibility (public/private)
  7. User adds hashtags
  8. User clicks "Create Group"
  9. Group is created and user redirected
- **Expected Result**: Group is successfully created with all provided details

### 4. Guided Mode - Create Event

- **Scenario**: User creates an event using guided mode
- **Steps**:
  1. User selects "Events" in entity type carousel
  2. User fills in event title
  3. User fills in event description
  4. User selects event date and time
  5. User sets location (physical or virtual)
  6. User selects associated group (optional)
  7. User sets visibility (public/private)
  8. User adds event image (optional)
  9. User clicks "Create Event"
- **Expected Result**: Event is created with all details and appears in calendar

### 5. Guided Mode - Create Statement

- **Scenario**: User creates a statement using guided mode
- **Steps**:
  1. User selects "Statements" entity type
  2. User enters statement text
  3. User selects statement type (position, question, fact, etc.)
  4. User selects tag/category
  5. User clicks "Create Statement"
- **Expected Result**: Statement is created and visible in user's profile

### 6. Guided Mode - Create Blog

- **Scenario**: User creates a blog post using guided mode
- **Steps**:
  1. User selects "Blogs" entity type
  2. User enters blog title
  3. User enters blog content (rich text editor)
  4. User adds hashtags
  5. User uploads cover image (optional)
  6. User sets visibility
  7. User clicks "Create Blog"
- **Expected Result**: Blog post is created and published

### 7. Guided Mode - Create Amendment

- **Scenario**: User creates an amendment using guided mode
- **Steps**:
  1. User selects "Amendments" entity type
  2. User enters amendment title
  3. User enters amendment subtitle
  4. User adds initial document content
  5. User adds hashtags
  6. User sets visibility
  7. User clicks "Create Amendment"
- **Expected Result**: Amendment is created with document structure

### 8. Guided Mode - Create Todo

- **Scenario**: User creates a todo task using guided mode
- **Steps**:
  1. User selects "Todos" entity type
  2. User enters todo title
  3. User enters description
  4. User sets priority (low, medium, high, urgent)
  5. User sets due date
  6. User assigns to users (optional)
  7. User adds tags
  8. User clicks "Create Todo"
- **Expected Result**: Todo is created and visible in todos page

### 9. Form Mode - Create Group

- **Scenario**: User creates a group using traditional form mode
- **Steps**:
  1. User switches to form mode
  2. User clicks "Groups" tab
  3. All group fields visible in one form
  4. User fills in name, description, visibility
  5. User adds hashtags
  6. User clicks "Create Group" button
- **Expected Result**: Group is created same as guided mode

### 10. Form Mode - Create Event

- **Scenario**: User creates event in form mode
- **Steps**:
  1. User is in form mode
  2. User clicks "Events" tab
  3. User fills all event fields simultaneously
  4. User uploads event image
  5. User clicks "Create Event"
- **Expected Result**: Event is created with all details

### 11. Create Agenda Item

- **Scenario**: User creates an agenda item for an event
- **Steps**:
  1. User selects "Agenda Items" entity type
  2. User enters agenda item title
  3. User selects associated event
  4. User sets item type (election, vote, speech, etc.)
  5. User sets order/position
  6. User clicks "Create Agenda Item"
- **Expected Result**: Agenda item is created and linked to event

### 12. Create Change Request

- **Scenario**: User creates a change request for an amendment
- **Steps**:
  1. User selects "Change Requests" entity type
  2. User enters change request title
  3. User describes proposed change
  4. User selects target amendment
  5. User provides justification
  6. User clicks "Create Change Request"
- **Expected Result**: Change request is created and voting begins

### 13. Create Election Candidate

- **Scenario**: User creates an election candidate
- **Steps**:
  1. User selects "Election Candidates" entity type
  2. User enters candidate name
  3. User selects associated election/agenda item
  4. User adds candidate statement
  5. User uploads candidate photo (optional)
  6. User clicks "Create Candidate"
- **Expected Result**: Candidate is added to election

### 14. Create Position

- **Scenario**: User creates an elected position within a group
- **Steps**:
  1. User selects "Positions" entity type
  2. User enters position name (e.g., "President", "Treasurer")
  3. User selects associated group
  4. User defines term length
  5. User sets responsibilities
  6. User clicks "Create Position"
- **Expected Result**: Position is created in group structure

### 15. Validation - Required Fields

- **Scenario**: System validates required fields before creation
- **Steps**:
  1. User attempts to create entity without required fields
  2. Error messages display for missing fields
  3. User cannot proceed without filling required fields
  4. User fills in required fields
  5. Validation passes
- **Expected Result**: Proper validation prevents incomplete submissions

### 16. Hashtag Management

- **Scenario**: User adds and manages hashtags during creation
- **Steps**:
  1. User creates entity with hashtag field
  2. User types hashtag with # symbol
  3. Hashtag appears as chip/badge
  4. User adds multiple hashtags
  5. User removes hashtag by clicking X
  6. Entity created with selected hashtags
- **Expected Result**: Hashtags are properly added and stored

### 17. Image Upload

- **Scenario**: User uploads images for entities that support them
- **Steps**:
  1. User creates event/blog/group
  2. User clicks image upload area
  3. File picker opens
  4. User selects image file
  5. Image preview displays
  6. User can replace or remove image
  7. Entity created with image
- **Expected Result**: Images are uploaded and associated with entity

### 18. Date and Time Picker

- **Scenario**: User selects date/time for events and todos
- **Steps**:
  1. User creates event or todo
  2. User clicks date field
  3. Calendar picker opens
  4. User selects date
  5. User clicks time field
  6. Time picker opens
  7. User selects time
  8. Date and time are set correctly
- **Expected Result**: Date/time selection works accurately

### 19. Rich Text Editor

- **Scenario**: User formats content with rich text editor
- **Steps**:
  1. User creates blog or amendment
  2. Content field has rich text editor
  3. User applies bold, italic, lists
  4. User adds headings
  5. User inserts links
  6. Formatting is preserved
- **Expected Result**: Rich text formatting works properly

### 20. Associate Entity with Group

- **Scenario**: User creates entity linked to a group
- **Steps**:
  1. User creates event/amendment
  2. User sees group selection dropdown
  3. User selects group from their memberships
  4. Entity is linked to group
  5. Entity appears in group timeline
- **Expected Result**: Entity-group association works correctly

### 21. Privacy Settings

- **Scenario**: User sets privacy/visibility for new entity
- **Steps**:
  1. User creates public-compatible entity
  2. User toggles privacy switch
  3. Public/private status changes
  4. User confirms selection
  5. Entity created with correct visibility
- **Expected Result**: Privacy settings are properly applied

### 22. Draft Auto-Save

- **Scenario**: System auto-saves draft as user types
- **Steps**:
  1. User starts creating entity
  2. User fills some fields
  3. Auto-save indicator appears
  4. User navigates away
  5. User returns to create page
  6. Draft is restored
- **Expected Result**: Drafts are preserved between sessions

### 23. Cancel Creation

- **Scenario**: User cancels entity creation
- **Steps**:
  1. User fills in some fields
  2. User clicks cancel/back button
  3. Confirmation dialog appears
  4. User confirms cancellation
  5. Form is cleared
  6. User returned to previous page
- **Expected Result**: Cancellation works with confirmation

### 24. Success Redirect

- **Scenario**: User redirected after successful creation
- **Steps**:
  1. User completes entity creation
  2. Success toast notification appears
  3. User redirected to entity detail page
  4. Created entity displays correctly
- **Expected Result**: Proper redirect and feedback after creation

### 25. Error Handling

- **Scenario**: System handles creation errors gracefully
- **Steps**:
  1. User submits entity creation
  2. Network error occurs
  3. Error message displays
  4. User data is preserved
  5. User can retry submission
- **Expected Result**: Errors are handled without data loss

### 26. Create Quick Todo from Anywhere

- **Scenario**: User quickly creates todo from navbar
- **Steps**:
  1. User clicks quick create button in navbar
  2. Todo quick create form appears
  3. User enters title and priority
  4. User clicks save
  5. Todo created without full form
- **Expected Result**: Quick create functionality works

### 27. Carousel Navigation

- **Scenario**: User navigates through guided mode carousel
- **Steps**:
  1. User in guided mode
  2. User clicks next arrow
  3. Carousel advances to next field
  4. User clicks previous arrow
  5. Carousel goes back
  6. User can jump to any step
- **Expected Result**: Carousel navigation is smooth and intuitive

### 28. Field Persistence in Guided Mode

- **Scenario**: Field values persist when navigating carousel
- **Steps**:
  1. User fills in field 1
  2. User advances to field 2
  3. User returns to field 1
  4. Previously entered value is still there
  5. User can edit previous values
- **Expected Result**: Data persists across carousel steps

### 29. Loading States

- **Scenario**: UI shows loading states during creation
- **Steps**:
  1. User submits entity creation
  2. Create button shows loading spinner
  3. Button is disabled during processing
  4. Loading completes
  5. Success or error state displays
- **Expected Result**: Loading states provide user feedback

### 30. Create Multiple Entities in Session

- **Scenario**: User creates multiple entities without page reload
- **Steps**:
  1. User creates first entity
  2. Success message appears
  3. Form resets to initial state
  4. User creates second entity of different type
  5. Both entities created successfully
- **Expected Result**: Multiple creations work in one session

## Test Coverage Summary

### Unit Tests (Vitest)

- Form validation logic
- Hashtag input component
- Image upload component
- Date/time picker component
- Rich text editor component
- Auto-save functionality

### E2E Tests (Playwright)

- Full creation flows for each entity type
- Mode switching (guided/form)
- Validation and error handling
- Image upload and file handling
- Association with groups/events
- Privacy settings

## Edge Cases Covered

1. Very long entity names/descriptions
2. Special characters in text fields
3. Invalid date ranges
4. Duplicate entity names
5. Network failures during creation
6. Browser refresh during creation
7. Missing optional vs required fields
8. Invalid image formats/sizes
9. Concurrent entity creation
10. Browser back button during creation
