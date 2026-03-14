'use client';

import { useState, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/features/shared/utils/utils';
import { CommentItem, type CommentData } from './CommentItem';
import { CommentInput } from './CommentInput';
import { CommentSortSelect, type CommentSortBy } from './CommentSortSelect';

interface CommentThreadProps {
  comments: CommentData[];
  currentUserId?: string;
  onAddComment: (text: string, parentId?: string) => Promise<void>;
  onVote: (commentId: string, voteValue: number, existingVote?: { id: string; vote: number }) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  hideHeader?: boolean;
  className?: string;
}

export function CommentThread({
  comments,
  currentUserId,
  onAddComment,
  onVote,
  onDelete,
  hideHeader,
  className,
}: CommentThreadProps) {
  const [sortBy, setSortBy] = useState<CommentSortBy>('votes');

  // Build threaded structure from flat list
  const threadedComments = useMemo(() => {
    // Comments already have `replies` populated from the data layer
    // or are top-level comments — filter to top-level only
    const topLevel = comments.filter(c => !c.parent_id);

    if (sortBy === 'time') {
      return [...topLevel].sort((a, b) => b.createdAt - a.createdAt);
    }
    // Sort by votes (score)
    return [...topLevel].sort((a, b) => {
      const aScore = (a.votes?.filter(v => v.vote === 1).length || 0) - (a.votes?.filter(v => v.vote === -1).length || 0);
      const bScore = (b.votes?.filter(v => v.vote === 1).length || 0) - (b.votes?.filter(v => v.vote === -1).length || 0);
      return bScore - aScore;
    });
  }, [comments, sortBy]);

  const handleReply = async (parentId: string, text: string) => {
    await onAddComment(text, parentId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {!hideHeader && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            <span>{comments.length} Comments</span>
          </div>
        )}
        <CommentSortSelect sortBy={sortBy} onSortChange={setSortBy} className="w-40" />
      </div>

      {/* New comment input */}
      {currentUserId && (
        <CommentInput
          onSubmit={text => onAddComment(text)}
          placeholder="Add a comment..."
        />
      )}

      {/* Comment list */}
      <div className="space-y-4">
        {threadedComments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          threadedComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onVote={onVote}
              onReply={handleReply}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
