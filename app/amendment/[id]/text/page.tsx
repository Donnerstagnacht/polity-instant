'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db from '../../../../db';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AmendmentTextPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  // Fetch amendment data from InstantDB
  const { data, isLoading } = db.useQuery({
    amendments: {
      $: { where: { id: resolvedParams.id } },
      user: {
        profile: {},
      },
    },
  });

  const amendment = data?.amendments?.[0];

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">Loading amendment text...</div>
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
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8" />
                <h1 className="text-4xl font-bold">{amendment.title}</h1>
              </div>
              {amendment.subtitle && (
                <p className="mb-4 text-xl text-muted-foreground">{amendment.subtitle}</p>
              )}
              {amendment.code && (
                <Badge variant="secondary" className="mb-2">
                  {amendment.code}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Amendment Text/Code */}
        <Card>
          <CardHeader>
            <CardTitle>Amendment Text</CardTitle>
            <CardDescription>Full text of the amendment</CardDescription>
          </CardHeader>
          <CardContent>
            {amendment.code ? (
              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-6 text-sm leading-relaxed">
                {amendment.code}
              </pre>
            ) : (
              <p className="text-muted-foreground">No text available for this amendment.</p>
            )}
          </CardContent>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
