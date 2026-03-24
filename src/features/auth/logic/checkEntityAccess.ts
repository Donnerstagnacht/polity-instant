export type Visibility = 'public' | 'authenticated' | 'private';

/**
 * Determines whether a user can access an entity based on its visibility tier.
 *
 * - `'public'`        → everyone (including unauthenticated)
 * - `'authenticated'` → any logged-in user
 * - `'private'`       → only users with a qualifying relationship
 *
 * @param visibility      – the entity's `visibility` field
 * @param isAuthenticated – whether the current user is logged in
 * @param hasRelationship – whether the current user has a qualifying
 *                          relationship with the entity (member, participant,
 *                          collaborator, blogger, creator, assignee, etc.)
 * @returns `true` if access is granted, `false` otherwise
 */
export function checkEntityAccess(
  visibility: string | undefined | null,
  isAuthenticated: boolean,
  hasRelationship: boolean,
): boolean {
  // Treat missing/null visibility as public (backward compat)
  const v = visibility ?? 'public';

  if (v === 'public') return true;
  if (v === 'authenticated') return isAuthenticated;
  // 'private' or any unknown value → require relationship
  return hasRelationship;
}
