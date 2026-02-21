import { defineMutators } from '@rocicorp/zero'

import { userMutators } from './users/mutators'
import { groupMutators } from './groups/mutators'
import { eventMutators } from './events/mutators'
import { amendmentMutators } from './amendments/mutators'
import { documentMutators } from './documents/mutators'
import { agendaMutators } from './agendas/mutators'
import { todoMutators } from './todos/mutators'
import { messageMutators } from './messages/mutators'
import { notificationMutators } from './notifications/mutators'
import { blogMutators } from './blogs/mutators'
import { paymentMutators } from './payments/mutators'
import { statementMutators } from './statements/mutators'
import { commonMutators } from './common/mutators'

export const mutators = defineMutators({
  users: userMutators,
  groups: groupMutators,
  events: eventMutators,
  amendments: amendmentMutators,
  documents: documentMutators,
  agendas: agendaMutators,
  todos: todoMutators,
  messages: messageMutators,
  notifications: notificationMutators,
  blogs: blogMutators,
  payments: paymentMutators,
  statements: statementMutators,
  common: commonMutators,
})
