# Create Flows Rewrite — Comprehensive Task Plan

This document tracks all tasks needed to:

1. Add missing inputs from old create flows to the new flows
2. Add a summary/review card as the last step before creation
3. Support two form styles: **one-page scroll** and **carousel** (swipeable)
4. Persist form style preference in user settings (schema change)
5. Add a progress indicator visible in both form modes
6. Make all search inputs use typeahead
7. Make all inputs reusable across flows and both form styles

**Progress Overview:**

- Total Tasks: 80
- Completed: 0
- Remaining: 80

---

## Gap Analysis: Old vs New Create Flows

Below is the per-flow comparison of missing inputs that need to be added to the new flows.

### Amendment

| Old Field                  | Old Step | Present in New?  | Notes                                                          |
| -------------------------- | -------- | ---------------- | -------------------------------------------------------------- |
| Title                      | Step 0   | YES              |                                                                |
| Subtitle                   | Step 0   | YES              |                                                                |
| Target Group (typeahead)   | Step 1   | NO — **MISSING** | TypeAhead search for groups                                    |
| Target Event (typeahead)   | Step 1   | NO — **MISSING** | TypeAhead search for events within group                       |
| Target Path display        | Step 1   | NO — **MISSING** | Auto-generated path through groups                             |
| Visibility selector        | Step 2   | NO — **MISSING** | public/authenticated/private                                   |
| Hashtags                   | Step 2   | YES              | HashtagEditor                                                  |
| Video URL                  | Step 3   | YES              | VideoUpload                                                    |
| Video Thumbnail            | Step 3   | YES              | Conditional ImageUpload                                        |
| Code (textarea)            | —        | YES (new only)   | 10-row textarea                                                |
| Status (select)            | —        | YES (new only)   | Drafting/Review/Passed/Rejected                                |
| Date                       | —        | YES (new only)   |                                                                |
| Supporters (number)        | —        | YES (new only)   |                                                                |
| Workflow Status            | —        | YES (new only)   |                                                                |
| Auto Close Voting (switch) | —        | YES (new only)   |                                                                |
| Image upload               | —        | YES (new only)   |                                                                |
| Review step                | Step 4   | Partial          | New has optional modal review. Needs full inline summary step. |

### Event

| Old Field                       | Old Step | Present in New?  | Notes                                                     |
| ------------------------------- | -------- | ---------------- | --------------------------------------------------------- |
| Title                           | Step 0   | YES              |                                                           |
| Description                     | Step 0   | YES              |                                                           |
| Start Date                      | Step 1   | YES              | (datetime-local in new)                                   |
| Start Time                      | Step 1   | YES              | (merged with date in new)                                 |
| End Date                        | Step 1   | YES              |                                                           |
| End Time                        | Step 1   | YES              |                                                           |
| Recurring Pattern               | Step 1   | NO — **MISSING** | none/daily/weekly/monthly/yearly/four-yearly              |
| Recurring End Date              | Step 1   | NO — **MISSING** | Conditional on recurring ≠ 'none'                         |
| Group (typeahead)               | Step 2   | NO — **MISSING** | TypeAhead search for user's groups                        |
| Event Type (radio)              | Step 3   | NO — **MISSING** | delegate_conference/general_assembly/open_assembly/other  |
| Allocation Mode (radio)         | Step 3   | NO — **MISSING** | ratio/total (if delegate_conference)                      |
| Delegate Ratio (number)         | Step 3   | NO — **MISSING** | Conditional                                               |
| Total Delegates (number)        | Step 3   | NO — **MISSING** | Conditional                                               |
| Location Type (button group)    | Step 4   | Partial          | New has single text input, old had online/physical toggle |
| Meeting Link                    | Step 4   | NO — **MISSING** | If online                                                 |
| Access Code                     | Step 4   | NO — **MISSING** | If online                                                 |
| Venue Name                      | Step 4   | NO — **MISSING** | If physical (new has generic location)                    |
| Street                          | Step 4   | NO — **MISSING** | If physical                                               |
| House Number                    | Step 4   | NO — **MISSING** | If physical                                               |
| Postal Code                     | Step 4   | NO — **MISSING** | If physical                                               |
| City                            | Step 4   | NO — **MISSING** | If physical                                               |
| Delegate Nomination Deadline    | Step 5   | NO — **MISSING** | Conditional on delegate_conference                        |
| Proposal Submission Deadline    | Step 5   | NO — **MISSING** | Conditional                                               |
| Amendment Cutoff Deadline       | Step 5   | NO — **MISSING** | Conditional                                               |
| Event Visibility (button group) | Step 6   | Partial          | New has Switch (isPublic), old had 3-way visibility       |
| Participant List Visibility     | Step 6   | NO — **MISSING** | public/authenticated/private                              |
| Max Participants / Capacity     | Step 6   | YES              |                                                           |
| Review step                     | Step 7   | Partial          | New has optional modal. Needs full inline summary step.   |

### Group

| Old Field                          | Old Step | Present in New?  | Notes                                                   |
| ---------------------------------- | -------- | ---------------- | ------------------------------------------------------- |
| Name                               | Step 0   | YES              |                                                         |
| Description                        | Step 0   | YES              |                                                         |
| Invite Members (user typeahead)    | Step 1   | NO — **MISSING** | TypeAhead search for users with add/remove              |
| Invited Users list                 | Step 1   | NO — **MISSING** | Scrollable card list                                    |
| Visibility                         | Step 2   | NO — **MISSING** | public/authenticated/private (new has no visibility)    |
| Hashtags                           | Step 2   | YES              | HashtagEditor                                           |
| Link Groups (group typeahead)      | Step 3   | NO — **MISSING** | TypeAhead + relationship type + rights                  |
| Relationship Type                  | Step 3   | NO — **MISSING** | parent/child                                            |
| Rights Selection                   | Step 3   | NO — **MISSING** | 5 rights multi-select                                   |
| Linked Groups list                 | Step 3   | NO — **MISSING** | Cards with remove                                       |
| Constitutional Event toggle        | Step 4   | NO — **MISSING** | Switch with conditional event fields                    |
| Event Name (if const. event)       | Step 4   | NO — **MISSING** | Text input                                              |
| Event Location (if const. event)   | Step 4   | NO — **MISSING** | Text input                                              |
| Event Start Date (if const. event) | Step 4   | NO — **MISSING** | Date input                                              |
| Event Start Time (if const. event) | Step 4   | NO — **MISSING** | Time input                                              |
| Location (city)                    | —        | YES (new only)   |                                                         |
| Region                             | —        | YES (new only)   |                                                         |
| Country                            | —        | YES (new only)   |                                                         |
| Social Media (5 fields)            | —        | YES (new only)   |                                                         |
| Image upload                       | —        | YES (new only)   |                                                         |
| Review step                        | Step 5   | Partial          | New has optional modal. Needs full inline summary step. |

### Todo

| Old Field               | Old Step | Present in New?  | Notes                                       |
| ----------------------- | -------- | ---------------- | ------------------------------------------- |
| Title                   | Step 0   | YES              |                                             |
| Description             | Step 0   | YES              |                                             |
| Due Date                | Step 1   | YES              |                                             |
| Priority (button group) | Step 1   | YES              | (native select in new, button group in old) |
| Status (button group)   | Step 1   | NO — **MISSING** | todo/in_progress/completed                  |
| Visibility              | Step 2   | NO — **MISSING** | public/authenticated/private                |
| Tags (add/remove)       | Step 2   | NO — **MISSING** | Tag management                              |
| Review step             | Step 3   | YES (partial)    | New has review as 2nd step                  |

### Statement

| Old Field        | Old Step | Present in New? | Notes                                             |
| ---------------- | -------- | --------------- | ------------------------------------------------- |
| Text (textarea)  | Step 0   | YES             |                                                   |
| Tag (text input) | Step 1   | YES             |                                                   |
| Visibility       | Step 1   | YES             | (native select in new, VisibilitySelector in old) |
| Review step      | Step 2   | YES             |                                                   |

### Blog

| Old Field   | Old Step | Present in New? | Notes |
| ----------- | -------- | --------------- | ----- |
| Title       | Step 0   | YES             |       |
| Date        | Step 0   | YES             |       |
| Cover Image | Step 0   | YES             |       |
| Visibility  | Step 1   | YES             |       |
| Hashtags    | Step 1   | YES             |       |
| Review step | Step 2   | YES             |       |

### Election Candidate

| Old Field                                   | Old Step | Present in New?  | Notes                                      |
| ------------------------------------------- | -------- | ---------------- | ------------------------------------------ |
| Election (typeahead in old → select in new) | Step 0   | YES (downgraded) | Old used TypeAhead, new uses native select |
| Order (number input)                        | Step 0   | NO — **MISSING** | Candidate ordering                         |
| Name (text input)                           | Step 1   | NO — **MISSING** | Old had separate name field                |
| Description (textarea)                      | Step 1   | YES              | (called "Statement" in new)                |
| Image URL (text input in old)               | Step 1   | YES (upgraded)   | New uses ImageUpload                       |
| Review step                                 | Step 2   | YES              |                                            |

### Position

| Old Field                                | Old Step | Present in New?  | Notes                                      |
| ---------------------------------------- | -------- | ---------------- | ------------------------------------------ |
| Group (typeahead in old → select in new) | Step 0   | YES (downgraded) | Old used TypeAhead, new uses native select |
| Title                                    | Step 0   | YES              |                                            |
| Description                              | Step 1   | YES              |                                            |
| Term (number, months)                    | Step 1   | YES              |                                            |
| First Term Start (date)                  | Step 1   | YES              |                                            |
| Review step                              | Step 2   | YES              |                                            |

### Agenda Item

_(No old equivalent — fully new flow)_

- All fields already present
- Already has 4-step carousel with review

### Payment

_(No old equivalent — fully new flow)_

- All fields already present
- Has review step

---

## 1. Schema & Data Layer — User Form Style Preference

### 1.1 SQL Schema

- [ ] **1.1.1** Add `user_preference` table to `supabase/schemas/` with columns: `id UUID PK`, `user_id UUID FK UNIQUE`, `create_form_style TEXT NOT NULL DEFAULT 'carousel'` (values: `'one_page'`, `'carousel'`, `'auto'`), `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`

### 1.2 Zero Table Definition

- [ ] **1.2.1** Create `src/zero/preferences/table.ts` with Zero table definition for `user_preference`

### 1.3 Zod Validation Schema

- [ ] **1.3.1** Create `src/zero/preferences/schema.ts` with `createPreferenceSchema`, `updatePreferenceSchema`, `selectPreferenceSchema`, and `UserPreference` type

### 1.4 Queries

- [ ] **1.4.1** Create `src/zero/preferences/queries.ts` with `preferenceQueries.byUser` query (fetch by user_id)

### 1.5 Mutators

- [ ] **1.5.1** Create `src/zero/preferences/shared-mutators.ts` with `create` and `update` mutators

### 1.6 Reactive Read Hook

- [ ] **1.6.1** Create `src/zero/preferences/usePreferenceState.ts` to expose `createFormStyle` and `isLoading`

### 1.7 Write Hook

- [ ] **1.7.1** Create `src/zero/preferences/usePreferenceActions.ts` with `updateFormStyle` action (with toast)

### 1.8 Registration

- [ ] **1.8.1** Create `src/zero/preferences/index.ts` barrel export
- [ ] **1.8.2** Register `user_preference` table in the Zero schema (main schema file)
- [ ] **1.8.3** Register preference queries in the queries registry
- [ ] **1.8.4** Register preference mutators in the mutators registry

---

## 2. Reusable Form Infrastructure

### 2.1 Form Step Types & State Management

- [ ] **2.1.1** Create `src/features/create/types/create-form.types.ts` — types for `FormStep` (label, fields, validation fn, optional flag), `FormStyle` (`'one_page' | 'carousel' | 'auto'`), `CreateFormConfig` (steps array, entity type, gradient), shared `FormStepProps`

### 2.2 Form Style Hook

- [ ] **2.2.1** Create `src/features/create/hooks/useFormStyle.ts` — reads `createFormStyle` from preferences, resolves `'auto'` based on screen width via `useMediaQuery` (desktop ≥ 1024px → one_page, else → carousel), returns resolved `formStyle`

### 2.3 Progress Indicator Component

- [ ] **2.3.1** Create `src/features/create/ui/CreateProgressIndicator.tsx` — shows current step / total steps, step labels, clickable navigation (only to completed/valid steps), uses existing `progress.tsx` bar + step dots/labels. Works in both carousel and one-page mode (in one-page mode highlights current section in viewport).

### 2.4 Carousel Form Layout

- [ ] **2.4.1** Create `src/features/create/ui/CarouselFormLayout.tsx` — wraps Embla carousel, renders each step in a `CarouselItem`, adds swipe support (already built-in to Embla), renders Back/Next buttons, Next disabled if current step validation fails, renders progress indicator at top

### 2.5 One-Page Form Layout

- [ ] **2.5.1** Create `src/features/create/ui/OnePageFormLayout.tsx` — renders all steps in a scrollable column with section headers, renders progress indicator as a sticky sidebar or top bar tracking scroll position, renders Create button at bottom

### 2.6 Adaptive Form Shell

- [ ] **2.6.1** Create `src/features/create/ui/CreateFormShell.tsx` — master wrapper that reads `useFormStyle()`, chooses `CarouselFormLayout` or `OnePageFormLayout`, passes steps + progress + review step + create handler. Each form only needs to define steps and plug into this shell.

### 2.7 Review/Summary Step Component

- [ ] **2.7.1** Create `src/features/create/ui/CreateSummaryStep.tsx` — generic summary step that receives field data and renders `CreateReviewCard` + `SummaryField` entries, with a prominent "Create" button. Reuses existing `CreateReviewCard` styling with entity-specific gradient from `content-type-config.ts`.

### 2.8 Form Style Selector

- [ ] **2.8.1** Create `src/features/create/ui/FormStyleSelector.tsx` — small UI widget (e.g., segmented control or dropdown in form header) to switch between "One Page", "Carousel", "Auto". Calls `usePreferenceActions().updateFormStyle()` to persist change.

---

## 3. Reusable Input Components for Create Forms

All inputs should be usable standalone in both carousel and one-page layouts. They receive value + onChange props.

### 3.1 Entity Search Inputs (TypeAhead)

- [ ] **3.1.1** Create `src/features/create/ui/inputs/GroupSearchInput.tsx` — wraps `TypeAheadSelect` for groups, uses `GroupSelectCard` rendering, searches by name/description
- [ ] **3.1.2** Create `src/features/create/ui/inputs/EventSearchInput.tsx` — wraps `TypeAheadSelect` for events, uses `EventSelectCard`, optionally filtered by group_id
- [ ] **3.1.3** Create `src/features/create/ui/inputs/UserSearchInput.tsx` — wraps `TypeAheadSelect` for users, uses `UserSearchCard` or avatar card, excludes current user, supports multi-select with add/remove list
- [ ] **3.1.4** Create `src/features/create/ui/inputs/ElectionSearchInput.tsx` — wraps `TypeAheadSelect` for elections, uses `ElectionSelectCard`, filters to pending elections
- [ ] **3.1.5** Create `src/features/create/ui/inputs/AmendmentSearchInput.tsx` — wraps `TypeAheadSelect` for amendments, uses `AmendmentSelectCard`
- [ ] **3.1.6** Create `src/features/create/ui/inputs/PositionSearchInput.tsx` — wraps `TypeAheadSelect` for positions, uses `PositionSelectCard`
- [ ] **3.1.7** Create `src/features/create/ui/inputs/EntitySearchInput.tsx` — wraps user/group search with entity type toggle (for payment flow), uses Popover+Command pattern

### 3.2 Selection Inputs (non-search)

- [ ] **3.2.1** Create `src/features/create/ui/inputs/VisibilityInput.tsx` — wraps existing `VisibilitySelector`, adds label + form integration
- [ ] **3.2.2** Create `src/features/create/ui/inputs/RecurringPatternInput.tsx` — button group for none/daily/weekly/monthly/yearly/four-yearly
- [ ] **3.2.3** Create `src/features/create/ui/inputs/EventTypeInput.tsx` — radio group for delegate_conference/general_assembly/open_assembly/other with conditional delegate config (allocation mode, ratio, total)
- [ ] **3.2.4** Create `src/features/create/ui/inputs/LocationTypeInput.tsx` — button group for online/physical with conditional fields (meeting link + access code OR venue + street + house number + postal code + city)
- [ ] **3.2.5** Create `src/features/create/ui/inputs/PriorityInput.tsx` — button group for low/medium/high
- [ ] **3.2.6** Create `src/features/create/ui/inputs/StatusInput.tsx` — button group for todo/in_progress/completed
- [ ] **3.2.7** Create `src/features/create/ui/inputs/DirectionInput.tsx` — toggle buttons for income/expense (payment)
- [ ] **3.2.8** Create `src/features/create/ui/inputs/PaymentTypeInput.tsx` — select for membership_fee/donation/subsidies/campaign/material/events/others
- [ ] **3.2.9** Create `src/features/create/ui/inputs/AgendaTypeInput.tsx` — wraps existing TypeSelector for election/vote/speech/discussion

### 3.3 Composite Inputs

- [ ] **3.3.1** Create `src/features/create/ui/inputs/DateTimeRangeInput.tsx` — start date/time + end date/time pair with validation (end ≥ start)
- [ ] **3.3.2** Create `src/features/create/ui/inputs/DeadlinesInput.tsx` — delegate nomination, proposal submission, amendment cutoff (date + time each, max = event start date)
- [ ] **3.3.3** Create `src/features/create/ui/inputs/GroupRelationshipsInput.tsx` — group typeahead + relationship type (parent/child) + rights multi-select + add button + linked groups list with remove
- [ ] **3.3.4** Create `src/features/create/ui/inputs/ConstitutionalEventInput.tsx` — toggle switch + conditional event fields (name, location, start date, start time)
- [ ] **3.3.5** Create `src/features/create/ui/inputs/TagsInput.tsx` — tag add/remove with text input (for todos, uses custom tags not hashtags)
- [ ] **3.3.6** Create `src/features/create/ui/inputs/InviteMembersInput.tsx` — multi-user selection using `UserSearchInput` with list display, add/remove capabilities

### 3.4 Inputs Index

- [ ] **3.4.1** Create `src/features/create/ui/inputs/index.ts` — barrel export for all input components

---

## 4. Per-Flow Form Definitions (Step Configs + Missing Field Integration)

Each flow needs a hook that defines its steps, form state, validation, and submit handler. These hooks are consumed by `CreateFormShell`.

### 4.1 Amendment Create Flow

- [ ] **4.1.1** Create `src/features/create/hooks/useCreateAmendmentForm.ts` — define steps:
  - Step 1: Title, Subtitle (basic info)
  - Step 2: Target Group (typeahead) → Target Event (typeahead) → auto path **[NEW]**
  - Step 3: Image upload, Video upload + thumbnail
  - Step 4: Visibility selector **[NEW]**, Hashtags
  - Step 5: Code (textarea), Status (select)
  - Step 6 (Review): Summary card
- [ ] **4.1.2** Rewrite `src/features/amendments/ui/AmendmentEditContent.tsx` (or create new `src/routes/_authed/create/amendment.tsx`) to use `CreateFormShell` + `useCreateAmendmentForm`

### 4.2 Event Create Flow

- [ ] **4.2.1** Create `src/features/create/hooks/useCreateEventForm.ts` — define steps:
  - Step 1: Title, Description (basic info)
  - Step 2: Start date/time, End date/time, Recurring pattern + recurring end date **[NEW]**
  - Step 3: Group selection (typeahead) **[NEW]**
  - Step 4: Event type + delegate config **[NEW]**
  - Step 5: Location type (online/physical) + conditional fields **[NEW — replaces single text input]**
  - Step 6: Deadlines (conditional on delegate_conference) **[NEW]**
  - Step 7: Visibility (3-way) **[UPGRADE from Switch]**, Participant list visibility **[NEW]**, Capacity
  - Step 8: Image upload, Hashtags
  - Step 9 (Review): Summary card
- [ ] **4.2.2** Rewrite `src/features/events/ui/EventEdit.tsx` create path (or create new route) to use `CreateFormShell` + `useCreateEventForm`

### 4.3 Group Create Flow

- [ ] **4.3.1** Create `src/features/create/hooks/useCreateGroupForm.ts` — define steps:
  - Step 1: Name, Description (basic info)
  - Step 2: Image upload
  - Step 3: Invite members (typeahead, multi-select, list) **[NEW]**
  - Step 4: Visibility selector **[NEW]**, Hashtags
  - Step 5: Link groups (typeahead, relationship type, rights, list) **[NEW]**
  - Step 6: Constitutional event (toggle + conditional fields) **[NEW]**
  - Step 7: Location (city, region, country), Social media (5 fields)
  - Step 8 (Review): Summary card
- [ ] **4.3.2** Rewrite `src/features/groups/ui/GroupEditForm.tsx` create path (or create new route) to use `CreateFormShell` + `useCreateGroupForm`

### 4.4 Todo Create Flow

- [ ] **4.4.1** Create `src/features/create/hooks/useCreateTodoForm.ts` — define steps:
  - Step 1: Title, Description (basic info)
  - Step 2: Due Date, Priority (button group), Status (button group) **[NEW — status]**
  - Step 3: Visibility **[NEW]**, Tags (add/remove) **[NEW]**
  - Step 4 (Review): Summary card
- [ ] **4.4.2** Rewrite `src/routes/_authed/create/todo.tsx` to use `CreateFormShell` + `useCreateTodoForm`

### 4.5 Statement Create Flow

- [ ] **4.5.1** Create `src/features/create/hooks/useCreateStatementForm.ts` — define steps:
  - Step 1: Text (textarea)
  - Step 2: Tag, Visibility (upgrade native select → `VisibilitySelector`)
  - Step 3 (Review): Summary card
- [ ] **4.5.2** Rewrite `src/routes/_authed/create/statement.tsx` to use `CreateFormShell` + `useCreateStatementForm`

### 4.6 Blog Create Flow

- [ ] **4.6.1** Create `src/features/create/hooks/useCreateBlogForm.ts` — define steps:
  - Step 1: Title, Date, Cover Image
  - Step 2: Visibility, Hashtags
  - Step 3 (Review): Summary card
- [ ] **4.6.2** Rewrite `src/features/blogs/ui/CreateBlogForm.tsx` to use `CreateFormShell` + `useCreateBlogForm`

### 4.7 Election Candidate Create Flow

- [ ] **4.7.1** Create `src/features/create/hooks/useCreateElectionCandidateForm.ts` — define steps:
  - Step 1: Election (upgrade to typeahead) **[UPGRADE]**, Order (number) **[NEW]**
  - Step 2: Name **[NEW]**, Description/Statement, Image
  - Step 3 (Review): Summary card
- [ ] **4.7.2** Rewrite `src/routes/_authed/create/election-candidate.tsx` to use `CreateFormShell` + `useCreateElectionCandidateForm`

### 4.8 Position Create Flow

- [ ] **4.8.1** Create `src/features/create/hooks/useCreatePositionForm.ts` — define steps:
  - Step 1: Group (upgrade to typeahead) **[UPGRADE]**, Title
  - Step 2: Description, Term (months), First Term Start
  - Step 3 (Review): Summary card
- [ ] **4.8.2** Rewrite `src/routes/_authed/create/position.tsx` to use `CreateFormShell` + `useCreatePositionForm`

### 4.9 Agenda Item Create Flow (already complete — just adapt to shell)

- [ ] **4.9.1** Create `src/features/create/hooks/useCreateAgendaItemForm.ts` — define steps matching current 4-step carousel
- [ ] **4.9.2** Rewrite `src/features/agendas/ui/CreateAgendaItemForm.tsx` to use `CreateFormShell` + `useCreateAgendaItemForm`

### 4.10 Payment Create Flow (already complete — just adapt to shell)

- [ ] **4.10.1** Create `src/features/create/hooks/useCreatePaymentForm.ts` — define steps:
  - Step 1: Group, Direction (toggle), Label, Type (select)
  - Step 2: Amount, Entity type toggle, Entity selector (typeahead)
  - Step 3 (Review): Summary card
- [ ] **4.10.2** Rewrite `src/routes/_authed/create/payment.tsx` to use `CreateFormShell` + `useCreatePaymentForm`

---

## 5. Route Integration

### 5.1 Route Files

- [ ] **5.1.1** Update `src/routes/_authed/create/amendment.tsx` — import and render the new amendment create form using `CreateFormShell`
- [ ] **5.1.2** Update `src/routes/_authed/create/event.tsx` — import and render the new event create form
- [ ] **5.1.3** Update `src/routes/_authed/create/group.tsx` — import and render the new group create form
- [ ] **5.1.4** Update `src/routes/_authed/create/todo.tsx` — import and render the new todo create form
- [ ] **5.1.5** Update `src/routes/_authed/create/statement.tsx` — import and render the new statement create form
- [ ] **5.1.6** Update `src/routes/_authed/create/blog-entry.tsx` — import and render the new blog create form
- [ ] **5.1.7** Update `src/routes/_authed/create/election-candidate.tsx` — import and render the new election candidate create form
- [ ] **5.1.8** Update `src/routes/_authed/create/position.tsx` — import and render the new position create form
- [ ] **5.1.9** Update `src/routes/_authed/create/payment.tsx` — import and render the new payment create form

### 5.2 Dashboard Update

- [ ] **5.2.1** Add `FormStyleSelector` to `CreateDashboard.tsx` header so users can change their preference before entering any flow

---

## 6. Internationalization

- [ ] **6.1** Add i18n keys for all new input labels, placeholders, step names, and validation messages across all create flows
- [ ] **6.2** Add i18n keys for form style selector options ("One Page", "Carousel", "Auto")
- [ ] **6.3** Add i18n keys for progress indicator ("Step X of Y")
- [ ] **6.4** Add i18n keys for recurring patterns, event types, location types, allocation modes, rights names, relationship types

---

## 7. Cleanup

- [ ] **7.1** Remove old `create/` folder (root-level, from old repo) once all logic is transferred
- [ ] **7.2** Ensure all native HTML `<select>`, `<input>`, `<textarea>` elements in route files are replaced with shadcn/ui components (`Select`, `Input`, `Textarea`) for consistency

---

## Summary

| Phase                           | Tasks | Status      |
| ------------------------------- | ----- | ----------- |
| 1. Schema & Data Layer          | 12    | Not Started |
| 2. Reusable Form Infrastructure | 8     | Not Started |
| 3. Reusable Input Components    | 21    | Not Started |
| 4. Per-Flow Form Definitions    | 20    | Not Started |
| 5. Route Integration            | 10    | Not Started |
| 6. Internationalization         | 4     | Not Started |
| 7. Cleanup                      | 2     | Not Started |

---

## Architecture Notes

### Form State Management

Each flow's hook (`useCreateXxxForm`) manages its own form state via `useState` with a single form data object. Validation functions are co-located per step. The hook returns: `{ steps, formData, setFormData, currentStep, handleCreate, isSubmitting }`.

### Key Dependencies

- **Embla Carousel** (already installed) — powers swipeable carousel mode
- **Radix UI Progress** (already installed) — powers progress indicator
- **TypeAheadSelect** (existing) — all entity searches
- **content-type-config.ts** — entity-specific gradients for review cards

### Parallelization Strategy

The following can be implemented in parallel by separate agents:

- **Phase 1** (schema) — independent, should be done first
- **Phase 2** (infrastructure) — depends on Phase 1 types only
- **Phase 3.1** (search inputs) — can be done in parallel with Phase 3.2 and 3.3
- **Phase 3.2** (selection inputs) — independent of other 3.x sub-phases
- **Phase 3.3** (composite inputs) — may depend on 3.1 (UserSearchInput for InviteMembersInput)
- **Phase 4** — depends on Phase 2 + 3, but each flow (4.1–4.10) is independent of others
- **Phase 5** — depends on Phase 4
- **Phase 6** — can be done in parallel with Phase 4/5

### Execution Order

```
Phase 1 ──► Phase 2 ──► Phase 3 (parallel sub-phases) ──► Phase 4 (parallel flows) ──► Phase 5
                                                            │
                                                          Phase 6 (parallel with 4/5)
```
