import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ============================================
// Payment Zod Schemas
// ============================================

const basePaymentSchema = z.object({
  id: z.string(),
  amount: z.number().nullable(),
  label: z.string().nullable(),
  type: z.string().nullable(),
  payer_user_id: z.string().nullable(),
  payer_group_id: z.string().nullable(),
  receiver_user_id: z.string().nullable(),
  receiver_group_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectPaymentSchema = basePaymentSchema

export const createPaymentSchema = basePaymentSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const deletePaymentSchema = z.object({ id: z.string() })

// ============================================
// StripeCustomer Zod Schemas
// ============================================

const baseStripeCustomerSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  stripe_customer_id: z.string(),
  email: z.string().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectStripeCustomerSchema = baseStripeCustomerSchema

export const createStripeCustomerSchema = baseStripeCustomerSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string() })

export const updateStripeCustomerSchema = baseStripeCustomerSchema
  .pick({ email: true })
  .partial()
  .extend({ id: z.string() })

// ============================================
// StripeSubscription Zod Schemas
// ============================================

const baseStripeSubscriptionSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  stripe_subscription_id: z.string(),
  stripe_customer_id: z.string().nullable(),
  status: z.string().nullable(),
  current_period_start: nullableTimestampSchema,
  current_period_end: nullableTimestampSchema,
  cancel_at_period_end: z.boolean().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  interval_period: z.string().nullable(),
  canceled_at: nullableTimestampSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectStripeSubscriptionSchema = baseStripeSubscriptionSchema

export const updateStripeSubscriptionSchema = baseStripeSubscriptionSchema
  .pick({
    status: true,
    current_period_start: true,
    current_period_end: true,
    cancel_at_period_end: true,
    amount: true,
    currency: true,
    interval_period: true,
    canceled_at: true,
  })
  .partial()
  .extend({ id: z.string() })

// ============================================
// StripePayment Zod Schemas
// ============================================

const baseStripePaymentSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  stripe_invoice_id: z.string(),
  stripe_customer_id: z.string().nullable(),
  stripe_subscription_id: z.string().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  status: z.string().nullable(),
  paid_at: nullableTimestampSchema,
  created_at: timestampSchema,
})

export const selectStripePaymentSchema = baseStripePaymentSchema

export const createStripePaymentSchema = baseStripePaymentSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Inferred Types
// ============================================

export type Payment = z.infer<typeof selectPaymentSchema>
export type StripeCustomer = z.infer<typeof selectStripeCustomerSchema>
export type StripeSubscription = z.infer<typeof selectStripeSubscriptionSchema>
export type StripePayment = z.infer<typeof selectStripePaymentSchema>
