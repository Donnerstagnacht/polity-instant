'use client';

import { use, useMemo } from 'react';
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

  // Fetch amendment data with its document
  const { data, isLoading } = db.useQuery({
    amendments: {
      $: { where: { id: resolvedParams.id } },
      user: {
        profile: {},
      },
      document: {},
    },
  });

  const amendment = data?.amendments?.[0];
  const document = amendment?.document;

  // Debug logging
  console.log('=== CHANGE REQUESTS PAGE DEBUG ===');
  console.log('Amendment:', amendment);
  console.log('Document:', document);
  console.log('Document discussions:', document?.discussions);
  console.log('Is discussions an array?', Array.isArray(document?.discussions));
  console.log('Discussions length:', document?.discussions?.length);

  // Extract open change requests from document discussions
  const changeRequests = useMemo(() => {
    if (!document?.discussions || !Array.isArray(document.discussions)) {
      console.log('No discussions found or not an array');
      return [];
    }

    console.log('Raw discussions:', document.discussions);
    console.log('Document content:', document.content);

    // Helper function to extract suggestion text from document content
    const extractSuggestionContent = (discussionId: string) => {
      if (!document.content || !Array.isArray(document.content)) {
        return { type: 'unknown', text: '', newText: '', properties: {}, newProperties: {} };
      }

      let type = 'unknown';
      let text = '';
      let newText = '';
      let properties: any = {};
      let newProperties: any = {};

      // Recursively search through the document content for suggestion marks
      const searchNodes = (nodes: any[]): void => {
        for (const node of nodes) {
          // Check if this node has a suggestion mark matching our discussion ID
          if (node && typeof node === 'object') {
            // Look for suggestion_* properties
            const suggestionKeys = Object.keys(node).filter(key => key.startsWith('suggestion_'));

            for (const key of suggestionKeys) {
              const suggestionData = node[key];
              if (suggestionData && suggestionData.id === discussionId) {
                type = suggestionData.type || type;

                // Extract text based on type
                if (node.text) {
                  if (suggestionData.type === 'insert') {
                    newText += node.text;
                  } else if (suggestionData.type === 'remove') {
                    text += node.text;
                  } else if (suggestionData.type === 'replace') {
                    newText += node.text;
                  } else if (suggestionData.type === 'update') {
                    newText += node.text;
                    // For update type, store the property changes
                    if (suggestionData.properties) {
                      properties = { ...properties, ...suggestionData.properties };
                    }
                    if (suggestionData.newProperties) {
                      newProperties = { ...newProperties, ...suggestionData.newProperties };
                    }
                  }
                }
              }
            }

            // Recursively search children
            if (node.children && Array.isArray(node.children)) {
              searchNodes(node.children);
            }
          }
        }
      };

      searchNodes(document.content);
      return { type, text, newText, properties, newProperties };
    };

    // Filter for suggestions (change requests) that have crId and are not resolved
    const filtered = document.discussions
      .filter((discussion: any) => {
        // Only include items with crId (these are change requests/suggestions)
        const hasChangeRequestId = !!discussion.crId;
        // Filter for unresolved (open) change requests
        const isOpen = !discussion.isResolved;

        console.log('Discussion:', discussion);
        console.log('  - hasChangeRequestId:', hasChangeRequestId);
        console.log('  - isOpen:', isOpen);
        console.log('  - crId:', discussion.crId);
        console.log('  - isResolved:', discussion.isResolved);

        return hasChangeRequestId && isOpen;
      })
      .map((suggestion: any) => {
        const suggestionContent = extractSuggestionContent(suggestion.id);

        return {
          id: suggestion.id,
          crId: suggestion.crId,
          crNumber: parseInt(suggestion.crId?.replace('CR-', '') || '0'),
          title: suggestion.title || suggestion.crId,
          description: suggestion.description || '',
          type: suggestionContent.type,
          text: suggestionContent.text,
          newText: suggestionContent.newText,
          properties: suggestionContent.properties,
          newProperties: suggestionContent.newProperties,
          proposedChange: suggestionContent.newText || suggestionContent.text,
          justification: suggestion.justification || '',
          status: suggestion.isResolved ? 'resolved' : 'open',
          createdAt: suggestion.createdAt,
          userId: suggestion.userId,
          comments: suggestion.comments || [],
        };
      })
      // Sort by CR number (ascending)
      .sort((a, b) => a.crNumber - b.crNumber);

    console.log('Filtered change requests:', filtered);
    console.log('Change requests count:', filtered.length);

    return filtered;
  }, [document?.discussions, document?.content]);

  // Get unique user IDs from change requests
  const userIds = useMemo(() => {
    return Array.from(new Set(changeRequests.map((cr: any) => cr.userId).filter(Boolean)));
  }, [changeRequests]);

  // Fetch user profiles for all creators
  const { data: profilesData } = db.useQuery(
    userIds.length > 0
      ? {
          profiles: {
            $: {
              where: {
                'user.id': { in: userIds },
              },
            },
          },
        }
      : { profiles: {} }
  );

  // Create a map of userId to profile
  const userProfiles = useMemo(() => {
    const map: Record<string, any> = {};
    if (profilesData?.profiles) {
      profilesData.profiles.forEach((profile: any) => {
        if (profile.user?.id) {
          map[profile.user.id] = profile;
        }
      });
    }
    return map;
  }, [profilesData]);

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
            <h1 className="text-4xl font-bold">Open Change Requests</h1>
          </div>
          <p className="text-muted-foreground">
            {changeRequests.length} open change request{changeRequests.length !== 1 ? 's' : ''} for
            this amendment
          </p>
        </div>

        {/* Debug Info */}
        <Card className="mb-4 border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <strong>Has document:</strong> {document ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Has discussions:</strong> {document?.discussions ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Is array:</strong> {Array.isArray(document?.discussions) ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Discussions count:</strong> {document?.discussions?.length || 0}
            </div>
            <div>
              <strong>Change requests found:</strong> {changeRequests.length}
            </div>
            {document?.discussions && (
              <div className="mt-2">
                <strong>Raw discussions:</strong>
                <pre className="mt-1 max-h-48 overflow-auto rounded bg-black/20 p-2">
                  {JSON.stringify(document.discussions, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

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
                      <CardTitle className="mb-2 flex items-center gap-2">
                        {request.crId && (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {request.crId}
                          </Badge>
                        )}
                        <span>{request.title}</span>
                      </CardTitle>
                      {request.description && (
                        <CardDescription>{request.description}</CardDescription>
                      )}
                      {!request.description && request.type && (
                        <CardDescription className="capitalize">
                          {request.type === 'insert' && 'Suggestion to add text'}
                          {request.type === 'remove' && 'Suggestion to remove text'}
                          {request.type === 'replace' && 'Suggestion to replace text'}
                          {request.type === 'update' &&
                            request.newProperties &&
                            Object.keys(request.newProperties).length > 0 && (
                              <span>
                                Suggestion to apply {Object.keys(request.newProperties).join(', ')}{' '}
                                formatting
                              </span>
                            )}
                          {request.type === 'update' &&
                            (!request.newProperties ||
                              Object.keys(request.newProperties).length === 0) &&
                            'Suggestion to update formatting'}
                        </CardDescription>
                      )}
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
                    {/* Update Type (for formatting changes like bold, italic, etc.) */}
                    {request.type === 'update' && request.newText && (
                      <div>
                        <h4 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
                          Formatting Change:
                        </h4>
                        <div className="space-y-2">
                          {/* Show what properties are being changed */}
                          {request.newProperties &&
                            Object.keys(request.newProperties).length > 0 && (
                              <div className="rounded-lg bg-blue-500/10 p-4">
                                <p className="mb-2 text-sm font-semibold">Apply formatting:</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(request.newProperties).map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="capitalize">
                                      {key}: {String(value)}
                                    </Badge>
                                  ))}
                                </div>
                                <p className="mt-3 whitespace-pre-wrap text-sm">
                                  To text: "{request.newText}"
                                </p>
                              </div>
                            )}
                          {request.properties && Object.keys(request.properties).length > 0 && (
                            <div className="rounded-lg bg-muted/50 p-4">
                              <p className="mb-2 text-sm font-semibold text-muted-foreground">
                                Remove formatting:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(request.properties).map(([key, value]) => (
                                  <Badge
                                    key={key}
                                    variant="outline"
                                    className="capitalize opacity-60"
                                  >
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
                          {request.type === 'remove' ? 'Delete:' : 'Original Text:'}
                        </h4>
                        <div className="rounded-lg bg-red-500/10 p-4 line-through">
                          <p className="whitespace-pre-wrap text-sm">{request.text}</p>
                        </div>
                      </div>
                    )}

                    {/* Proposed Change (for insert/replace types) */}
                    {request.newText &&
                      (request.type === 'insert' || request.type === 'replace') && (
                        <div>
                          <h4 className="mb-2 font-semibold text-green-600 dark:text-green-400">
                            {request.type === 'insert' ? 'Add:' : 'Replace with:'}
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
                        <h4 className="mb-2 font-semibold">
                          Discussion ({request.comments.length})
                        </h4>
                        <div className="space-y-2">
                          {request.comments.slice(0, 3).map((comment: any, idx: number) => (
                            <div key={idx} className="rounded-lg border bg-muted/50 p-3 text-sm">
                              <p className="text-muted-foreground">
                                {comment.text || comment.value}
                              </p>
                              {comment.userId && userProfiles[comment.userId] && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  — {userProfiles[comment.userId].name}
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
                      {request.userId && userProfiles[request.userId] && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{userProfiles[request.userId].name || 'Unknown User'}</span>
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
                    </div>
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
