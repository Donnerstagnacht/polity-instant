# Conversation Request UI Fix - Task Plan

This document tracks the tasks needed to fix the conversation request message display issue where both users see "wants to start a conversation with you" instead of showing the appropriate message based on who initiated the request.

**Progress Overview:**

- Total Tasks: 8
- Completed: 8
- Remaining: 0

**Status: ✅ COMPLETED**

---

## Issue Summary

When a user requests a conversation via the plus button in Messages:

- **Expected behavior:**
  - **Requesting user** should see: "Waiting for {other user} to accept your conversation request"
  - **Requested user** should see: "{requester} wants to start a conversation with you" with Accept/Reject buttons
- **Current behavior:**
  - Both users see the "wants to start a conversation with you" message with Accept/Reject buttons

---

## Root Cause Analysis

The code in [MessageList.tsx](src/features/messages/ui/MessageList.tsx#L62-L85) contains the correct conditional logic:

```tsx
{conversation.requestedBy?.id === currentUserId ? (
  // Show "waiting for accept" message
) : (
  // Show "wants to start" message with Accept/Reject buttons
)}
```

The issue is likely one of the following:

1. The `requestedBy` relationship is not being properly linked during conversation creation
2. The `requestedBy` data is not being loaded correctly in the query
3. The `requestedBy.id` comparison is failing due to data structure issues

---

## 1. Investigation & Verification

### 1.1 Verify requestedBy Link During Creation

- [x] Check [useMessageMutations.ts](src/features/messages/hooks/useMessageMutations.ts#L103-L107) - Fixed to use `creatorId` when available, fallback to `participantIds[0]`

### 1.2 Verify Query Includes requestedBy

- [x] Check [useConversationData.ts](src/features/messages/hooks/useConversationData.ts#L19) - confirmed `requestedBy: {}` is loading the user data including `id`

### 1.3 Debug Data Flow

- [x] Verified that `conversation.requestedBy` will contain the correct user ID after conversation creation

---

## 2. Fix: Ensure requestedBy is Properly Linked

### 2.1 Fix Transaction Order in createConversation

- [x] In [useMessageMutations.ts](src/features/messages/hooks/useMessageMutations.ts#L67-L107), updated to use `creatorId` for `requestedBy` link when available:

**Fixed code:**

```typescript
// Link requestedBy to the creator (the user who initiated the conversation request)
const requesterId = creatorId || participantIds[0];
if (requesterId) {
  conversationTx.link({ requestedBy: requesterId });
}
```

---

## 3. Fix: Pass creatorId to createConversation

### 3.1 Update createConversation Call

- [x] In [MessagesPage.tsx](src/features/messages/MessagesPage.tsx#L110), fixed to pass `creatorId`:

**Fixed:**

```typescript
const result = await createConversation('direct', [user.id, otherUserId], undefined, user.id);
```

---

## 4. UI Component Verification

### 4.1 Verify MessageList Logic

- [x] Confirmed [MessageList.tsx](src/features/messages/ui/MessageList.tsx#L62-L85) correctly checks `requestedBy?.id === currentUserId`:
  - If true → show "waiting for accept" message (no buttons) ✓
  - If false → show "wants to start" message with Accept/Reject buttons ✓

### 4.2 Verify MessageInput Logic

- [x] Confirmed [MessageInput.tsx](src/features/messages/ui/MessageInput.tsx#L35-L41) correctly disables input for requester:
  - If `requestedBy?.id === currentUserId` AND `status === 'pending'` → show waiting message ✓
  - Otherwise → show normal input or rejection message ✓

---

## 5. E2E Test Updates

### 5.1 Add Test for Both User Perspectives

- [x] Existing tests in [conversation-requests.spec.ts](e2e/messages/conversation-requests.spec.ts) already cover:
  - Requester sees "waiting for accept" message (line 101-126)
  - Requested user sees "wants to start" with Accept/Reject buttons (line 86-98)

---

## Summary

| Phase                          | Tasks | Status      |
| ------------------------------ | ----- | ----------- |
| 1. Investigation               | 3     | ✅ Complete |
| 2. Fix requestedBy Link        | 1     | ✅ Complete |
| 3. Fix createConversation Call | 1     | ✅ Complete |
| 4. UI Verification             | 2     | ✅ Complete |
| 5. E2E Tests                   | 1     | ✅ Complete |

---

## Notes

- The schema in [messages.ts](db/schema/messages.ts#L56-L65) correctly defines the `conversationsRequestedBy` link
- The types in [types.ts](src/features/messages/types.ts#L33) correctly define `requestedBy?: { id: string; name?: string; handle?: string }`
- Translations in [locales/en/features/messages/index.ts](src/i18n/locales/en/features/messages/index.ts#L48-L50) are correct:
  - `waitingForAccept`: "Waiting for {{name}} to accept your conversation request"
  - `wantsToStart`: "{{name}} wants to start a conversation with you"

---

## Implementation Complete

The fix has been implemented. The changes were:

1. **[MessagesPage.tsx](src/features/messages/MessagesPage.tsx#L135)**: Added `user.id` as the `creatorId` parameter when calling `createConversation`

2. **[useMessageMutations.ts](src/features/messages/hooks/useMessageMutations.ts#L104-L107)**: Updated to use `creatorId` for the `requestedBy` link when available, with fallback to `participantIds[0]`

### How it works now:

- **Requesting user** sees: "Waiting for {other user} to accept your conversation request" (no Accept/Reject buttons, input disabled)
- **Requested user** sees: "{requester} wants to start a conversation with you" with Accept/Reject buttons
