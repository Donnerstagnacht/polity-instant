import type { I18nLocale } from '../en/enTranslation';

import { commonTranslations } from './common';
import { navigationTranslations } from './navigation';
import { agendasTranslations } from './features/agendas';
import { authTranslations } from './features/auth';
import { amendmentsTranslations } from './features/amendments';
import { blogsTranslations } from './features/blogs';
import { calendarTranslations } from './features/calendar';
import { changeRequestsTranslations } from './features/change-requests';
import { createTranslations } from './features/create';
import { decisionTerminalTranslations } from './features/decision-terminal';
import { delegatesTranslations } from './features/delegates';
import { discussionsTranslations } from './features/discussions';
import { documentsTranslations } from './features/documents';
import { editor as editorTranslations } from './features/editor';
import { electionsTranslations } from './features/elections';
import { eventsTranslations } from './features/events';
import { groupsTranslations } from './features/groups';
import { meetTranslations } from './features/meet';
import { messagesTranslations } from './features/messages';
import { networkTranslations } from './features/network';
import { notificationsTranslations } from './features/notifications';
import { paymentsTranslations } from './features/payments';
import { positionsTranslations } from './features/positions';
import { searchTranslations } from './features/search';
import { statementsTranslations } from './features/statements';
import { timelineTranslations } from './features/timeline';
import { todosTranslations } from './features/todos';
import { userTranslations } from './features/users';
import { votesTranslations } from './features/votes';
import { landingSectionTranslations } from './pages/home/landing';
import { componentsTranslations } from './components';
import { plateJsTranslations } from './plateJs';
import { pagesTranslations } from './pages';

// Using I18nLocale type to ensure compatibility with English translations
const deTranslation: I18nLocale = {
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
    agendas: agendasTranslations,
    auth: authTranslations,
    amendments: amendmentsTranslations,
    blogs: blogsTranslations,
    calendar: calendarTranslations,
    changeRequests: changeRequestsTranslations,
    create: createTranslations,
    decisionTerminal: decisionTerminalTranslations,
    delegates: delegatesTranslations,
    discussions: discussionsTranslations,
    documents: documentsTranslations,
    editor: editorTranslations,
    elections: electionsTranslations,
    events: eventsTranslations,
    groups: groupsTranslations,
    meet: meetTranslations,
    messages: messagesTranslations,
    network: networkTranslations,
    notifications: notificationsTranslations,
    payments: paymentsTranslations,
    positions: positionsTranslations,
    search: searchTranslations,
    statements: statementsTranslations,
    timeline: timelineTranslations,
    todos: todosTranslations,
    user: userTranslations,
    votes: votesTranslations,
  },

  // Legacy compatibility - map old keys to new structure
  home: pagesTranslations.home,
  timeline: timelineTranslations,
};

export default deTranslation;
