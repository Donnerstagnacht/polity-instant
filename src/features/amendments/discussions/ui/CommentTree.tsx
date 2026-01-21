import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Reply, ArrowUp, ArrowDown, User, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { createComment } from '../utils/thread-operations';
import { voteOnComment, calculateScore } from '@/features/amendments/utils/voting-utils';
import type { CommentWithReplies } from '../utils/comment-tree';

interface CommentTreeProps {
  comment: CommentWithReplies;
  threadId: string;
  userId?: string;
}

export function CommentTree({ comment, threadId, userId }: CommentTreeProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const score = calculateScore(comment.upvotes, comment.downvotes);
  const userVote = comment.votes?.find(v => v.user?.id === userId);
  const hasUpvoted = userVote?.vote === 1;
  const hasDownvoted = userVote?.vote === -1;

  const handleVote = async (voteValue: number) => {
    if (!userId) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      await voteOnComment(
        comment.id,
        voteValue,
        userVote,
        comment.upvotes || 0,
        comment.downvotes || 0,
        userId
      );
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !userId) return;

    setIsSubmitting(true);
    try {
      await createComment(threadId, replyText, userId, comment.id);
      toast.success('Reply posted successfully');
      setReplyText('');
      setIsReplying(false);
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            {/* Vote buttons */}
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${hasUpvoted ? 'text-orange-500' : ''}`}
                onClick={() => handleVote(1)}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span
                className={`text-sm font-semibold ${score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : ''}`}
              >
                {score}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${hasDownvoted ? 'text-blue-500' : ''}`}
                onClick={() => handleVote(-1)}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Comment content */}
            <div className="flex-1">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.creator?.avatar || comment.creator?.imageURL} />
                    <AvatarFallback>{comment.creator?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <span>{comment.creator?.name || 'Anonymous'}</span>
                  {comment.creator?.handle && (
                    <span className="text-xs">@{comment.creator.handle}</span>
                  )}
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="mb-3 whitespace-pre-wrap">{comment.text}</p>
              <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)}>
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </Button>

              {isReplying && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleReply} disabled={isSubmitting || !replyText.trim()}>
                      Post Reply
                    </Button>
                    <Button variant="outline" onClick={() => setIsReplying(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 space-y-3 border-l-2 border-muted pl-4">
          {comment.replies.map(reply => (
            <CommentTree key={reply.id} comment={reply} threadId={threadId} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}
