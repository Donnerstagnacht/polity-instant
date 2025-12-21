import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ArrowLeft, FileEdit, Clock, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { VoteControls } from '@/features/amendments/ui/VoteControls';
import { useChangeRequests, type ChangeRequest } from '../hooks/useChangeRequests';

interface ChangeRequestsViewProps {
  amendmentId: string;
  userId?: string;
}

function getStatusColor(status: string) {
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
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
}

interface ChangeRequestCardProps {
  request: ChangeRequest;
  users: Record<string, any>;
  document?: any;
  collaborators: any[];
  amendmentId: string;
  userId?: string;
  isClosed?: boolean;
}

function ChangeRequestCard({
  request,
  users,
  document,
  collaborators,
  amendmentId,
  userId,
  isClosed = false,
}: ChangeRequestCardProps) {
  return (
    <Card className={isClosed ? 'overflow-hidden opacity-75' : 'overflow-hidden'}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2 flex items-center gap-2">
              {request.crId && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {request.crId}
                </Badge>
              )}
              <span>{request.title}</span>
              {isClosed && request.resolution && (
                <Badge
                  variant={request.resolution === 'accepted' ? 'default' : 'destructive'}
                  className="ml-2"
                >
                  {request.resolution === 'accepted' ? 'Accepted' : 'Rejected'}
                </Badge>
              )}
            </CardTitle>
            {request.description && <CardDescription>{request.description}</CardDescription>}
            {!request.description && request.type && (
              <CardDescription className="capitalize">
                {request.type === 'insert' && 'Suggestion to add text'}
                {request.type === 'remove' && 'Suggestion to remove text'}
                {request.type === 'replace' && 'Suggestion to replace text'}
                {request.type === 'update' &&
                  request.newProperties &&
                  Object.keys(request.newProperties).length > 0 && (
                    <span>
                      Suggestion to apply {Object.keys(request.newProperties).join(', ')} formatting
                    </span>
                  )}
                {request.type === 'update' &&
                  (!request.newProperties || Object.keys(request.newProperties).length === 0) &&
                  'Suggestion to update formatting'}
              </CardDescription>
            )}
          </div>
          {!isClosed && (
            <Badge className={getStatusColor(request.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(request.status)}
                {request.status}
              </span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Update Type (for formatting changes) */}
          {request.type === 'update' && request.newText && (
            <div>
              <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
                {isClosed ? 'Formatting Changed:' : 'Formatting Change:'}
              </h4>
              <div className="space-y-2">
                {request.newProperties && Object.keys(request.newProperties).length > 0 && (
                  <div className="rounded-lg bg-blue-500/10 p-4">
                    <p className="mb-2 text-sm font-semibold">
                      {isClosed ? 'Applied' : 'Apply'} formatting:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(request.newProperties).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="capitalize">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm">To text: "{request.newText}"</p>
                  </div>
                )}
                {request.properties && Object.keys(request.properties).length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="mb-2 text-sm font-semibold text-muted-foreground">
                      {isClosed ? 'Removed' : 'Remove'} formatting:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(request.properties).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="capitalize opacity-60">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Original Text (for remove/replace types) */}
          {request.text && (request.type === 'remove' || request.type === 'replace') && (
            <div>
              <h4 className="mb-2 font-semibold text-red-600 dark:text-red-400">
                {request.type === 'remove' ? (isClosed ? 'Deleted:' : 'Delete:') : 'Original Text:'}
              </h4>
              <div className="rounded-lg bg-red-500/10 p-4 line-through">
                <p className="whitespace-pre-wrap text-sm">{request.text}</p>
              </div>
            </div>
          )}

          {/* Proposed Change (for insert/replace types) */}
          {request.newText && (request.type === 'insert' || request.type === 'replace') && (
            <div>
              <h4 className="mb-2 font-semibold text-green-600 dark:text-green-400">
                {request.type === 'insert' ? (isClosed ? 'Added:' : 'Add:') : 'Replace with:'}
              </h4>
              <div className="rounded-lg bg-green-500/10 p-4">
                <p className="whitespace-pre-wrap text-sm">{request.newText}</p>
              </div>
            </div>
          )}

          {/* Fallback for proposedChange */}
          {request.type !== 'update' &&
            !request.newText &&
            !request.text &&
            request.proposedChange && (
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

          {/* Comments from discussions */}
          {request.comments && request.comments.length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold">Discussion ({request.comments.length})</h4>
              <div className="space-y-2">
                {request.comments.slice(0, 3).map((comment: any, idx: number) => (
                  <div key={idx} className="rounded-lg border bg-muted/50 p-3 text-sm">
                    <p className="text-muted-foreground">{comment.text || comment.value}</p>
                    {comment.userId && users[comment.userId] && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        — {users[comment.userId].name}
                      </p>
                    )}
                  </div>
                ))}
                {request.comments.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{request.comments.length - 3} more comments
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {request.userId && users[request.userId] && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{users[request.userId].name || 'Unknown User'}</span>
              </div>
            )}
            {request.crId && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {request.crId}
                </Badge>
              </div>
            )}
            {request.createdAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
            )}
            {isClosed && request.resolvedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Resolved {new Date(request.resolvedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Voting Controls (only in vote mode for open requests) */}
          {!isClosed && document?.editingMode === 'vote' && userId && (
            <div className="mt-6 border-t pt-4">
              <VoteControls
                changeRequestId={request.changeRequestEntityId || request.id}
                currentUserId={userId}
                votes={request.votes || []}
                collaborators={collaborators
                  .filter(c => c.user?.id)
                  .map(c => ({
                    id: c.id,
                    user: {
                      id: c.user?.id ?? '',
                      user: {
                        name: c.user?.name ?? '',
                        avatar: c.user?.avatar ?? '',
                      },
                    },
                  }))}
                status={request.status}
                amendmentId={amendmentId}
                documentId={document?.id || ''}
                suggestionData={
                  !request.changeRequestEntityId
                    ? {
                        crId: request.crId || '',
                        description: request.description || '',
                        proposedChange: request.proposedChange || '',
                        justification: request.justification || '',
                        userId: request.userId || '',
                        createdAt: request.createdAt || Date.now(),
                      }
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ChangeRequestsView({ amendmentId, userId }: ChangeRequestsViewProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');

  const {
    amendment,
    document,
    openChangeRequests,
    closedChangeRequests,
    users,
    collaborators,
    isLoading,
  } = useChangeRequests(amendmentId);

  if (isLoading) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <div className="py-12 text-center">Loading change requests...</div>
      </PageWrapper>
    );
  }

  if (!amendment) {
    return (
      <PageWrapper className="container mx-auto p-8">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Amendment Not Found</h1>
          <p className="text-muted-foreground">
            The amendment you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </PageWrapper>
    );
  }

  const totalChangeRequests = openChangeRequests.length + closedChangeRequests.length;

  return (
    <PageWrapper className="container mx-auto p-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href={`/amendment/${amendmentId}`}>
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
          {openChangeRequests.length} open, {closedChangeRequests.length} closed change request
          {totalChangeRequests !== 1 ? 's' : ''} for this amendment
        </p>
      </div>

      {/* Tabs for Open/Closed */}
      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'open' | 'closed')}>
        <TabsList className="mb-6">
          <TabsTrigger value="open" className="gap-2">
            Open
            <Badge variant="secondary" className="ml-1">
              {openChangeRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="closed" className="gap-2">
            Closed
            <Badge variant="secondary" className="ml-1">
              {closedChangeRequests.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Open Change Requests Tab */}
        <TabsContent value="open" className="space-y-4">
          {openChangeRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileEdit className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No open change requests. Be the first to propose a change!
                </p>
              </CardContent>
            </Card>
          ) : (
            openChangeRequests.map(request => (
              <ChangeRequestCard
                key={request.id}
                request={request}
                users={users}
                document={document}
                collaborators={collaborators}
                amendmentId={amendmentId}
                userId={userId}
              />
            ))
          )}
        </TabsContent>

        {/* Closed Change Requests Tab */}
        <TabsContent value="closed" className="space-y-4">
          {closedChangeRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileEdit className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No closed change requests yet.</p>
              </CardContent>
            </Card>
          ) : (
            closedChangeRequests.map(request => (
              <ChangeRequestCard
                key={request.id}
                request={request}
                users={users}
                document={document}
                collaborators={collaborators}
                amendmentId={amendmentId}
                userId={userId}
                isClosed={true}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
