import { z } from 'zod';
import type { ReadonlyJSONValue } from '@rocicorp/zero';

export const timestampSchema = z.number();

export const nullableTimestampSchema = z.union([z.number(), z.null()]).transform((val) =>
  val === null ? 0 : val
);

export const jsonSchema: z.ZodType<ReadonlyJSONValue> = z.any();

/** Typed JSON schema for string arrays (tags, etc.) */
export const jsonStringArraySchema: z.ZodType<string[]> = z.array(z.string());

/** Typed JSON schema for number arrays (recurrence_days, etc.) */
export const jsonNumberArraySchema: z.ZodType<number[]> = z.array(z.number());

/** Typed JSON schema for Record<string, string> (metadata, etc.) */
export const jsonStringRecordSchema: z.ZodType<Record<string, string>> = z.record(z.string());

/** Typed JSON schema for Record<string, number> (stats, etc.) */
export const jsonNumberRecordSchema: z.ZodType<Record<string, number>> = z.record(z.number());

/** Typed JSON schema for Record<string, boolean> (notification settings, etc.) */
export const jsonBooleanRecordSchema: z.ZodType<Record<string, boolean>> = z.record(z.boolean());

/** Typed JSON schema for Record<string, boolean | string> (timeline settings, etc.) */
export const jsonBooleanOrStringRecordSchema: z.ZodType<Record<string, boolean | string>> = z.record(z.union([z.boolean(), z.string()]));

/** Typed JSON schema for Record<string, string> (delegate states, etc.) */
export const jsonStringStringRecordSchema: z.ZodType<Record<string, string>> = z.record(z.string(), z.string());
