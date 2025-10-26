'use client';

import { use, useState } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import db, { id } from '../../../../db';
import {
  ArrowLeft,
  MessageSquare,
  User,
  Clock,
  Reply,
  Plus,
  File,
  Upload,
  X,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Calendar as CalendarIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/auth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUploadFile } from '@/hooks/use-upload-file';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CommentWithReplies {
  id: string;
  text: string;
  createdAt: number;
  updatedAt?: number;
  parentComment?: any;
  upvotes?: number;
  downvotes?: number;
  creator?: {
    profile?: {
      name?: string;
      handle?: string;
    };
  };
  votes?: {
    id: string;
    vote: number;
    user?: {
      id: string;
    };
  }[];
  replies?: CommentWithReplies[];
}

interface Thread {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  upvotes?: number;
  downvotes?: number;
  creator?: {
    profile?: {
      name?: string;
      handle?: string;
    };
  };
  file?: {
    url?: string;
    path?: string;
  };
  votes?: {
    id: string;
    vote: number;
    user?: {
      id: string;
    };
  }[];
  comments?: CommentWithReplies[];
}

function CommentTree({ comment, threadId }: { comment: CommentWithReplies; threadId: string }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const score = (comment.upvotes || 0) - (comment.downvotes || 0);
  const userVote = comment.votes?.find(v => v.user?.id === user?.id);
  const hasUpvoted = userVote?.vote === 1;
  const hasDownvoted = userVote?.vote === -1;

  const handleVote = async (voteValue: number) => {
    if (!user?.id) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      if (userVote) {
        // Update or remove existing vote
        if (userVote.vote === voteValue) {
          // Remove vote
          await db.transact([
            db.tx.commentVotes[userVote.id].delete(),
            db.tx.comments[comment.id].update({
              upvotes: voteValue === 1 ? (comment.upvotes || 1) - 1 : comment.upvotes,
              downvotes: voteValue === -1 ? (comment.downvotes || 1) - 1 : comment.downvotes,
            }),
          ]);
        } else {
          // Change vote
          await db.transact([
            db.tx.commentVotes[userVote.id].update({ vote: voteValue }),
            db.tx.comments[comment.id].update({
              upvotes:
                voteValue === 1
                  ? (comment.upvotes || 0) + 1
                  : Math.max(0, (comment.upvotes || 1) - 1),
              downvotes:
                voteValue === -1
                  ? (comment.downvotes || 0) + 1
                  : Math.max(0, (comment.downvotes || 1) - 1),
            }),
          ]);
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
          db.tx.comments[comment.id].update({
            upvotes: voteValue === 1 ? (comment.upvotes || 0) + 1 : comment.upvotes,
            downvotes: voteValue === -1 ? (comment.downvotes || 0) + 1 : comment.downvotes,
          }),
        ]);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !user?.id) return;

    setIsSubmitting(true);
    try {
      const commentId = id();
      await db.transact([
        db.tx.comments[commentId].update({
          text: replyText,
          createdAt: Date.now(),
        }),
        db.tx.comments[commentId].link({
          thread: threadId,
          creator: user.id,
          parentComment: comment.id,
        }),
      ]);

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
                  <User className="h-4 w-4" />
                  <span>{comment.creator?.profile?.name || 'Anonymous'}</span>
                  {comment.creator?.profile?.handle && (
                    <span className="text-xs">@{comment.creator.profile.handle}</span>
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
            <CommentTree key={reply.id} comment={reply} threadId={threadId} />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadCard({ thread, sortBy }: { thread: Thread; sortBy: 'votes' | 'time' }) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

  const score = (thread.upvotes || 0) - (thread.downvotes || 0);
  const userVote = thread.votes?.find(v => v.user?.id === user?.id);
  const hasUpvoted = userVote?.vote === 1;
  const hasDownvoted = userVote?.vote === -1;

  // Organize comments into a tree structure and sort
  const allComments = thread.comments || [];
  const rootComments = allComments.filter(c => !c.parentComment);

  // Sort root comments
  const sortedRootComments = [...rootComments].sort((a, b) => {
    if (sortBy === 'votes') {
      const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
      const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return b.createdAt - a.createdAt;
    } else {
      return b.createdAt - a.createdAt;
    }
  });

  // Function to recursively sort replies
  const sortCommentTree = (comment: CommentWithReplies): CommentWithReplies => {
    if (!comment.replies || comment.replies.length === 0) return comment;

    const sortedReplies = [...comment.replies]
      .sort((a, b) => {
        if (sortBy === 'votes') {
          const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
          const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return b.createdAt - a.createdAt;
        } else {
          return b.createdAt - a.createdAt;
        }
      })
      .map(sortCommentTree);

    return { ...comment, replies: sortedReplies };
  };

  const sortedComments = sortedRootComments.map(sortCommentTree);

  const handleVote = async (voteValue: number) => {
    if (!user?.id) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      if (userVote) {
        // Update or remove existing vote
        if (userVote.vote === voteValue) {
          // Remove vote
          await db.transact([
            db.tx.threadVotes[userVote.id].delete(),
            db.tx.threads[thread.id].update({
              upvotes: voteValue === 1 ? (thread.upvotes || 1) - 1 : thread.upvotes,
              downvotes: voteValue === -1 ? (thread.downvotes || 1) - 1 : thread.downvotes,
            }),
          ]);
        } else {
          // Change vote
          await db.transact([
            db.tx.threadVotes[userVote.id].update({ vote: voteValue }),
            db.tx.threads[thread.id].update({
              upvotes:
                voteValue === 1
                  ? (thread.upvotes || 0) + 1
                  : Math.max(0, (thread.upvotes || 1) - 1),
              downvotes:
                voteValue === -1
                  ? (thread.downvotes || 0) + 1
                  : Math.max(0, (thread.downvotes || 1) - 1),
            }),
          ]);
        }
      } else {
        // Create new vote
        const voteId = id();
        await db.transact([
          db.tx.threadVotes[voteId].update({
            vote: voteValue,
            createdAt: Date.now(),
          }),
          db.tx.threadVotes[voteId].link({
            thread: thread.id,
            user: user.id,
          }),
          db.tx.threads[thread.id].update({
            upvotes: voteValue === 1 ? (thread.upvotes || 0) + 1 : thread.upvotes,
            downvotes: voteValue === -1 ? (thread.downvotes || 0) + 1 : thread.downvotes,
          }),
        ]);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

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
          thread: thread.id,
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
                  <span>{thread.creator?.profile?.name || 'Anonymous'}</span>
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
            <CommentTree key={comment.id} comment={comment} threadId={thread.id} />
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

function CreateThreadDialog({
  amendmentId,
  open,
  onOpenChange,
}: {
  amendmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const user = useAuthStore(state => state.user);
  const { uploadFile, isUploading } = useUploadFile();

  const handleSubmit = async () => {
    if (!title.trim() || !user?.id) return;

    setIsSubmitting(true);
    try {
      const threadId = id();
      const now = Date.now();

      // Upload file if selected
      let uploadedFileId: string | null = null;
      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile);
        if (uploadResult?.key) {
          uploadedFileId = uploadResult.key;
        }
      }

      // Create thread
      const transactions = [
        db.tx.threads[threadId].update({
          title,
          description: description || undefined,
          createdAt: now,
          updatedAt: now,
        }),
        db.tx.threads[threadId].link({
          amendment: amendmentId,
          creator: user.id,
        }),
      ];

      // Link file if uploaded
      if (uploadedFileId) {
        transactions.push(db.tx.threads[threadId].link({ file: uploadedFileId }));
      }

      await db.transact(transactions);

      toast.success('Thread created successfully');
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to create thread');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Discussion Thread</DialogTitle>
          <DialogDescription>Start a new discussion about this amendment</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter thread title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this thread is about..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="file">Attachment (Optional)</Label>
            <div className="mt-2">
              {selectedFile ? (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    <span className="text-sm">{selectedFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 hover:bg-muted">
                  <Upload className="h-5 w-5" />
                  <span>Choose file to attach</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isUploading || !title.trim()}>
            {isUploading ? 'Uploading...' : isSubmitting ? 'Creating...' : 'Create Thread'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AmendmentDiscussionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'votes' | 'time'>('votes');

  // Fetch amendment data with threads and comments
  const { data, isLoading } = db.useQuery({
    amendments: {
      $: { where: { id: resolvedParams.id } },
      threads: {
        creator: {
          profile: {},
        },
        file: {},
        votes: {
          user: {},
        },
        comments: {
          creator: {
            profile: {},
          },
          votes: {
            user: {},
          },
          replies: {
            creator: {
              profile: {},
            },
            votes: {
              user: {},
            },
          },
        },
      },
    },
  });

  const amendment = data?.amendments?.[0];
  const rawThreads = (amendment?.threads || []) as Thread[];

  // Sort threads
  const threads = [...rawThreads].sort((a, b) => {
    if (sortBy === 'votes') {
      const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
      const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
      if (scoreA !== scoreB) return scoreB - scoreA; // Higher score first
      return b.createdAt - a.createdAt; // Newer first if equal
    } else {
      return b.createdAt - a.createdAt; // Newer first
    }
  });

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">Loading discussions...</div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!amendment) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Amendment Not Found</h1>
            <p className="text-muted-foreground">
              The amendment you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href={`/amendment/${resolvedParams.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Amendment
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <MessageSquare className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Discussions</h1>
            </div>
            <p className="text-muted-foreground">
              {threads.length} discussion thread{threads.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: 'votes' | 'time') => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="votes">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Top Voted</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="time">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Newest First</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Thread
            </Button>
          </div>
        </div>

        {/* Threads List */}
        <div className="space-y-6">
          {threads.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">
                  No discussion threads yet. Start a conversation!
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Thread
                </Button>
              </CardContent>
            </Card>
          ) : (
            threads.map(thread => <ThreadCard key={thread.id} thread={thread} sortBy={sortBy} />)
          )}
        </div>

        {/* Create Thread Dialog */}
        <CreateThreadDialog
          amendmentId={resolvedParams.id}
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </PageWrapper>
    </AuthGuard>
  );
}
