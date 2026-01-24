import type { DeepReplace } from '@/i18n/i18n.types.ts';

import { commonTranslations } from './common';
import { navigationTranslations } from './navigation';
import { authTranslations } from './features/auth';
import { amendmentsTranslations } from './features/amendments';
import { blogsTranslations } from './features/blogs';
import { calendarTranslations } from './features/calendar';
import { createTranslations } from './features/create';
import { eventsTranslations } from './features/events';
import { groupsTranslations } from './features/groups';
import { meetTranslations } from './features/meet';
import { messagesTranslations } from './features/messages';
import { notificationsTranslations } from './features/notifications';
import { searchTranslations } from './features/search';
import { statementsTranslations } from './features/statements';
import { timelineTranslations } from './features/timeline';
import { todosTranslations } from './features/todos';
import { userTranslations } from './features/user';
import { editor as editorTranslations } from './features/editor';
import { landingSectionTranslations } from './pages/home/landing';
import { componentsTranslations } from './components';
import { plateJsTranslations } from './plateJs';
import { pagesTranslations } from './pages';

const enTranslation = {
  // Common/shared translations
  common: commonTranslations,
  loading: commonTranslations.loading,
  errors: commonTranslations.errors,

  // Navigation
  navigation: navigationTranslations,
  navigationDemo: navigationTranslations.demo,
  commandDialog: navigationTranslations.commandDialog,

  // Authentication
  auth: authTranslations,
  onboarding: authTranslations.onboarding,

  // Landing pages
  landing: {
    ...landingSectionTranslations,
    solutions: pagesTranslations.solutions,
    pricing: pagesTranslations.pricing,
  },

  // Shared components
  components: componentsTranslations,
  media: componentsTranslations.media,
  mediaUpload: componentsTranslations.mediaUpload,
  dateElement: componentsTranslations.dateElement,
  columnElement: componentsTranslations.columnElement,

  // PlateJS editor
  plateJs: plateJsTranslations,

  // Page-specific translations
  pages: pagesTranslations,

  // Feature-specific translations
  features: {
    auth: authTranslations,
    amendments: amendmentsTranslations,
    blogs: blogsTranslations,
    calendar: calendarTranslations,
    create: createTranslations,
    editor: editorTranslations,
    events: eventsTranslations,
    groups: groupsTranslations,
    meet: meetTranslations,
    messages: messagesTranslations,
    notifications: notificationsTranslations,
    search: searchTranslations,
    statements: statementsTranslations,
    timeline: timelineTranslations,
    todos: todosTranslations,
    user: userTranslations,
  },

  // Legacy compatibility - map old keys to new structure
  // These ensure backwards compatibility with existing code
  home: pagesTranslations.home,
  timeline: timelineTranslations,
};

export default enTranslation;

export type I18nLocale = DeepReplace<typeof enTranslation, [string, string]>;
