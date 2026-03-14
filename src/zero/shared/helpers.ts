import { z } from 'zod';
import type { ReadonlyJSONValue } from '@rocicorp/zero';

export const timestampSchema = z.number();

export const nullableTimestampSchema = z.union([z.number(), z.null()]).transform((val) =>
  val === null ? 0 : val
);

export const jsonSchema: z.ZodType<ReadonlyJSONValue> = z.any();
