// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/react';
import _users from './schema/users';
import _groups from './schema/groups';
import _events from './schema/events';
import _amendments from './schema/amendments';
import _agendas from './schema/agendas';
import _todos from './schema/todos';
import _messages from './schema/messages';
import _notifications from './schema/notifications';
import _blog from './schema/blog';
import _payments from './schema/payments';
import _statements from './schema/statements';
import _common from './schema/common';

const _schema = i.schema({
  entities: {
    ..._users.entities,
    ..._groups.entities,
    ..._events.entities,
    ..._amendments.entities,
    ..._agendas.entities,
    ..._todos.entities,
    ..._messages.entities,
    ..._notifications.entities,
    ..._blog.entities,
    ..._payments.entities,
    ..._statements.entities,
    ..._common.entities,
  },
  links: {
    ..._users.links,
    ..._groups.links,
    ..._events.links,
    ..._amendments.links,
    ..._agendas.links,
    ..._todos.links,
    ..._messages.links,
    ..._notifications.links,
    ..._blog.links,
    ..._payments.links,
    ..._statements.links,
    ..._common.links,
  },
  rooms: {
    editor: {
      presence: i.entity({
        avatar: i.string().optional(),
        color: i.string(),
        name: i.string(),
        userId: i.string(),
      }),
      topics: {
        typing: i.entity({
          isTyping: i.boolean(),
          userId: i.string(),
        }),
      },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
type AppSchema = _AppSchema;
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
