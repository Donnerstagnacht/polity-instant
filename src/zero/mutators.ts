import { defineMutators } from '@rocicorp/zero'

import { userSharedMutators } from './users/shared-mutators'
import { groupSharedMutators } from './groups/shared-mutators'
import { eventSharedMutators } from './events/shared-mutators'
import { amendmentSharedMutators } from './amendments/shared-mutators'
import { documentSharedMutators } from './documents/shared-mutators'
import { agendaSharedMutators } from './agendas/shared-mutators'
import { todoSharedMutators } from './todos/shared-mutators'
import { messageSharedMutators } from './messages/shared-mutators'
import { notificationSharedMutators } from './notifications/shared-mutators'
import { blogSharedMutators } from './blogs/shared-mutators'
import { paymentSharedMutators } from './payments/shared-mutators'
import { statementSharedMutators } from './statements/shared-mutators'
import { commonSharedMutators } from './common/shared-mutators'

export const mutators = defineMutators({
  users: userSharedMutators,
  groups: groupSharedMutators,
  events: eventSharedMutators,
  amendments: amendmentSharedMutators,
  documents: documentSharedMutators,
  agendas: agendaSharedMutators,
  todos: todoSharedMutators,
  messages: messageSharedMutators,
  notifications: notificationSharedMutators,
  blogs: blogSharedMutators,
  payments: paymentSharedMutators,
  statements: statementSharedMutators,
  common: commonSharedMutators,
})
