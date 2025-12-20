import type { InstantRules } from '@instantdb/react';

const rules = {
  payments: {
    allow: {
      view: 'isPayer || isReceiver',
      create: 'isPayer || hasGroupPaymentCreate',
      update: 'hasGroupPaymentUpdate',
      delete: 'hasGroupPaymentDelete',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isPayer',
      'auth.id == data.ref("payerUser.id") || ' +
        'data.ref("payerGroup.id") in auth.ref("$user.memberships.group.id")',
      'isReceiver',
      'auth.id == data.ref("receiverUser.id") || ' +
        'data.ref("receiverGroup.id") in auth.ref("$user.memberships.group.id")',
      'hasGroupPaymentCreate',
      "(data.ref('payerGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') || " +
        "data.ref('receiverGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id')) && " +
        "'payments' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupPaymentUpdate',
      "(data.ref('payerGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') || " +
        "data.ref('receiverGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id')) && " +
        "'payments' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'update' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupPaymentDelete',
      "(data.ref('payerGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') || " +
        "data.ref('receiverGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id')) && " +
        "'payments' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
  },
  stripeCustomers: {
    allow: {
      view: 'isSelf',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
    bind: ['isAuthenticated', 'auth.id != null', 'isSelf', 'auth.id == data.ref("user.id")'],
  },
  stripeSubscriptions: {
    allow: {
      view: 'isCustomerUser',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isCustomerUser',
      'auth.id == data.ref("customer.user.id")',
    ],
  },
  stripePayments: {
    allow: {
      view: 'isCustomerUser',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isCustomerUser',
      'auth.id == data.ref("customer.user.id")',
    ],
  },
} satisfies InstantRules;

export default rules;
