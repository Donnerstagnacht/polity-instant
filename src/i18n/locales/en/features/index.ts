export { authTranslations } from './auth';
export { amendmentsTranslations } from './amendments';
export { blogsTranslations } from './blogs';
export { calendarTranslations } from './calendar';
export { createTranslations } from './create';
export { documentsTranslations } from './documents';
export { eventsTranslations } from './events';
export { groupsTranslations } from './groups';
export { meetTranslations } from './meet';
export { messagesTranslations } from './messages';
export { notificationsTranslations } from './notifications';
export { searchTranslations } from './search';
export { statementsTranslations } from './statements';
export { timelineTranslations } from './timeline';
export { todosTranslations } from './todos';
export { userTranslations } from './user';

export const features = {
  auth: async () => (await import('./auth')).authTranslations,
  amendments: async () => (await import('./amendments')).amendmentsTranslations,
  blogs: async () => (await import('./blogs')).blogsTranslations,
  calendar: async () => (await import('./calendar')).calendarTranslations,
  create: async () => (await import('./create')).createTranslations,
  documents: async () => (await import('./documents')).documentsTranslations,
  events: async () => (await import('./events')).eventsTranslations,
  groups: async () => (await import('./groups')).groupsTranslations,
  meet: async () => (await import('./meet')).meetTranslations,
  messages: async () => (await import('./messages')).messagesTranslations,
  notifications: async () => (await import('./notifications')).notificationsTranslations,
  search: async () => (await import('./search')).searchTranslations,
  statements: async () => (await import('./statements')).statementsTranslations,
  timeline: async () => (await import('./timeline')).timelineTranslations,
  todos: async () => (await import('./todos')).todosTranslations,
  user: async () => (await import('./user')).userTranslations,
} as const;
