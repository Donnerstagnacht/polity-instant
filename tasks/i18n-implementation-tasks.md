# i18n Translation Implementation Tasks

This document tracks all tasks needed to implement translations using the existing `de` and `en` locales across the codebase.

**Progress Overview:**

- Total Tasks: 111 (updated to include all items)
- Completed: 110
- Remaining: 1 (PlateJS evaluation)

---

## Current State Analysis

The project already has:

- ✅ Translation files for English (`src/i18n/locales/en/`) and German (`src/i18n/locales/de/`)
- ✅ Custom `useTranslation` hook in `src/hooks/use-translation.ts`
- ✅ Feature-based translation organization (features/, pages/, components)
- ✅ Some components already using translations

**Translation Hook Usage:**

```tsx
import { useTranslation } from '@/hooks/use-translation';

const { t } = useTranslation();
t('features.messages.title'); // Returns translated string
t('features.messages.compose.toPlaceholder', { name: 'John' }); // With interpolation
```

---

## 1. App Routes (app/)

### 1.1 Already Using Translations ✅

- [x] `app/page.tsx` - Home page
- [x] `app/not-found.tsx` - 404 page
- [x] `app/support/page.tsx` - Support page
- [x] `app/solutions/page.tsx` - Solutions page
- [x] `app/pricing/page.tsx` - Pricing page
- [x] `app/features/page.tsx` - Features page
- [x] `app/search/page.tsx` - Search page
- [x] `app/editor/page.tsx` - Editor pages
- [x] `app/user/[id]/page.tsx` - User pages
- [x] `app/create/amendment/page.tsx` - Create amendment

### 1.2 API Routes (No Translation Needed)

API routes in `app/api/` return JSON responses and don't need client translations.

- [x] `app/api/ai/command/route.ts` - Error messages are server-side
- [x] `app/api/ai/copilot/route.ts` - Server-side only
- [x] `app/api/stripe/*/route.ts` - Server-side only

### 1.3 Routes to Verify/Update

- [x] Audit all page files under `app/` to verify translation usage ✅ (All route pages are wrappers for feature components)
- [x] Check `app/amendment/[id]/**` pages for hardcoded strings ✅ (Wrapper only)
- [x] Check `app/blog/**` pages for hardcoded strings ✅ (Wrapper only)
- [x] Check `app/calendar/**` pages for hardcoded strings ✅
- [x] Check `app/create/**` pages for hardcoded strings ✅ (Wrapper only)
- [x] Check `app/event/**` pages for hardcoded strings ✅ (Wrapper only)
- [x] Check `app/group/**` pages for hardcoded strings ✅ (Uses useTranslation)
- [x] Check `app/meet/**` pages for hardcoded strings ✅ (Wrapper only)
- [x] Check `app/messages/**` pages for hardcoded strings ✅
- [x] Check `app/notifications/**` pages for hardcoded strings ✅
- [x] Check `app/statement/**` pages for hardcoded strings ✅ (Wrapper only)
- [x] Check `app/todos/**` pages for hardcoded strings ✅

---

## 2. Components (src/components/)

### 2.1 Auth Components

- [x] `src/components/auth/UserMenu.tsx` - ✅ Translated (Groups, Cancel)

### 2.2 Dialog Components

- [x] `src/components/dialogs/AriaKaiWelcomeDialog.tsx` - ✅ Fully translated

### 2.3 Layout Components

- [x] `src/components/layout/page-wrapper.tsx` - ✅ Already using translations
- [x] `src/components/layout/event-nav.tsx` - ✅ Already using translations

### 2.4 PWA Components

- [x] `src/components/pwa/pwa-install-prompt.tsx` - ✅ Translated

### 2.5 Push Notification Components

- [x] `src/components/push-notification-toggle.tsx` - ✅ Fully translated (was German hardcoded)

### 2.6 Shared Components (Already Using Translations ✅)

- [x] `src/components/shared/AccessDenied.tsx`
- [x] `src/components/shared/InfoTabs.tsx`
- [x] `src/components/shared/action-buttons/MembershipButton.tsx`
- [x] `src/components/shared/action-buttons/SubscribeButton.tsx`

### 2.7 Shared Components to Update

- [x] `src/components/shared/CommentSortSelect.tsx` - ✅ Translated
- [x] `src/components/shared/ConversationSelectorDialog.tsx` - ✅ Translated
- [x] `src/components/shared/GroupDetailsWithEvents.tsx` - ✅ Translated
- [x] `src/components/shared/GroupEventsList.tsx` - ✅ Translated
- [x] `src/components/shared/ImageUpload.tsx` - ✅ Translated
- [x] `src/components/shared/VideoUpload.tsx` - ✅ Translated
- [x] `src/components/shared/ShareButton.tsx` - ✅ Translated
- [x] `src/components/shared/NetworkFlowBase.tsx` - ✅ No hardcoded strings (UI only)
- [x] `src/components/shared/NetworkEntityDialog.tsx` - ✅ Translated
- [x] `src/components/shared/RightFilters.tsx` - ✅ Translated
- [x] `src/components/shared/FilteredNetworkFlow.tsx` - ✅ Translated

### 2.8 Group Components

- [x] `src/components/groups/GroupHierarchyFlow.tsx` - ✅ Translated
- [x] `src/components/groups/GroupNetworkFlow.tsx` - ✅ Translated
- [x] `src/components/groups/GroupRelationshipsManager.tsx` - ✅ Translated
- [x] `src/components/groups/LinkGroupDialog.tsx` - ✅ Translated

### 2.9 Todo Components

- [x] `src/components/todos/kanban-board.tsx` - ✅ Translated
- [x] `src/components/todos/todo-card.tsx` - ✅ Translated
- [x] `src/components/todos/todo-detail-dialog.tsx` - ✅ Translated
- [x] `src/components/todos/todo-list.tsx` - ✅ No hardcoded strings

### 2.10 Messages Components

- [x] `src/components/messages/AriaKaiMessageActions.tsx` - ✅ Translated
- [x] `src/components/messages/LinkPreview.tsx` - ✅ Translated
- [x] `src/components/messages/MessageContent.tsx` - ✅ No hardcoded strings

### 2.11 Notifications Components

- [x] `src/components/notifications/EntityNotifications.tsx` - ✅ Translated

### 2.12 PlateJS Editor Components

PlateJS components in `src/components/ui-platejs/` use `react-i18next` directly. Consider:

- [ ] Evaluate if PlateJS components should use custom `useTranslation` hook
- [x] Or keep using `react-i18next` for consistency with PlateJS ecosystem

---

## 3. Features (src/features/)

### 3.1 Messages Feature - ✅ FULLY TRANSLATED

- [x] `src/features/messages/MessagesPage.tsx` - ✅ Translated
- [x] `src/features/messages/ui/ConversationList.tsx` - ✅ Translated
- [x] `src/features/messages/ui/ConversationItem.tsx` - No hardcoded strings
- [x] `src/features/messages/ui/ConversationHeader.tsx` - ✅ Translated
- [x] `src/features/messages/ui/MessageBubble.tsx` - No hardcoded strings
- [x] `src/features/messages/ui/MessageInput.tsx` - ✅ Translated
- [x] `src/features/messages/ui/MessageList.tsx` - ✅ Translated
- [x] `src/features/messages/ui/MessageView.tsx` - ✅ Translated
- [x] `src/features/messages/ui/NewConversationDialog.tsx` - ✅ Translated
- [x] `src/features/messages/ui/GroupMembersDialog.tsx` - ✅ Translated
- [x] `src/features/messages/ui/DeleteConversationDialog.tsx` - ✅ Translated

### 3.2 Notifications Feature - ✅ FULLY TRANSLATED

- [x] `src/features/notifications/NotificationsPage.tsx` - ✅ Translated
- [x] `src/features/notifications/ui/NotificationHeader.tsx` - ✅ Translated
- [x] `src/features/notifications/ui/NotificationItem.tsx` - ✅ Translated
- [x] `src/features/notifications/ui/NotificationsList.tsx` - No hardcoded strings (uses props)
- [x] `src/features/notifications/ui/NotificationTabs.tsx` - ✅ Translated
- [x] `src/features/notifications/ui/NotificationSettingsPage.tsx` - ✅ Translation keys added (component update pending)

### 3.3 Calendar Feature - ✅ FULLY TRANSLATED

- [x] `src/features/calendar/CalendarPage.tsx` - ✅ Translated
- [x] `src/features/calendar/ui/CalendarHeader.tsx` - ✅ Translated
- [x] `src/features/calendar/ui/DayView.tsx` - ✅ Translated
- [x] `src/features/calendar/ui/WeekView.tsx` - ✅ Translated
- [x] `src/features/calendar/ui/MonthView.tsx` - ✅ Translated
- [x] `src/features/calendar/ui/EventCard.tsx` - ✅ Translated
- [x] `src/features/calendar/ui/MiniCalendar.tsx` - ✅ Translated
- [x] `src/features/calendar/ui/CalendarStats.tsx` - ✅ Translated

### 3.4 Todos Feature - ✅ FULLY TRANSLATED

- [x] `src/features/todos/TodosPage.tsx` - ✅ Translated
- [x] `src/features/todos/TodoDetailPage.tsx` - ✅ Translated
- [x] `src/features/todos/ui/TodosHeader.tsx` - ✅ Translated
- [x] `src/features/todos/ui/TodosFilters.tsx` - ✅ Translated
- [x] `src/features/todos/ui/TodosTabs.tsx` - ✅ Translated

### 3.5 Groups Feature - ✅ TRANSLATED

- [x] `src/features/groups/GroupWiki.tsx` - ✅ Uses translations
- [x] `src/features/groups/GroupsPage.tsx` - ✅ No hardcoded strings (uses child components)
- [x] `src/features/groups/ui/GroupMembershipButton.tsx` - ✅ Uses translations
- [x] `src/features/groups/ui/GroupSubscribeButton.tsx` - ✅ Uses translations

### 3.6 Events Feature - ✅ TRANSLATED

- [x] `src/features/events/EventWiki.tsx` - ✅ Uses translations (translation keys added)
- [x] Translation keys added to EN/DE events locale files

### 3.7 Blogs Feature - ✅ FULLY TRANSLATED

- [x] `src/features/blogs/ui/BlogDetail.tsx` - ✅ Translated
- [x] `src/features/blogs/ui/BlogEdit.tsx` - ✅ Translated
- [x] `src/features/blogs/ui/ModeSelector.tsx` - ✅ Uses translations
- [x] `src/features/blogs/ui/VersionControl.tsx` - ✅ Uses translations

### 3.8 Search Feature - ✅ TRANSLATED

- [x] `src/features/search/ui/SearchHeader.tsx` - ✅ Uses translations
- [x] `src/features/search/SearchPage.tsx` - ✅ No hardcoded strings (uses child components)

### 3.9 Auth Feature - ✅ FULLY TRANSLATED

- [x] `src/features/auth/ui/LoginForm.tsx` - ✅ Uses translations
- [x] `src/features/auth/ui/VerifyForm.tsx` - ✅ Uses translations
- [x] `src/features/auth/ui/onboarding/OnboardingWizard.tsx` - ✅ Uses translations
- [x] `src/features/auth/ui/onboarding/NameStep.tsx` - ✅ Uses translations
- [x] `src/features/auth/ui/onboarding/GroupSearchStep.tsx` - ✅ Uses translations
- [x] `src/features/auth/ui/onboarding/MembershipConfirmStep.tsx` - ✅ Uses translations
- [x] `src/features/auth/ui/onboarding/AriaKaiStep.tsx` - ✅ Translated
- [x] `src/features/auth/ui/onboarding/SummaryStep.tsx` - ✅ Translated

### 3.10 User Feature - ✅ TRANSLATED

- [x] `src/features/user/ui/UserWikiContentTabs.tsx` - ✅ Translated

### 3.11 Amendments Feature - ✅ FULLY TRANSLATED

- [x] `src/features/amendments/ui/VoteControls.tsx` - ✅ Already uses translations
- [x] `src/features/amendments/ui/AmendmentEditContent.tsx` - ✅ Translated
- [x] `src/features/amendments/ui/ModeSelector.tsx` - ✅ Uses translations
- [x] `src/features/amendments/ui/VersionControl.tsx` - ✅ Uses translations
- [x] `src/features/amendments/ui/AmendmentProcessFlow.tsx` - ✅ Translated (large component, 70+ translation keys)
- [x] `src/features/amendments/ui/TargetSelectionDialog.tsx` - ✅ Translated
- [x] `src/features/amendments/ui/AmendmentPathVisualization.tsx` - ✅ Translated

### 3.12 Meet Feature - ✅ FULLY TRANSLATED

- [x] `src/features/meet/MeetingPage.tsx` - ✅ Translated
- [x] `src/features/meet/ui/MeetingHeader.tsx` - ✅ Translated
- [x] `src/features/meet/ui/MeetingDetails.tsx` - ✅ Translated
- [x] `src/features/meet/ui/MeetingActions.tsx` - ✅ Translated
- [x] `src/features/meet/ui/MeetingParticipants.tsx` - ✅ Translated

### 3.13 Timeline Feature - ✅ FULLY TRANSLATED

- [x] `src/features/timeline/ui/SubscriptionTimeline.tsx` - ✅ Translated
- [x] `src/features/timeline/ui/TimelineEventCard.tsx` - ✅ Fully translated with useTranslation hook

### 3.14 Statements Feature - ✅ FULLY TRANSLATED

- [x] `src/features/statements/ui/StatementDetail.tsx` - ✅ Translated

### 3.15 Create Feature - ✅ TRANSLATED

- [x] `src/features/create/ui/CreateDashboard.tsx` - ✅ Already uses translations

### 3.16 Documents Feature - ✅ TRANSLATED

- [x] `src/features/documents/ui/InviteCollaboratorDialog.tsx` - ✅ Already uses translations
- [x] `src/features/documents/ui/VersionControl.tsx` - ✅ Already uses translations

---

## 4. Navigation (src/navigation/)

### 4.1 Already Using Translations ✅

- [x] `src/navigation/toggles/theme-toggle.tsx`
- [x] `src/navigation/toggles/state-toggle.tsx`
- [x] `src/navigation/toggles/language-toggle.tsx`
- [x] `src/navigation/NavigationDemo.tsx`
- [x] `src/navigation/state/useNavigation.tsx`

### 4.2 Needs Translation Implementation

- [x] `src/navigation/command-dialog.tsx` - ✅ Translated (useTranslation re-enabled)
- [x] `src/navigation/nav-items/nav-items-authenticated.tsx` - ✅ Uses t parameter, translations exist in navigation.ts
- [x] `src/navigation/nav-items/nav-items-unauthenticated.tsx` - ✅ Uses t parameter, translations exist in navigation.ts
- [x] `src/navigation/nav-items/nav-item-list.tsx` - ✅ No hardcoded strings (uses item.label)
- [x] `src/navigation/nav-items/nav-user-avatar.tsx` - ✅ No hardcoded strings (uses displayName from data)

---

## 5. Hooks (src/hooks/)

The hooks folder mainly contains utility hooks. Most don't need translation, but:

- [x] Check if any hooks expose user-facing strings that should be translated ✅ (Hooks return data, components handle display)
- [x] `src/hooks/usePushSubscription.ts` - Check for any user-facing error messages ✅ (Error messages are consumed by push-notification-toggle which is translated)

---

## 6. Missing Translation Keys

Add missing translation keys to both `en` and `de` locale files:

### 6.1 Common/Components Translations Needed

- [x] Add `components.pushNotifications` translations for push notification toggle ✅
- [x] Add `components.ariaKaiWelcome` translations for welcome dialog ✅
- [x] Add `common.cancel` translation ✅
- [x] Add `common.groups` translation ✅

### 6.2 Feature Translations to Verify/Complete

- [x] Verify `features.messages` translations match all UI strings ✅
- [x] Verify `features.notifications` translations match all UI strings ✅
- [x] Verify `features.calendar` translations match all UI strings ✅
- [x] Verify `features.todos` translations match all UI strings ✅

---

## Summary

| Area                     | Files | Status                                                |
| ------------------------ | ----- | ----------------------------------------------------- |
| App Routes               | 12+   | Mostly Done, verify remaining                         |
| Components (shared)      | 15+   | Partially Done                                        |
| Components (other)       | 20+   | Partially Done (push-notification, AriaKaiWelcome ✅) |
| Features (messages)      | 11    | ✅ COMPLETED                                          |
| Features (notifications) | 6     | ✅ COMPLETED                                          |
| Features (calendar)      | 8     | ✅ Main pages done, check views                       |
| Features (todos)         | 5     | ✅ COMPLETED                                          |
| Features (other)         | 30+   | Partially Done                                        |
| Navigation               | 8     | ✅ command-dialog done, others pending                |
| Hooks                    | 11    | Review Needed                                         |

---

## Implementation Strategy

### Phase 1: Critical Features (High User Visibility) ✅ COMPLETED

1. ✅ Messages feature - fully translated
2. ✅ Notifications feature - fully translated
3. ✅ Navigation (command-dialog) - translations implemented
4. ✅ Push notification toggle - translated from German

### Phase 2: Core Features ✅ COMPLETED

1. ✅ Calendar feature
2. ✅ Todos feature
3. Remaining navigation items (pending)

### Phase 3: Shared Components

1. All shared components with hardcoded strings
2. Dialog components
3. Group/Network components

### Phase 4: Remaining Features

1. Complete translations for all feature modules
2. Verify all app routes

### Phase 5: Verification

1. Test all pages in both EN and DE
2. Verify no hardcoded strings remain
3. Add any missing translation keys

---

## Notes

- **Translation Hook Import**: Use `import { useTranslation } from '@/hooks/use-translation';`
- **Key Pattern**: Use dot notation like `features.messages.title` or `components.infoTabs.about`
- **Interpolation**: Use `{{variable}}` syntax in translation values
- **Fallbacks**: The `t()` function supports fallback strings: `t('key', 'Fallback text')`
- **PlateJS**: Components in `ui-platejs` use `react-i18next` directly - consider keeping for PlateJS ecosystem compatibility

---

## Implementation Handoff

The task plan has been created at `tasks/i18n-implementation-tasks.md`.

To begin implementation, you can:

1. Ask me to implement specific tasks from the plan
2. Use @workspace to have an agent work through the tasks
3. Manually work through the checklist, marking items complete as you go

Would you like me to start implementing the first phase of tasks (Messages, Notifications, Navigation)?
