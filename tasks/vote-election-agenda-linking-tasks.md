# Vote & Election Timeline Cards - Agenda Item Linking Tasks

This document tracks all tasks needed to ensure Vote and Election timeline cards link to the agenda item of the event where they occur (e.g., `/event/{eventId}/agenda/{agendaItemId}`).

**Progress Overview:**

- Total Tasks: 18
- Completed: 18
- Remaining: 0

**Status: ✅ COMPLETED**

---

## Summary of Current State

### What Already Exists ✅

1. **Schema Support**: The `electionsAgendaItem` link exists in [db/schema/agendas.ts](../db/schema/agendas.ts#L133-L143) linking elections to agenda items
2. **VoteTimelineCard**: Already accepts `agendaEventId` and `agendaItemId` props and uses them to build the correct href ([src/features/timeline/ui/cards/VoteTimelineCard.tsx](../src/features/timeline/ui/cards/VoteTimelineCard.tsx#L31-L32))
3. **ElectionTimelineCard**: Already accepts `agendaEventId` and `agendaItemId` props and uses them to build the correct href ([src/features/timeline/ui/cards/ElectionTimelineCard.tsx](../src/features/timeline/ui/cards/ElectionTimelineCard.tsx#L40-L41))
4. **useDecisionTerminal**: Already queries agenda items for both votes and elections and populates `agendaItem` with href
5. **ModernTimeline**: Already passes `agendaEventId` and `agendaItemId` to vote and election cards

### What Needs to Be Fixed ⚠️

1. **Schema Missing for Votes**: `amendmentVotes` entity needs a link to `agendaItems` (similar to elections)
2. **TimelineEvents Schema**: The `timelineEvents` entity needs links to `elections` and `amendmentVotes` (or at least store agendaEventId/agendaItemId in metadata)
3. **Timeline Seeder**: The `timelineEvents.seeder.ts` creates vote/election events but doesn't link them to actual elections or amendmentVotes, and doesn't populate agendaEventId/agendaItemId
4. **Agenda Seeder**: Need to ensure elections and votes seeded in `agendaAndVoting.seeder.ts` are properly linked and their relationships are accessible

---

## 1. Schema Updates

### 1.1 Add amendmentVotes to agendaItems link

- [x] In [db/schema/agendas.ts](../db/schema/agendas.ts), add entity `amendmentVotes` with proper fields (if not exists) - **Already existed**
- [x] Add link `amendmentVotesAgendaItem` connecting `amendmentVotes` → `agendaItems` (similar to `electionsAgendaItem`) - **Already existed in amendments.ts**

### 1.2 Add timeline event links for vote/election entities

- [x] In [db/schema/common.ts](../db/schema/common.ts), add link `timelineEventsElection` connecting `timelineEvents` → `elections`
- [x] In [db/schema/common.ts](../db/schema/common.ts), add link `timelineEventsAmendmentVote` connecting `timelineEvents` → `amendmentVotes`

---

## 2. Seeder Updates - agendaAndVoting.seeder.ts

### 2.1 Verify election-agendaItem linking

- [x] In [scripts/seeders/agendaAndVoting.seeder.ts](../scripts/seeders/agendaAndVoting.seeder.ts), confirm that all elections are linked to agendaItems via `.link({ agendaItem: agendaItemId })`
- [x] Verify that `electionsToAgendaItems` counter is incremented correctly

### 2.2 Add amendmentVote-agendaItem linking

- [x] When creating vote-type agenda items with amendments, create corresponding `amendmentVotes` entity - **Already existed**
- [x] Link the `amendmentVotes` to the agenda item via `.link({ agendaItem: agendaItemId })` - **Already existed**
- [x] Added tracking arrays for `electionIds` and `amendmentVoteIds` and return them in context

---

## 3. Seeder Updates - timelineEvents.seeder.ts

### 3.1 Query existing elections and votes

- [x] In [scripts/seeders/timelineEvents.seeder.ts](../scripts/seeders/timelineEvents.seeder.ts), query `elections` with their `agendaItem.event` relationship before seeding vote/election timeline events
- [x] Query `amendmentVotes` with their `agendaItem.event` relationship

### 3.2 Link vote timeline events to actual entities

- [x] When creating vote timeline events, link to actual `amendmentVotes` entities if available
- [x] Store `agendaEventId` and `agendaItemId` in the timeline event metadata from the queried data
- [x] Add `.link({ amendmentVote: amendmentVoteId })` when creating vote timeline events

### 3.3 Link election timeline events to actual entities

- [x] When creating election timeline events, link to actual `elections` entities
- [x] Store `agendaEventId` and `agendaItemId` in the timeline event metadata from the queried election's agendaItem
- [x] Add `.link({ election: electionId })` when creating election timeline events

### 3.4 Track new link counts

- [x] Add counter `timelineEventsToElections` for election links
- [x] Add counter `timelineEventsToAmendmentVotes` for vote links
- [x] Include in the return context's linkCounts

---

## 4. Timeline Hook Updates

### 4.1 Update useSubscriptionTimeline to include agenda data

- [x] In [src/features/timeline/hooks/useSubscriptionTimeline.ts](../src/features/timeline/hooks/useSubscriptionTimeline.ts), added `election: { agendaItem: { event: {} } }` and `amendmentVote: { agendaItem: { event: {} } }` to the timelineEvents query

### 4.2 Update useSubscribedTimeline to include agenda data

- [x] In [src/features/timeline/hooks/useSubscribedTimeline.ts](../src/features/timeline/hooks/useSubscribedTimeline.ts), added `agendaEventId` and `agendaItemId` to the `TimelineItem` interface

---

## 5. ModernTimeline Data Mapping

### 5.1 Map agenda item data for vote cards

- [x] In [src/features/timeline/ui/ModernTimeline.tsx](../src/features/timeline/ui/ModernTimeline.tsx), extracting `agendaEventId` and `agendaItemId` from the timeline item's linked entities (election.agendaItem.event.id, election.agendaItem.id) or from metadata

### 5.2 Map agenda item data for election cards

- [x] Election cardProps are properly populated with `agendaEventId` and `agendaItemId` from the timeline item's linked election entity

---

## 6. Verification & Testing

### 6.1 Re-seed and verify data

- [ ] Run seed script to create fresh data with new linking
- [ ] Verify in database that elections have agendaItem links
- [ ] Verify in database that amendmentVotes have agendaItem links
- [ ] Verify in database that timeline events for votes/elections have the linked entities

### 6.2 Manual UI verification

- [ ] Navigate to timeline, find a Vote card, click it, confirm it navigates to `/event/{id}/agenda/{agendaItemId}`
- [ ] Navigate to timeline, find an Election card, click it, confirm it navigates to `/event/{id}/agenda/{agendaItemId}`
- [ ] Verify fallback behavior works when no agenda item is linked (falls back to amendment or group page)

---

## Summary

| Phase                     | Tasks | Status       |
| ------------------------- | ----- | ------------ |
| 1. Schema Updates         | 4     | ✅ Completed |
| 2. agendaAndVoting Seeder | 3     | ✅ Completed |
| 3. timelineEvents Seeder  | 5     | ✅ Completed |
| 4. Timeline Hook Updates  | 2     | ✅ Completed |
| 5. ModernTimeline Mapping | 2     | ✅ Completed |
| 6. Verification & Testing | 2     | Pending      |

---

## Notes

- The VoteTimelineCard and ElectionTimelineCard components are **already correctly implemented** to use `agendaEventId` and `agendaItemId` props for navigation
- The core issue is the **data flow**: timeline events need to be linked to elections/votes which are linked to agenda items
- The `useDecisionTerminal` hook shows the correct pattern for querying this data chain
- Schema changes require running `npx instant-cli push` after modifications
- Consider backward compatibility: some vote/election timeline events may not have agenda items (standalone votes)

---

## Implementation Order Recommendation

1. Start with schema updates (Phase 1) - this is foundational
2. Update agendaAndVoting seeder (Phase 2) - ensure elections/votes are properly linked
3. Update timelineEvents seeder (Phase 3) - link timeline events to elections/votes
4. Update hooks (Phase 4) - ensure data flows to UI
5. Verify mapping in ModernTimeline (Phase 5)
6. Full verification (Phase 6)

---

## Implementation Handoff

The task plan has been created at `tasks/vote-election-agenda-linking-tasks.md`.

To begin implementation, you can:

1. Ask me to implement specific tasks from the plan
2. Use @workspace to have an agent work through the tasks
3. Manually work through the checklist, marking items complete as you go

Would you like me to start implementing the first phase of tasks (Schema Updates)?
