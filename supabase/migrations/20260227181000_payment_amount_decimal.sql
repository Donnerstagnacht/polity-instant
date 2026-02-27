-- Migrate payment.amount from INTEGER to NUMERIC(12,2) to support decimal values
ALTER TABLE public.payment ALTER COLUMN amount TYPE NUMERIC(12,2);
