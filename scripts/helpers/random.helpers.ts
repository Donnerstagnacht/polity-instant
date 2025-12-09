/**
 * Random utility functions for seeding
 */

/**
 * Returns a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random item from the array
 */
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Returns multiple random items from the array without duplicates
 */
export function randomItems<T>(array: readonly T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Returns a random visibility value
 */
export function randomVisibility(): 'public' | 'authenticated' | 'private' {
  const visibilities: ('public' | 'authenticated' | 'private')[] = [
    'public',
    'authenticated',
    'private',
  ];
  return randomItem(visibilities);
}
