/**
 * Pure helper functions for parsing @mentions and #hashtags from text.
 */

export interface ParsedMention {
  type: 'mention';
  value: string; // e.g. "username"
  start: number;
  end: number;
}

export interface ParsedHashtag {
  type: 'hashtag';
  value: string; // e.g. "climate"
  start: number;
  end: number;
}

export type ParsedToken = ParsedMention | ParsedHashtag | { type: 'text'; value: string; start: number; end: number };

const MENTION_REGEX = /(?:^|(?<=\s))@([\w.-]+)/g;
const HASHTAG_REGEX = /(?:^|(?<=\s))#([\w-]+)/g;

/** Extract all @mention occurrences from text. */
export function parseMentions(text: string): ParsedMention[] {
  const results: ParsedMention[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(MENTION_REGEX.source, MENTION_REGEX.flags);
  while ((match = re.exec(text)) !== null) {
    results.push({ type: 'mention', value: match[1], start: match.index, end: re.lastIndex });
  }
  return results;
}

/** Extract all #hashtag occurrences from text. */
export function parseHashtags(text: string): ParsedHashtag[] {
  const results: ParsedHashtag[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(HASHTAG_REGEX.source, HASHTAG_REGEX.flags);
  while ((match = re.exec(text)) !== null) {
    results.push({ type: 'hashtag', value: match[1], start: match.index, end: re.lastIndex });
  }
  return results;
}

/**
 * Tokenise text into an ordered list of text / @mention / #hashtag segments.
 * Useful for rendering text with clickable links.
 */
export function tokenizeText(text: string): ParsedToken[] {
  const mentions = parseMentions(text);
  const hashtags = parseHashtags(text);

  const markers = [
    ...mentions.map((m) => ({ ...m, sortKey: m.start })),
    ...hashtags.map((h) => ({ ...h, sortKey: h.start })),
  ].sort((a, b) => a.sortKey - b.sortKey);

  const tokens: ParsedToken[] = [];
  let cursor = 0;

  for (const marker of markers) {
    if (marker.start > cursor) {
      tokens.push({ type: 'text', value: text.slice(cursor, marker.start), start: cursor, end: marker.start });
    }
    tokens.push(marker);
    cursor = marker.end;
  }

  if (cursor < text.length) {
    tokens.push({ type: 'text', value: text.slice(cursor), start: cursor, end: text.length });
  }

  return tokens;
}
