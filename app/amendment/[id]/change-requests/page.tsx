'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db from '../../../../db';
import { ArrowLeft, FileEdit, Clock, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AmendmentChangeRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  // Fetch amendment data with change requests
  const { data, isLoading } = db.useQuery({
    amendments: {
      $: { where: { id: resolvedParams.id } },
      changeRequests: {
        creator: {
          profile: {},
        },
      },
    },
  });

  const amendment = data?.amendments?.[0];
  const changeRequests = amendment?.changeRequests || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">Loading change requests...</div>
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
          <div className="mb-4 flex items-center gap-3">
            <FileEdit className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Change Requests</h1>
          </div>
          <p className="text-muted-foreground">
            {changeRequests.length} change request{changeRequests.length !== 1 ? 's' : ''} for this
            amendment
          </p>
        </div>

        {/* Change Requests List */}
        <div className="space-y-4">
          {changeRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileEdit className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No change requests yet. Be the first to propose a change!
                </p>
              </CardContent>
            </Card>
          ) : (
            changeRequests.map(request => (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{request.title}</CardTitle>
                      <CardDescription>{request.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Proposed Change */}
                    {request.proposedChange && (
                      <div>
                        <h4 className="mb-2 font-semibold">Proposed Change:</h4>
                        <div className="rounded-lg bg-muted p-4">
                          <p className="whitespace-pre-wrap text-sm">{request.proposedChange}</p>
                        </div>
                      </div>
                    )}

                    {/* Justification */}
                    {request.justification && (
                      <div>
                        <h4 className="mb-2 font-semibold">Justification:</h4>
                        <p className="text-sm text-muted-foreground">{request.justification}</p>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {request.creator?.profile?.name && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{request.creator.profile.name}</span>
                        </div>
                      )}
                      {request.createdAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Voting Period */}
                    {request.votingStartTime && request.votingEndTime && (
                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                        <p className="text-sm">
                          <strong>Voting Period:</strong>{' '}
                          {new Date(request.votingStartTime).toLocaleDateString()} -{' '}
                          {new Date(request.votingEndTime).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
