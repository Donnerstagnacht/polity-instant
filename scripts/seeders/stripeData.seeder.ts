/**
 * Stripe Data Seeder
 * Seeds Stripe customers, subscriptions, and payment data
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem } from '../helpers/random.helpers';

export const stripeDataSeeder: EntitySeeder = {
  name: 'stripeData',
  dependencies: ['users'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];

    console.log('Seeding Stripe customers, subscriptions, and payments...');
    const transactions = [];
    let totalCustomers = 0;
    let totalSubscriptions = 0;
    let totalPayments = 0;
    let stripeCustomersToUsers = 0;
    let stripeSubscriptionsToCustomers = 0;
    let stripePaymentsToSubscriptions = 0;

    const stripeCustomerIds: string[] = [];
    const stripeSubscriptionIds: string[] = [];
    const stripePaymentIds: string[] = [];

    // Plan amounts in cents
    const plans = [
      { name: 'running', amount: 200, currency: 'eur' }, // €2
      { name: 'development', amount: 1000, currency: 'eur' }, // €10
    ];

    // Create Stripe data for each user
    for (const userId of userIds) {
      const customerId = id();
      stripeCustomerIds.push(customerId);
      const stripeCustomerId = `cus_${faker.string.alphanumeric(14)}`;
      const hasSubscription = faker.datatype.boolean(0.8); // 80% of users have a subscription

      // Create customer
      transactions.push(
        tx.stripeCustomers[customerId]
          .update({
            stripeCustomerId,
            email: faker.internet.email().toLowerCase(),
            createdAt: faker.date.past({ years: 1 }),
            updatedAt: new Date(),
          })
          .link({ user: userId })
      );
      totalCustomers++;
      stripeCustomersToUsers++;

      if (hasSubscription) {
        // Choose a random plan (running or development)
        const plan = randomItem(plans);
        const subscriptionId = id();
        stripeSubscriptionIds.push(subscriptionId);
        const stripeSubscriptionId = `sub_${faker.string.alphanumeric(14)}`;

        const createdAt = faker.date.past({ years: 0.8 });
        const currentPeriodStart = faker.date.recent({ days: 15 });
        const currentPeriodEnd = new Date(currentPeriodStart);
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        // 90% active, 10% canceled/past_due
        const statuses = [
          'active',
          'active',
          'active',
          'active',
          'active',
          'active',
          'active',
          'active',
          'active',
          'canceled',
          'past_due',
        ];
        const status = randomItem(statuses);

        transactions.push(
          tx.stripeSubscriptions[subscriptionId]
            .update({
              stripeSubscriptionId,
              stripeCustomerId,
              status,
              currentPeriodStart: currentPeriodStart.toISOString(),
              currentPeriodEnd: currentPeriodEnd.toISOString(),
              cancelAtPeriodEnd: status === 'canceled' ? faker.datatype.boolean(0.5) : false,
              amount: plan.amount,
              currency: plan.currency,
              interval: 'month',
              createdAt: createdAt.toISOString(),
              updatedAt: new Date().toISOString(),
              canceledAt:
                status === 'canceled' ? faker.date.recent({ days: 30 }).toISOString() : undefined,
            })
            .link({ customer: customerId })
        );
        totalSubscriptions++;
        stripeSubscriptionsToCustomers++;

        // Create 1-5 past payments for this subscription
        const paymentCount = randomInt(1, 5);
        for (let i = 0; i < paymentCount; i++) {
          const paymentId = id();
          stripePaymentIds.push(paymentId);
          const stripeInvoiceId = `in_${faker.string.alphanumeric(14)}`;

          const minDate = new Date(createdAt);
          const maxDate = new Date(currentPeriodStart);

          let paymentCreatedAt;
          if (maxDate.getTime() - minDate.getTime() < 86400000) {
            paymentCreatedAt = faker.date.between({
              from: minDate,
              to: new Date(),
            });
          } else {
            paymentCreatedAt = faker.date.between({
              from: minDate,
              to: maxDate,
            });
          }

          const paymentStatuses = ['paid', 'paid', 'paid', 'paid', 'paid', 'open', 'failed'];
          const paymentStatus = randomItem(paymentStatuses);

          transactions.push(
            tx.stripePayments[paymentId]
              .update({
                stripeInvoiceId,
                stripeCustomerId,
                stripeSubscriptionId,
                amount: plan.amount,
                currency: plan.currency,
                status: paymentStatus,
                createdAt: paymentCreatedAt.toISOString(),
                paidAt:
                  paymentStatus === 'paid'
                    ? new Date(paymentCreatedAt.getTime() + 86400000).toISOString()
                    : undefined,
              })
              .link({ subscription: subscriptionId })
          );
          totalPayments++;
          stripePaymentsToSubscriptions++;
        }
      }
    }

    // Execute in batches
    if (transactions.length > 0) {
      const batchSize = 20;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        await db.transact(batch);
      }
    }

    console.log(`✓ Created ${totalCustomers} Stripe customers`);
    console.log(`✓ Created ${totalSubscriptions} active subscriptions (80% of users)`);
    console.log(`✓ Created ${totalPayments} payment records`);
    console.log(`  - Stripe customer-to-user links: ${stripeCustomersToUsers}`);
    console.log(`  - Stripe subscription-to-customer links: ${stripeSubscriptionsToCustomers}`);
    console.log(`  - Stripe payment-to-subscription links: ${stripePaymentsToSubscriptions}`);

    return {
      ...context,
      stripeCustomerIds,
      stripeSubscriptionIds,
      stripePaymentIds,
      linkCounts: {
        ...context.linkCounts,
        stripeCustomersToUsers:
          (context.linkCounts?.stripeCustomersToUsers || 0) + stripeCustomersToUsers,
        stripeSubscriptionsToCustomers:
          (context.linkCounts?.stripeSubscriptionsToCustomers || 0) +
          stripeSubscriptionsToCustomers,
        stripePaymentsToSubscriptions:
          (context.linkCounts?.stripePaymentsToSubscriptions || 0) + stripePaymentsToSubscriptions,
      },
    };
  },
};
