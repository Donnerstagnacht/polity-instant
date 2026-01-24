# Timeline Card Refresh Implementation Tasks

This document tracks all tasks needed to update timeline cards (event/group/amendment/blog/user/statement/vote/election/todo/video/image/action) per requirements, including click behavior, stats bars, membership/RSVP popovers, share/subscribe actions, and fixes.

**Progress Overview:**

- Total Tasks: 36
- Completed: 0
- Remaining: 36

---

## 1. Discovery & Baseline Alignment

### 1.1 Inventory current card behaviors

- [ ] Review card components in src/features/timeline/ui/cards/ to map existing actions, stats, and links
- [ ] Identify which cards already use TimelineCardBase `href` and which need link wiring (Image, Action, etc.)
- [ ] Document current stats/hashtags support per card to avoid regressions

### 1.2 Locate reusable logic and hooks

- [ ] Catalog existing share behavior in src/features/events/EventWiki.tsx, src/features/groups/GroupWiki.tsx, src/features/user/wiki.tsx, and other feature pages
- [ ] Identify subscribe/participation/membership hooks and helpers used in event/group/user pages (e.g., EventSubscribeButton, useSubscribeEvent)
- [ ] Identify existing action popover patterns and toast/sonner usage for success/error feedback

---

## 2. Cross-Cutting Card Infrastructure Updates

### 2.1 Global click + subtitle link behavior

- [ ] Ensure TimelineCardBase handles left-click and middle/right open in new tab for all cards by providing `href` consistently
- [ ] Confirm TimelineCardHeader subtitle click uses `subtitleHref` for group name on event/amendment cards (already in base; ensure usage)
- [ ] Add card-level `href` to cards missing it (Action, Image, Video if needed) while avoiding nested anchor conflicts

### 2.2 Stats bar with icon + tooltip

- [ ] Standardize a stats row pattern (Tooltip on hover with title) across cards that need it
- [ ] Implement per-card stats requirements using icons + hover title text
- [ ] Update translations for new stat labels in src/i18n/locales/en/ and src/i18n/locales/de/

### 2.3 Action feedback (Sonner toasts)

- [ ] Add success/error toast feedback for all actions triggered from cards (join/leave/RSVP, subscribe, share, status changes)
- [ ] Reuse existing toast patterns (sonner) and ensure errors are surfaced gracefully

---

## 3. Event Card Updates

### 3.1 Event card content + layout

- [ ] Ensure card is clickable with `href` and group subtitle is linkable (subtitleHref)
- [ ] Append city/postcode to location if header does not include it (confirm buildLocationDisplay usage)
- [ ] Ensure hashtags render below description (HashtagDisplay placement)
- [ ] Render stats bar with tooltips for participants, elections, amendments

### 3.2 RSVP popover behavior + status

- [ ] Show RSVP button reflecting attendance status (participant/invited/requested/none)
- [ ] Implement popover actions: leave, accept invitation, withdraw request, request participation
- [ ] Reuse event participation logic/hooks from event page (src/features/events/…)
- [ ] Add toast feedback on RSVP actions

### 3.3 Share + subscribe fixes

- [ ] Replace card share button logic with EventWiki share behavior using ShareButton
- [ ] Wire subscribe toggle to EventWiki/subscribe hook and fix non-working state
- [ ] Remove details button (if present) from event card action bar

---

## 4. Group Card Updates

### 4.1 Stats + membership status

- [ ] Add stats bar with tooltips for members, events, amendments
- [ ] Show membership status on button and popover options (leave, accept, withdraw, request)
- [ ] Reuse group membership logic from group page and fix join/subscribe non-working state
- [ ] Add toast feedback for membership changes

### 4.2 Share + subscribe

- [ ] Add share button (reuse GroupWiki share logic)
- [ ] Add subscribe button using group subscribe logic from GroupWiki

---

## 5. Amendment Card Updates

### 5.1 Stats + hashtags

- [ ] Add stats bar with tooltips for collaborators, supporting groups, change requests
- [ ] Ensure hashtags render below description

### 5.2 Collaboration status popover

- [ ] Show collaboration status on button and popover options (leave, accept, withdraw, request)
- [ ] Reuse collaboration/membership logic from amendment features
- [ ] Add toast feedback for collaboration actions

### 5.3 Share + subscribe + discuss link

- [ ] Add share button (reuse Event share style but with amendment URL)
- [ ] Add subscribe button using amendment subscribe logic
- [ ] Ensure discuss button links to /amendment/[id]/discussions

---

## 6. Blog Card Updates

### 6.1 Stats + hashtags

- [ ] Add stats bar with tooltips for subscribers and comments
- [ ] Add hashtags below description/excerpt

### 6.2 Share + subscribe

- [ ] Add share button using blog share logic (see BlogDetail/BlogEditorView)
- [ ] Add subscribe button reusing user-page subscribe logic

---

## 7. User Card Updates

### 7.1 Stats bar

- [ ] Add stats bar with tooltips (define metrics based on user data: subscribers, groups, amendments, etc.)

### 7.2 Share + subscribe

- [ ] Add share button with user share logic (src/features/user/wiki.tsx)
- [ ] Add subscribe button reusing user subscribe logic

---

## 8. Statement Card Updates

- [ ] Add stats bar with tooltip labels for reactions/comments (confirm desired stats)
- [ ] Add share button using statement share logic

---

## 9. Vote Card Updates

- [ ] Add share button using vote share logic
- [ ] Update vote card `href` to link to event agenda item associated with the vote
- [ ] Confirm discuss action is preserved

---

## 10. Election Card Updates

- [ ] Add share button using election share logic
- [ ] Update election card `href` to link to event agenda item associated with the election

---

## 11. Todo Card Updates

- [ ] Add stats bar with tooltips (assignees, progress, etc.)
- [ ] Add share button using todo share logic
- [ ] Show status in action bar with a popover to set status (pending/in progress/completed/canceled)
- [ ] Remove volunteer button and add “Assign to me” action
- [ ] Add toast feedback for status changes and assignment

---

## 12. Video Card Updates

- [ ] Add stats bar with tooltips (views, likes, etc.)
- [ ] Add share button with video share logic; ensure link targets amendment
- [ ] On play, open popover/modal with video player (autoplay), not inline navigation
- [ ] Remove like button

---

## 13. Image Card Updates

- [ ] Add stats bar with tooltips (likes, comments, etc.)
- [ ] Add share button with image share logic; resolve share target (event/amendment/group/user/blog)
- [ ] Remove like and image action buttons

---

## 14. Activity (Action) Card Updates

- [ ] Add stats bar with tooltips if applicable (define metrics)
- [ ] Add share button using activity share logic

---

## 15. Validation & QA

### 15.1 i18n coverage

- [ ] Add/verify translation keys for new labels, statuses, and tooltip titles in src/i18n/locales/en/ and src/i18n/locales/de/

### 15.2 Functional checks

- [ ] Verify all cards open in same tab on left-click and new tab on middle/ctrl/cmd click
- [ ] Verify RSVP/join/subscribe buttons function from cards (event/group) and match page behavior
- [ ] Ensure popovers close after action, and toasts show success/error

---

## Summary

| Phase                 | Tasks | Status      |
| --------------------- | ----- | ----------- |
| Discovery & Baseline  | 2     | Not Started |
| Cross-Cutting Updates | 3     | Not Started |
| Event Card            | 3     | Not Started |
| Group Card            | 2     | Not Started |
| Amendment Card        | 3     | Not Started |
| Blog Card             | 2     | Not Started |
| User Card             | 2     | Not Started |
| Statement Card        | 1     | Not Started |
| Vote Card             | 1     | Not Started |
| Election Card         | 1     | Not Started |
| Todo Card             | 1     | Not Started |
| Video Card            | 1     | Not Started |
| Image Card            | 1     | Not Started |
| Activity Card         | 1     | Not Started |
| Validation & QA       | 2     | Not Started |

---

## Notes

- Prefer reusing existing hooks/components for membership/subscription to avoid logic drift (EventWiki/GroupWiki/User wiki).
- All user-facing text must go through translations; add new keys where needed.
- Ensure popovers and inner buttons stop propagation so card-level `href` navigation remains intact.
- Update tests only if necessary; consider adding/adjusting e2e coverage for card actions if regressions appear.
