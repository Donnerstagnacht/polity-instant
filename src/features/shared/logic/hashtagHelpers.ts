/**
 * Consolidated hashtag helper functions.
 * Re-exports from zero/common/hashtagHelpers + adds text parsing utilities.
 */

export { extractHashtags, extractHashtagTags } from '@/zero/common/hashtagHelpers';
export { getHashtagGradient } from '@/features/timeline/logic/gradient-assignment';

/**
 * Parse #hashtag tokens from raw text (e.g. statement text).
 * Returns an array of tag strings (without the # prefix).
 */
export function parseHashtagsFromText(text: string): string[] {
  if (!text) return [];
  const regex = /(?:^|(?<=\s))#([\w-]+)/g;
  const tags: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const tag = match[1];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  return tags;
}
