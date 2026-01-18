'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { db } from '../../../../db/db';
import { FileText, User, MessageSquare, Share2, ThumbsUp } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface StatementDetailProps {
  statementId: string;
}

export function StatementDetail({ statementId }: StatementDetailProps) {
  const { t } = useTranslation();
  
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
        <div className="py-12 text-center">{t('features.statements.detail.loading')}</div>
      </PageWrapper>
    );
  }

  if (!statement) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">{t('features.statements.detail.notFound')}</h1>
          <p className="text-muted-foreground">
            {t('features.statements.detail.notFoundDescription')}
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
                  {t('features.statements.detail.agree')}
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('features.statements.detail.comment')}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('features.statements.detail.share')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('features.statements.detail.discussion')}</CardTitle>
              <CardDescription>{t('features.statements.detail.discussionDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('features.statements.detail.noComments')}
              </p>
            </CardContent>
          </Card>

          {/* Related Statements */}
          <Card>
            <CardHeader>
              <CardTitle>{t('features.statements.detail.relatedStatements')}</CardTitle>
              <CardDescription>{t('features.statements.detail.relatedStatementsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('features.statements.detail.noRelatedStatements')}</p>
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
                  {t('features.statements.detail.author')}
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
              <CardTitle>{t('features.statements.detail.category')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm">
                {statement.tag}
              </Badge>
              <p className="mt-3 text-sm text-muted-foreground">
                {t('features.statements.detail.exploreMore')}
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('features.statements.detail.actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="mr-2 h-4 w-4" />
                {t('features.statements.detail.shareStatement')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                {t('features.statements.detail.saveForLater')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
