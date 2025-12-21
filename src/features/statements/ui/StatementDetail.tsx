'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '../../../../db/db';
import { FileText, User, MessageSquare, Share2, ThumbsUp } from 'lucide-react';

interface StatementDetailProps {
  statementId: string;
}

export function StatementDetail({ statementId }: StatementDetailProps) {
  // Fetch statement data from InstantDB
  const { data, isLoading } = db.useQuery({
    statements: {
      $: { where: { id: statementId } },
      user: {},
    },
  });

  const statement = data?.statements?.[0];

  if (isLoading) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <div className="py-12 text-center">Loading statement details...</div>
      </PageWrapper>
    );
  }

  if (!statement) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Statement Not Found</h1>
          <p className="text-muted-foreground">
            The statement you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </PageWrapper>
    );
  }

  const author = statement.user;

  return (
    <PageWrapper className="container mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <FileText className="h-8 w-8" />
          <Badge variant="outline" className="text-sm">
            {statement.tag}
          </Badge>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <blockquote className="border-l-4 border-primary pl-6 text-2xl font-medium leading-relaxed">
              "{statement.text}"
            </blockquote>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Engagement Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Agree
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Comment
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
              <CardDescription>What do others think about this statement?</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to share your thoughts.
              </p>
            </CardContent>
          </Card>

          {/* Related Statements */}
          <Card>
            <CardHeader>
              <CardTitle>Related Statements</CardTitle>
              <CardDescription>Other statements with similar tags</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No related statements found.</p>
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tag Info */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm">
                {statement.tag}
              </Badge>
              <p className="mt-3 text-sm text-muted-foreground">
                Explore more statements in this category
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="mr-2 h-4 w-4" />
                Share Statement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Save for Later
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
