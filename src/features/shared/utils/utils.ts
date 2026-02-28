import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class values into a single className string using clsx and tailwind-merge.
 * This allows for conditional and merged Tailwind CSS classes.
 *
 * @param inputs - Class values to be combined (strings, objects, arrays, etc.)
 * @returns A merged className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
