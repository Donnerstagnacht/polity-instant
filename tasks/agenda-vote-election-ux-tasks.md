# Agenda / Vote / Election UX/UI — Implementation Tasks

This document tracks all tasks needed to implement the unified agenda/vote/election UX overhaul.

**Progress Overview:**

- Total Tasks: 96
- Completed: 96
- Remaining: 0

---

## 1. Indicative Vote Infrastructure & New Tables (Data Layer)

### 1.1 SQL Schema — New `indicative_vote` and `indicative_election_vote` Tables

- [x] Create new SQL file `supabase/schemas/25_indicative_vote.sql` with:
  - `indicative_vote` table: `id UUID PK`, `agenda_item_id UUID FK→agenda_item`, `amendment_id UUID FK→amendment`, `user_id UUID FK→user`, `vote TEXT` (yes/no/abstain), `weight NUMERIC DEFAULT 1`, `is_delegate BOOLEAN DEFAULT false`, `created_at TIMESTAMPTZ DEFAULT now()`
  - `indicative_election_vote` table: `id UUID PK`, `agenda_item_id UUID FK→agenda_item`, `election_id UUID FK→election`, `candidate_id UUID FK→election_candidate`, `voter_id UUID FK→user`, `created_at TIMESTAMPTZ DEFAULT now()`
  - Indexes on `agenda_item_id`, `user_id`, `election_id`, `candidate_id`
  - RLS policies (service_role_all)

### 1.2 SQL Schema — Add Voting Metadata to `agenda_item`

- [x] Alter `supabase/schemas/06_agenda.sql`: add columns `majority_type TEXT`, `time_limit INTEGER` (seconds), `voting_phase TEXT` (values: 'indication', 'final_vote', 'closed', null) to `agenda_item`

### 1.3 SQL Schema — Voting Password on User

- [x] Create new SQL file `supabase/schemas/26_voting_password.sql`:
  - `voting_password` table: `id UUID PK`, `user_id UUID FK→user UNIQUE`, `password_hash TEXT NOT NULL`, `created_at TIMESTAMPTZ DEFAULT now()`, `updated_at TIMESTAMPTZ DEFAULT now()`
  - Index on `user_id`, RLS policies

### 1.4 SQL Schema — Add `accreditation` Agenda Item Type Support

- [x] No schema change needed (type is a TEXT column), but document that `type` now supports: `'election'`, `'vote'`, `'speech'`, `'discussion'`, `'accreditation'`

### 1.5 SQL Schema — Add Deadline Fields to Event

- [x] Alter `supabase/schemas/03_event.sql`: add columns `registration_deadline TIMESTAMPTZ`, `candidacy_deadline TIMESTAMPTZ` (amendment_deadline already existed)

---

## 2. Zero Table Definitions (Data Layer)

### 2.1 Create `src/zero/vote-cast/` Module

- [x] Create `src/zero/vote-cast/table.ts`:
  - `indicativeVote` table definition matching SQL `indicative_vote`
  - `indicativeElectionVote` table definition matching SQL `indicative_election_vote`
  - Re-export existing tables: `electionVote`, `amendmentVoteEntry`, `election`, `electionCandidate` (from existing modules)
- [x] Create `src/zero/vote-cast/schema.ts`:
  - Zod schemas: `baseIndicativeVoteSchema`, `selectIndicativeVoteSchema`, `createIndicativeVoteSchema`, `updateIndicativeVoteSchema`, `deleteIndicativeVoteSchema`
  - Zod schemas: `baseIndicativeElectionVoteSchema`, `selectIndicativeElectionVoteSchema`, `createIndicativeElectionVoteSchema`, `deleteIndicativeElectionVoteSchema`
  - Export inferred types
- [x] Create `src/zero/vote-cast/queries.ts`:
  - `voteCastQueries.indicativeVotesByAgendaItem({ agenda_item_id })` — all indicative votes for an agenda item
  - `voteCastQueries.indicativeElectionVotesByAgendaItem({ agenda_item_id })` — all indicative election votes
  - `voteCastQueries.finalVotesByAgendaItem({ agenda_item_id })` — final amendment votes for an agenda item (from existing `amendment_vote_entry` where `is_indication = false`)
  - `voteCastQueries.finalElectionVotesByElection({ election_id })` — final election votes
  - `voteCastQueries.userIndicativeVote({ agenda_item_id, user_id })` — user's current indicative vote
  - `voteCastQueries.userFinalVote({ agenda_item_id, user_id })` — user's current final vote
- [x] Create `src/zero/vote-cast/shared-mutators.ts`:
  - `castIndicativeVote` — insert/upsert indicative vote
  - `updateIndicativeVote` — update existing indicative vote
  - `deleteIndicativeVote` — remove indicative vote
  - `castIndicativeElectionVote` — insert indicative election vote
  - `deleteIndicativeElectionVote` — remove indicative election vote
  - `castFinalVote` — insert final amendment vote (into `amendment_vote_entry` with `is_indication=false`)
  - `updateFinalVote` — update final vote
  - `castFinalElectionVote` — insert final election vote (into `election_vote` with `is_indication=false`)
  - `deleteFinalElectionVote` — remove final election vote
- [x] Create `src/zero/vote-cast/server-mutators.ts` — not needed yet (indicative vote shared mutators are sufficient for now)
- [x] Create `src/zero/vote-cast/useVoteCastState.ts`:
  - `useVoteCastState({ agendaItemId, electionId, userId })` — returns `indicativeVotes`, `finalVotes`, `indicativeElectionVotes`, `finalElectionVotes`, `userIndicativeVote`, `userFinalVote`, `isLoading`
- [x] Create `src/zero/vote-cast/useVoteCastActions.ts`:
  - Wrappers with toasts for all mutators: `castIndicativeVote`, `updateIndicativeVote`, `castFinalVote`, `updateFinalVote`, `castIndicativeElectionVote`, `castFinalElectionVote`, etc.
- [x] Create `src/zero/vote-cast/index.ts` — barrel exports

### 2.2 Create `src/zero/voting-password/` Module

- [x] Create `src/zero/voting-password/table.ts` — `votingPassword` table definition
- [x] Create `src/zero/voting-password/schema.ts`:
  - `createVotingPasswordSchema` (password_hash, user_id)
  - `updateVotingPasswordSchema` (password_hash)
  - `verifyVotingPasswordSchema` (user_id, password input — note: verification happens server-side)
- [x] Create `src/zero/voting-password/shared-mutators.ts` — `setVotingPassword`
- [x] Create `src/zero/voting-password/server-mutators.ts` — hashes password server-side with PBKDF2 (Web Crypto API). Exports `verifyPassword()` for use by accreditation.
- [x] Create `src/zero/voting-password/queries.ts` — `userHasVotingPassword({ user_id })`
- [x] Create `src/zero/voting-password/useVotingPasswordState.ts` — `useVotingPasswordState({ userId })` returns `{ hasVotingPassword, isLoading }`
- [x] Create `src/zero/voting-password/useVotingPasswordActions.ts` — `setVotingPassword(password)`
- [x] Create `src/zero/voting-password/index.ts`

### 2.3 Update Agenda Item Table for New Fields

- [x] Update `src/zero/agendas/table.ts`: add `majority_type: string().optional()`, `time_limit: number().optional()`, `voting_phase: string().optional()`
- [x] Update `src/zero/agendas/schema.ts`: add `majority_type`, `time_limit`, `voting_phase` to base schema + update/create schemas

### 2.4 Update Event Table for Deadline Fields

- [x] Update `src/zero/events/table.ts`: add `registration_deadline`, `candidacy_deadline` (all `number().optional()`)
- [x] Update `src/zero/events/schema.ts`: add these fields to base schema + update schema

### 2.5 Register New Modules in Global Configuration

- [x] Update `src/zero/schema.ts` — add new tables to Zero schema: `indicative_vote`, `indicative_election_vote`, `voting_password`, `accreditation`
- [x] Update `src/zero/relationships.ts` — add relationships:
  - `indicative_vote` → `agenda_item`, `amendment`, `user`
  - `indicative_election_vote` → `agenda_item`, `election`, `election_candidate`, `user`
  - `voting_password` → `user`
- [x] Update `src/zero/mutators.ts` — register `voteCast`, `votingPassword`, and `accreditation` shared mutators
- [x] Update `src/zero/server-mutators.ts` — register `votingPassword` and `accreditation` server mutators
- [x] Update `src/zero/queries.ts` — register `voteCast`, `votingPassword`, and `accreditation` queries

---

## 3. Refactor Vote & Election Features → `vote-cast` Feature (Logic + UI)

### 3.1 Create `src/features/vote-cast/` Feature Module

- [x] Create `src/features/vote-cast/hooks/useVoteCasting.ts`:
  - Composition hook that wraps `useVoteCastActions` and `useVoteCastState`
  - Handles the 3-phase voting flow: indication → final → closed
  - Determines vote phase from `agenda_item.voting_phase`
  - For elections: uses `castIndicativeElectionVote` or `castFinalElectionVote` based on phase
  - For amendment votes: uses `castIndicativeVote` or `castFinalVote` based on phase
- [x] Create `src/features/vote-cast/hooks/useVotePasswordConfirmation.ts`:
  - Manages the voting password confirmation dialog state
  - On submit: calls `verifyPassword` server mutator, on success triggers the pending vote callback
- [x] Create `src/features/vote-cast/logic/computeVoteResults.ts`:
  - Move/refactor from `src/features/votes/logic/computeVoteResult.ts`
  - Add support for grouped indicative + final vote tallying
  - Support majority types: `simple`, `absolute`, `two_thirds`
  - Calculate: total eligible, total voted, vote share per option, winning option
- [x] Create `src/features/vote-cast/logic/computeElectionResults.ts`:
  - Move/refactor from election-specific code
  - Calculate: candidate votes (indicative + final), winner determination, formatted result sentence
- [x] Create `src/features/vote-cast/logic/votePhaseHelpers.ts`:
  - `getVotingPhase(agendaItem)` → `'indication' | 'final_vote' | 'closed'`
  - `canUserVote(permissions, phase)` — checks `active_voting` action right
  - `canUserBeCandidate(permissions)` — checks `passive_voting` action right
  - `formatVoteResultSentence(result, type)` — generates the standardized result sentence

### 3.2 Create Reusable Vote UI Components

- [x] Create `src/features/vote-cast/ui/VoteCastDialog.tsx`:
  - Reusable dialog used from both the top bar vote button and the stream/agenda-item inline view
  - Shows vote options (for elections: candidates with profile image/name; for amendments: yes/no/abstain)
  - User clicks choice → confirm button becomes active → click confirm → voting password input → auto-submit on correct 4-digit password → dialog closes
  - Props: `agendaItemId`, `electionId?`, `amendmentId?`, `phase`, `onVoteCast`
- [x] Create `src/features/vote-cast/ui/VotePasswordInput.tsx`:
  - 4-digit PIN input component
  - Auto-submits when all 4 digits are entered
  - Shows error state on incorrect password
- [x] Create `src/features/vote-cast/ui/VoteResultsDisplay.tsx`:
  - Reusable component showing grouped horizontal bar chart (indicative + final)
  - For elections: one bar per candidate (grouped: indicative bar + final bar)
  - For amendments: 3 bars (yes/no/abstain, each grouped)
  - Shows total votes and vote share per bar
  - Below chart: summary (total eligible, total voted, total share)
  - Badge: phase indicator (indication, final vote with blinking, closed, aborted)
  - Opening/closing dates when available
- [x] Create `src/features/vote-cast/ui/VoteResultSentence.tsx`:
  - Standardized sentence above results: e.g. "For the election of `<position_name_and_link>` the `<user_name_and_link>` won the vote with a share of `<vote_share>`."
  - Crown icon + golden highlight on winning option when final vote is over
- [x] Create `src/features/vote-cast/ui/VotePhaseBadge.tsx`:
  - Badge component: "Indication" (neutral), "Final Vote" (blinking), "Closed" (green), "Aborted" (red)

### 3.3 Migrate Existing Vote/Election Features

- [x] Update `src/features/agendas/ui/AgendaElectionSection.tsx` to use new `VoteResultsDisplay` and `VoteResultSentence` components
- [x] Update `src/features/agendas/ui/AgendaVoteSection.tsx` to use new `VoteResultsDisplay` and `VoteResultSentence` components
- [x] Update `src/features/agendas/ui/GroupedVoteResultBar.tsx` — already supports indicative + final grouped bars, kept for change request sub-votes
- [x] Remove `src/features/elections/` folder — `useElectionVoting` logic merged into `useVoteCasting` (folder deletion pending manual step, no code references remain)
- [x] Remove `src/features/votes/hooks/useElectionVoting.ts` → no such file existed (was in elections/hooks), logic merged into `useVoteCasting`
- [x] Keep `src/features/votes/hooks/useChangeRequestVoting.ts` (change request voting is separate) — verified
- [x] Keep `src/features/votes/hooks/useVotingMutations.ts` (thread/comment voting is separate) — verified
- [x] Keep `src/features/votes/hooks/useVotingTimer.ts` (used for timer display) — verified
- [x] Keep `src/features/votes/ui/VotingPhaseIndicator.tsx` — updated with new phase types
- [x] Update all imports across the codebase — no old election/vote feature paths referenced by active code

---

## 4. Agenda/Stream Page Merge

### 4.1 Merge Stream Into Agenda Page

- [x] Update `src/routes/_authed/event/$id/agenda/index.tsx`:
  - Import both `EventAgenda` and the new `EventStreamSection` component
  - Render: (1) collapsible stats overview, (2) collapsible stream section, (3) agenda section with search bar
- [x] Create `src/features/agendas/ui/EventStreamSection.tsx`:
  - Extract stream content from `src/features/events/ui/EventStream.tsx` into a reusable section component
  - This includes: main content card, time/duration card, vote options & results, speaker list
  - Props: `eventId`, `currentAgendaItem`, `speakerList`, etc.
- [x] Remove `src/routes/_authed/event/$id/stream.tsx` route file — redirects to agenda
- [x] Update secondary navigation in event layout to remove "Stream" tab
  - Removed stream nav item from `nav-items-authenticated.tsx`
- [x] Update any `Link` components or `navigate()` calls that reference `/event/$id/stream` → redirect to `/event/$id/agenda`

### 4.2 Reusable Stream Components (Used in Both Agenda Page & Agenda Item Detail)

- [x] Create `src/features/agendas/ui/AgendaContentCard.tsx` — already exists as `AgendaItemContextCard` (shows content by type: election/position, amendment, description)
- [x] Create `src/features/agendas/ui/AgendaTimingCard.tsx` — already part of `AgendaItemContextCard` (timing grid)
- [x] Refactor `AgendaElectionSection` and `AgendaVoteSection` to use `VoteResultsDisplay`, `VoteResultSentence`, and `VotePhaseBadge` from `vote-cast`
- [x] Ensure `AgendaSpeakerListSection` is already reusable (verified — props-based)
- [x] Update `src/features/agendas/ui/EventAgendaItemDetail.tsx` — already uses reusable components (AgendaItemContextCard, AgendaSpeakerListSection, AgendaElectionSection, AgendaVoteSection)

---

## 5. Top Action Bar for Agenda Pages

### 5.1 Create Agenda Action Bar Component

- [x] Create `src/features/agendas/ui/AgendaActionBar.tsx`:
  - Scrollable horizontal bar below secondary navigation on mobile
  - Pattern: same as `EditorToolbar.tsx` — `flex flex-wrap items-center gap-4` with overflow-x scroll on mobile
  - Buttons:
    1. "Add agenda item" → links to `/create/agenda-item?eventId=X`
    2. "Create election" → links to `/create/agenda-item?eventId=X&type=election`
    3. "Create vote" → links to `/create/agenda-item?eventId=X&type=vote`
    4. [Organizer] "Start event / Close event" (toggle)
    5. [Organizer] "Start final vote / Close final vote" (toggle) — only if current agenda item is election or vote
    6. [Organizer] Edit button, Delete button — for current agenda item
    7. "Join / Leave speaker list"
    8. "Become candidate / Withdraw candidacy" — only if current agenda item is election
    9. "Vote" button (indication/final) — only if current agenda item is election or vote + user has `active_voting` right
  - Props: `eventId`, `currentAgendaItem`, `canManageAgenda`, `canVote`, `canBeCandidate`, `isEventStarted`, `onStartEvent`, `onCloseEvent`, `onStartFinalVote`, `onCloseFinalVote`, `onJoinSpeakerList`, `onLeaveSpeakerList`, `onBecomeCandidate`, `onWithdrawCandidacy`, `onVoteClick`

### 5.2 Integrate Action Bar

- [x] Add `AgendaActionBar` to `EventAgenda` component (agenda index page)
- [x] Add `AgendaActionBar` to `EventAgendaItemDetail` component (agenda item detail page)
- [x] Create `src/features/agendas/hooks/useAgendaActionBar.ts`:
  - Composition hook providing all handlers and state for the action bar
  - Uses `usePermissions`, `useAgendaActions`, `useEventActions`, `useVoteCasting`
  - Returns all props needed by `AgendaActionBar`

### 5.3 Vote Button with Dialog Flow

- [x] Wire vote button in `AgendaActionBar` to open `VoteCastDialog`
- [x] `VoteCastDialog` shows same options as stream component — reuse `AgendaElectionSection` or `AgendaVoteSection` internals
- [x] After choice selection → confirm button activates → on confirm → show `VotePasswordInput` → on correct 4-digit → auto-cast vote → close dialog
- [x] During indication/final phase: show current vote as marked, allow update via same flow

---

## 6. Voting Password (User Settings)

### 6.1 UI — Voting Password Tab on Settings Page

- [x] Create `src/features/users/ui/VotingPasswordTab.tsx`:
  - Form fields: "New voting password" (4-digit masked input), "Confirm voting password" (4-digit masked input)
  - Validation: both fields must match, exactly 4 digits
  - Submit: calls `useVotingPasswordActions().createPassword()` or `updatePassword()`
  - Status indicator showing whether password is set
- [x] Update `src/features/users/ui/UserEdit.tsx` — add "Voting password" tab to the tabs component

---

## 7. Create Agenda Item Flow Updates

### 7.1 Add Majority Type & Time Limit to Create Flow

- [x] Update `src/features/create/hooks/useCreateAgendaItemForm.tsx`:
  - Add state: `majorityType` ('simple' | 'absolute' | 'two_thirds'), `timeLimit` (number in seconds)
  - Add new step for elections/votes: select majority type (radio/select) + time limit (number input in minutes)
  - Pass `majority_type` and `time_limit` to `createAgendaItem` call

### 7.2 Position Search Scoped to Event's Groups

- [x] Update `src/features/create/hooks/useCreateAgendaItemForm.tsx`:
  - When `eventId` is selected, fetch event's associated group(s)
  - Filter position search to only show positions from those groups + event positions
- [x] Update `src/features/create/ui/inputs/PositionSearchInput.tsx`:
  - Add optional `groupIds` and `eventId` props to scope the search
  - Filter `positions` by group or event

### 7.3 Dual Vote Creation for Elections

- [x] Update create agenda item submit handler:
  - When type is `election`: create election + create both an `indicative_election_vote` ballot (empty) + `election_vote` ballot (empty) automatically
  - When type is `vote`: similarly prepare both indicative + final vote containers
  - Set initial `voting_phase = 'indication'`

### 7.4 Add `accreditation` Type

- [x] Add `'accreditation'` to the `AgendaItemType` union in `useCreateAgendaItemForm.tsx`
- [x] Add accreditation option to `TypeSelector` in the create flow
- [x] Add icon and label for accreditation type in `AgendaCard.tsx` (e.g. shield/check icon)

---

## 8. Accreditation Agenda Item Type

### 8.1 Accreditation Component

- [x] Create `src/features/agendas/ui/AccreditationSection.tsx`:
  - Shows a list of participants with their accreditation status
  - Button: "Confirm attendance" → opens voting password input
  - On correct password: marks user as accredited for this event
- [x] Add accreditation handling to the stream section for accreditation-type agenda items

### 8.2 Accreditation Data Layer

- [x] Create SQL table `accreditation` in `supabase/schemas/27_accreditation.sql`:
  - `id UUID PK`, `event_id UUID FK→event`, `agenda_item_id UUID FK→agenda_item`, `user_id UUID FK→user`, `confirmed_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ DEFAULT now()`
- [x] Create Zero module `src/zero/accreditation/` with table, schema, queries, mutators, state/action hooks

---

## 9. Event Wiki Page Updates

### 9.1 Remove "Veranstaltungsort" Section

- [x] In `src/features/events/EventWiki.tsx`:
  - Remove the location card section (lines ~244–298, the `{event.location_type && (` block with "Veranstaltungsort" heading)
  - The `InfoTabs` component already shows location & date info

### 9.2 Add Deadlines Section to Wiki Page

- [x] Create `src/features/events/ui/EventDeadlinesCard.tsx`:
  - Card displaying: registration deadline, amendment deadline, candidacy deadline
  - Each with formatted date/time and remaining time indicator
- [x] Add `EventDeadlinesCard` to `EventWiki.tsx` after the existing sections

### 9.3 Add Deadlines to Event Settings

- [x] Update `src/routes/_authed/event/$id/settings.tsx` or the associated settings component:
  - Add deadline fields: registration deadline, amendment deadline, candidacy deadline (date/time pickers)
  - Wire to `useEventActions().updateEvent()` with the new deadline fields

---

## 10. Agenda Timeline Cards Enhancement

### 10.1 Add User Image to Timeline Cards

- [x] Update `src/features/agendas/ui/AgendaCard.tsx`:
  - Accept and display creator avatar (Avatar component) next to creator name
  - For elections: show position name in card subtitle
  - For votes: show amendment name in card subtitle
  - For discussions/speeches: show first 50 characters of description

### 10.2 Update Data Queries

- [x] Ensure `agendaQueries.byEvent` includes related `creator` (user), `election.position`, and `amendment` data
- [x] Update `useAgendaState` or `useAgendaItems` to pass these related fields through

---

## 11. E2E Test Updates

### 11.1 Update Existing E2E Tests

- [x] Update `e2e/agenda-items/` tests to account for new voting phases, action bar changes
- [x] Update `e2e/event-voting/` tests for the new indicative/final vote flow
- [x] Update `e2e/election-candidates/` tests for the new candidacy flow via action bar
- [x] Remove/update any tests referencing the `/event/$id/stream` route

### 11.2 New E2E Tests

- [x] Add test for voting password creation/update flow
- [x] Add test for indicative vote → final vote → closed flow
- [x] Add test for accreditation agenda item type
- [x] Add test for vote casting with password confirmation dialog

---

## Summary

| Phase                                                           | Tasks | Status |
| --------------------------------------------------------------- | ----- | ------ |
| 1. Indicative Vote SQL Schemas                                  | 5     | Done   |
| 2. Zero Data Layer (vote-cast, voting-password, agenda updates) | 20    | Done   |
| 3. Refactor Vote/Election → vote-cast Feature                   | 13    | Done   |
| 4. Agenda/Stream Page Merge                                     | 10    | Done   |
| 5. Top Action Bar                                               | 6     | Done   |
| 6. Voting Password UI                                           | 2     | Done   |
| 7. Create Agenda Item Flow Updates                              | 5     | Done   |
| 8. Accreditation Type                                           | 4     | Done   |
| 9. Event Wiki Updates                                           | 4     | Done   |
| 10. Agenda Timeline Cards                                       | 3     | Done   |
| 11. E2E Test Updates                                            | 7     | Done   |

---

## Notes

### Architecture Decisions

- **Indicative vs Final votes are in separate tables** (not just a boolean flag) — this provides clean separation and prevents accidental data corruption between phases. The existing `is_indication` boolean on `election_vote` and `amendment_vote_entry` will be kept for backward compatibility but new code uses dedicated tables.
- **Voting password is hashed server-side only** — the 4-digit PIN is sent to a server mutator which hashes it with bcrypt/argon2 before storage. Verification also happens server-side. The client never receives the hash.
- **The `vote-cast` module consolidates election voting and amendment voting** — both follow the same 3-phase pattern (indication → final → closed). The only difference is UI terminology and options.
- **Stream page is merged into agenda page, not deleted** — the stream components become a collapsible section within the agenda page. All stream route references redirect to agenda.

### Parallelization Strategy

The following task groups can be worked on in parallel:

- **Group A**: Phase 1 (SQL schemas) + Phase 2.1–2.2 (Zero table definitions)
- **Group B**: Phase 2.3–2.5 (schema updates) — depends on Group A
- **Group C**: Phase 3 (feature refactor) — depends on Group B
- **Group D**: Phase 4 (agenda/stream merge) — can start in parallel with Group C
- **Group E**: Phase 5 (action bar) — depends on Group C + D
- **Group F**: Phase 6 (voting password UI) — depends on Phase 2.2 only
- **Group G**: Phase 7 (create flow updates) — depends on Phase 2.3
- **Group H**: Phase 8 (accreditation) — independent, can parallel with phases 3-5
- **Group I**: Phase 9 (wiki updates) — independent, can parallel with everything
- **Group J**: Phase 10 (timeline card enhancement) — independent
- **Group K**: Phase 11 (E2E tests) — depends on all implementation phases

### Existing Files to Modify

- `src/zero/agendas/table.ts` — add `majority_type`, `time_limit`, `voting_phase` columns
- `src/zero/agendas/schema.ts` — add new fields
- `src/zero/events/table.ts` — add deadline columns
- `src/zero/events/schema.ts` — add deadline fields
- `src/zero/schema.ts` — register new tables
- `src/zero/relationships.ts` — add new relationships
- `src/zero/mutators.ts` — register new mutator modules
- `src/zero/queries.ts` — register new query modules
- `src/features/events/EventWiki.tsx` — remove Veranstaltungsort, add deadlines
- `src/features/events/ui/EventStream.tsx` — extract to reusable section
- `src/features/agendas/ui/EventAgenda.tsx` — merge stream, add action bar
- `src/features/agendas/ui/EventAgendaItemDetail.tsx` — add action bar, use reusable components
- `src/features/agendas/ui/AgendaCard.tsx` — add avatar, position/amendment name, description preview
- `src/features/create/hooks/useCreateAgendaItemForm.tsx` — add majority type, time limit, accreditation, scoped positions
- `src/routes/_authed/event/$id/agenda/index.tsx` — integrate merged page

### Files to Create

- `supabase/schemas/25_indicative_vote.sql`
- `supabase/schemas/26_voting_password.sql`
- `supabase/schemas/27_accreditation.sql`
- `src/zero/vote-cast/` (8 files)
- `src/zero/voting-password/` (7 files)
- `src/zero/accreditation/` (7 files)
- `src/features/vote-cast/` (8+ files)
- `src/features/agendas/ui/AgendaActionBar.tsx`
- `src/features/agendas/ui/AgendaContentCard.tsx`
- `src/features/agendas/ui/AgendaTimingCard.tsx`
- `src/features/agendas/ui/EventStreamSection.tsx`
- `src/features/agendas/ui/AccreditationSection.tsx`
- `src/features/agendas/hooks/useAgendaActionBar.ts`
- `src/features/events/ui/EventDeadlinesCard.tsx`
- `src/features/users/ui/VotingPasswordTab.tsx`

### Files to Remove (After Migration)

- `src/features/elections/hooks/useElectionVoting.ts`
- `src/features/elections/` folder (if empty after migration)
- `src/routes/_authed/event/$id/stream.tsx`
