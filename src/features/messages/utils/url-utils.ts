// URL detection and parsing utilities

export function detectUrls(text: string): string[] {
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\/?(?:user|group|event|amendment|blog|statement|todos?)\/[a-zA-Z0-9_-]+)/gi;
  const matches = text.match(urlRegex);
  return matches || [];
}

export function parseMessageWithLinks(
  text: string
): { type: 'text' | 'url'; content: string }[] {
  const urlRegex =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(\/?(?:user|group|event|amendment|blog|statement|todos?)\/[a-zA-Z0-9_-]+)/gi;
  const parts: { type: 'text' | 'url'; content: string }[] = [];

  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before URL
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add URL
    let url = match[0];
    // Normalize www URLs
    if (url.startsWith('www.')) {
      url = 'https://' + url;
    }
    // Relative URLs are kept as-is

    parts.push({
      type: 'url',
      content: url,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
}

export function hasUrls(text: string): boolean {
  return detectUrls(text).length > 0;
}
