import { randomUUID } from 'crypto';

/**
 * Generate a new UUID (drop-in replacement for InstantDB's id())
 */
export const id = (): string => randomUUID();
