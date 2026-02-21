import { table, string, number, boolean } from '@rocicorp/zero'

export const payment = table('payment')
  .columns({
    id: string(),
    amount: number().optional(),
    label: string().optional(),
    type: string().optional(),
    payer_user_id: string().optional(),
    payer_group_id: string().optional(),
    receiver_user_id: string().optional(),
    receiver_group_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const stripeCustomer = table('stripe_customer')
  .columns({
    id: string(),
    user_id: string(),
    stripe_customer_id: string(),
    email: string().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const stripeSubscription = table('stripe_subscription')
  .columns({
    id: string(),
    customer_id: string(),
    stripe_subscription_id: string(),
    stripe_customer_id: string().optional(),
    status: string().optional(),
    current_period_start: number().optional(),
    current_period_end: number().optional(),
    cancel_at_period_end: boolean().optional(),
    amount: number().optional(),
    currency: string().optional(),
    interval_period: string().optional(),
    canceled_at: number().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const stripePayment = table('stripe_payment')
  .columns({
    id: string(),
    customer_id: string(),
    stripe_invoice_id: string(),
    stripe_customer_id: string().optional(),
    stripe_subscription_id: string().optional(),
    amount: number().optional(),
    currency: string().optional(),
    status: string().optional(),
    paid_at: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')
