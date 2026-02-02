# Agenda Item Vote & Election Enhancement Tasks

This document tracks all tasks needed to implement comprehensive agenda item voting and election features, including linking to amendments, vote indications, RBAC integration, and UI improvements.

**Progress Overview:**

- Total Tasks: 72
- Completed: 72
- Remaining: 0

**Status: ✅ COMPLETED**

---

## 1. Schema Updates

### 1.1 Link Elections to Amendments

- [x] Add `electionsAmendment` link in `db/schema/agendas.ts` to connect elections to amendments
- [x] Update `elections` entity to optionally link to an amendment (for election-related amendments)

### 1.2 Add Vote Indication Schema Support

- [x] Add `isIndication` boolean field to `electionVotes` entity in `db/schema/agendas.ts`
- [x] Add `isIndication` boolean field to `amendmentVoteEntries` entity in `db/schema/amendments.ts`
- [x] Add `indicatedAt` date field to track when indication was made (optional)

### 1.3 Add Passive Voting Action Type

- [x] Add `passive_voting` action type to `ActionType` in `db/rbac/types.ts`
- [x] Update `DEFAULT_EVENT_ROLES` in `db/rbac/constants.ts` to include `passive_voting` for Participant role
- [x] Add `passive_voting` to `ACTION_RIGHTS` array in `db/rbac/constants.ts`

---

## 2. Seeder Updates

### 2.1 Update `agendaAndVoting.seeder.ts`

- [x] Ensure all vote-type agenda items link to an amendment (use existing `amendmentId` linking)
- [x] Update election creation to optionally link to an amendment when relevant
- [x] Add `isIndication` flag to seeded `electionVotes` (set to true for votes before voting starts)
- [x] Add `isIndication` flag to seeded `amendmentVoteEntries` for pre-vote indications

### 2.2 Update `rbac.seeder.ts`

- [x] Add `active_voting` action right for Voter and Participant roles in events
- [x] Add `passive_voting` action right for Participant role in events

---

## 3. RBAC Integration

### 3.1 Permission Helpers

- [x] Add `hasActiveVotingRight` helper function to check if user can vote
- [x] Add `hasPassiveVotingRight` helper function to check if user can be a candidate
- [x] Update `usePermissions` hook to expose these new permission checks

### 3.2 Event Permissions Query

- [x] Ensure `useEventAgendaItem` hook queries for user's event participation and role
- [x] Add permission checks for voting actions in the agenda item detail page

---

## 4. Agenda Item Detail Page Restructure

### 4.1 Section 1: Header Card (Context Card)

- [x] Create `AgendaItemContextCard.tsx` component in `src/features/events/ui/`
- [x] For Elections: Display position information (title, description, group context)
- [x] For Votes: Display amendment information using `AmendmentTimelineCard` style
- [x] Add estimated, start, end, and duration time display
- [x] Add status badge (planned, active, completed)
- [x] Style card similar to timeline cards with gradient headers

### 4.2 Section 2: Speakers List

- [x] Create `AgendaSpeakerListSection.tsx` component
- [x] Display current speakers list with order numbers
- [x] Add "Join Speaker List" button for participants
- [x] Show speaker dialog with all registered speakers (profile images, names, links)
- [x] Add speaking time indicator for each speaker
- [x] Show mark as completed controls for organizers

### 4.3 Section 3: Vote & Result Section

- [x] Create `AgendaVoteSection.tsx` for amendment votes
- [x] Create `AgendaElectionSection.tsx` for elections

#### 4.3.1 Change Request Votes (Collapsible, on top of final vote)

- [x] Create `ChangeRequestVoteList.tsx` collapsible component (integrated into AgendaVoteSection)
- [x] Display ordered list of change requests (by `characterCount` or `votingOrder`)
- [x] Each change request shows: title, description, vote options (Yes/No/Abstain)
- [x] Each change request must be activated by user with `manage_votes` right before voting
- [x] Add "Activate" button for organizers to start voting on each CR
- [x] Show indication results before activation, actual results during/after
- [x] Apply same indication/final vote rules as main amendment vote
- [x] Track completion status: show checkmark when CR vote is completed
- [x] Block final amendment vote until all CRs are voted

#### 4.3.2 Final Amendment/Election Vote

- [x] Display candidates with profile images, names, and vote counts
- [x] Add horizontal bar chart visualization under each option
- [x] Show percentage and absolute votes on hover (tooltip)
- [x] Add centered "Vote" button that opens confirmation dialog
- [x] Disable/hide final vote section until all change requests are completed

### 4.4 Vote/Election Dialog

- [x] Create `VoteConfirmationDialog.tsx` component (integrated into AgendaVoteSection and AgendaElectionSection)
- [x] Display same options as the main view
- [x] Include cancel and confirm buttons
- [x] Handle indication mode (before voting starts) vs actual voting
- [x] Show "Confirm Indication" if user already indicated

### 4.5 Indication vs Actual Vote Logic

- [x] Detect if agenda item/election is started based on `activatedAt` or voting session status
- [x] Before start: Record votes with `isIndication: true`
- [x] During voting: Convert indication to actual vote or allow new vote
- [x] After voting: Hide vote button entirely
- [x] Apply same logic to each change request vote individually

---

## 5. Timeline & Terminal Card Updates

### 5.1 Update VoteTimelineCard

- [x] Add indication mode detection (check if voting hasn't started)
- [x] Before voting start: Display indication results only with "\* ind." label
- [x] During/After voting: Display BOTH indication results AND actual results side by side
- [x] Use consistent visual format for both (e.g., "Ind: 65% | Actual: 72%")
- [x] Update vote counts to show both indication and actual counts

### 5.2 Update ElectionTimelineCard

- [x] Add indication mode detection
- [x] Before voting start: Display indication results only with "\* ind." label
- [x] During/After voting: Display BOTH indication AND actual results for each candidate
- [x] Show indication percentage alongside actual percentage

### 5.3 Update DecisionTerminal Cards

- [x] Update `DecisionTable.tsx` to show indication column alongside actual results
- [x] Update `MobileDecisionCard.tsx` to show both indication and actual results
- [x] Update `DecisionSidePanel.tsx` to show indication vs actual comparison
- [x] Add visual distinction (e.g., lighter color for indication, bold for actual)

### 5.4 Update Search Page Cards

- [x] Ensure SearchPage uses same timeline card components
- [x] Indication + actual results display should automatically apply via shared components

### 5.5 Update ModernTimeline Integration

- [x] Verify `renderTimelineCard` function handles indication state
- [x] Pass both indication and actual vote data from data to card components
- [x] Ensure dual display works in masonry grid layout

---

## 6. UI Components

### 6.1 Vote Progress Visualization

- [x] Create `HorizontalVoteBar.tsx` component for horizontal bar chart (VoteBar in AgendaVoteSection)
- [x] Accept vote counts and display proportional bars
- [x] Add tooltip with absolute numbers on hover
- [x] Support both election candidates and yes/no votes

### 6.2 Candidate Button

- [x] Add "Become Candidate" button in election section
- [x] Check `passive_voting` permission before showing
- [x] Link to existing candidate registration flow
- [x] Show only during nominations phase

### 6.3 Permission-Based Button Visibility

- [x] Vote button: Only show if user has `active_voting` permission
- [x] Candidate button: Only show if user has `passive_voting` permission
- [x] Hide buttons after voting closes

---

## 7. Hook Updates

### 7.1 Update `useEventAgendaItem.ts`

- [x] Query for amendment data when agenda type is vote
- [x] Query for position data when type is election
- [x] Include change requests with proper ordering
- [x] Add voting permission checks
- [x] Handle indication vs actual vote submission

### 7.2 Create `useAgendaItemVoting.ts`

- [x] Handle vote submission logic with indication flag
- [x] Detect voting phase (pre, active, post)
- [x] Convert indication to vote when voting starts
- [x] Query user's existing votes/indications

### 7.3 Update `useDecisionTerminal.ts`

- [x] Add indication flag to decision items
- [x] Compute if results are indications or actual votes

---

## 8. Cleanup

### 8.1 Remove "Weitere Informationen" Section

- [x] Delete the "Weitere Informationen" card from `EventAgendaItemDetail.tsx`
- [x] Remove redundant type/status/duration display (moved to header card)

### 8.2 Remove Unused Components

- [x] Audit `EventAgendaItemDetail.tsx` for unused imports
- [x] Remove unused state variables
- [x] Clean up commented-out code
- [x] Remove deprecated legacy amendment vote section if superseded

### 8.3 Code Organization

- [x] Extract large render functions into separate components
- [x] Ensure consistent naming conventions
- [x] Add proper TypeScript types for all new components

---

## 9. Translations

### 9.1 Add German Translations

- [x] Add translations for vote indication labels in `src/i18n/locales/de/features/events/index.ts`
- [x] Add translations for new button labels (Become Candidate, Confirm Vote)
- [x] Add translations for section headers

### 9.2 Add English Translations

- [x] Add translations for vote indication labels in `src/i18n/locales/en/features/events/index.ts`
- [x] Add translations for new button labels
- [x] Add translations for section headers

---

## 10. Testing Considerations

### 10.1 E2E Test Updates

- [ ] Update `e2e/agenda-items/` tests to cover new UI structure
- [ ] Add test for vote indication before voting starts
- [ ] Add test for converting indication to actual vote
- [ ] Add test for permission-based button visibility

---

## Summary

| Phase                          | Tasks | Status       |
| ------------------------------ | ----- | ------------ |
| 1. Schema Updates              | 7     | ✅ Completed |
| 2. Seeder Updates              | 4     | ✅ Completed |
| 3. RBAC Integration            | 5     | ✅ Completed |
| 4. Agenda Item Detail Page     | 19    | ✅ Completed |
| 5. Timeline & Terminal Updates | 8     | ✅ Completed |
| 6. UI Components               | 5     | ✅ Completed |
| 7. Hook Updates                | 8     | ✅ Completed |
| 8. Cleanup                     | 7     | ✅ Completed |
| 9. Translations                | 4     | ✅ Completed |
| 10. Testing                    | 4     | Optional     |

---

## Notes

### Existing Components to Reuse

- `VoteProgressBar` from `src/features/timeline/ui/terminal/VoteProgressBar.tsx`
- `AmendmentTimelineCard` styling for vote context cards
- `ElectionTimelineCard` patterns for candidate display
- `PositionsTable` styling for position display

### Important Schema Links (Already Exist)

- `agendaItemsAmendment`: Links agenda items to amendments ✓
- `electionsAgendaItem`: Links elections to agenda items ✓
- `electionsPosition`: Links elections to positions ✓
- `electionCandidatesUser`: Links candidates to users ✓

### Key Ordering Algorithm

Change requests are ordered by:

1. `votingOrder` (manual override by organizers) - if set
2. `characterCount` (descending) - default sort by change relevance

### Vote State Machine

```
Pre-voting → During Voting → Post-voting
   ↓              ↓             ↓
Indication    Actual Vote    Read-only
(isIndication=true)  (isIndication=false)  (no voting)
```

### Indication vs Actual Display Logic

```
BEFORE voting starts:
  → Show: Indication only (with "* ind." label)
  → Example: "Support: 65%* ind."

DURING voting:
  → Show: BOTH indication AND actual side by side
  → Example: "Ind: 65% | Actual: 72%"

AFTER voting:
  → Show: BOTH indication AND actual (final results)
  → Example: "Ind: 65% | Final: 78%"
```

### Change Request Voting Flow

```
1. Agenda item activated
2. For each Change Request (ordered by characterCount):
   a. Organizer activates CR (manage_votes permission)
   b. Participants vote on CR (active_voting permission)
   c. CR marked as completed
3. After ALL CRs are voted → Final amendment vote unlocks
4. Participants vote on final amendment
5. Agenda item completed
```

### Permission Model

- `active_voting`: Can vote in elections/votes
- `passive_voting`: Can become a candidate in elections
- Both should be assigned to appropriate event roles

---

## Implementation Handoff

The task plan has been created at `tasks/agenda-item-vote-election-linking-tasks.md`.

To begin implementation, you can:

1. Ask me to implement specific tasks from the plan
2. Use @workspace to have an agent work through the tasks
3. Manually work through the checklist, marking items complete as you go

Would you like me to start implementing the first phase of tasks (Schema Updates)?
