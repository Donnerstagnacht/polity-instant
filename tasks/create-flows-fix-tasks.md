# Create Flows — Fix & New Payment Flow Tasks

This document tracks all tasks needed to fix the broken create flows and add the new Payment creation flow.

**Progress Overview:**

- Total Tasks: 46
- Completed: 0
- Remaining: 46

---

## Root Cause Summary

| #   | Flow                      | Status              | Root Cause                                                                                                                                           |
| --- | ------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Create Group              | ✅ Works            | —                                                                                                                                                    |
| 2   | Create Event              | ❌ Broken           | `EventEdit` fetches a non-existent event by the new UUID → shows "Event not found"                                                                   |
| 3   | Create Amendment          | ❌ Broken           | `AmendmentEditContent` receives `amendment={undefined}` → shows "Amendment not found" + submit only calls `updateAmendment`, never `createAmendment` |
| 4   | Create Blog               | ❌ Broken (routing) | `CreateDashboard` links to `/create/blog` but route file is `blog-entry.tsx` (path `/create/blog-entry`). Form logic itself works.                   |
| 5   | Create Todo               | ✅ Works            | —                                                                                                                                                    |
| 6   | Create Statement          | ✅ Works            | —                                                                                                                                                    |
| 7   | Create Agenda Item        | ✅ Works            | Type-ahead selects use Zero queries correctly                                                                                                        |
| 8   | Create Election Candidate | ✅ Works            | Pending elections dropdown uses Zero query                                                                                                           |
| 9   | Create Position           | ✅ Works            | Group dropdown uses user memberships query                                                                                                           |
| 10  | Create Payment            | 🆕 New              | Needs new route + form + dashboard entry                                                                                                             |

---

## 1. Fix Create Event Flow (CRITICAL)

### Problem

`src/routes/_authed/create/event.tsx` generates a random UUID and passes it to `<EventEdit eventId={eventId} />`. `EventEdit` calls `useEventUpdate(eventId)` which calls `useEventData(eventId)` which queries `queries.events.byIdFull({ id: eventId })`. Since no event exists with that ID, the query returns null and the component renders "Event not found".

### Reference Pattern

`useGroupUpdate` in `src/features/groups/hooks/useGroupUpdate.ts` correctly handles create mode:

- Accepts optional `initialData` parameter
- Derives `isCreating = !initialData`
- Only populates form from data in edit mode
- Calls `createGroup()` vs `updateGroup()` based on mode

### 1.1 Refactor `useEventUpdate` to support create mode

- [ ] **1.1.1** In `src/features/events/hooks/useEventUpdate.ts`, add an optional `initialData` parameter (or `mode: 'create' | 'edit'`) to skip data fetching in create mode
- [ ] **1.1.2** When in create mode (`!initialData`), skip calling `useEventData(eventId)` — return `event: null` and `isLoading: false` immediately so the form renders with empty fields
- [ ] **1.1.3** Split the `handleSubmit` function: in create mode call `eventActions.createEvent({id: eventId, ...formData})`, in edit mode call `updateEvent(formData)` as today
- [ ] **1.1.4** After `createEvent`, call `commonActions.syncEntityHashtags('event', eventId, ...)` for hashtags (same as edit mode)
- [ ] **1.1.5** After successful creation, navigate to `/event/${eventId}`

### 1.2 Refactor `EventEdit` to handle create mode

- [ ] **1.2.1** In `src/features/events/ui/EventEdit.tsx`, accept an optional `mode?: 'create' | 'edit'` prop (default `'edit'`)
- [ ] **1.2.2** Pass mode to `useEventUpdate(eventId, mode)` so the hook knows to skip fetching
- [ ] **1.2.3** Remove or guard the `if (!event)` "not found" block — in create mode `event` will be null but that's expected, render the form anyway
- [ ] **1.2.4** Hide the `CancelEventDialog`/delete button in create mode (no event to delete yet)
- [ ] **1.2.5** Change page title/subtitle i18n keys to show "Create Event" vs "Edit Event" based on mode

### 1.3 Update the route

- [ ] **1.3.1** In `src/routes/_authed/create/event.tsx`, pass `mode="create"` to `<EventEdit eventId={eventId} mode="create" />`

---

## 2. Fix Create Amendment Flow (CRITICAL)

### Problem

`src/routes/_authed/create/amendment.tsx` passes `amendment={undefined}` to `AmendmentEditContent`. The component checks `if (!amendment)` and shows "Amendment not found". Even if that guard were bypassed, the submit handler early-returns with an error when `!amendment` and only calls `updateAmendment`, never `createAmendment`.

### 2.1 Add create mode to `AmendmentEditContent`

- [ ] **2.1.1** In `src/features/amendments/ui/AmendmentEditContent.tsx`, add a `mode?: 'create' | 'edit'` prop (derive from `amendment` being undefined, or accept explicitly)
- [ ] **2.1.2** When `mode === 'create'`, skip the `if (!amendment)` "not found" block — render the form with empty initial state
- [ ] **2.1.3** In the `handleSubmit` function, when `mode === 'create'`: call `amendmentActions.createAmendment({id: amendmentId, title, code, status, workflow_status, ...})` instead of `updateAmendment`
- [ ] **2.1.4** After `createAmendment`, sync hashtags via `commonActions.syncEntityHashtags('amendment', ...)` (same as edit mode)
- [ ] **2.1.5** After successful creation, navigate to `/amendment/${amendmentId}`

### 2.2 Update the route

- [ ] **2.2.1** In `src/routes/_authed/create/amendment.tsx`, pass `mode="create"` to `<AmendmentEditContent>`

### 2.3 Verify amendment create mutator

- [ ] **2.3.1** Confirm `src/zero/amendments/shared-mutators.ts` has a `create` mutator and it accepts the fields the form sends (title, code, status, workflow_status, visibility, supporters, image_url, etc.)
- [ ] **2.3.2** Confirm `useAmendmentActions` exposes a `createAmendment` function — if missing, add it following the pattern of existing actions like `updateAmendment`

---

## 3. Fix Create Blog Flow (Routing Bug)

### Problem

`CreateDashboard.tsx` links to `/create/blog` but the route file is `src/routes/_authed/create/blog-entry.tsx` which registers the path `/create/blog-entry`. Clicking "Create Blog" on the dashboard leads to a 404.

### 3.1 Fix the link

- [ ] **3.1.1** In `src/features/create/ui/CreateDashboard.tsx` line ~40, change `href: '/create/blog'` to `href: '/create/blog-entry'`

### 3.2 Verify blog form works end-to-end

- [ ] **3.2.1** Confirm `CreateBlogForm` can submit successfully — it calls `createBlogFull()` which creates blog + roles + action rights + blog_blogger entry
- [ ] **3.2.2** Confirm navigation to `/blog/${blogId}` works after creation

---

## 4. Verify Create Group Flow (Working — Sanity Check)

- [ ] **4.1** Confirm `src/routes/_authed/create/group.tsx` renders `GroupEditForm` with a fresh UUID and no `initialData`
- [ ] **4.2** Confirm `useGroupUpdate` calls `createGroup()` + `setupGroupAdminRoles()` in create mode
- [ ] **4.3** Confirm navigation works to `/group/${groupId}` after creation

---

## 5. Verify Create Todo Flow (Working — Sanity Check)

- [ ] **5.1** Confirm `src/routes/_authed/create/todo.tsx` form calls `useTodoMutations().createTodo()` with correct fields
- [ ] **5.2** Confirm title validation prevents empty submissions
- [ ] **5.3** Confirm navigation to `/user/${userId}` works after creation

---

## 6. Verify Create Statement Flow (Working — Sanity Check)

- [ ] **6.1** Confirm `src/routes/_authed/create/statement.tsx` form calls `useStatementMutations().createStatement()` with correct fields
- [ ] **6.2** Confirm text + tag validation prevents empty submissions
- [ ] **6.3** Confirm navigation to `/profile` works after creation

---

## 7. Verify Create Agenda Item Flow (Working — Sanity Check)

- [ ] **7.1** Confirm `TypeAheadSelect` for event selection works — `useAllEvents()` returns data from `queries.events.all({})`
- [ ] **7.2** Confirm `TypeAheadSelect` for amendment selection works (when type='vote') — `useAllAmendments()` returns data
- [ ] **7.3** Confirm `TypeAheadSelect` for position selection works (when type='election') — `usePositionsWithGroups()` returns data with group relations
- [ ] **7.4** Confirm election entity is created when type='election' alongside the agenda item
- [ ] **7.5** Confirm notification fires via `notifyAgendaItemCreated()`

---

## 8. Verify Create Election Candidate Flow (Working — Sanity Check)

- [ ] **8.1** Confirm pending elections dropdown populates from `useAgendaState({ includePendingElections: true }).pendingElections`
- [ ] **8.2** Confirm `addCandidate()` mutation sends correct fields (id, description, election_id, user_id, status, image_url)
- [ ] **8.3** Confirm `ImageUpload` component works for candidate photo

---

## 9. Verify Create Position Flow (Working — Sanity Check)

- [ ] **9.1** Confirm group dropdown populates from `useGroupState({ userId }).userMemberships`
- [ ] **9.2** Confirm `createPosition()` mutation sends correct fields (id, title, description, term, first_term_start, group_id)
- [ ] **9.3** Confirm navigation to `/group/${groupId}` works after creation

---

## 10. New: Create Payment Flow

### Context

Group operations page (`/group/$id/operation`) already has an `AddPaymentDialog` for creating payments within a group context. The new "Create Payment" flow on the `/create` dashboard needs a standalone form that lets the user select the group, direction, and details without being on a group page.

### Existing Infrastructure

- **Data layer**: `src/zero/payments/usePaymentActions.ts` — has `createPayment()`
- **Schema**: `src/zero/payments/schema.ts` — `createPaymentSchema` requires: id, amount, label, type, payer_user_id, payer_group_id, receiver_user_id, receiver_group_id
- **Existing dialog**: `src/features/groups/ui/AddPaymentDialog.tsx` — can be used as reference for field structure
- **Payment types**: membership_fee, donation, subsidies, campaign, material, events, others **(from AddPaymentDialog)**
- **Group query**: `useGroupState({ userId }).userMemberships` — for group selection dropdown

### 10.1 Create the route file

- [ ] **10.1.1** Create `src/routes/_authed/create/payment.tsx` with TanStack Router `createFileRoute('/_authed/create/payment')` exporting a `CreatePaymentPage` component
- [ ] **10.1.2** The page should be an inline form (like todo/statement) or import a dedicated form component

### 10.2 Build the payment creation form

- [ ] **10.2.1** Create `src/routes/_authed/create/payment.tsx` (inline form) with fields:
  - **Group** (required): `<select>` dropdown populated by `useGroupState({ userId }).userMemberships` — maps to payer_group_id or receiver_group_id depending on direction
  - **Direction** (required): Income / Expense toggle — determines which side the group is on (payer vs receiver)
  - **Entity selector** (optional): User/Group search for the counterparty — reuse pattern from `AddPaymentDialog`'s entity popover or use `TypeAheadSelect` with `GroupSelectCard`
  - **Label** (required): text input for payment description
  - **Type** (required): `<select>` dropdown with options: membership_fee, donation, subsidies, campaign, material, events, others
  - **Amount** (required): number input
- [ ] **10.2.2** On submit: call `usePaymentActions().createPayment()` with generated UUID and correct payer/receiver IDs based on direction
- [ ] **10.2.3** After successful creation, navigate to `/group/${groupId}/operation`
- [ ] **10.2.4** Add proper validation: require group, label, type, and amount > 0

### 10.3 Add to CreateDashboard

- [ ] **10.3.1** In `src/features/create/ui/CreateDashboard.tsx`, add a Payment item to the `operationalItems` array:
  ```ts
  { href: '/create/payment', icon: DollarSign, title: t('pages.create.payment.pageTitle'), description: t('pages.create.payment.description') }
  ```
- [ ] **10.3.2** Import `DollarSign` (or `Wallet`, `CreditCard`) from `lucide-react`

### 10.4 Add i18n keys

- [ ] **10.4.1** Add translation keys for `pages.create.payment.pageTitle` and `pages.create.payment.description` to the i18n files (check which i18n file pattern is used — likely `src/i18n/`)

---

## 11. Cross-Cutting: Type-Ahead & Search Verification

- [ ] **11.1** Confirm `src/components/ui/type-ahead-select.tsx` is generic and works with the current Zero data shapes (events, amendments, positions)
- [ ] **11.2** Confirm `src/components/ui/entity-select-cards.tsx` renders correctly for EventSelectCard, AmendmentSelectCard, PositionSelectCard — these are used by `CreateAgendaItemForm`
- [ ] **11.3** Verify that `useAllEvents()`, `useAllAmendments()`, `usePositionsWithGroups()` return the fields expected by the card components (title, status, description, group name, etc.)

---

## Summary

| Phase                        | Tasks | Status      | Parallelizable                |
| ---------------------------- | ----- | ----------- | ----------------------------- |
| 1. Fix Event Create          | 9     | Not Started | No (sequential refactor)      |
| 2. Fix Amendment Create      | 7     | Not Started | Yes (parallel with Phase 1)   |
| 3. Fix Blog Routing          | 2     | Not Started | Yes (parallel with Phase 1)   |
| 4. Verify Group              | 3     | Not Started | Yes (parallel)                |
| 5. Verify Todo               | 3     | Not Started | Yes (parallel)                |
| 6. Verify Statement          | 3     | Not Started | Yes (parallel)                |
| 7. Verify Agenda Item        | 5     | Not Started | Yes (parallel)                |
| 8. Verify Election Candidate | 3     | Not Started | Yes (parallel)                |
| 9. Verify Position           | 3     | Not Started | Yes (parallel)                |
| 10. New Payment Flow         | 8     | Not Started | Yes (parallel with Phase 1-2) |
| 11. Type-Ahead Verification  | 3     | Not Started | Yes (parallel)                |

### Recommended Execution Order

**Wave 1 (parallel):** Phases 1, 2, 3 — fix the three broken flows
**Wave 2 (parallel):** Phase 10 — new payment flow (can start alongside Wave 1)
**Wave 3 (parallel):** Phases 4-9, 11 — verification/sanity checks (can be batched)

---

## Key Files Reference

| File                                                                                                       | Role                                        |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [src/routes/\_authed/create/event.tsx](src/routes/_authed/create/event.tsx)                                | Event create route (broken)                 |
| [src/features/events/ui/EventEdit.tsx](src/features/events/ui/EventEdit.tsx)                               | Event edit/create form                      |
| [src/features/events/hooks/useEventUpdate.ts](src/features/events/hooks/useEventUpdate.ts)                 | Event form state hook (edit-only)           |
| [src/features/events/hooks/useEventData.ts](src/features/events/hooks/useEventData.ts)                     | Event data fetching                         |
| [src/zero/events/useEventActions.ts](src/zero/events/useEventActions.ts)                                   | Event mutations (has createEvent)           |
| [src/routes/\_authed/create/amendment.tsx](src/routes/_authed/create/amendment.tsx)                        | Amendment create route (broken)             |
| [src/features/amendments/ui/AmendmentEditContent.tsx](src/features/amendments/ui/AmendmentEditContent.tsx) | Amendment edit/create form (edit-only)      |
| [src/zero/amendments/useAmendmentActions.ts](src/zero/amendments/useAmendmentActions.ts)                   | Amendment mutations                         |
| [src/features/create/ui/CreateDashboard.tsx](src/features/create/ui/CreateDashboard.tsx)                   | Dashboard with all create links             |
| [src/features/groups/hooks/useGroupUpdate.ts](src/features/groups/hooks/useGroupUpdate.ts)                 | **Reference**: working create/edit pattern  |
| [src/features/groups/ui/AddPaymentDialog.tsx](src/features/groups/ui/AddPaymentDialog.tsx)                 | **Reference**: existing payment creation UI |
| [src/zero/payments/usePaymentActions.ts](src/zero/payments/usePaymentActions.ts)                           | Payment mutations (has createPayment)       |
| [src/zero/payments/schema.ts](src/zero/payments/schema.ts)                                                 | Payment validation schema                   |
| [src/components/ui/type-ahead-select.tsx](src/components/ui/type-ahead-select.tsx)                         | Generic searchable dropdown                 |
| [src/components/ui/entity-select-cards.tsx](src/components/ui/entity-select-cards.tsx)                     | Card renderers for type-ahead               |

---

## Notes

- The working pattern to follow is `useGroupUpdate` which derives `isCreating = !initialData` and branches create vs update logic accordingly.
- All Zero mutations with toast feedback live in `src/zero/*/useXxxActions.ts` — the create flows should use these directly or via orchestration hooks in `src/features/*/hooks/`.
- `syncEntityHashtags` from `useCommonActions` is the standard way to manage hashtags across all entities — used in create and edit modes for events, amendments, blogs, groups.
- The `createBlogFull()` pattern (atomic multi-entity creation: blog + roles + rights + entry) should be considered for events and amendments if they also need role/permission setup on creation.
- Payment types (membership_fee, donation, subsidies, campaign, material, events, others) are already defined in `AddPaymentDialog` — reuse.
