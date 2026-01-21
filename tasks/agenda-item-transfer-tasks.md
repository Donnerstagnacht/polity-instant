# Agenda Item Transfer Feature - Implementation Tasks

This document tracks all tasks needed to implement the agenda item transfer feature, which allows users with "manage agenda" rights to move agenda items between events.

**Feature Overview:**

- Users with "manage agenda" (agendaItems.manage) action right can transfer agenda items
- Type-ahead search to select destination event (where user also has "manage agenda" rights)
- Notifications sent to participants of both source and destination events
- Move button only visible to users with required permissions

**Progress Overview:**

- Total Tasks: 22
- Completed: 17
- Remaining: 5

---

## 1. Backend - Notification System

### 1.1 Add New Notification Type

- [x] Add `agenda_item_transferred` to `NotificationType` in `src/utils/notification-helpers.ts`
  - Add to the "Event notifications" section after `event_agenda_item_deleted`

### 1.2 Create Notification Helper Function

- [x] Create `notifyAgendaItemTransferred` function in `src/utils/notification-helpers.ts`
  - Place after `notifyAgendaItemDeleted` function (around line 1518)
  - Accept params: `senderId`, `sourceEventId`, `sourceEventTitle`, `targetEventId`, `targetEventTitle`, `agendaItemTitle`
  - Send notifications to both source and target event participants
  - Return array of transactions for both notifications

---

## 2. Backend - Agenda Item Mutations Hook

### 2.1 Add Transfer Function to Hook

- [x] Create `handleTransfer` function in `src/features/events/hooks/useAgendaItemMutations.ts`
  - Accept params: `targetEventId`, `agendaItemTitle`, `sourceEventTitle`, `targetEventTitle`
  - Update agenda item's event link to new event
  - Call notification helper for both events
  - Return loading state

### 2.2 Export Transfer Function

- [x] Export `handleTransfer` and `transferLoading` from `useAgendaItemMutations` hook
  - Ensure proper TypeScript typing

---

## 3. UI - Transfer Dialog Component

### 3.1 Create Transfer Dialog Component

- [x] Create new file `src/features/events/ui/TransferAgendaItemDialog.tsx`
  - Accept props: `agendaItemId`, `agendaItemTitle`, `currentEventId`, `currentEventTitle`, `onTransferComplete`
  - Use `Dialog` component from shadcn/ui
  - Include "Move" button trigger (only rendered conditionally by parent)
  - Use `TypeAheadSelect` component for event selection

### 3.2 Implement Event Search Query

- [x] Query events where user has `agendaItems.manage` permission
  - Use InstantDB query to fetch events with user's participations
  - Filter events client-side based on user's role permissions
  - Exclude current event from results
  - Use `usePermissions` hook to check rights

### 3.3 Add Event Selection UI

- [x] Implement type-ahead search for destination event
  - Use `TypeAheadSelect` component from `src/components/ui/type-ahead-select.tsx`
  - Search by event name, description, location
  - Render event cards with `EventSelectCard` from `src/components/ui/entity-select-cards.tsx`
  - Show event date, location, and participant count

### 3.4 Add Transfer Confirmation

- [x] Show selected event details before transfer
  - Display source event → destination event
  - Show participant counts for both events
  - Add confirmation button with loading state
  - Show warning about notification sending

---

## 4. UI - Integrate Transfer Button

### 4.1 Add Move Button to AgendaCard

- [x] Update `src/components/shared/timeline/AgendaCard.tsx`
  - Add optional `onMoveClick` prop
  - Add optional `showMoveButton` prop
  - Render move button in card header next to action buttons
  - Use `ArrowRight` icon from lucide-react
  - Stop event propagation on button click

### 4.2 Update EventAgenda to Show Transfer Button

- [x] Update `src/features/events/ui/EventAgenda.tsx`
  - Import and use `TransferAgendaItemDialog`
  - Check user permissions using `usePermissions` hook
  - Pass `showMoveButton` prop to `AgendaCard` based on permissions
  - Only show for users with `agendaItems.manage` action right
  - Handle transfer complete callback to refresh data

### 4.3 Add Transfer Button to Agenda Item Detail

- [x] Update `src/features/events/ui/EventAgendaItemDetail.tsx`
  - Add "Move to Another Event" button in actions section
  - Use permission check: `can('manage', 'agendaItems')`
  - Show button next to existing edit/delete buttons
  - Include `TransferAgendaItemDialog` component

---

## 5. Internationalization (i18n)

### 5.1 Add English Translations

- [x] Update `src/i18n/locales/en/features/events/index.ts`
  - Add translations to `agenda` section:
    - `transferItem`: "Transfer Agenda Item"
    - `moveToEvent`: "Move to Another Event"
    - `selectDestinationEvent`: "Select Destination Event"
    - `searchEvents`: "Search for an event..."
    - `transferConfirm`: "Transfer"
    - `transferring`: "Transferring..."
    - `transferSuccess`: "Agenda item transferred successfully"
    - `transferError`: "Failed to transfer agenda item"
    - `currentEvent`: "Current Event"
    - `destinationEvent`: "Destination Event"
    - `transferWarning`: "All participants of both events will be notified about this transfer."
    - `noEventsWithPermission`: "No events found where you have manage agenda rights"

### 5.2 Add German Translations

- [x] Update `src/i18n/locales/de/features/events/index.ts`
  - Add German translations for all keys above:
    - `transferItem`: "Tagesordnungspunkt übertragen"
    - `moveToEvent`: "Zu einer anderen Veranstaltung verschieben"
    - `selectDestinationEvent`: "Zielveranstaltung auswählen"
    - `searchEvents`: "Nach einer Veranstaltung suchen..."
    - `transferConfirm`: "Übertragen"
    - `transferring`: "Übertrage..."
    - `transferSuccess`: "Tagesordnungspunkt erfolgreich übertragen"
    - `transferError`: "Übertragung des Tagesordnungspunkts fehlgeschlagen"
    - `currentEvent`: "Aktuelle Veranstaltung"
    - `destinationEvent`: "Zielveranstaltung"
    - `transferWarning`: "Alle Teilnehmer beider Veranstaltungen werden über diese Übertragung benachrichtigt."
    - `noEventsWithPermission`: "Keine Veranstaltungen gefunden, in denen Sie Agenda-Verwaltungsrechte haben"

---

## 6. Testing & Validation

### 6.1 Permission Testing

- [ ] Test transfer button visibility
  - Verify button only shows for users with `agendaItems.manage` permission
  - Test with different roles (Organizer, Participant)
  - Verify button hidden for users without permission

### 6.2 Transfer Functionality Testing

- [ ] Test agenda item transfer
  - Create test agenda item in Event A
  - Transfer to Event B where user has permissions
  - Verify agenda item appears in Event B
  - Verify agenda item removed from Event A
  - Check agenda item order is preserved

### 6.3 Notification Testing

- [ ] Test notification delivery
  - Verify source event participants receive notification
  - Verify destination event participants receive notification
  - Check notification message content is correct
  - Verify action URLs point to correct events

### 6.4 Edge Cases Testing

- [ ] Test edge cases
  - Transfer when user is only participant in one event
  - Transfer with no other participants in events
  - Transfer when target event has many agenda items
  - Transfer while source event is in progress
  - Cancel transfer dialog without completing
  - Search with no matching events

---

## 7. Code Quality & Documentation

### 7.1 TypeScript Types

- [x] Add proper TypeScript types for all new functions
  - Transfer function parameters
  - Notification helper parameters
  - Dialog component props
  - Event search results

### 7.2 Error Handling

- [x] Add comprehensive error handling
  - Transfer database transaction failures
  - Notification sending failures
  - Permission check failures
  - Network errors during event search
  - Show user-friendly error messages via toast

### 7.3 Loading States

- [x] Implement proper loading states
  - Transfer in progress indicator
  - Event search loading spinner
  - Disable buttons during transfer
  - Show success toast on completion

---

## 8. Seed Scripts

### 8.1 Update Notification Seeder

- [x] Add `event_agenda_item_transferred` to notification types in `scripts/seeders/notifications.seeder.ts`

### 8.2 Update RBAC Constants

- [x] Add `agendaItems.manage` permission to `DEFAULT_EVENT_ROLES` for Organizer role in `db/rbac/constants.ts`
  - Ensures event organizers have agenda management rights by default

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|✅ Completed |
| 5. Internationalization | 2 | ✅ Completed |
| 6. Testing | 4 | Not Started |
| 7. Code Quality | 3 | ✅ Completed |
| 8. Seed Scripts | 2 | ✅ Completed |

**Total**: 18 tasks completed, 4 remaining (testing only
| 7. Code Quality | 3 | ✅ Completed |
| 8. Seed Scripts | 1 | ✅ Completed |

**Total**: 18 tasks completed, 5 remaining (testing + 1 UI task)

---

## Implementation Notes

### Key Files to Modify

- `src/utils/notification-helpers.ts` - Add notification type and helper
- `src/features/events/hooks/useAgendaItemMutations.ts` - Add transfer function
- `src/features/events/ui/TransferAgendaItemDialog.tsx` - New component
- `src/components/shared/timeline/AgendaCard.tsx` - Add move button
- `src/features/events/ui/EventAgenda.tsx` - Integrate transfer dialog
- `src/features/events/ui/EventAgendaItemDetail.tsx` - Add transfer button
- `src/i18n/locales/en/features/events/index.ts` - English translations
- `src/i18n/locales/de/features/events/index.ts` - German translations

### Dependencies

- `@/components/ui/dialog` - Dialog component
- `@/components/ui/type-ahead-select` - Type-ahead search
- `@/components/ui/entity-select-cards` - Event display cards
- `db/rbac/usePermissions` - Permission checking
- `lucide-react` - Icons (ArrowRight, Search, etc.)

### RBAC Considerations

- Action right required: `agendaItems.manage`
- Permission scope: Event-level
- Check using `hasEventPermission` helper
- User must have permission in both source and destination events

### Notification Design

- **Type**: `agenda_item_transferred`
- **Recipients**: All participants of source event + all participants of destination event
- **Title**: "Agenda Item Moved"
- **Message**: "'{agendaItemTitle}' was moved from '{sourceEventTitle}' to '{targetEventTitle}'"
- **Action URL**: Link to destination event agenda

### UI/UX Considerations

- Use type-ahead search pattern consistent with rest of app
- Show gradient event cards for selection
- Clear visual indication of source → destination
- Confirmation step before transfer
- Success toast notification
- Automatic redirect or refresh after transfer

---

## Assumptions

1. Agenda items can be moved between any events where user has `agendaItems.manage` permission
2. Moving an agenda item preserves all its properties (title, description, duration, etc.)
3. Related entities (elections, votes, speaker lists) move with the agenda item
4. Order in destination event is appended to end (highest order number)
5. User must have permission in BOTH source and destination events
6. Notifications are sent asynchronously and won't block the transfer operation
