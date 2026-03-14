/**
 * Converts a value that may be `null` to `undefined`.
 * Used at the boundary between Zero (which returns `null` for missing values)
 * and React components (which conventionally use `undefined` for optional props).
 */
export function toUndefined<T>(value: T | null): T | undefined {
  return value ?? undefined
}
