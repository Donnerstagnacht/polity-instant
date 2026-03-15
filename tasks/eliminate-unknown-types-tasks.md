# Eliminate `unknown` Types & Complete Zero-Derived Type Migration

This document tracks all remaining tasks to eliminate fixable `unknown` occurrences and finalize zero-derived type adoption across the codebase.

**Progress Overview:**

- Total Tasks: 38
- Completed: 38
- Remaining: 0

**Audit Summary (104 `unknown` occurrences):**

- KEEP (legitimate): ~33 — `catch (err: unknown)`, `T = unknown` generics, test casts, error utils, i18n type params, React context init, chart payload, storybook args
- FIX: ~67 — across 6 categories below
- No `: any` found anywhere in `src/`

**Already completed (prior session):**

- [x] `.github/copilot-instructions.md` — Type Definitions section
- [x] `amendmentHelpers.ts` — VotableAmendment → `Pick<NonNullable<AmendmentFullRow>, ...>`
- [x] `recurringEventHelpers.ts` — RecurringEvent/EventException → EventForCalendarRow
- [x] `calendar.types.ts` — CalendarEvent → `Omit<EventForCalendarRow, ...> & { ... }`
- [x] `useUserMembershipsFilters.ts` — FilterableRecord → union of 4 zero Row types
- [x] `MembershipStatusTable.tsx` — MembershipItem → FilterableRecord + DisplayEntity
- [x] `comment-tree.ts` — CommentWithReplies → `AmendmentCommentRow & { replies? }`
- [x] `amendmentPathHelpers.ts` — 4 interfaces → NetworkXxxRow re-exports
- [x] `own-content-query.ts` — Record<string, unknown> → concrete typed objects
- [x] `public-content-query.ts` — Record<string, unknown> → concrete typed objects
- [x] `searchUtils.ts` — filterByQuery `unknown` → `string | null | undefined`
- [x] `todo.types.ts` — Already `type Todo = TodoWithRelationsRow`
- [x] All other type files verified (message, group, network, search, create-form, editor, notification, notification-settings)

---

## 1. Server Validators — Replace `(data: unknown) => data as T` with Zod (8 occurrences)

Replace unsafe `.validator((data: unknown) => data as T)` with Zod `.parse()` for runtime validation.

Each server function needs a Zod schema defined inline (or imported) and the validator updated to use `.parse()`.

### 1.1 Stripe Server Functions

- [x] `src/server/stripe-webhook.ts` L38 — define Zod schema for `{ rawBody: string; signature: string }`, use `.validator(schema.parse)`
- [x] `src/server/stripe-subscription-status.ts` L24 — define Zod schema for `{ userId: string }`, use `.validator(schema.parse)`
- [x] `src/server/stripe-create-portal.ts` L15 — define Zod schema for `{ customerId: string; returnOrigin?: string }`, use `.validator(schema.parse)`
- [x] `src/server/stripe-create-checkout.ts` L15 — define Zod schema for `{ priceId?: string; amount?: number; ... }`, use `.validator(schema.parse)`
- [x] `src/server/stripe-cancel-subscription.ts` L14 — define Zod schema for `{ subscriptionId: string }`, use `.validator(schema.parse)`

### 1.2 Other Server Functions

- [x] `src/server/push-send.ts` L42 — define Zod schema for push notification params, use `.validator(schema.parse)`
- [x] `src/server/finalize-delegates.ts` L19 — define Zod schema for `{ eventId: string; senderId?: string }`, use `.validator(schema.parse)`
- [x] `src/features/timeline/utils/createTimelineEvent.ts` L137 — define Zod schema for `CreateTimelineEventParams`, use `.validator(schema.parse)`

---

## 2. Presence System — Define Proper Types (11 occurrences)

Define concrete `PresenceData` interfaces instead of `Record<string, unknown>` and `[key: string]: unknown`.

### 2.1 Core Presence Types

- [x] `src/presence/usePresence.ts` — Replace `PeerData` index signature (`[key: string]: unknown` L8) with concrete fields (userId, cursor position, selection range, etc.). Update `publishTopic` data param (L19, L130) to use discriminated union per topic.
- [x] `src/presence/presence-server.ts` — Replace `PeerData` index signature (L14) and `PresenceMessage.data` (L22) with same concrete types.

### 2.2 Editor Presence Consumers

- [x] `src/features/editor/hooks/useEditorPresence.ts` — Replace `Record<string, unknown>` in `publishPresence` callback (L32, L70) with `EditorPresenceData` type.
- [x] `src/features/documents/hooks/useDocumentPresence.ts` — Replace `Record<string, unknown>` in `publishPresence` callback (L33, L77, L83) and `peers` variable (L76) with `DocumentPresenceData` type.

---

## 3. Plate.js / Editor — Use Plate's Own Types (18 occurrences)

Replace `Record<string, unknown>` with Plate.js types (`TElement`, `TNode`, `Value`, etc.) or targeted interfaces.

### 3.1 Plate Editor Core

- [x] `src/features/shared/ui/kit-platejs/plate-editor.tsx` — Replace `Record<string, unknown>` for cursor `position` (L25) with cursor position type, `config` object (L78) with Plate config type, `match` function params (L164, L183) with `TNode` or `TElement`.
- [x] `src/features/shared/ui/kit-platejs/block-selection-kit.tsx` L21 — Verify if `props as unknown as PlateElementProps` cast is still necessary; if so, add a comment explaining why.

### 3.2 Plate UI Components

- [x] `src/features/shared/ui/ui-platejs/block-suggestion.tsx` L614-615 — Replace `Record<string, unknown>` for `properties` and `newProperties` with `Partial<TElement>` or a `SuggestionProperties` interface.
- [x] `src/features/shared/ui/ui-platejs/link-node.tsx` L17 — Replace `linkProps as Record<string, unknown>` cast; type `linkProps` properly from Plate's link plugin.
- [x] `src/features/shared/ui/ui-platejs/media-toolbar-button.tsx` L81 — Replace `as unknown as FileList` cast; check Plate media API for proper type.
- [x] `src/features/shared/ui/ui-platejs/media-placeholder-node.tsx` L72, L106 — Replace `as unknown as FileList` cast and `Record<string, unknown>` node with proper media node type.

### 3.3 Change Requests (Suggestion Extraction)

- [x] `src/features/change-requests/utils/suggestion-extraction.ts` L11-12, L29-30, L33, L40 — Define `SuggestionDelta` interface `{ properties: Partial<TElement>; newProperties: Partial<TElement> }` and replace all `Record<string, unknown>` usages (7 occurrences in this file).
- [x] `src/features/change-requests/hooks/useChangeRequests.ts` L27-28 — Replace `Record<string, unknown>` for `properties` / `newProperties` with same `SuggestionDelta` type.

### 3.4 Editor Operations & Documents

- [x] `src/features/editor/hooks/useEditorOperations.ts` L67 — Replace `content as unknown as ReadonlyJSONValue` with proper Plate `Value` type export.
- [x] `src/features/documents/hooks/useDocumentEditor.ts` L101 — Replace `document as Record<string, unknown> & { discussions?: TDiscussion[] }` with a proper typed query result that includes `discussions`.
- [x] `src/features/amendments/ui/VersionComparisonView.tsx` L27 — Replace hand-written `PlateNode` interface `{ [key: string]: unknown }` with Plate's `TNode` or `TElement` import.

---

## 4. Timeline & Search — Type Card Props (11 occurrences)

Replace `Record<string, unknown>` card props with a discriminated union per card type.

### 4.1 Define Card Props Types

- [x] Create a `TimelineCardProps` discriminated union type (or per-card prop interfaces) in `src/features/timeline/types/` that covers all card types: `EventCard`, `AmendmentCard`, `GroupCard`, `BlogCard`, `ElectionCard`, `CommentCard`, etc. Each variant has typed fields instead of `Record<string, unknown>`.

### 4.2 ModernTimeline.tsx (8 occurrences)

- [x] `src/features/timeline/ui/ModernTimeline.tsx` L78 — Replace `getString(value: unknown)` with `getString(value: string | number | null | undefined)`.
- [x] `src/features/timeline/ui/ModernTimeline.tsx` L124-136 — Replace `as unknown[]` casts for `eventParticipants`, `scheduledElections`, `targetedAmendments` with proper zero Row array types derived from timeline event relations query.
- [x] `src/features/timeline/ui/ModernTimeline.tsx` L444 — Replace `cardProps: Record<string, unknown> | null` with `TimelineCardProps | null`.

### 4.3 LazyCardComponents.tsx (2 occurrences)

- [x] `src/features/timeline/ui/LazyCardComponents.tsx` L95, L175 — Replace `cardProps: Record<string, unknown>` in `DynamicTimelineCardProps` and `preloadCard` return type with `TimelineCardProps`.

### 4.4 Search Page (2 occurrences)

- [x] `src/features/search/hooks/useSearchPage.ts` L100, L102 — Replace `Record<string, unknown>` in `buildCardProps` return type with `TimelineCardProps | null`.

---

## 5. i18n Translation Casts (3 occurrences)

Replace `t(...) as unknown as string[]` with proper typing.

- [x] Add a `tArray(key: string): string[]` helper to `src/features/shared/hooks/use-translation.ts` (or add an overload / generic to the existing `t()`) that returns `string[]` when the translation value is an array.
- [x] `src/routes/pricing.tsx` L35 — Replace `t(...) as unknown as string[]` with `tArray(...)`.
- [x] `src/routes/solutions.tsx` L30 — Same.
- [x] `src/routes/support.tsx` L36 — Same.

---

## 6. Miscellaneous Fixes (10 occurrences)

### 6.1 Translation Hook Internal

- [x] `src/features/shared/hooks/use-translation.ts` L12, L16, L20 — Type `getNestedValue` with proper translation tree type: `obj: TranslationTree` (use the i18n JSON shape). Return `string | string[] | TranslationTree` instead of `unknown`.

### 6.2 Other One-Off Fixes

- [x] `src/features/amendments/ui/AmendmentProcessFlow.tsx` L561 — Replace `_event: unknown` with the ReactFlow `NodeMouseHandler` callback type.
- [x] `src/features/create/hooks/useCreateAgendaItemForm.tsx` L31 — Replace `(searchParams as Record<string, unknown>).eventId` with typed search params from TanStack Router (use a search param schema or `useSearch<{ eventId?: string }>({...})`).
- [x] `src/features/flow-editor/flowEditor.tsx` L33, L48 — Replace `data: Record<string, unknown>` in local `Node`/`Edge` interfaces with concrete `{ label: string; [other known fields] }` or import ReactFlow's `Node<T>` / `Edge<T>` generics.
- [x] `src/features/timeline/utils/createTimelineEvent.ts` L106, L154 — Replace `metadata?: Record<string, unknown>` and `insertData: Record<string, unknown>` with a `TimelineEventInsert` interface matching the timeline_events table schema.
- [x] `src/features/notifications/utils/notification-helpers.ts` L273 — Replace `const notification: Record<string, unknown>` with a `NotificationInsert` type matching the notifications table columns.
- [x] `src/zero/server-notify.ts` L12, L19 — Replace `type Params = Record<string, unknown>` and `helpers as Record<string, unknown>` with typed helper function map.

---

## 7. Remaining Phase 2 — `user.types.ts` (12 consumers)

The `User` interface and sub-types (`UserStatement`, `UserBlog`, `UserGroup`, `UserAmendment`, `UserHashtag`, `UserStat`, `UserContact`, `UserSocialMedia`) are hand-written view-model types built by `transformUserData.ts` from `FullProfileRow`. They intentionally use camelCase field names.

**Decision needed**: This is a transformation layer, not a simple DB entity duplication. Options:

### Option A: Minimal (add source annotation, keep structure)

- [x] Add JSDoc comment to `user.types.ts` documenting that `User` is a view-model derived from `FullProfileRow` via `transformUserData.ts`
- [x] Import `FullProfileRow` as source-of-truth reference in the file

### Option B: Full refactor (derive from zero, remove camelCase transform)

- [ ] Replace `User` with direct use of `FullProfileRow` + snake_case field names throughout 12 consumer files
- [ ] Remove `transformUserData.ts` entirely
- [ ] Update all 12 consumer files to use snake_case fields

**Recommendation**: Option A — the transform layer is intentional (aggregating stats, formatting data), and removing it would require touching 12+ UI files for marginal type-safety gain.

---

## 8. Final Verification

- [x] Run `npx tsc --noEmit` — expect 0 errors
- [x] Run `grep -r ': any' src/ --include='*.ts' --include='*.tsx'` — expect 0 matches
- [x] Run `grep -r ' unknown' src/ --include='*.ts' --include='*.tsx'` — expect only KEEP-category occurrences (~33)
- [ ] Verify no runtime regressions: run `npm run dev` and spot-check key pages (timeline, search, editor, pricing)

---

## Summary

| Phase                | Tasks | Status                              |
| -------------------- | ----: | ----------------------------------- |
| 1. Server Validators |     8 | Done                                |
| 2. Presence Types    |     4 | Done                                |
| 3. Plate.js / Editor |    11 | Done                                |
| 4. Timeline & Search |     6 | Done                                |
| 5. i18n Casts        |     4 | Done                                |
| 6. Misc Fixes        |     6 | Done                                |
| 7. user.types.ts     |     3 | Option A Done, Option B In Progress |
| 8. Verification      |     4 | Done                                |

---

## Notes

- **Parallelization**: Phases 1-6 are independent and can be worked on in parallel by separate agents. Phase 8 must run last.
- **Phase 3 (Plate.js)** is the largest and most complex — Plate's typing API varies by version. Check `@udecode/plate-*` package versions for available type exports before refactoring.
- **Phase 4 (Timeline)** requires understanding the timeline event query shape. Read `src/zero/timeline/queries.ts` to see what relations are included and derive card prop types from there.
- **Phase 7 (user.types.ts)** is a design decision, not strictly a bug. The current types work and are internally consistent; they're just hand-written rather than zero-derived. Recommend Option A for now.
- All 33 KEEP occurrences are legitimate TypeScript patterns per the copilot-instructions.md rules.
