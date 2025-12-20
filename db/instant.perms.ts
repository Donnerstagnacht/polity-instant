// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react';
import _users from './perms/users';
import _groups from './perms/groups';
import _events from './perms/events';
import _amendments from './perms/amendments';
import _agendas from './perms/agendas';
import _todos from './perms/todos';
import _messages from './perms/messages';
import _notifications from './perms/notifications';
import _blog from './perms/blog';
import _payments from './perms/payments';
import _common from './perms/common';

const rules = {
  ..._users,
  ..._groups,
  ..._events,
  ..._amendments,
  ..._agendas,
  ..._todos,
  ..._messages,
  ..._notifications,
  ..._blog,
  ..._payments,
  ..._common,
} satisfies InstantRules;

export default rules;
