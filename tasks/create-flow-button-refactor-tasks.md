# Create Flow: Replace Next Button with Create on Last Step

This document tracks all tasks needed to move the "Create" button from inside the `CreateSummaryStep` component into the layout navigation footer, replacing the "Next" button on the last step.

**Progress Overview:**

- Total Tasks: 16
- Completed: 0
- Remaining: 16

---

## Summary of Changes

**Current behavior:**

- `CarouselFormLayout` always shows Prev/Next buttons in its footer — Next is disabled on the last step (can't scroll further)
- `CreateSummaryStep` renders its own full-width Create button below the review card
- `OnePageFormLayout` has no footer buttons — the only Create button is inside `CreateSummaryStep`

**Target behavior:**

- `CarouselFormLayout` footer: on the last step, the Next button becomes a Create button (with loading state)
- `OnePageFormLayout`: a Create button is added at the bottom of the layout (only visible when scrolled to/near the review step)
- `CreateSummaryStep` no longer renders any button — it's purely a review card display

---

## 1. Shared Types & Props (no dependencies — do first)

### 1.1 Update layout component interfaces

- [ ] In `src/features/create/ui/CarouselFormLayout.tsx`, add `onSubmit` and `isSubmitting` to the `CarouselFormLayoutProps` interface
- [ ] In `src/features/create/ui/OnePageFormLayout.tsx`, add `onSubmit` and `isSubmitting` to the `OnePageFormLayoutProps` interface

---

## 2. Layout Components (depends on 1)

### 2.1 CarouselFormLayout — replace Next with Create on last step

- [ ] In `src/features/create/ui/CarouselFormLayout.tsx`:
  - Compute `isLastStep = currentStep === steps.length - 1`
  - When `isLastStep`, render a **Create** button (with `Loader2` spinner when `isSubmitting`) instead of the Next button
  - The Create button calls `onSubmit()` and is disabled when `isSubmitting` or when the current step is not valid
  - When NOT `isLastStep`, keep the existing Next button behavior unchanged
  - Import `Loader2` from `lucide-react` and `useTranslation` (already imported)

### 2.2 OnePageFormLayout — add Create button at bottom

- [ ] In `src/features/create/ui/OnePageFormLayout.tsx`:
  - Add a Create button after the steps list (below the last section)
  - The button calls `onSubmit()`, shows `Loader2` spinner when `isSubmitting`, and is disabled when submitting
  - Use the same i18n keys as the current `CreateSummaryStep` button: `t('pages.create.creating')` and `t('pages.create.summary.createButton')`
  - Import `Button` from `@/components/ui/button`, `Loader2` from `lucide-react`, `useTranslation` from `@/hooks/use-translation`

---

## 3. CreateFormShell — pass config through (depends on 1)

### 3.1 Pass onSubmit and isSubmitting to layout

- [ ] In `src/features/create/ui/CreateFormShell.tsx`:
  - Pass `onSubmit={config.onSubmit}` and `isSubmitting={config.isSubmitting}` to the `<Layout>` component

---

## 4. CreateSummaryStep — remove button (no dependencies)

### 4.1 Remove Create button from CreateSummaryStep

- [ ] In `src/features/create/ui/CreateSummaryStep.tsx`:
  - Remove the `<Button>` element and its surrounding wrapper
  - Remove `onSubmit` and `isSubmitting` from the props interface
  - Remove the `Button` and `Loader2` imports (if no longer used)
  - Remove unused i18n keys usage (`pages.create.creating`, `pages.create.summary.createButton`)
  - Keep the `CreateReviewCard` rendering intact

---

## 5. Update all 10 create form hooks (depends on 4)

Each hook's `CreateSummaryStep` usage must have `onSubmit` and `isSubmitting` props removed.

**These 10 tasks are fully independent of each other and can be done in parallel:**

### 5.1 useCreateGroupForm

- [ ] `src/features/create/hooks/useCreateGroupForm.tsx` — Remove `onSubmit={handleSubmit}` and `isSubmitting={isSubmitting}` from the `<CreateSummaryStep>` JSX (around line 159)

### 5.2 useCreateEventForm

- [ ] `src/features/create/hooks/useCreateEventForm.tsx` — Remove `onSubmit` and `isSubmitting` from `<CreateSummaryStep>` (around line 187)

### 5.3 useCreateTodoForm

- [ ] `src/features/create/hooks/useCreateTodoForm.tsx` — Remove `onSubmit` and `isSubmitting` from `<CreateSummaryStep>` (around line 118)

### 5.4 useCreateBlogForm

- [ ] `src/features/create/hooks/useCreateBlogForm.tsx` — Remove `onSubmit` and `isSubmitting` from `<CreateSummaryStep>` (around line 211)

### 5.5 useCreateAmendmentForm

- [ ] `src/features/create/hooks/useCreateAmendmentForm.tsx` — Remove `onSubmit` and `isSubmitting` from `<CreateSummaryStep>` (around line 135)

### 5.6 useCreateStatementForm

- [ ] `src/features/create/hooks/useCreateStatementForm.tsx` — Remove `onSubmit` and `isSubmitting` from `<CreateSummaryStep>` (around line 77)

### 5.7 useCreateElectionCandidateForm

- [ ] `src/features/create/hooks/useCreateElectionCandidateForm.tsx` — Remove `onSubmit` and `isSubmitting` from `<CreateSummaryStep>` (around line 97)

### 5.8 useCreatePositionForm

- [ ] `src/features/create/hooks/useCreatePositionForm.tsx` — Remove `onSubmit` and `isSubmitting` from `<CreateSummaryStep>` (around line 131)

### 5.9 useCreatePaymentForm

- [ ] `src/features/create/hooks/useCreatePaymentForm.tsx` — Remove `onSubmit` and `isSubmitting` from `<CreateSummaryStep>` (around line 174)

### 5.10 useCreateAgendaItemForm

- [ ] `src/features/create/hooks/useCreateAgendaItemForm.tsx` — Remove `onSubmit` and `isSubmitting` from `<CreateSummaryStep>` (around line 238)

---

## Summary

| Phase                | Tasks | Status      | Parallelizable         |
| -------------------- | ----- | ----------- | ---------------------- |
| 1. Types & Props     | 2     | Not Started | Yes (both independent) |
| 2. Layout Components | 2     | Not Started | Yes (both independent) |
| 3. CreateFormShell   | 1     | Not Started | Yes (with phase 2)     |
| 4. CreateSummaryStep | 1     | Not Started | Yes (with phases 1-3)  |
| 5. Form Hook Cleanup | 10    | Not Started | All 10 in parallel     |

**Optimal parallel plan:** Phases 1-4 can all be done in a single parallel batch (they edit different files). Phase 5 (all 10 hooks) can be done in a second parallel batch afterward.

---

## Notes

- The `onSubmit` and `isSubmitting` already exist on `CreateFormConfig` — they just need to be threaded through `CreateFormShell` → Layout components
- i18n keys `pages.create.creating` and `pages.create.summary.createButton` are already defined and can be reused by the layout components
- The `OnePageFormLayout` currently has no `useTranslation` — it will need to be added
- The `CarouselFormLayout` already imports `useTranslation`
- No Playwright tests need updating since the button text and behavior remain the same — just the placement changes
