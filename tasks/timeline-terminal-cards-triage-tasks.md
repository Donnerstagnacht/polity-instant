# Timeline Terminal + Card Rendering Triage Tasks

This document tracks tasks needed to diagnose and fix the Decision Terminal data flow and ensure timeline cards render using the dedicated card components, including any schema/seed adjustments.

**Progress Overview:**

- Total Tasks: 18
- Completed: 9
- Remaining: 9

---

## 1. Current Behavior Audit

### 1.1 Verify data sources and wiring

- [x] Review `ModernTimeline` decision mode to confirm `DecisionTerminal` receives live data (currently empty array)
- [x] Inspect `useDecisionTerminal` hook usage patterns and intended data flow
- [x] Inventory timeline rendering paths (simple cards vs `DynamicTimelineCard`) and identify active path in `ModernTimeline`

### 1.2 Confirm translation coverage

- [ ] Ensure `DecisionTerminal` empty/loading strings exist in i18n and are used consistently
- [ ] Verify `ExploreEmptyState` strings are all referenced via `useTranslation`

---

## 2. Decision Terminal Data Integration

### 2.1 Hook integration

- [x] Wire `useDecisionTerminal` into `ModernTimeline` decision mode
- [x] Pass `decisions`, `isLoading`, and counts to `DecisionTerminal`
- [ ] Add filtering inputs (group scope, recently closed days) if needed for current page context

### 2.2 Empty and loading states

- [ ] Validate `TerminalEmptyState` in `DecisionTerminal` renders for each filter
- [ ] Confirm skeletons appear when `isLoading` is true

---

## 3. Timeline Card Rendering Path

### 3.1 Replace placeholder card renderer

- [x] Replace `renderSimpleCard` with `DynamicTimelineCard` to use the real card components
- [x] Map `TimelineItem`/`ExploreItem` data into each card’s expected props
- [x] Add graceful fallback for unknown `cardType`

### 3.2 Data model alignment

- [x] Align timeline item shape with card props (e.g., `group`, `event`, `amendment`, `blog`, `todo`, `statement`)
- [ ] Confirm `contentTypes` from filters match `CardType` union
- [ ] Ensure gradient assignment uses `getTimelineCardGradient` or existing gradient utility

---

## 4. Schema & Seed Coverage (if data is missing)

### 4.1 Schema verification

- [ ] Check timeline-related entities in `db/schema` for required fields used by cards and terminal
- [ ] Validate indexes for timeline queries (filter/sort fields)

### 4.2 Seeder updates

- [ ] Ensure `timelineEvents.seeder.ts` produces diverse content types used in cards
- [ ] Add sample votes/elections to support Decision Terminal if required
- [ ] Re-run seed logic (or update instructions) to validate timeline content appears

---

## 5. QA and Validation

### 5.1 UI verification

- [ ] Confirm cards render in Following and Explore modes with real card components
- [ ] Verify Decision Terminal displays open and closed decisions
- [ ] Validate mobile card rendering for Decision Terminal

### 5.2 Tests and docs

- [ ] Add/adjust e2e coverage for Decision Terminal and timeline card rendering
- [ ] Update any relevant docs for timeline mode behavior

---

## Summary

| Phase   | Tasks | Status      |
| ------- | ----- | ----------- |
| Phase 1 | 4     | In Progress |
| Phase 2 | 5     | In Progress |
| Phase 3 | 4     | In Progress |
| Phase 4 | 4     | Not Started |
| Phase 5 | 3     | Not Started |

---

## Notes

- The Decision Terminal currently appears empty because it is passed an empty `decisions` array; wire `useDecisionTerminal` for data.
- Timeline cards are currently rendered via `renderSimpleCard` in `ModernTimeline`, bypassing the specialized card components in `src/features/timeline/ui/cards`.
- Schema/seed work is only required if timeline queries return empty or missing fields after wiring the UI components.
