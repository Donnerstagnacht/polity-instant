'use client';

import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useZero } from '@rocicorp/zero/react';
import { PageWrapper } from '@/layout/page-wrapper';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { HashtagDisplay } from '@/features/shared/ui/ui/hashtag-display';
import { extractHashtags } from '@/zero/common/hashtagHelpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useUserState } from '@/zero/users/useUserState';
import { BookOpen, Calendar, Trash2, Edit } from 'lucide-react';
import { StatsBar } from '@/features/shared/ui/ui/StatsBar';
import { useSubscribeBlog } from '@/features/blogs/hooks/useSubscribeBlog';
import { ActionBar } from '@/features/shared/ui/ui/ActionBar';
import { useAuth } from '@/providers/auth-provider';
import { ShareButton } from '@/features/shared/ui/action-buttons/ShareButton.tsx';
import { SubscribeButton } from 'src/features/shared/ui/action-buttons';
import { VoteButtons, type VoteValue } from '@/features/shared/ui/voting';
import { CommentThread } from '@/features/shared/ui/comments';
import type { CommentData } from '@/features/shared/ui/comments';
import { toast } from 'sonner';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useBlogPermissions } from '../hooks/useBlogPermissions';
import { usePermissions } from '@/zero/rbac/usePermissions';
import { PlateEditor } from '@/features/shared/ui/kit-platejs/plate-editor';
import { Link } from '@tanstack/react-router';
import { mutators } from '@/zero/mutators';
import { useNotificationDispatch } from '@/zero/notifications/useNotificationDispatch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/ui/ui/alert-dialog';

interface BlogDetailProps {
  blogId: string;
}

export function BlogDetail({ blogId }: BlogDetailProps) {
  const navigate = useNavigate();
  const zero = useZero();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Permissions — blog-level + group-level
  const { canEdit: blogCanEdit, canDelete: blogCanDelete } = useBlogPermissions(blogId);
  const blogActions = useBlogActions();
  const { addComment: addCommentAction, voteComment } = useDocumentActions();
  const { currentUser } = useUserState();
  const { dispatchEntity: dispatchNotification } = useNotificationDispatch();

  // Subscribe hook
  const {
    isSubscribed,
    subscriberCount,
    toggleSubscribe,
    isLoading: subscribeLoading,
  } = useSubscribeBlog(blogId);

  // Query current user's name for notifications
  const currentUserName = currentUser?.first_name || 'Someone';

  // Fetch blog data with relations
  const { blogWithDetails, comments: commentsRows, blogThread } = useBlogState({
    blogId,
    includeDetails: true,
    includeComments: true,
  });

  const blog = blogWithDetails;

  // Map Zero comment rows → CommentData shape expected by CommentThread
  const allComments: CommentData[] = useMemo(() => {
    return (commentsRows || []).map((c: any) => ({
      id: c.id,
      text: c.content ?? '',
      createdAt: c.created_at ?? 0,
      creator: c.user
        ? {
            id: c.user.id,
            name: [c.user.first_name, c.user.last_name].filter(Boolean).join(' ') || undefined,
            handle: c.user.handle ?? undefined,
            avatar: c.user.avatar ?? undefined,
          }
        : undefined,
      votes: (c.votes ?? []).map((v: any) => ({
        id: v.id,
        vote: v.vote,
        user: v.user ? { id: v.user.id } : undefined,
      })),
      replies: (c.replies ?? []).map((r: any) => ({
        id: r.id,
        text: r.content ?? '',
        createdAt: r.created_at ?? 0,
        creator: r.user
          ? {
              id: r.user.id,
              name: [r.user.first_name, r.user.last_name].filter(Boolean).join(' ') || undefined,
              handle: r.user.handle ?? undefined,
              avatar: r.user.avatar ?? undefined,
            }
          : undefined,
        votes: (r.votes ?? []).map((v: any) => ({
          id: v.id,
          vote: v.vote,
          user: v.user ? { id: v.user.id } : undefined,
        })),
      })),
    }));
  }, [commentsRows]);

  // Group-level permission check for "Manage Group" rights
  const { can: canGroup } = usePermissions({ groupId: blog?.group_id ?? undefined });
  const groupCanManage = blog?.group_id ? canGroup('manage', 'groups') : false;

  // Combined permissions: blog RBAC OR group "Manage Group"
  const canEdit = blogCanEdit || groupCanManage;
  const canDelete = blogCanDelete || groupCanManage;

  // Vote handling
  const score = (blog?.upvotes || 0) - (blog?.downvotes || 0);
  const userVote = blog?.support_votes?.find((v: any) => v.user?.id === user?.id);
  const currentVoteValue: VoteValue = userVote ? (userVote.vote === 1 ? 1 : -1) : 0;

  const handleVote = async (voteValue: VoteValue) => {
    if (!user?.id) {
      toast.error('Please log in to vote');
      return;
    }
    if (!blog) return;

    try {
      if (userVote) {
        if (userVote.vote === voteValue) {
          await blogActions.deleteSupportVote(userVote.id);
          await blogActions.updateBlog({
            id: blogId,
            upvotes: voteValue === 1 ? (blog.upvotes || 1) - 1 : blog.upvotes,
            downvotes: voteValue === -1 ? (blog.downvotes || 1) - 1 : blog.downvotes,
          });
        } else {
          await blogActions.updateSupportVote({ id: userVote.id, vote: voteValue });
          await blogActions.updateBlog({
            id: blogId,
            upvotes:
              voteValue === 1 ? (blog.upvotes || 0) + 1 : Math.max(0, (blog.upvotes || 1) - 1),
            downvotes:
              voteValue === -1 ? (blog.downvotes || 0) + 1 : Math.max(0, (blog.downvotes || 1) - 1),
          });
        }
      } else {
        const voteId = crypto.randomUUID();
        await blogActions.createSupportVote({ id: voteId, vote: voteValue, blog_id: blogId });
        await blogActions.updateBlog({
          id: blogId,
          upvotes: voteValue === 1 ? (blog.upvotes || 0) + 1 : blog.upvotes,
          downvotes: voteValue === -1 ? (blog.downvotes || 0) + 1 : blog.downvotes,
        });

        const blogAuthor =
          blog.bloggers?.find((b: any) => b.status === 'owner')?.user || blog.bloggers?.[0]?.user;
        if (blogAuthor?.id && blogAuthor.id !== user.id) {
          await dispatchNotification({
            type: 'blog_vote_cast',
            title: voteValue === 1 ? 'Blog Upvoted' : 'Blog Downvoted',
            message: `${currentUserName} has ${voteValue === 1 ? 'upvote' : 'downvote'}d ${blog.title || 'Blog'}`,
            senderId: user.id,
            recipientEntityType: 'blog',
            recipientEntityId: blogId,
            relatedEntityType: 'blog',
            relatedEntityId: blogId,
          });
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleAddComment = async (text: string, parentId?: string) => {
    if (!text.trim() || !user?.id) return;
    try {
      // Create a thread for this blog if one doesn't exist yet
      if (!blogThread) {
        await zero.mutate(mutators.documents.createThread({
          id: blogId,
          document_id: null,
          amendment_id: null,
          statement_id: null,
          blog_id: blogId,
          content: null,
          status: 'open',
          resolved_at: null,
          position: null,
          user_id: user.id,
          upvotes: 0,
          downvotes: 0,
        }));
      }

      const commentId = crypto.randomUUID();
      await addCommentAction({
        id: commentId,
        thread_id: blogId,
        parent_id: parentId || null,
        content: text,
        upvotes: 0,
        downvotes: 0,
        user_id: user.id,
      });
      if (blog) {
        await dispatchNotification({
          type: 'blog_comment_added',
          title: 'New Comment',
          message: `${currentUserName} commented on ${blog.title || 'Blog'}`,
          senderId: user.id,
          recipientEntityType: 'blog',
          recipientEntityId: blogId,
          relatedEntityType: 'blog',
          relatedEntityId: blogId,
        });
      }
      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    }
  };

  const handleCommentVote = async (commentId: string, voteValue: number) => {
    if (!user?.id) return;
    try {
      await voteComment({
        id: crypto.randomUUID(),
        comment_id: commentId,
        user_id: user.id,
        vote: voteValue,
      });
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const handleDeleteBlog = async () => {
    try {
      // Send deletion notifications before removing the blog entity
      if (user?.id && blog) {
        await dispatchNotification({
          type: 'blog_deleted',
          title: 'Blog Deleted',
          message: `${blog.title || 'Blog'} has been deleted`,
          senderId: user.id,
          recipientEntityType: 'blog',
          recipientEntityId: blogId,
          relatedEntityType: 'blog',
          relatedEntityId: blogId,
        });
      }
      await blogActions.deleteBlog(blogId);
      toast.success(t('features.blogs.detail.blogDeleted'));
      const groupId = blog?.group_id;
      if (groupId) {
        navigate({ to: '/group/$id/blogs-and-statements', params: { id: groupId } });
      } else {
        navigate({ to: '/' });
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error(t('features.blogs.detail.blogDeleteFailed'));
    }
  };

  if (!blogWithDetails) {
    return (
      <PageWrapper>
        <div className="py-12 text-center">{t('features.blogs.detail.loading')}</div>
      </PageWrapper>
    );
  }

  if (!blog) {
    return (
      <PageWrapper>
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">{t('features.blogs.detail.notFound')}</h1>
          <p className="text-muted-foreground">{t('features.blogs.detail.notFoundDescription')}</p>
        </div>
      </PageWrapper>
    );
  }

  // Get the blog author - find the owner or first blogger
  const author =
    blog.bloggers?.find((blogger: any) => blogger.status === 'owner')?.user ||
    blog.bloggers?.[0]?.user;

  // Compute context-aware editor URL
  const editorUrl = blog.group_id
    ? `/group/${blog.group_id}/blog/${blogId}/editor`
    : `/user/${author?.id || user?.id}/blog/${blogId}/editor`;

  // Compute context-aware blog view URL (for share, back links)
  const blogViewUrl = blog.group_id
    ? `/group/${blog.group_id}/blog/${blogId}`
    : `/user/${author?.id || user?.id}/blog/${blogId}`;

  return (
    <PageWrapper>
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
              <AvatarImage src={author.avatar ?? undefined} />
              <AvatarFallback>{author.first_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium">
                {t ? t('components.labels.createdBy') : 'Created by'}{' '}
                {[author.first_name, author.last_name].filter(Boolean).join(' ') || 'Unknown'}
              </p>
              {author.handle && <p className="text-muted-foreground text-xs">@{author.handle}</p>}
            </div>
          </div>
        )}

        {blog.date && (
          <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2 text-sm">
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
          { value: allComments.length, labelKey: 'components.labels.comments' },
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
        <VoteButtons
          upvotes={blog.upvotes ?? 0}
          downvotes={blog.downvotes ?? 0}
          userVote={currentVoteValue}
          onVote={handleVote}
          orientation="horizontal"
        />
        <ShareButton url={blogViewUrl} title={blog.title ?? ''} description="" />

        {/* RBAC Actions */}
        {canEdit && (
          <Link to={editorUrl}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              {t('features.blogs.detail.editBlog')}
            </Button>
          </Link>
        )}
        {canDelete && (
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            {t('features.blogs.delete')}
          </Button>
        )}
      </ActionBar>

      {/* Hashtags */}
      {blog.blog_hashtags && blog.blog_hashtags.length > 0 && (
        <div className="mb-6">
          <HashtagDisplay hashtags={extractHashtags([...blog.blog_hashtags])} centered />
        </div>
      )}

      {/* Blog Content */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('features.blogs.detail.blogContent')}</CardTitle>
            <CardDescription>
              {blog.content
                ? t('features.blogs.detail.latestVersion')
                : t('features.blogs.detail.noContentYet')}
            </CardDescription>
          </div>
          {canEdit && (
            <Link to={editorUrl}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                {t('features.blogs.detail.editContent')}
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent className="prose prose-slate dark:prose-invert max-w-none">
          {blog.content && Array.isArray(blog.content) && blog.content.length > 0 ? (
            <PlateEditor
              value={blog.content as any[]}
              currentMode="view"
              isOwnerOrCollaborator={false}
            />
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              <p>{t('features.blogs.detail.noContentAvailable')}</p>
              {canEdit && (
                <Link to={editorUrl}>
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
      <CommentThread
        comments={allComments}
        currentUserId={user?.id}
        onAddComment={handleAddComment}
        onVote={handleCommentVote}
        className="mt-6"
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('features.blogs.detail.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('features.blogs.detail.confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                setDeleteOpen(false);
                await handleDeleteBlog();
              }}
            >
              {t('common.actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}
