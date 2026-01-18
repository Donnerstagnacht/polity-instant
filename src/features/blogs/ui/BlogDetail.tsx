'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import db, { id } from '../../../../db/db';
import { BookOpen, Calendar, MessageSquare, Clock, ArrowUp, ArrowDown, Trash2, Edit } from 'lucide-react';
import { StatsBar } from '@/components/ui/StatsBar';
import { useSubscribeBlog } from '@/features/blogs/hooks/useSubscribeBlog';
import { ActionBar } from '@/components/ui/ActionBar';
import { useAuthStore } from '@/features/auth/auth';
import { ShareButton } from '@/components/shared/ShareButton';
import { SubscribeButton } from '@/components/shared/action-buttons';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import { CommentSortSelect, CommentSortBy } from '@/components/shared/CommentSortSelect';
import { useBlogPermissions } from '../hooks/useBlogPermissions';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import Link from 'next/link';
import { notifyBlogCommentAdded } from '@/utils/notification-helpers';

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

interface BlogDetailProps {
  blogId: string;
}

export function BlogDetail({ blogId }: BlogDetailProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<CommentSortBy>('votes');

  // Permissions
  const { canEdit, canDelete, canManageMembers } = useBlogPermissions(blogId);

  // Subscribe hook
  const {
    isSubscribed,
    subscriberCount,
    toggleSubscribe,
    isLoading: subscribeLoading,
  } = useSubscribeBlog(blogId);

  // Query current user's name for notifications
  const { data: currentUserData } = db.useQuery(
    user?.id
      ? {
          $users: {
            $: {
              where: { id: user.id },
              limit: 1,
            },
          },
        }
      : null
  );
  const currentUserName = currentUserData?.$users?.[0]?.name || 'Someone';

  // Fetch blog data from InstantDB with comments
  const { data, isLoading } = db.useQuery({
    blogs: {
      $: { where: { id: blogId } },
      blogRoleBloggers: {
        user: {},
        role: {},
      },
      hashtags: {},
      subscribers: {},
      votes: {
        user: {},
      },
    },
  });

  // Separate query for comments to avoid nesting issues
  const { data: commentsData } = db.useQuery({
    comments: {
      $: { where: { blog: blogId } },
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

  // Vote handling
  const score = (blog?.upvotes || 0) - (blog?.downvotes || 0);
  const userVote = blog?.votes?.find((v: any) => v.user?.id === user?.id);
  const hasUpvoted = userVote?.vote === 1;
  const hasDownvoted = userVote?.vote === -1;

  const handleVote = async (voteValue: number) => {
    if (!user?.id) {
      toast.error('Please log in to vote');
      return;
    }

    if (!blog) {
      toast.error('Blog data not loaded');
      return;
    }

    try {
      if (userVote) {
        // Update or remove existing vote
        if (userVote.vote === voteValue) {
          // Remove vote
          await db.transact([
            db.tx.blogSupportVotes[userVote.id].delete(),
            db.tx.blogs[blogId].update({
              upvotes: voteValue === 1 ? (blog.upvotes || 1) - 1 : blog.upvotes,
              downvotes: voteValue === -1 ? (blog.downvotes || 1) - 1 : blog.downvotes,
            }),
          ]);
        } else {
          // Change vote
          await db.transact([
            db.tx.blogSupportVotes[userVote.id].update({ vote: voteValue }),
            db.tx.blogs[blogId].update({
              upvotes:
                voteValue === 1
                  ? (blog.upvotes || 0) + 1
                  : Math.max(0, (blog.upvotes || 1) - 1),
              downvotes:
                voteValue === -1
                  ? (blog.downvotes || 0) + 1
                  : Math.max(0, (blog.downvotes || 1) - 1),
            }),
          ]);
        }
      } else {
        // Create new vote
        const voteId = id();
        await db.transact([
          db.tx.blogSupportVotes[voteId].update({
            vote: voteValue,
            createdAt: Date.now(),
          }),
          db.tx.blogSupportVotes[voteId].link({
            blog: blogId,
            user: user.id,
          }),
          db.tx.blogs[blogId].update({
            upvotes: voteValue === 1 ? (blog.upvotes || 0) + 1 : blog.upvotes,
            downvotes: voteValue === -1 ? (blog.downvotes || 0) + 1 : blog.downvotes,
          }),
        ]);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

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

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!commentText.trim() || !user?.id) return;

    setIsSubmitting(true);
    try {
      const commentId = id();
      const transactions: any[] = [
        db.tx.comments[commentId].update({
          text: commentText,
          createdAt: Date.now(),
        }),
        db.tx.comments[commentId].link({
          blog: blogId,
          creator: user.id,
        }),
      ];

      // Add notification to the blog entity
      if (blog) {
        const notificationTxs = notifyBlogCommentAdded({
          senderId: user.id,
          senderName: currentUserName,
          blogId,
          blogTitle: blog.title || 'Blog',
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);

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

  const handleDeleteBlog = async () => {
    if (!confirm(t('features.blogs.detail.confirmDelete'))) return;
    try {
      await db.transact([db.tx.blogs[blogId].delete()]);
      toast.success(t('features.blogs.detail.blogDeleted'));
      router.push('/');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error(t('features.blogs.detail.blogDeleteFailed'));
    }
  };

  if (isLoading) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <div className="py-12 text-center">{t('features.blogs.detail.loading')}</div>
      </PageWrapper>
    );
  }

  if (!blog) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">{t('features.blogs.detail.notFound')}</h1>
          <p className="text-muted-foreground">
            {t('features.blogs.detail.notFoundDescription')}
          </p>
        </div>
      </PageWrapper>
    );
  }

  // Get the blog author - find the owner or first blogger
  const author =
    blog.blogRoleBloggers?.find((blogger: any) => blogger.status === 'owner')?.user ||
    blog.blogRoleBloggers?.[0]?.user;

  return (
    <PageWrapper className="container mx-auto max-w-6xl p-4">
      {/* Header with centered title */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <BookOpen className="h-8 w-8" />
          <h1 className="text-4xl font-bold">{blog.title}</h1>
        </div>

        {/* Created By Section */}
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
          { value: score, labelKey: 'components.labels.supporters' },
          { value: comments.length, labelKey: 'components.labels.comments' },
        ]}
      />

      {/* Action Bar */}
      <ActionBar>
        <SubscribeButton
          entityType="blog"
          entityId={blogId}
          isSubscribed={isSubscribed}
          onToggleSubscribe={toggleSubscribe}
          isLoading={subscribeLoading}
        />
        <div className="flex h-10 items-center gap-1 rounded-lg border bg-card px-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${hasUpvoted ? 'text-orange-500' : ''}`}
            onClick={() => handleVote(1)}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${hasDownvoted ? 'text-blue-500' : ''}`}
            onClick={() => handleVote(-1)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setIsCommenting(true)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          {t('features.blogs.detail.comment')}
        </Button>
        <ShareButton url={`/blog/${blogId}`} title={blog.title} description="" />
        
        {/* RBAC Actions */}
        {canDelete && (
          <Button variant="destructive" onClick={handleDeleteBlog}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('features.blogs.delete')}
          </Button>
        )}
      </ActionBar>

      {/* Hashtags */}
      {blog.hashtags && blog.hashtags.length > 0 && (
        <div className="mb-6">
          <HashtagDisplay hashtags={blog.hashtags} centered />
        </div>
      )}

      {/* Blog Content */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('features.blogs.detail.blogContent')}</CardTitle>
            <CardDescription>
              {blog.content ? t('features.blogs.detail.latestVersion') : t('features.blogs.detail.noContentYet')}
            </CardDescription>
          </div>
          {canEdit && (
            <Link href={`/blog/${blogId}/editor`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                {t('features.blogs.detail.editContent')}
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent className="prose prose-slate max-w-none dark:prose-invert">
          {blog.content && Array.isArray(blog.content) && blog.content.length > 0 ? (
            <PlateEditor
              value={blog.content}
              currentMode="view"
              isOwnerOrCollaborator={false}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>{t('features.blogs.detail.noContentAvailable')}</p>
              {canEdit && (
                <Link href={`/blog/${blogId}/editor`}>
                  <Button variant="outline" className="mt-4">
                    <Edit className="mr-2 h-4 w-4" />
                    {t('features.blogs.detail.startWriting')}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('features.blogs.detail.discussion')} ({comments.length})</CardTitle>
              <CardDescription>{t('features.blogs.detail.discussionDescription')}</CardDescription>
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
              {t('features.blogs.detail.addComment')}
            </Button>
          )}

          {isCommenting && (
            <div className="mb-6 space-y-2 rounded-lg border p-4">
              <Textarea
                placeholder={t('features.blogs.detail.writeComment')}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddComment} disabled={isSubmitting || !commentText.trim()}>
                  {t('features.blogs.detail.postComment')}
                </Button>
                <Button variant="outline" onClick={() => setIsCommenting(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                {t('features.blogs.detail.noCommentsYet')}
              </p>
            ) : (
              comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} blogId={blogId} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
