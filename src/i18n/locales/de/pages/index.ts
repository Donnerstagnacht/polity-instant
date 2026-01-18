import { homePageTranslations } from './home';
import { groupPageTranslations } from './group';
import { userPageTranslations } from './user';
import { eventPageTranslations } from './event';
import { amendmentPageTranslations } from './amendment';
import { blogPageTranslations } from './blog';
import { calendarPageTranslations } from './calendar';
import { createPageTranslations } from './create';
import { searchPageTranslations } from './search';
import { todosPageTranslations } from './todos';
import { messagesPageTranslations } from './messages';
import { notificationsPageTranslations } from './notifications';
import { solutionsPageTranslations } from './solutions';
import { pricingPageTranslations } from './pricing';
import { featuresPageTranslations } from './features';
import { supportPageTranslations } from './support';
import { editorPageTranslations } from './editor';
import { meetPageTranslations } from './meet';
import { statementPageTranslations } from './statement';
import { authPageTranslations } from './auth';

export const pagesTranslations = {
  home: homePageTranslations,
  group: groupPageTranslations,
  user: userPageTranslations,
  event: eventPageTranslations,
  amendment: amendmentPageTranslations,
  blog: blogPageTranslations,
  calendar: calendarPageTranslations,
  create: createPageTranslations,
  search: searchPageTranslations,
  todos: todosPageTranslations,
  messages: messagesPageTranslations,
  notifications: notificationsPageTranslations,
  solutions: solutionsPageTranslations,
  pricing: pricingPageTranslations,
  features: featuresPageTranslations,
  support: supportPageTranslations,
  editor: editorPageTranslations,
  meet: meetPageTranslations,
  statement: statementPageTranslations,
  auth: authPageTranslations,
} as const;
