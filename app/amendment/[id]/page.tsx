'use client';

import { use, useState, useRef } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db from '../../../db';
import { Scale, Calendar, User, ThumbsUp, FileText, MessageSquare, FileEdit } from 'lucide-react';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import Link from 'next/link';
import { SubscriberStatsBar } from '@/components/ui/SubscriberStatsBar';
import { AmendmentSubscribeButton } from '@/features/amendments/ui/AmendmentSubscribeButton';
import { useSubscribeAmendment } from '@/features/amendments/hooks/useSubscribeAmendment';
import { useAmendmentCollaboration } from '@/features/amendments/hooks/useAmendmentCollaboration';
import { AmendmentCollaborationButton } from '@/features/amendments/ui/AmendmentCollaborationButton';

export default function AmendmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationText, setAnimationText] = useState('');
  const animationRef = useRef<HTMLDivElement>(null);

  // Subscribe hook
  const { subscriberCount } = useSubscribeAmendment(resolvedParams.id);

  // Collaboration hook
  const {
    status,
    isCollaborator,
    hasRequested,
    isInvited,
    collaboratorCount,
    isLoading: collaborationLoading,
    requestCollaboration,
    leaveCollaboration,
    acceptInvitation,
  } = useAmendmentCollaboration(resolvedParams.id);

  // Fetch amendment data from InstantDB with subscribers
  const { data, isLoading } = db.useQuery({
    amendments: {
      $: { where: { id: resolvedParams.id } },
      user: {
        profile: {},
      },
      hashtags: {},
      subscribers: {},
    },
  });

  const amendment = data?.amendments?.[0];

  const statusColors: Record<string, string> = {
    Passed: 'bg-green-500/10 text-green-500 border-green-500/20',
    Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    'Under Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Drafting: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">Loading amendment details...</div>
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

  const author = amendment.user?.profile;

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <Scale className="h-8 w-8" />
                <h1 className="text-4xl font-bold">{amendment.title}</h1>
              </div>
              {amendment.subtitle && (
                <p className="mb-4 text-xl text-muted-foreground">{amendment.subtitle}</p>
              )}
              <div className="flex items-center gap-4">
                <Badge className={statusColors[amendment.status] || ''}>{amendment.status}</Badge>
                {amendment.date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{amendment.date}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{amendment.supporters || 0} supporters</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <AmendmentSubscribeButton
                amendmentId={resolvedParams.id}
                onSubscribeChange={async isNowSubscribed => {
                  setAnimationText(isNowSubscribed ? '+1' : '-1');
                  setShowAnimation(true);
                  setTimeout(() => setShowAnimation(false), 1000);
                }}
              />
              <AmendmentCollaborationButton
                status={status}
                isCollaborator={isCollaborator}
                hasRequested={hasRequested}
                isInvited={isInvited}
                onRequestCollaboration={requestCollaboration}
                onLeave={leaveCollaboration}
                onAcceptInvitation={acceptInvitation}
                isLoading={collaborationLoading}
              />
              <Button>
                <ThumbsUp className="mr-2 h-4 w-4" />
                Support
              </Button>
            </div>
          </div>

          {/* Subscriber Stats Bar */}
          <SubscriberStatsBar
            collaboratorCount={collaboratorCount}
            subscriberCount={subscriberCount}
            showAnimation={showAnimation}
            animationText={animationText}
            animationRef={animationRef}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            {/* Quick Navigation */}
            <Card>
              <CardHeader>
                <CardTitle>Amendment Sections</CardTitle>
                <CardDescription>Navigate to different sections of this amendment</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <Link href={`/amendment/${resolvedParams.id}/text`}>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Full Text
                  </Button>
                </Link>
                <Link href={`/amendment/${resolvedParams.id}/change-requests`}>
                  <Button variant="outline" className="w-full justify-start">
                    <FileEdit className="mr-2 h-4 w-4" />
                    Change Requests
                  </Button>
                </Link>
                <Link href={`/amendment/${resolvedParams.id}/discussions`}>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Discussions
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Amendment Code */}
            {amendment.code && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Amendment Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                    {amendment.code}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Hashtags */}
            {amendment.hashtags && amendment.hashtags.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <HashtagDisplay hashtags={amendment.hashtags} title="Hashtags" />
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {amendment.tags && Array.isArray(amendment.tags) && amendment.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {amendment.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Discussion Section */}
            <Card>
              <CardHeader>
                <CardTitle>Discussion</CardTitle>
                <CardDescription>Community comments and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No comments yet. Be the first to discuss this amendment.
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
                    Proposed By
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{author.name || 'Unknown'}</p>
                    {author.handle && (
                      <p className="text-sm text-muted-foreground">@{author.handle}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        amendment.status === 'Drafting' ? 'bg-blue-500' : 'bg-muted'
                      }`}
                    />
                    <span className="text-sm">Drafting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        amendment.status === 'Under Review' ? 'bg-yellow-500' : 'bg-muted'
                      }`}
                    />
                    <span className="text-sm">Under Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        amendment.status === 'Passed'
                          ? 'bg-green-500'
                          : amendment.status === 'Rejected'
                            ? 'bg-red-500'
                            : 'bg-muted'
                      }`}
                    />
                    <span className="text-sm">
                      {amendment.status === 'Passed' ? 'Passed' : 'Decision'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supporters */}
            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
                <CardDescription>{amendment.supporters || 0} supporters</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Support This Amendment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
