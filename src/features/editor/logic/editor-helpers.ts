/**
 * Generate a consistent color for a user based on their ID
 */
export function generateUserColor(userId: string): string {
  const hash = parseInt(userId.substring(0, 8), 16);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
