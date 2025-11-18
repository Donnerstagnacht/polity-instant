'use client';

import { use, useState } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import db, { id } from '../../../db';
import { BookOpen, Calendar, MessageSquare, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { StatsBar } from '@/components/ui/StatsBar';
import { BlogSubscribeButton } from '@/features/blogs/ui/BlogSubscribeButton';
import { useSubscribeBlog } from '@/features/blogs/hooks/useSubscribeBlog';
import { ActionBar } from '@/components/ui/ActionBar';
import { useAuthStore } from '@/features/auth/auth';
import { ShareButton } from '@/components/shared/ShareButton';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import { CommentSortSelect, CommentSortBy } from '@/components/shared/CommentSortSelect';

// Comment component for blog comments
interface BlogComment {
  id: string;
  text: string;
  createdAt: number;
  updatedAt?: number;
  upvotes?: number;
  downvotes?: number;
  parentComment?: any;
  creator?: {
    id?: string;
    name?: string;
    handle?: string;
    avatar?: string;
  };
  votes?: {
    id: string;
    vote: number;
    user?: {
      id: string;
    };
  }[];
  replies?: BlogComment[];
}

function CommentItem({ comment, blogId }: { comment: BlogComment; blogId: string }) {
  const { user } = useAuthStore();

  const userVote = comment.votes?.find(v => v.user?.id === user?.id);
  const hasUpvoted = userVote?.vote === 1;
  const hasDownvoted = userVote?.vote === -1;

  // Calculate score from votes relation
  const upvotesFromRelation = comment.votes?.filter(v => v.vote === 1).length || 0;
  const downvotesFromRelation = comment.votes?.filter(v => v.vote === -1).length || 0;
  const score = upvotesFromRelation - downvotesFromRelation;

  const handleVote = async (voteValue: number) => {
    if (!user?.id) {
      toast.error('You must be logged in to vote');
      return;
    }

    try {
      if (userVote) {
        if (userVote.vote === voteValue) {
          // Remove vote
          await db.transact([db.tx.commentVotes[userVote.id].delete()]);
        } else {
          // Change vote
          await db.transact([db.tx.commentVotes[userVote.id].update({ vote: voteValue })]);
        }
      } else {
        // Create new vote
        const voteId = id();
        await db.transact([
          db.tx.commentVotes[voteId].update({
            vote: voteValue,
            createdAt: Date.now(),
          }),
          db.tx.commentVotes[voteId].link({
            comment: comment.id,
            user: user.id,
          }),
        ]);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  return (
    <div className="flex gap-4 rounded-lg border p-4">
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
            <Avatar>
              <AvatarImage src={comment.creator?.avatar} />
              <AvatarFallback>{comment.creator?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{comment.creator?.name || 'Anonymous'}</span>
            {comment.creator?.handle && <span className="text-xs">@{comment.creator.handle}</span>}
            <span>•</span>
            <Clock className="h-4 w-4" />
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <p className="mb-3 whitespace-pre-wrap">{comment.text}</p>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3 border-l-2 pl-4">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} blogId={blogId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<CommentSortBy>('votes');

  // Subscribe hook
  const { subscriberCount } = useSubscribeBlog(resolvedParams.id);

  // Fetch blog data from InstantDB with comments
  // Note: We fetch all comments and filter later to avoid nested query issues
  const { data, isLoading, error } = db.useQuery({
    blogs: {
      $: { where: { id: resolvedParams.id } },
      user: {},
      hashtags: {},
      subscribers: {},
    },
  });

  // Separate query for comments to avoid nesting issues
  const { data: commentsData } = db.useQuery({
    comments: {
      $: { where: { blog: resolvedParams.id } },
      creator: {},
      votes: {
        user: {},
      },
      parentComment: {},
      replies: {
        creator: {},
        votes: {
          user: {},
        },
      },
    },
  });

  const blog = data?.blogs?.[0];
  // Get comments from separate query and filter to only show top-level comments
  const allComments = (commentsData?.comments || []) as BlogComment[];
  const topLevelComments = allComments.filter(comment => !comment.parentComment);

  // Sort comments based on selected sort method
  const comments = [...topLevelComments].sort((a, b) => {
    if (sortBy === 'votes') {
      // Calculate scores from votes relation
      const upvotesA = a.votes?.filter(v => v.vote === 1).length || 0;
      const downvotesA = a.votes?.filter(v => v.vote === -1).length || 0;
      const scoreA = upvotesA - downvotesA;

      const upvotesB = b.votes?.filter(v => v.vote === 1).length || 0;
      const downvotesB = b.votes?.filter(v => v.vote === -1).length || 0;
      const scoreB = upvotesB - downvotesB;

      return scoreB - scoreA; // Higher score first
    } else {
      return b.createdAt - a.createdAt; // Newer first
    }
  });

  // Debug logging
  console.log('Blog query data:', {
    data,
    blogId: resolvedParams.id,
    blog,
    isLoading,
    error,
    allBlogsCount: data?.blogs?.length,
    commentsCount: allComments.length,
  });

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!commentText.trim() || !user?.id) return;

    setIsSubmitting(true);
    try {
      const commentId = id();
      await db.transact([
        db.tx.comments[commentId].update({
          text: commentText,
          createdAt: Date.now(),
        }),
        db.tx.comments[commentId].link({
          blog: resolvedParams.id,
          creator: user.id,
        }),
      ]);

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

  // Handle like - removed, we use comment voting instead

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">Loading blog post...</div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!blog) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Blog Post Not Found</h1>
            <p className="text-muted-foreground">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  const author = blog.user;

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto max-w-6xl p-4">
        {/* Header with centered title */}
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-3">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-4xl font-bold">{blog.title}</h1>
          </div>

          {/* Created By Section - Similar to Amendment's Proposed By */}
          {author && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={author.avatar || author.imageURL} />
                <AvatarFallback>{author.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {t ? t('components.labels.createdBy') : 'Created by'} {author.name || 'Unknown'}
                </p>
                {author.handle && <p className="text-xs text-muted-foreground">@{author.handle}</p>}
              </div>
            </div>
          )}

          {blog.date && (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{blog.date}</span>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <StatsBar
          stats={[
            { value: subscriberCount, labelKey: 'components.labels.subscribers' },
            { value: blog.likeCount || 0, labelKey: 'components.labels.likes' },
            { value: comments.length, labelKey: 'components.labels.comments' },
          ]}
        />

        {/* Action Bar */}
        <ActionBar>
          <BlogSubscribeButton blogId={resolvedParams.id} />
          <Button variant="outline" onClick={() => setIsCommenting(true)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Comment
          </Button>
          <ShareButton url={`/blog/${resolvedParams.id}`} title={blog.title} description="" />
        </ActionBar>

        {/* Hashtags */}
        {blog.hashtags && blog.hashtags.length > 0 && (
          <div className="mb-6">
            <HashtagDisplay hashtags={blog.hashtags} centered />
          </div>
        )}

        {/* Blog Content */}
        <Card className="mb-6">
          <CardContent className="prose prose-slate max-w-none pt-6 dark:prose-invert">
            <p className="lead text-muted-foreground">
              This is where the blog content would appear. The blog post can include rich text,
              images, and other media.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <h2>Section Heading</h2>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
              officia deserunt mollit anim id est laborum.
            </p>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Discussion ({comments.length})</CardTitle>
                <CardDescription>Join the conversation</CardDescription>
              </div>
              <CommentSortSelect sortBy={sortBy} onSortChange={setSortBy} />
            </div>
          </CardHeader>
          <CardContent>
            {/* Add Comment Form */}
            {!isCommenting && (
              <Button
                variant="outline"
                onClick={() => setIsCommenting(true)}
                className="mb-6 w-full"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Comment
              </Button>
            )}

            {isCommenting && (
              <div className="mb-6 space-y-2 rounded-lg border p-4">
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

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No comments yet. Be the first to comment on this post.
                </p>
              ) : (
                comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} blogId={resolvedParams.id} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
