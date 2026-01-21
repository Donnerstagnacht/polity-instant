# Event Voting System & Agenda Management - Implementation Tasks

This document tracks all tasks needed to implement comprehensive event voting, agenda management, supporter confirmation, and event cancellation features.

**Progress Overview:**

- Total Tasks: 115
- Completed: 0
- Remaining: 115

---

## Feature 1: Event Agenda Item Activation

Allows users with "manage agenda" action rights to navigate through the agenda, activating items sequentially. Activated items are displayed to all participants with real-time notifications.

---

### 1.1 Schema Updates for Agenda Item Activation

- [ ] Add `currentAgendaItemId` field to `events` entity in `db/schema/events.ts`
  - Type: `i.string().indexed().optional()` - ID of the currently active agenda item
- [ ] Add `activatedAt` field to `agendaItems` entity in `db/schema/agendas.ts`
  - Type: `i.date().indexed().optional()` - Timestamp when item was activated
- [ ] Add `completedAt` field to `agendaItems` entity in `db/schema/agendas.ts`
  - Type: `i.date().indexed().optional()` - Timestamp when item was completed

### 1.2 Notification Types for Agenda Activation

- [ ] Add `agenda_item_activated` to `NotificationType` in `src/utils/notification-helpers.ts`

  - Add to "Event notifications" section

- [ ] Create `notifyAgendaItemActivated` function in `src/utils/notification-helpers.ts`
  - Params: `senderId`, `eventId`, `eventTitle`, `agendaItemId`, `agendaItemTitle`, `agendaItemType`
  - Send notification to all event participants
  - Include action URL to event stream page

### 1.3 Agenda Navigation Hook

- [ ] Create `useAgendaNavigation` hook in `src/features/events/hooks/useAgendaNavigation.ts`

  - Provide `activateAgendaItem(itemId)` function
  - Provide `moveToNextItem()` function
  - Provide `moveToPreviousItem()` function
  - Provide `completeCurrentItem()` function
  - Track current active item index
  - Validate user has "agendaItems.manage" permission

- [ ] Add transaction logic for activating agenda item

  - Update event's `currentAgendaItemId`
  - Set agenda item status to `in-progress`
  - Set `activatedAt` timestamp
  - Send notifications to participants

- [ ] Add transaction logic for completing agenda item
  - Set `completedAt` timestamp
  - Update status to `completed`
  - Auto-advance to next item if configured

### 1.4 Agenda Navigation UI Components

- [ ] Create `AgendaNavigationControls` component in `src/features/events/ui/AgendaNavigationControls.tsx`

  - Previous/Next buttons
  - Current item indicator
  - Complete current item button
  - Progress indicator (X of Y items)
  - Only visible to users with "agendaItems.manage" permission

- [ ] Update `EventStream.tsx` to show current agenda item prominently

  - Add real-time subscription to `currentAgendaItemId` changes
  - Show notification toast when agenda item changes
  - Auto-scroll to active content

- [ ] Update `EventAgenda.tsx` to highlight active agenda item
  - Visual indicator for active item (pulsing border, icon)
  - Show completion status for each item

### 1.5 Translations for Agenda Activation

- [ ] Add German translations in `src/i18n/locales/de/features/events/index.ts`

  - `agenda.activate`: 'Tagesordnungspunkt aktivieren'
  - `agenda.deactivate`: 'Tagesordnungspunkt deaktivieren'
  - `agenda.next`: 'Nächster Punkt'
  - `agenda.previous`: 'Vorheriger Punkt'
  - `agenda.complete`: 'Punkt abschließen'
  - `agenda.currentItem`: 'Aktueller Punkt'
  - `agenda.itemActivated`: 'Tagesordnungspunkt wurde aktiviert'

- [ ] Add English translations in `src/i18n/locales/en/features/events/index.ts`
  - Mirror German translations

---

## Feature 2: Event Voting System

Implements structured voting for amendment votes and elections at events, including introduction phase, voting phase, and result calculation.

---

### 2.1 RBAC Updates for Voting Rights

- [ ] Add `active_voting` action type to `ActionType` in `db/rbac/types.ts`

  - For event participants who can vote

- [ ] Update `DEFAULT_EVENT_ROLES` in `db/rbac/constants.ts`

  - Add "Voter" role with `active_voting` permission
  - Add `active_voting` to "Participant" role by default

- [ ] Add to `ACTION_RIGHTS` list in `db/rbac/constants.ts`
  - `{ resource: 'events', action: 'active_voting', label: 'Active Voting Rights' }`

### 2.2 Schema Updates for Voting System

- [ ] Add `eventVotingSessions` entity to `db/schema/events.ts`

  ```typescript
  eventVotingSessions: i.entity({
    createdAt: i.date().indexed(),
    updatedAt: i.date().indexed(),
    phase: i.string().indexed(), // 'introduction', 'voting', 'completed'
    votingType: i.string().indexed(), // 'amendment', 'election', 'change_request'
    startedAt: i.date().indexed().optional(),
    endedAt: i.date().indexed().optional(),
    timeLimit: i.number().optional(), // Time limit in seconds
    autoCloseOnAllVoted: i.boolean().optional(),
    autoCloseOnTimeout: i.boolean().optional(),
    majorityType: i.string().indexed(), // 'simple', 'absolute', 'two_thirds'
    result: i.string().indexed().optional(), // 'passed', 'rejected', 'tie'
    targetEntityType: i.string().indexed(), // 'amendment', 'change_request', 'election'
    targetEntityId: i.string().indexed(),
  });
  ```

- [ ] Add links for `eventVotingSessions`

  - `eventVotingSessionsAgendaItem` → links to agendaItem
  - `eventVotingSessionsEvent` → links to event
  - `eventVotingSessionsAmendment` → links to amendment (optional)
  - `eventVotingSessionsChangeRequest` → links to changeRequest (optional)
  - `eventVotingSessionsElection` → links to election (optional)

- [ ] Add `eventVotes` entity to `db/schema/events.ts`

  ```typescript
  eventVotes: i.entity({
    createdAt: i.date().indexed(),
    vote: i.string().indexed(), // 'accept', 'reject', 'abstain'
  });
  ```

- [ ] Add links for `eventVotes`
  - `eventVotesSession` → links to eventVotingSessions
  - `eventVotesVoter` → links to $users
  - `eventVotesCandidate` → links to electionCandidates (optional, for elections)

### 2.3 Voting Phase Management Hook

- [ ] Create `useEventVoting` hook in `src/features/events/hooks/useEventVoting.ts`

  - Query current voting session for agenda item
  - Provide `startIntroductionPhase(agendaItemId)` function
  - Provide `startVotingPhase(sessionId)` function
  - Provide `closeVoting(sessionId)` function
  - Track eligible voters (users with `active_voting` right)
  - Calculate if all eligible voters have voted
  - Handle timeout auto-close logic

- [ ] Create `useVotingTimer` hook in `src/features/events/hooks/useVotingTimer.ts`
  - Countdown timer for voting phase
  - Auto-trigger close when timer expires
  - Real-time sync across all participants

### 2.4 Vote Casting Logic

- [ ] Add `castEventVote` function to `useEventVoting` hook

  - Validate user has `active_voting` permission
  - Check user hasn't already voted in this session
  - Create eventVote record
  - Check if all voted and auto-close if configured

- [ ] Add vote result calculation utilities in `src/utils/voting-utils.ts`
  - `calculateMajority(votes, majorityType)` - Returns 'passed' | 'rejected' | 'tie'
  - `getEligibleVoterCount(eventId)` - Count users with active_voting right
  - `getVotePercentages(votes)` - Calculate accept/reject/abstain percentages

### 2.5 Amendment Voting Flow

- [ ] Handle amendment voting result in `useEventVoting`

  - If passed and target is higher event: forward amendment and create agenda item
  - If rejected: update agenda item forwardingStatus to 'rejected'
  - Update amendment workflowStatus based on result

- [ ] Create `handleAmendmentVoteResult` function in `src/features/amendments/utils/voting-results.ts`
  - Forward amendment to target group/event if approved
  - Create agenda item at target event
  - Update amendment path segments
  - Send notifications to relevant parties

### 2.6 Change Request Voting Flow

- [ ] Add change request ordering logic to voting

  - Order by `characterCount` (descending) by default
  - Allow manual override with `votingOrder` field
  - Vote on each change request sequentially

- [ ] Create `useChangeRequestVoting` hook in `src/features/amendments/hooks/useChangeRequestVoting.ts`

  - Get ordered list of pending change requests
  - Track current change request being voted on
  - Move to next after vote completes
  - After all CRs voted: trigger final amendment vote

- [ ] Add CR voting result handling
  - If accepted: merge change into document
  - If rejected: mark CR as rejected
  - Update document content with accepted changes

### 2.7 Election Voting Flow

- [ ] Create `useElectionVoting` hook in `src/features/events/hooks/useElectionVoting.ts`

  - Get election candidates
  - Handle vote casting for election
  - Calculate winner based on majorityType
  - Handle tie scenarios

- [ ] Add election result processing in `src/features/events/utils/election-results.ts`

  - `calculateElectionWinner(votes, candidates, majorityType)`
  - Handle multiple-choice elections
  - Determine winner or if revote needed

- [ ] Handle position assignment after election
  - Add winner to position as current holder
  - Create `positionHolderHistory` record
  - Schedule revote for position term end (see 2.8)

### 2.8 Revote Scheduling

- [ ] Add `scheduledRevoteDate` field to `positions` entity in `db/schema/groups.ts`

  - Type: `i.date().indexed().optional()`

- [ ] Create `schedulePositionRevote` function in `src/features/events/utils/revote-scheduling.ts`

  - Calculate revote date based on position term
  - Find or create event at that date
  - Create election agenda item for the event
  - Link election to position

- [ ] Add `scheduledElections` entity to track future elections
  ```typescript
  scheduledElections: i.entity({
    scheduledDate: i.date().indexed(),
    status: i.string().indexed(), // 'scheduled', 'event_created', 'completed', 'cancelled'
    createdAt: i.date().indexed(),
  });
  ```
  - Links: position, group, event (optional)

### 2.9 Voting UI Components

- [ ] Create `VotingSessionManager` component in `src/features/events/ui/VotingSessionManager.tsx`

  - Shows current voting session state
  - Controls for organizers (start/close phases)
  - Timer display
  - Vote count display (X of Y voted)

- [ ] Create `VotingPhaseIndicator` component in `src/features/events/ui/VotingPhaseIndicator.tsx`

  - Visual indicator for introduction/voting/completed phases
  - Timer countdown if active
  - Result display when completed

- [ ] Create `VoteButtons` component in `src/features/events/ui/VoteButtons.tsx`

  - Accept/Reject/Abstain buttons
  - Disabled when user has voted
  - Show user's current vote if cast
  - Loading state during vote submission

- [ ] Update `EventAgendaItemDetail.tsx` to integrate voting

  - Show voting session for amendment/election items
  - Display change request queue if applicable
  - Show results when voting completes

- [ ] Update `AmendmentVotingQueue.tsx` to use new voting system
  - Integrate with `useChangeRequestVoting` hook
  - Show sequential voting progress
  - Display current CR being voted

### 2.10 Voting Notifications

- [ ] Add notification types to `NotificationType`:

  - `voting_phase_started` - Voting has begun
  - `voting_phase_ending_soon` - X minutes remaining
  - `voting_completed` - Voting results available
  - `amendment_forwarded` - Amendment forwarded to next event
  - `election_result` - Election winner announced
  - `revote_scheduled` - Position revote scheduled

- [ ] Create notification helper functions for each type
  - Include relevant context (item title, event, results)
  - Link to appropriate pages

### 2.11 Voting Translations

- [ ] Add German translations for voting system

  ```typescript
  voting: {
    introduction: 'Einführungsphase',
    votingActive: 'Abstimmung läuft',
    completed: 'Abgeschlossen',
    startVoting: 'Abstimmung starten',
    closeVoting: 'Abstimmung beenden',
    accept: 'Zustimmen',
    reject: 'Ablehnen',
    abstain: 'Enthaltung',
    votesRemaining: '{count} Stimmen ausstehend',
    passed: 'Angenommen',
    rejected: 'Abgelehnt',
    tie: 'Stimmengleichheit',
    timeRemaining: '{time} verbleibend',
    allVoted: 'Alle haben abgestimmt',
    yourVote: 'Ihre Stimme',
    eligibleVoters: 'Stimmberechtigte',
  }
  ```

- [ ] Add English translations
  - Mirror German translations

---

## Feature 3: Supporter Confirmation for Amendment Changes

Groups that support an amendment must confirm support when change requests are accepted.

---

### 3.1 Schema Updates for Supporter Confirmation

- [ ] Add `supportConfirmations` entity to `db/schema/amendments.ts`

  ```typescript
  supportConfirmations: i.entity({
    status: i.string().indexed(), // 'pending', 'confirmed', 'declined'
    changeRequestId: i.string().indexed(),
    originalVersion: i.json(), // Snapshot of amendment at support time
    createdAt: i.date().indexed(),
    respondedAt: i.date().indexed().optional(),
  });
  ```

- [ ] Add links for `supportConfirmations`
  - `supportConfirmationsAmendment` → links to amendment
  - `supportConfirmationsGroup` → links to group (the supporting group)
  - `supportConfirmationsChangeRequest` → links to changeRequest that triggered confirmation
  - `supportConfirmationsAgendaItem` → links to agenda item created for confirmation

### 3.2 Trigger Confirmation on Change Request Acceptance

- [ ] Create `triggerSupporterConfirmation` function in `src/features/amendments/utils/supporter-confirmation.ts`
  - Called when a change request is accepted
  - For each supporting group:
    - Create `supportConfirmation` record with status 'pending'
    - Snapshot current amendment document version
    - Find group's next event
    - Create agenda item for confirmation vote
- [ ] Update change request acceptance logic
  - After merging change, call `triggerSupporterConfirmation`
  - Include reference to the change request

### 3.3 Confirmation Agenda Item Creation

- [ ] Create `createConfirmationAgendaItem` function

  - Title: "Support Confirmation: {Amendment Title}"
  - Type: 'support_confirmation'
  - Link to amendment, group, and supportConfirmation
  - Set appropriate order in group's next event agenda

- [ ] Add 'support_confirmation' to agenda item types
  - Update type validation in agendaItems schema if needed

### 3.4 Version Comparison UI

- [ ] Create `VersionComparisonView` component in `src/features/amendments/ui/VersionComparisonView.tsx`

  - Side-by-side or inline diff view
  - Additions highlighted in green
  - Deletions highlighted in red
  - Use existing diff utilities from `src/utils/diff-utils.ts`
  - Integrate with Plate.js editor for rich text display

- [ ] Create `SupportConfirmationPanel` component in `src/features/amendments/ui/SupportConfirmationPanel.tsx`
  - Display original version (at time of support)
  - Display current version (with changes)
  - Show `VersionComparisonView`
  - Confirm Support / Decline Support buttons

### 3.5 Confirmation Voting Logic

- [ ] Create `useSupportConfirmation` hook in `src/features/amendments/hooks/useSupportConfirmation.ts`

  - Query pending confirmations for a group
  - Provide `confirmSupport(confirmationId)` function
  - Provide `declineSupport(confirmationId)` function
  - Handle agenda item completion on response

- [ ] Handle confirmation results
  - If confirmed: Update supportConfirmation status to 'confirmed', maintain group in supporters
  - If declined:
    - Remove group from amendment's `groupSupporters`
    - Remove amendment from group's `supportedAmendments`
    - Update supportConfirmation status to 'declined'

### 3.6 Pending Support Display

- [ ] Update supporter display in `AmendmentWiki.tsx`

  - Show supporter status: 'active', 'pending', 'declined'
  - Use badges: green for active, yellow for pending
  - Filter declined groups from main list

- [ ] Create `SupporterStatusBadge` component
  - Props: `status: 'active' | 'pending' | 'declined'`
  - Corresponding colors and icons

### 3.7 Supporter Confirmation Notifications

- [ ] Add notification types:

  - `support_confirmation_required` - Sent to group when confirmation needed
  - `support_confirmed` - Sent to amendment owner when group confirms
  - `support_declined` - Sent to amendment owner when group declines

- [ ] Create notification helper functions

### 3.8 Supporter Confirmation Translations

- [ ] Add German translations

  ```typescript
  supportConfirmation: {
    required: 'Unterstützungsbestätigung erforderlich',
    confirm: 'Unterstützung bestätigen',
    decline: 'Unterstützung ablehnen',
    pending: 'Ausstehend',
    confirmed: 'Bestätigt',
    declined: 'Abgelehnt',
    originalVersion: 'Ursprüngliche Version',
    currentVersion: 'Aktuelle Version',
    changes: 'Änderungen',
    confirmMessage: 'Möchten Sie die Unterstützung für diesen Antrag bestätigen?',
    declineMessage: 'Möchten Sie die Unterstützung für diesen Antrag zurückziehen?',
  }
  ```

- [ ] Add English translations

---

## Feature 4: Cancel Events with Amendment Reassignment

Allows authorized users to cancel events, with automatic reassignment of amendment votes and elections to the next valid event.

---

### 4.1 RBAC Updates for Event Deletion

- [ ] Verify `delete` action exists for `events` resource in RBAC

  - Already exists in `db/perms/events.ts`

- [ ] Add `delete_event` to `ACTION_RIGHTS` if not present
  - `{ resource: 'events', action: 'delete', label: 'Delete/Cancel Event' }`

### 4.2 Schema Updates for Event Cancellation

- [ ] Add `status` field to `events` entity in `db/schema/events.ts`

  - Type: `i.string().indexed().optional()` - 'active', 'cancelled', 'completed'
  - Default: 'active'

- [ ] Add `cancellationReason` field to `events` entity

  - Type: `i.string().optional()`

- [ ] Add `cancelledAt` field to `events` entity

  - Type: `i.date().indexed().optional()`

- [ ] Add `cancelledBy` link to events
  - Links to the user who cancelled the event

### 4.3 Valid Reassignment Target Logic

- [ ] Create `findValidReassignmentEvent` function in `src/features/events/utils/event-reassignment.ts`

  - Params: `cancelledEventId`, `groupId`
  - Find group's events after cancelled event
  - Ensure target event is before any events to which amendments would be forwarded on approval
  - Return valid target event or null if none exists

- [ ] Create `validateEventCancellation` function
  - Check if valid reassignment target exists
  - Return validation result with reasons if invalid

### 4.4 Agenda Item Reassignment Logic

- [ ] Create `reassignAgendaItems` function in `src/features/events/utils/event-reassignment.ts`

  - For each agenda item in cancelled event:
    - If type is 'amendment' or 'election':
      - Move to target event
      - Update order to append at end
      - Preserve all linked data (votes, sessions)
    - If type is other: Delete or archive

- [ ] Handle cases where reassignment is not possible
  - Mark agenda items as 'orphaned'
  - Create notifications for collaborators

### 4.5 Amendment Path Recalculation

- [ ] Create `recalculateAmendmentPath` function in `src/features/amendments/utils/path-recalculation.ts`

  - Find all amendments affected by event cancellation
  - For each amendment:
    - If new valid path exists: Update path segments
    - If no valid path: Mark as 'path_invalid', notify collaborators

- [ ] Create notification for path recalculation required
  - Type: `amendment_path_recalculation_required`
  - Include link to amendment process page

### 4.6 Event Cancellation Hook

- [ ] Create `useCancelEvent` hook in `src/features/events/hooks/useCancelEvent.ts`
  - Provide `validateCancellation(eventId)` function
  - Provide `cancelEvent(eventId, reason)` function
  - Handle the full cancellation workflow:
    1. Validate reassignment target exists
    2. Reassign agenda items
    3. Recalculate affected amendment paths
    4. Update event status to 'cancelled'
    5. Send notifications

### 4.7 Event Cancellation UI

- [ ] Create `CancelEventDialog` component in `src/features/events/ui/CancelEventDialog.tsx`

  - Show validation results
  - Display affected agenda items
  - Show target reassignment event if valid
  - Reason input field
  - Confirmation with warning
  - Loading state during cancellation

- [ ] Update `EventEdit.tsx` to include cancel button

  - Only visible to users with 'delete' permission
  - Opens `CancelEventDialog`

- [ ] Create `CancelledEventBanner` component
  - Display on cancelled event pages
  - Show cancellation reason and date
  - Link to reassignment target event

### 4.8 Notification for Reassignment Failure

- [ ] Add notification types:

  - `event_cancelled` - Event has been cancelled
  - `agenda_items_reassigned` - Items moved to new event
  - `amendment_path_recalculation_required` - Path needs manual update

- [ ] Create helper functions for each notification

### 4.9 Event Cancellation Translations

- [ ] Add German translations

  ```typescript
  cancellation: {
    cancel: 'Veranstaltung absagen',
    reason: 'Grund der Absage',
    confirm: 'Absage bestätigen',
    warning: 'Diese Aktion kann nicht rückgängig gemacht werden.',
    affectedItems: 'Betroffene Tagesordnungspunkte',
    reassignmentTarget: 'Neue Veranstaltung für Tagesordnung',
    noValidTarget: 'Keine gültige Zielveranstaltung gefunden',
    collaboratorsNotified: 'Mitarbeiter werden benachrichtigt',
    cancelled: 'Abgesagt',
    cancelledBy: 'Abgesagt von',
    cancelledAt: 'Abgesagt am',
  }
  ```

- [ ] Add English translations

---

## Feature 5: Update Seed Scripts

Update seeding scripts to reflect all new schema changes and test data for the new features.

---

### 5.1 Update Schema Types

- [ ] Run InstantDB schema push after all schema changes
  - Verify all new entities and fields are created

### 5.2 Update Events Seeder

- [ ] Update `scripts/seeders/events.seeder.ts`
  - Add `status` field to events (default 'active')
  - Add some cancelled events for testing
  - Add `currentAgendaItemId` to some events

### 5.3 Update Agenda Seeder

- [ ] Update `scripts/seeders/agendaAndVoting.seeder.ts`
  - Add `activatedAt` and `completedAt` to some agenda items
  - Add 'support_confirmation' type agenda items
  - Create sample `eventVotingSessions`
  - Create sample `eventVotes`

### 5.4 Create Voting Session Seeder

- [ ] Add voting session creation to `agendaAndVoting.seeder.ts`
  - Create sessions in various phases (introduction, voting, completed)
  - Link to agenda items
  - Create sample votes for completed sessions

### 5.5 Update Amendments Seeder

- [ ] Update `scripts/seeders/amendments.seeder.ts`
  - Create `supportConfirmations` records
  - Add some in 'pending', 'confirmed', 'declined' states
  - Link to test groups and amendments

### 5.6 Create Support Confirmation Seeder

- [ ] Add support confirmation creation logic
  - Create confirmations for amendments with group supporters
  - Create corresponding agenda items
  - Snapshot document versions

### 5.7 Update RBAC Seeder

- [ ] Update `scripts/seeders/rbac.seeder.ts`
  - Add 'active_voting' action right to appropriate roles
  - Create 'Voter' role for events
  - Assign voting rights to test participants

### 5.8 Create Scheduled Elections Seeder

- [ ] Add `scheduledElections` seeding
  - Create scheduled revotes for some positions
  - Link to groups and future events

### 5.9 Test Data Consistency

- [ ] Verify all seeded data is consistent
  - Amendments have valid paths
  - Events have proper agenda ordering
  - Voting sessions reference valid entities
  - Support confirmations are properly linked

---

## Summary

| Phase                     | Tasks | Status      |
| ------------------------- | ----- | ----------- |
| 1. Agenda Item Activation | 15    | Not Started |
| 2. Event Voting System    | 37    | Not Started |
| 3. Supporter Confirmation | 22    | Not Started |
| 4. Cancel Events          | 24    | Not Started |
| 5. Update Seed Scripts    | 17    | Not Started |

---

## Implementation Order

1. **Schema Updates First** - Complete all schema changes across features before implementing logic
2. **RBAC Updates** - Add new action rights and roles
3. **Core Hooks** - Implement business logic hooks
4. **Notification Helpers** - Add notification functions
5. **UI Components** - Build user interface
6. **Translations** - Add i18n support
7. **Seed Scripts** - Update test data generation

---

## Notes

- All user-facing strings MUST use translations (no hardcoded text)
- Use existing patterns from `useAgendaItemMutations.ts` and `VoteControls.tsx`
- Reuse `TypeAheadSelect` and gradient card components for consistency
- Real-time updates via InstantDB subscriptions
- Follow existing notification patterns in `notification-helpers.ts`
- Test with E2E tests after implementation

---

## Dependencies

- Feature 2 depends on Feature 1 (agenda activation required for voting flow)
- Feature 3 depends on Feature 2 (voting system for confirmation)
- Feature 4 is independent but shares some utilities with Feature 2
- Feature 5 depends on all schema changes from Features 1-4
