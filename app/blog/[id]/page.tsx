'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db from '../../../db';
import { BookOpen, User, Calendar, Heart, MessageSquare, Share2 } from 'lucide-react';

export default function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  // Fetch blog data from InstantDB
  const { data, isLoading } = db.useQuery({
    blogs: {
      $: { where: { id: resolvedParams.id } },
      user: {
        profile: {},
      },
    },
  });

  const blog = data?.blogs?.[0];

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

  const author = blog.user?.profile;

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <BookOpen className="h-8 w-8" />
            <Badge variant="default">Blog Post</Badge>
          </div>
          <h1 className="mb-4 text-4xl font-bold">{blog.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            {blog.date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{blog.date}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>{blog.likes || 0} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{blog.comments || 0} comments</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-6 md:col-span-3">
            {/* Blog Content */}
            <Card>
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
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                  fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                  culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </CardContent>
            </Card>

            {/* Engagement Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <Heart className="mr-2 h-4 w-4" />
                      Like ({blog.likes || 0})
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Comment ({blog.comments || 0})
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle>Comments ({blog.comments || 0})</CardTitle>
                <CardDescription>Join the discussion</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No comments yet. Be the first to comment on this post.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            {author && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Author
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{author.name || 'Unknown'}</p>
                    {author.handle && (
                      <p className="text-sm text-muted-foreground">@{author.handle}</p>
                    )}
                    {author.bio && (
                      <p className="line-clamp-3 text-sm text-muted-foreground">{author.bio}</p>
                    )}
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Likes</span>
                  <span className="font-medium">{blog.likes || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Comments</span>
                  <span className="font-medium">{blog.comments || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <span className="text-sm font-medium">{blog.date}</span>
                </div>
              </CardContent>
            </Card>

            {/* Related Posts */}
            <Card>
              <CardHeader>
                <CardTitle>More from this author</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No other posts yet.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
