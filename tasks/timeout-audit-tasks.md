# Timeout Audit — Remove Unnecessary Timeouts in `src/`

This document tracks the removal of unnecessary `setTimeout` calls in application code.
With Zero's local-first sync model, data is available instantly after a mutation — post-save
navigation delays are a stale pattern and should be removed.

**Progress Overview:**

- Total Tasks: 9
- Completed: 9
- Remaining: 0

---

## Scope

Only timeouts in `src/` (not tests/e2e). Debounce/throttle for UX (typeaheads, editor saves,
hover intents, animations, focus, accessibility, reconnect logic) are **excluded** — those are
legitimate.

---

## 1. Remove Post-Save Navigation Delays (6 files)

All of these follow the same anti-pattern: `setTimeout(() => navigate(...), 500)` after a
Zero mutation that has already resolved. With Zero, the local cache is updated synchronously
on `mutate()` — the destination route will have the data immediately.

**Fix pattern:** Replace `setTimeout(() => navigate({...}), 500)` with a direct `navigate({...})` call.

### 1.1 Feature: Blogs

- [x] **[useBlogEditPage.ts](src/features/blogs/hooks/useBlogEditPage.ts#L134)** — Removed `setTimeout`, navigates directly after `toast.success`.
- [x] **[useBlogUpdate.ts](src/features/blogs/hooks/useBlogUpdate.ts#L131)** — Same pattern. Removed timeout, navigates immediately.

### 1.2 Feature: Groups

- [x] **[useGroupUpdate.ts](src/features/groups/hooks/useGroupUpdate.ts#L167)** — Removed `setTimeout` and stale DB-wait comment. Navigates directly.

### 1.3 Feature: Events

- [x] **[useEventUpdate.ts](src/features/events/hooks/useEventUpdate.ts#L117)** — Removed `setTimeout`. Navigates directly.

### 1.4 Feature: Documents

- [x] **[useDocumentMutations.ts](src/features/documents/hooks/useDocumentMutations.ts#L76)** — Removed `setTimeout`. Navigates to editor immediately after creation.

### 1.5 Feature: Amendments

- [x] **[AmendmentEditContent.tsx](src/features/amendments/ui/AmendmentEditContent.tsx#L160)** — Removed `setTimeout`. Navigates directly.

---

## 2. Remove Dead Mock Code

- [x] **[groups.store.tsx](src/global-state/groups.store.tsx#L110)** — Removed fake 500ms API delay. Store is dead code (no imports) — consider deleting entirely in a separate cleanup.

---

## 3. Improvements to Consider (Non-blocking)

These are not bugs, but could be improved for consistency/correctness:

- [x] **[use-navigation-progress.ts](src/hooks/use-navigation-progress.ts)** — Replaced 1000ms `setTimeout` with `useRouterState({ select: (s) => s.status === 'pending' })`. Now reflects actual router state.
- [x] **[nav-item-list.tsx](src/navigation/nav-items/nav-item-list.tsx)** — Replaced 1000ms `setTimeout` with `useRouterState` pending check + `useEffect` to clear `loadingItem` when navigation completes.

---

## Timeouts to KEEP (No Action Required)

These are all legitimate and should **not** be removed:

| File                                                                                            | Delay          | Reason                                                                                                           |
| ----------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| [useEditor.ts](src/features/editor/hooks/useEditor.ts#L213)                                     | 2000ms         | Collaboration conflict guard — prevents remote sync from overwriting local edits                                 |
| [useEditor.ts](src/features/editor/hooks/useEditor.ts#L263)                                     | 500ms          | **Debounced title save** — prevents saving on every keystroke                                                    |
| [useEditor.ts content save](src/features/editor/hooks/useEditor.ts#L230)                        | 1000ms         | **Throttled content save** — `Date.now() - lastSaveTime < 1000` check (not a setTimeout but same throttle logic) |
| [useDocumentEditor.ts](src/features/documents/amendment-editor/hooks/useDocumentEditor.ts#L143) | 2000ms         | Collaboration conflict guard                                                                                     |
| [useDocumentEditor.ts](src/features/documents/amendment-editor/hooks/useDocumentEditor.ts#L203) | 500ms          | Debounced title save                                                                                             |
| [useDocumentEditor.ts](src/features/documents/amendment-editor/hooks/useDocumentEditor.ts#L258) | ≤1000ms        | Throttled discussions save                                                                                       |
| [useDocumentEditor (feature)](src/features/documents/hooks/useDocumentEditor.ts)                | 300-500ms      | Uses `useAutoSave` for debounce/throttle                                                                         |
| [useAutoSave.ts](src/hooks/useAutoSave.ts)                                                      | configurable   | Debounce/throttle infrastructure used by editors                                                                 |
| [state-switcher.tsx](src/navigation/toggles/state-switcher.tsx)                                 | 200-300ms      | Hover intent detection for dropdown menus                                                                        |
| [AuthGuard.tsx](src/features/auth/AuthGuard.tsx#L53)                                            | 100ms          | Auth race condition guard                                                                                        |
| [EnsureUser.tsx](src/features/auth/EnsureUser.tsx#L29)                                          | 8000ms         | Zero sync timeout fallback                                                                                       |
| [EventAgenda.tsx](src/features/agendas/ui/EventAgenda.tsx#L92)                                  | 100ms          | Auto-scroll after DOM update                                                                                     |
| [EventStream.tsx](src/features/events/ui/EventStream.tsx#L89)                                   | 100ms          | Auto-scroll after DOM update                                                                                     |
| [DecisionRow.tsx](src/features/decision-terminal/ui/DecisionRow.tsx#L35)                        | 500ms          | Flash animation cleanup                                                                                          |
| [useDecisionFlash.ts](src/features/decision-terminal/hooks/useDecisionFlash.ts#L92)             | configurable   | Flash state lifecycle                                                                                            |
| [useSearchURL.ts](src/features/search/hooks/useSearchURL.ts#L82)                                | 300ms          | URL debounce for search typeahead                                                                                |
| [useAccessibility.tsx](src/features/timeline/hooks/useAccessibility.tsx#L24)                    | 100ms          | Screen reader re-announce trick                                                                                  |
| [QuickComment.tsx](src/features/timeline/ui/cards/QuickComment.tsx#L96)                         | 0ms            | Focus after React re-render                                                                                      |
| [usePushSubscription.ts](src/hooks/usePushSubscription.ts#L162)                                 | 5000ms         | Service worker readiness timeout guard                                                                           |
| [ShareButton.tsx](src/components/shared/ShareButton.tsx#L58)                                    | 2000ms         | "Copied!" feedback reset                                                                                         |
| [usePresence.ts](src/presence/usePresence.ts#L94)                                               | 2000ms         | WebSocket reconnect delay                                                                                        |
| [notification-helpers.ts](src/utils/notification-helpers.ts#L263)                               | 0ms            | Async deferral for push notification                                                                             |
| [use-chat.ts](src/components/kit-platejs/use-chat.ts)                                           | 400ms/variable | Mock AI stream simulation                                                                                        |
| [emoji-node.tsx](src/components/ui-platejs/emoji-node.tsx)                                      | 100ms          | Emoji search debounce                                                                                            |
| [font-color-toolbar-button.tsx](src/components/ui-platejs/font-color-toolbar-button.tsx)        | 100ms          | Color picker debounce                                                                                            |
| [block-context-menu.tsx](src/components/ui-platejs/block-context-menu.tsx)                      | —              | Editor UX                                                                                                        |
| [ai-menu.tsx](src/components/ui-platejs/ai-menu.tsx)                                            | —              | Editor UX                                                                                                        |
| [code-block-node.tsx](src/components/ui-platejs/code-block-node.tsx)                            | —              | Editor UX                                                                                                        |
| [comment.tsx](src/components/ui-platejs/comment.tsx)                                            | —              | Editor UX                                                                                                        |
| [copilot-kit.tsx](src/components/kit-platejs/copilot-kit.tsx)                                   | 500ms          | Copilot debounce                                                                                                 |

### Why keep editor debounce/throttle?

The editor stores content as large JSON (Plate.js document tree). Unlike simple field updates
(e.g. saving a title string), editor content changes fire on every keystroke, cursor move, or
formatting action. Without debounce/throttle:

- **Every keystroke** would trigger a full JSON serialization + Zero mutate call
- The JSON payload can be **10-100KB+** for a real document
- This would flood the Zero sync engine with redundant writes
- Network bandwidth and server-side processing would spike unnecessarily

The 500ms debounce + 1000ms throttle is a well-established pattern for rich text editors.
The `useAutoSave` hook and the manual debounce in `useEditor.ts` / `useDocumentEditor.ts`
are correct and should be kept.

---

## Summary

| Phase                         | Tasks | Status   |
| ----------------------------- | ----- | -------- |
| 1. Remove navigation delays   | 6     | **Done** |
| 2. Remove dead mock code      | 1     | **Done** |
| 3. Loading state improvements | 2     | **Done** |

---

## Notes

- All 6 navigation delay removals are independent and can be done in parallel by sub-agents
- Phase 3 is non-blocking / optional — consider for a future iteration
- `setInterval` usages (voting timer, countdown, presence polling, upload progress) are all legitimate and not included in this audit
