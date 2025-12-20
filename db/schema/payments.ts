import { i } from '@instantdb/react';

const _payments = {
  entities: {
    payments: i.entity({
      amount: i.number(),
      createdAt: i.date().indexed(),
      label: i.string().indexed(),
      type: i.string().indexed(),
    }),
    stripeCustomers: i.entity({
      stripeCustomerId: i.string().unique().indexed(),
      email: i.string().indexed().optional(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),
    stripeSubscriptions: i.entity({
      stripeSubscriptionId: i.string().unique().indexed(),
      stripeCustomerId: i.string().indexed(),
      status: i.string().indexed(), // 'active', 'canceled', 'past_due', etc.
      currentPeriodStart: i.date().indexed(),
      currentPeriodEnd: i.date().indexed(),
      cancelAtPeriodEnd: i.boolean(),
      amount: i.number(), // in cents
      currency: i.string(),
      interval: i.string(), // 'month', 'year'
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      canceledAt: i.date().optional(),
    }),
    stripePayments: i.entity({
      stripeInvoiceId: i.string().unique().indexed(),
      stripeCustomerId: i.string().indexed(),
      stripeSubscriptionId: i.string().indexed().optional(),
      amount: i.number(), // in cents
      currency: i.string(),
      status: i.string().indexed(), // 'paid', 'failed', 'pending'
      createdAt: i.date().indexed(),
      paidAt: i.date().optional(),
    }),
  },
  links: {
    paymentsPayerUser: {
      forward: {
        on: 'payments',
        has: 'one',
        label: 'payerUser',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'paymentsMade',
      },
    },
    paymentsPayerGroup: {
      forward: {
        on: 'payments',
        has: 'one',
        label: 'payerGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'paymentsMade',
      },
    },
    paymentsReceiverUser: {
      forward: {
        on: 'payments',
        has: 'one',
        label: 'receiverUser',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'paymentsReceived',
      },
    },
    paymentsReceiverGroup: {
      forward: {
        on: 'payments',
        has: 'one',
        label: 'receiverGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'paymentsReceived',
      },
    },
    stripeCustomersUser: {
      forward: {
        on: 'stripeCustomers',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'one',
        label: 'stripeCustomer',
      },
    },
    stripeSubscriptionsCustomer: {
      forward: {
        on: 'stripeSubscriptions',
        has: 'one',
        label: 'customer',
      },
      reverse: {
        on: 'stripeCustomers',
        has: 'many',
        label: 'subscriptions',
      },
    },
    stripePaymentsCustomer: {
      forward: {
        on: 'stripePayments',
        has: 'one',
        label: 'customer',
      },
      reverse: {
        on: 'stripeCustomers',
        has: 'many',
        label: 'payments',
      },
    },
    stripePaymentsSubscription: {
      forward: {
        on: 'stripePayments',
        has: 'one',
        label: 'subscription',
      },
      reverse: {
        on: 'stripeSubscriptions',
        has: 'many',
        label: 'payments',
      },
    },
  } as const,
};

export default _payments;
