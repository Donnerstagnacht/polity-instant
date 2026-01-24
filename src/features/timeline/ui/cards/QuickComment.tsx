'use client';

import * as React from 'react';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/utils';
import { useTranslation } from '@/hooks/use-translation';

export interface QuickCommentProps {
  /** Content item ID to comment on */
  contentId: string;
  /** Content type */
  contentType: 'amendment' | 'event' | 'blog' | 'statement' | 'group';
  /** Called when comment is submitted */
  onSubmit?: (comment: string) => Promise<void>;
  /** Number of existing comments */
  commentCount?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Show in expanded state by default */
  defaultExpanded?: boolean;
  /** Compact mode for card footers */
  compact?: boolean;
  className?: string;
}

/**
 * QuickComment - Inline comment input for timeline cards
 *
 * Expands on focus, collapses on blur when empty
 */
export function QuickComment({
  contentId,
  contentType,
  onSubmit,
  commentCount = 0,
  placeholder,
  defaultExpanded = false,
  compact = false,
  className,
}: QuickCommentProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const defaultPlaceholder = t('features.timeline.comments.addComment');

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!comment.trim()) {
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setComment('');
    setIsExpanded(false);
    inputRef.current?.blur();
  };

  const handleSubmit = async () => {
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(comment.trim());
      setComment('');
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => {
          setIsExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn(
          'flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
          className
        )}
      >
        <MessageCircle className="h-4 w-4" />
        {commentCount > 0 && <span>{commentCount}</span>}
      </button>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Collapsed state - simple input */}
      {!isExpanded && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-full px-3 py-2',
            'cursor-text bg-muted/50 transition-colors hover:bg-muted'
          )}
          onClick={() => {
            setIsExpanded(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{placeholder || defaultPlaceholder}</span>
        </div>
      )}

      {/* Expanded state - full textarea */}
      {isExpanded && (
        <div className="space-y-2">
          <textarea
            ref={inputRef}
            value={comment}
            onChange={e => setComment(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || defaultPlaceholder}
            className={cn(
              'w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'placeholder:text-muted-foreground',
              'min-h-[80px]'
            )}
            rows={3}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t('features.timeline.comments.ctrlEnterSubmit')}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSubmitting}>
                <X className="mr-1 h-4 w-4" />
                {t('common.cancel')}
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!comment.trim() || isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-1 h-4 w-4" />
                )}
                {t('common.send')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * CommentPreview - Shows preview of recent comments
 */
export function CommentPreview({
  comments,
  maxComments = 2,
  onViewAll,
  className,
}: {
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: number;
  }>;
  maxComments?: number;
  onViewAll?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const visibleComments = comments.slice(0, maxComments);
  const hiddenCount = comments.length - maxComments;

  if (comments.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {visibleComments.map(comment => (
        <div key={comment.id} className="flex gap-2 text-sm">
          <span className="font-medium text-foreground">{comment.author}</span>
          <span className="line-clamp-1 text-muted-foreground">{comment.content}</span>
        </div>
      ))}
      {hiddenCount > 0 && onViewAll && (
        <button onClick={onViewAll} className="text-sm text-primary hover:underline">
          {t('features.timeline.comments.viewAll', { count: comments.length })}
        </button>
      )}
    </div>
  );
}
