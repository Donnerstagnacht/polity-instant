import { i } from '@instantdb/react';

const _todos = {
  entities: {
    todoAssignments: i.entity({
      assignedAt: i.date().indexed(),
      role: i.string().optional(),
    }),
    todos: i.entity({
      completedAt: i.date().optional(),
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      dueDate: i.date().indexed().optional(),
      priority: i.string().indexed(),
      status: i.string().indexed(),
      tags: i.json().optional(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
  },
  links: {
    todoAssignmentsTodo: {
      forward: {
        on: 'todoAssignments',
        has: 'one',
        label: 'todo',
      },
      reverse: {
        on: 'todos',
        has: 'many',
        label: 'assignments',
      },
    },
    todoAssignmentsUser: {
      forward: {
        on: 'todoAssignments',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'todoAssignments',
      },
    },
    todosCreator: {
      forward: {
        on: 'todos',
        has: 'one',
        label: 'creator',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'createdTodos',
      },
    },
    todosGroup: {
      forward: {
        on: 'todos',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'todos',
      },
    },
    todosEvent: {
      forward: {
        on: 'todos',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'todos',
      },
    },
    todosAmendment: {
      forward: {
        on: 'todos',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'todos',
      },
    },
  } as const,
};

export default _todos;
