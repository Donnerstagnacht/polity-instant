/**
 * Main blog editor view component
 */

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Eye, ArrowLeft, FileText, Pencil } from 'lucide-react';
import { VersionControl } from './VersionControl';
import { ShareButton } from '@/components/shared/ShareButton';
import { useBlogEditor } from '../hooks/useBlogEditor';
import db from '../../../../db/db';

interface BlogEditorViewProps {
  blogId: string;
  userId: string | undefined;
  userRecord: any;
  userColor: string;
}

export function BlogEditorView({
  blogId,
  userId,
  userRecord,
  userColor,
}: BlogEditorViewProps) {
  const router = useRouter();

  // Blog editor hook
  const {
    blogTitle,
    editorValue,
    discussions,
    blogContent,
    isSavingTitle,
    isEditingTitle,
    saveStatus,
    hasUnsavedChanges,
    blog,
    blogLoading,
    setIsEditingTitle,
    setDiscussions,
    handleContentChange,
    handleTitleChange,
    handleDiscussionsChange,
  } = useBlogEditor({ blogId, userId });

  // Build users map for the editor
  const editorUsers = useMemo(() => {
    const users: Record<string, { id: string; name: string; avatarUrl: string }> = {};

    if (userId && userRecord) {
      users[userId] = {
        id: userId,
        name: userRecord.name || userRecord.email || 'You',
        avatarUrl: userRecord.avatar || '',
      };
    }

    // Add other bloggers
    if (blog?.blogRoleBloggers) {
      blog.blogRoleBloggers.forEach((blogger: any) => {
        if (blogger.user && blogger.user.id !== userId) {
          users[blogger.user.id] = {
            id: blogger.user.id,
            name: blogger.user.name || blogger.user.email || 'User',
            avatarUrl: blogger.user.avatar || '',
          };
        }
      });
    }

    return users;
  }, [userId, userRecord, blog?.blogRoleBloggers]);

  // Handlers
  const handleRestoreVersion = useCallback(
    async (content: any[]) => {
      if (!blogId || !userId) return;

      // Update local state after restore
      handleContentChange(content);
    },
    [blogId, userId, handleContentChange]
  );

  // Check if user has access
  const hasAccess =
    blog &&
    (blog.blogRoleBloggers?.some((b: any) => b.user?.id === userId) ||
      blog.isPublic);

  // Check if user is owner or collaborator
  const isOwnerOrCollaborator =
    blog &&
    blog.blogRoleBloggers?.some(
      (b: any) => b.user?.id === userId && (b.status === 'owner' || b.status === 'admin')
    );

  if (blogLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!blog) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <p className="mb-4 text-lg text-muted-foreground">
            Blog not found.
          </p>
          <Button onClick={() => router.push(`/blog`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <p className="mb-4 text-lg text-muted-foreground">
            You don't have access to this blog.
          </p>
          <Button onClick={() => router.push(`/blog/${blogId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/blog/${blogId}`}>
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          {/* Share Button */}
          <ShareButton
            url={`/blog/${blogId}`}
            title={blogTitle || blog.title}
            description={blog.description || ''}
          />

          {/* Version Control */}
          {userId && blogId && (
            <VersionControl
              blogId={blogId}
              currentContent={blogContent}
              currentUserId={userId}
              onRestoreVersion={handleRestoreVersion}
            />
          )}

          {blog.isPublic !== undefined && (
            <Badge variant="outline" className="capitalize">
              {blog.isPublic ? 'Public' : 'Private'}
            </Badge>
          )}
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8" />
            <div className="flex-1">
              {isEditingTitle ? (
                <Input
                  value={blogTitle}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                  placeholder="Blog Title"
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      setIsEditingTitle(false);
                    }
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{blogTitle || 'Untitled Blog'}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {saveStatus === 'saving' || isSavingTitle ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <span className="text-destructive">⚠️ Save failed</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <span className="text-yellow-600">Unsaved changes</span>
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  <span>All changes saved</span>
                </>
              )}
            </div>
          </div>
          <CardDescription>
            Edit the content of your blog post. Changes are saved automatically as you type.
          </CardDescription>

          {/* Blog metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {blog.date && (
              <span className="text-muted-foreground">Date: {blog.date}</span>
            )}
            {blog.upvotes !== undefined && (
              <span className="text-muted-foreground">{blog.upvotes} upvotes</span>
            )}
          </div>

          {/* Bloggers list */}
          {blog.blogRoleBloggers && blog.blogRoleBloggers.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Bloggers:</span>
              {blog.blogRoleBloggers.map((blogger: any) => (
                <div
                  key={blogger.id}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-1"
                >
                  <Avatar className="h-5 w-5">
                    {blogger.user?.avatar ? (
                      <AvatarImage src={blogger.user.avatar} alt={blogger.user.name || ''} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {blogger.user?.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{blogger.user?.name || 'Unknown'}</span>
                </div>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="min-h-[600px]">
            <PlateEditor
              key={blogId}
              value={blogContent}
              onChange={handleContentChange}
              documentId={blogId}
              documentTitle={blogTitle}
              currentMode={(blog.editingMode as any) || 'edit'}
              isOwnerOrCollaborator={!!isOwnerOrCollaborator}
              currentUser={
                userId && userRecord
                  ? {
                      id: userId,
                      name: userRecord.name || userRecord.email || 'Anonymous',
                      avatar: userRecord.avatar,
                    }
                  : undefined
              }
              users={editorUsers}
              discussions={discussions}
              onDiscussionsChange={handleDiscussionsChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
