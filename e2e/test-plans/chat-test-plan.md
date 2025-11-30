# Chat/Messages Feature Test Plan

## Overview

Comprehensive test plan for the messaging system covering conversations, message sending/receiving, search, unread indicators, and real-time updates.

## Test Scenarios

### 1. Load Messages Page

- **Scenario**: User accesses the messages page
- **Steps**:
  1. User navigates to /messages
  2. Page loads with conversation list on left
  3. Message area on right (empty if no conversation selected)
  4. Search bar visible at top
- **Expected Result**: Messages page loads with proper layout

### 2. View Conversations List

- **Scenario**: User sees all their conversations
- **Steps**:
  1. User is on messages page
  2. Left sidebar shows all conversations
  3. Conversations sorted by most recent message
  4. Each conversation shows:
     - Other participant's avatar and name
     - Last message preview
     - Timestamp
     - Unread badge (if applicable)
- **Expected Result**: Conversations list displays correctly sorted

### 3. Select Conversation

- **Scenario**: User selects a conversation to view messages
- **Steps**:
  1. User clicks on conversation in list
  2. Right panel loads message history
  3. Messages sorted oldest to newest (like WhatsApp)
  4. User's messages aligned right
  5. Other participant's messages aligned left
  6. Conversation is highlighted in sidebar
- **Expected Result**: Conversation opens with full message history

### 4. Send Text Message

- **Scenario**: User sends a text message
- **Steps**:
  1. User has conversation selected
  2. User types message in input field at bottom
  3. User clicks send button or presses Enter
  4. Message appears in conversation immediately
  5. Message marked as sent
  6. Input field clears
  7. Conversation moves to top of list
- **Expected Result**: Message is sent and displayed correctly

### 5. Receive Message

- **Scenario**: User receives a new message
- **Steps**:
  1. Other user sends message
  2. Message appears in conversation in real-time
  3. If conversation not selected, unread badge appears
  4. Conversation moves to top of list
  5. Browser notification appears (if enabled)
- **Expected Result**: Incoming messages update immediately

### 6. Mark Messages as Read

- **Scenario**: Messages are marked read when conversation viewed
- **Steps**:
  1. User has unread messages in conversation
  2. Unread badge visible on conversation
  3. User selects conversation
  4. Messages display
  5. Unread badge disappears
  6. Messages marked as read in database
- **Expected Result**: Read status updates automatically

### 7. Search Conversations

- **Scenario**: User searches through conversations
- **Steps**:
  1. User types in search bar
  2. Conversations filter by participant name
  3. Conversations also filter by message content
  4. Results update in real-time as user types
  5. User clears search
  6. All conversations reappear
- **Expected Result**: Search filters conversations accurately

### 8. Start New Conversation

- **Scenario**: User initiates new conversation
- **Steps**:
  1. User clicks "New Message" button
  2. Dialog opens with user search
  3. User searches for recipient
  4. User selects recipient
  5. New conversation created
  6. User can immediately send first message
- **Expected Result**: New conversation is created successfully

### 9. Auto-Scroll to Latest Message

- **Scenario**: Message area scrolls to show newest messages
- **Steps**:
  1. User opens conversation with many messages
  2. View automatically scrolls to bottom (latest message)
  3. User receives new message
  4. View auto-scrolls to show new message
- **Expected Result**: Auto-scroll keeps latest messages visible

### 10. Manual Scroll Through History

- **Scenario**: User scrolls up to view old messages
- **Steps**:
  1. User has long conversation selected
  2. User scrolls up to view older messages
  3. Older messages load (if paginated)
  4. User can scroll back down
  5. Auto-scroll doesn't interfere when user is scrolling
- **Expected Result**: Manual scrolling works smoothly

### 11. Message Timestamps

- **Scenario**: Messages display relative timestamps
- **Steps**:
  1. User views conversation
  2. Recent messages show "Xm ago" or "Xh ago"
  3. Messages from today show time
  4. Older messages show date
  5. Timestamps update in real-time
- **Expected Result**: Timestamps are accurate and readable

### 12. Participant Avatar and Name

- **Scenario**: Conversations show participant information
- **Steps**:
  1. Each conversation shows other participant's avatar
  2. Name or handle displays
  3. Default avatar shown if no custom avatar
  4. Clicking participant name opens their profile
- **Expected Result**: Participant info displays correctly

### 13. Unread Message Count

- **Scenario**: Unread messages show count badge
- **Steps**:
  1. User has unread messages in conversation
  2. Red badge shows count (e.g., "3")
  3. Badge appears on conversation item
  4. Also appears on messages nav icon
  5. Count updates when messages read
- **Expected Result**: Unread counts are accurate

### 14. Empty State - No Conversations

- **Scenario**: User with no conversations sees empty state
- **Steps**:
  1. New user opens messages page
  2. Empty state message displays
  3. Prompt to start new conversation
  4. "New Message" button visible
- **Expected Result**: Helpful empty state guides user

### 15. Empty State - No Selected Conversation

- **Scenario**: Right panel shows empty state when nothing selected
- **Steps**:
  1. User on messages page
  2. No conversation selected
  3. Right panel shows placeholder
  4. Message like "Select a conversation to start messaging"
- **Expected Result**: Clear indication to select conversation

### 16. Mobile Responsive Layout

- **Scenario**: Messages page works on mobile devices
- **Steps**:
  1. User opens messages on mobile
  2. Conversation list shown first
  3. User selects conversation
  4. Message view takes full screen
  5. Back arrow returns to conversation list
- **Expected Result**: Mobile layout is user-friendly

### 17. Long Message Handling

- **Scenario**: Long messages display properly
- **Steps**:
  1. User sends very long message
  2. Message wraps to multiple lines
  3. Message bubble expands appropriately
  4. Conversation remains readable
- **Expected Result**: Long messages are handled gracefully

### 18. Special Characters in Messages

- **Scenario**: Messages with special characters, emojis, links
- **Steps**:
  1. User sends message with emojis
  2. Emojis display correctly
  3. User sends message with URLs
  4. URLs are clickable (if link detection enabled)
  5. Special characters don't break layout
- **Expected Result**: All character types handled properly

### 19. Delete Conversation

- **Scenario**: User deletes a conversation
- **Steps**:
  1. User right-clicks or long-presses conversation
  2. Delete option appears
  3. User clicks delete
  4. Confirmation dialog appears
  5. User confirms
  6. Conversation removed from list
- **Expected Result**: Conversation deletion works with confirmation

### 20. Archive Conversation

- **Scenario**: User archives old conversation
- **Steps**:
  1. User selects conversation
  2. User clicks archive button
  3. Conversation moves to archived section
  4. Archived conversations accessible via filter
  5. User can unarchive conversation
- **Expected Result**: Archive functionality works bidirectionally

### 21. Mute Conversation

- **Scenario**: User mutes notifications for conversation
- **Steps**:
  1. User opens conversation settings
  2. User toggles mute switch
  3. New messages don't trigger notifications
  4. Visual indicator shows conversation is muted
  5. User can unmute conversation
- **Expected Result**: Mute prevents notifications but keeps messages

### 22. Message Sending Loading State

- **Scenario**: UI shows loading state when sending message
- **Steps**:
  1. User types and sends message
  2. Message appears with sending indicator
  3. Once sent, indicator changes to "sent"
  4. If failed, error indicator appears
  5. User can retry failed message
- **Expected Result**: Clear feedback on message delivery status

### 23. Keyboard Shortcuts

- **Scenario**: User uses keyboard shortcuts in messages
- **Steps**:
  1. User presses Enter to send message
  2. Shift+Enter creates new line
  3. Escape key clears input
  4. Arrow keys navigate conversations
- **Expected Result**: Keyboard shortcuts improve efficiency

### 24. Multi-Line Message Composition

- **Scenario**: User composes message with multiple lines
- **Steps**:
  1. User types message
  2. User presses Shift+Enter
  3. Cursor moves to new line
  4. Input area expands
  5. User can continue typing
  6. Send button sends entire multi-line message
- **Expected Result**: Multi-line composition works smoothly

### 25. Copy Message Text

- **Scenario**: User copies text from message
- **Steps**:
  1. User selects message text
  2. User right-clicks or uses Ctrl+C
  3. Text is copied to clipboard
  4. User can paste elsewhere
- **Expected Result**: Message text is selectable and copyable

### 26. Conversation Last Message Update

- **Scenario**: Conversation preview shows latest message
- **Steps**:
  1. New message sent in conversation
  2. Conversation item shows new message preview
  3. Preview truncated if too long
  4. "You:" prefix if user sent message
  5. Updates in real-time
- **Expected Result**: Last message preview always current

### 27. Online Status Indicator

- **Scenario**: User sees if conversation partner is online
- **Steps**:
  1. User opens conversation
  2. Green dot shows if partner online
  3. Offline status shown otherwise
  4. "Last seen" timestamp (if available)
  5. Status updates in real-time
- **Expected Result**: Presence indicators work accurately

### 28. Message Reactions

- **Scenario**: User reacts to messages with emoji (future feature)
- **Steps**:
  1. User hovers over message
  2. Reaction button appears
  3. User selects emoji reaction
  4. Reaction appears on message
  5. User can remove reaction
- **Expected Result**: Message reactions enhance communication

### 29. Typing Indicator

- **Scenario**: User sees when other person is typing
- **Steps**:
  1. Other user starts typing
  2. "..." typing indicator appears
  3. Indicator shows in conversation
  4. Stops when typing stops
  5. Clears when message sent
- **Expected Result**: Typing indicator provides real-time feedback

### 30. Message Search Within Conversation

- **Scenario**: User searches within specific conversation
- **Steps**:
  1. User opens conversation settings
  2. User enters search query
  3. Messages containing query are highlighted
  4. User can jump between matches
  5. Search cleared when user exits
- **Expected Result**: In-conversation search finds messages

## Test Coverage Summary

### Unit Tests (Vitest)

- Message sorting logic
- Unread count calculation
- Search filtering logic
- Timestamp formatting
- Message validation

### E2E Tests (Playwright)

- Send and receive messages
- Conversation selection
- Search functionality
- Real-time updates
- Mobile responsive behavior

## Edge Cases Covered

1. Very long conversation histories
2. Rapid message sending
3. Network disconnection/reconnection
4. Concurrent users in same conversation
5. Empty messages
6. Messages with only whitespace
7. Unicode and emoji handling
8. Very long participant names
9. Deleted participant accounts
10. Browser refresh during message send
