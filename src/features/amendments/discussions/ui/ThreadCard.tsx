import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, ArrowDown, User, Clock, MessageSquare, File } from 'lucide-react';
import { toast } from 'sonner';
import { createComment } from '../utils/thread-operations';
import { voteOnThread, calculateScore } from '@/features/amendments/utils/voting-utils';
import { CommentTree } from './CommentTree';
import type { Thread } from '../hooks/useDiscussions';

interface ThreadCardProps {
  thread: Thread;
  userId?: string;
}

export function ThreadCard({ thread, userId }: ThreadCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const score = calculateScore(thread.upvotes, thread.downvotes);
  const userVote = thread.votes?.find(v => v.user?.id === userId);
  const hasUpvoted = userVote?.vote === 1;
  const hasDownvoted = userVote?.vote === -1;

  const sortedComments = thread.comments || [];

  const handleVote = async (voteValue: number) => {
    if (!userId) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      await voteOnThread(
        thread.id,
        voteValue,
        userVote,
        thread.upvotes || 0,
        thread.downvotes || 0,
        userId
      );
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !userId) return;

    setIsSubmitting(true);
    try {
      await createComment(thread.id, commentText, userId);
      toast.success('Comment posted successfully');
      setCommentText('');
      setIsCommenting(false);
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex gap-4">
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

          {/* Thread content */}
          <div className="flex flex-1 items-start justify-between">
            <div className="flex-1">
              <CardTitle className="mb-2">{thread.title}</CardTitle>
              {thread.description && (
                <CardDescription className="mb-3">{thread.description}</CardDescription>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{thread.creator?.name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                </div>
                <Badge variant="outline">
                  {sortedComments.length} comment{sortedComments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            {thread.file?.url && (
              <a
                href={thread.file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
              >
                <File className="h-4 w-4" />
                Attachment
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Comments */}
        <div className="space-y-4">
          {sortedComments.map(comment => (
            <CommentTree key={comment.id} comment={comment} threadId={thread.id} userId={userId} />
          ))}

          {sortedComments.length === 0 && !isCommenting && (
            <p className="text-center text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          )}

          {/* Add Comment */}
          {!isCommenting && (
            <Button variant="outline" onClick={() => setIsCommenting(true)} className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Add Comment
            </Button>
          )}

          {isCommenting && (
            <div className="space-y-2 rounded-lg border p-4">
              <Textarea
                placeholder="Write your comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddComment} disabled={isSubmitting || !commentText.trim()}>
                  Post Comment
                </Button>
                <Button variant="outline" onClick={() => setIsCommenting(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
