'use client';

import { parseMessageWithLinks } from '@/utils/url-utils';
import { LinkPreview } from './LinkPreview';

interface MessageContentProps {
  content: string;
  className?: string;
}

export function MessageContent({ content, className = '' }: MessageContentProps) {
  const parts = parseMessageWithLinks(content);
  const urls = parts.filter(p => p.type === 'url').map(p => p.content);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Render text with inline links */}
      <div className="whitespace-pre-wrap">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index}>{part.content}</span>;
          } else {
            return (
              <a
                key={index}
                href={part.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                {part.content}
              </a>
            );
          }
        })}
      </div>

      {/* Render link previews below */}
      {urls.length > 0 && (
        <div className="mt-2 space-y-2">
          {urls.map((url, index) => (
            <LinkPreview key={index} url={url} />
          ))}
        </div>
      )}
    </div>
  );
}
