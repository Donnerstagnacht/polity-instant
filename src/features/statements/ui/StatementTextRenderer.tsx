import { Link } from '@tanstack/react-router';
import { tokenizeText } from '@/features/shared/logic/mentionHelpers';

interface StatementTextRendererProps {
  text: string;
  className?: string;
}

/**
 * Renders statement text with clickable @mentions and #hashtags.
 * - @handle → link to /search?q=handle (user search)
 * - #tag   → link to /search?hashtag=tag
 */
export function StatementTextRenderer({ text, className }: StatementTextRendererProps) {
  const tokens = tokenizeText(text);

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        if (token.type === 'mention') {
          return (
            <Link
              key={i}
              to="/search"
              search={{ q: token.value }}
              className="text-primary font-medium hover:underline"
            >
              @{token.value}
            </Link>
          );
        }
        if (token.type === 'hashtag') {
          return (
            <Link
              key={i}
              to="/search"
              search={{ hashtag: token.value }}
              className="text-primary font-medium hover:underline"
            >
              #{token.value}
            </Link>
          );
        }
        return <span key={i}>{token.value}</span>;
      })}
    </span>
  );
}
