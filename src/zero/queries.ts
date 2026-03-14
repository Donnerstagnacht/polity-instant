import { defineQueries } from '@rocicorp/zero'

import { userQueries } from './users/queries'
import { groupQueries } from './groups/queries'
import { eventQueries } from './events/queries'
import { amendmentQueries } from './amendments/queries'
import { documentQueries } from './documents/queries'
import { agendaQueries } from './agendas/queries'
import { todoQueries } from './todos/queries'
import { messageQueries } from './messages/queries'
import { notificationQueries } from './notifications/queries'
import { blogQueries } from './blogs/queries'
import { paymentQueries } from './payments/queries'
import { statementQueries } from './statements/queries'
import { commonQueries } from './common/queries'
import { searchQueries } from './shared/queries'
import { rbacQueries } from './rbac/queries'
import { preferenceQueries } from './preferences/queries'
import { calendarSubscriptionQueries } from './calendar-subscriptions/queries'

export const queries = defineQueries({
  users: userQueries,
  groups: groupQueries,
  events: eventQueries,
  amendments: amendmentQueries,
  documents: documentQueries,
  agendas: agendaQueries,
  todos: todoQueries,
  messages: messageQueries,
  notifications: notificationQueries,
  blogs: blogQueries,
  payments: paymentQueries,
  statements: statementQueries,
  common: commonQueries,
  search: searchQueries,
  rbac: rbacQueries,
  preferences: preferenceQueries,
  calendarSubscriptions: calendarSubscriptionQueries,
})
