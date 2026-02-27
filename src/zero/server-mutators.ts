/**
 * Server-only mutator overrides — thin composition file.
 *
 * Each domain's overrides live in `src/zero/<domain>/server-mutators.ts`.
 * This file imports them all and composes the final `serverMutators` registry
 * passed to PushProcessor in the /api/mutate endpoint.
 */
import { defineMutators } from '@rocicorp/zero'
import { mutators } from './mutators'
import { groupServerMutators } from './groups/server-mutators'
import { eventServerMutators } from './events/server-mutators'
import { amendmentServerMutators } from './amendments/server-mutators'
import { blogServerMutators } from './blogs/server-mutators'
import { agendaServerMutators } from './agendas/server-mutators'
import { todoServerMutators } from './todos/server-mutators'
import { paymentServerMutators } from './payments/server-mutators'
import { documentServerMutators } from './documents/server-mutators'
import { commonServerMutators } from './common/server-mutators'

export const serverMutators = defineMutators(mutators, {
  groups: groupServerMutators,
  events: eventServerMutators,
  amendments: amendmentServerMutators,
  blogs: blogServerMutators,
  agendas: agendaServerMutators,
  todos: todoServerMutators,
  payments: paymentServerMutators,
  documents: documentServerMutators,
  common: commonServerMutators,
})
