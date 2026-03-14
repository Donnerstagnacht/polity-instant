/**
 * Extract { id, tag } objects from junction rows with nested `hashtag` one-relation.
 * Works for user_hashtags, group_hashtags, amendment_hashtags, event_hashtags, blog_hashtags.
 */
export function extractHashtags(
  junctions: ReadonlyArray<{ hashtag?: { id: string; tag: string } | null }> | undefined | null,
): { id: string; tag: string }[] {
  if (!junctions) return [];
  return junctions.map(j => j.hashtag).filter((h): h is { id: string; tag: string } => !!h);
}

/**
 * Extract just tag strings from junction rows.
 */
export function extractHashtagTags(
  junctions: ReadonlyArray<{ hashtag?: { tag?: string | null } | null }> | undefined | null,
): string[] {
  if (!junctions) return [];
  return junctions
    .map(j => j.hashtag?.tag)
    .filter((t): t is string => !!t);
}
