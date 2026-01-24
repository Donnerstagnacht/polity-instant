/**
 * Main blog editor view component
 *
 * Uses the unified editor system from @/features/editor
 */

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Eye, ArrowLeft, FileText, Pencil } from 'lucide-react';
import { ShareButton } from '@/components/shared/ShareButton';

// Unified editor imports
import { useEditor, useEditorUsers, VersionControl, type EditorUser } from '@/features/editor';
import db from '@db/db';

interface BlogEditorViewProps {
  blogId: string;
  userId: string | undefined;
  userRecord: any;
  userColor: string;
}

export function BlogEditorView({ blogId, userId, userRecord, userColor }: BlogEditorViewProps) {
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Unified editor hook
  const {
    entity,
    title: blogTitle,
    content: blogContent,
    discussions,
    mode,
    saveStatus,
    hasUnsavedChanges,
    isSavingTitle,
    isLoading: blogLoading,
    hasAccess,
    isOwnerOrCollaborator,
    setTitle: handleTitleChange,
    setContent: handleContentChange,
    setDiscussions: handleDiscussionsChange,
    setMode: handleModeChange,
    restoreVersion: handleRestoreVersion,
  } = useEditor({
    entityType: 'blog',
    entityId: blogId,
    userId,
  });

  // Query blog data for additional metadata
  const { data: blogData } = db.useQuery({
    blogs: {
      $: { where: { id: blogId } },
      blogRoleBloggers: {
        user: {},
      },
    },
  });
  const blog = blogData?.blogs?.[0];

  // Build current user for hooks
  const currentUser: EditorUser | undefined = userId
    ? {
        id: userId,
        name: userRecord?.name || userRecord?.email || 'Anonymous',
        email: userRecord?.email,
        avatarUrl: userRecord?.avatar,
      }
    : undefined;

  // Build users map for the editor
  const editorUsers = useEditorUsers(entity, currentUser);
  // Additional check from queried data
  const isOwnerOrCollabFromData =
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
          <p className="mb-4 text-lg text-muted-foreground">Blog not found.</p>
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
          <p className="mb-4 text-lg text-muted-foreground">You don't have access to this blog.</p>
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

          {/* Unified Version Control */}
          {userId && blogId && (
            <VersionControl
              entityType="blog"
              entityId={blogId}
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
            {blog.date && <span className="text-muted-foreground">Date: {blog.date}</span>}
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
              currentMode={mode || 'edit'}
              isOwnerOrCollaborator={!!(isOwnerOrCollaborator || isOwnerOrCollabFromData)}
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
