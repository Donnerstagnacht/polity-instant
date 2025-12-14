'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db, { id } from '../../../db';
import { Settings, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { StatsBar } from '@/components/ui/StatsBar';
import { useSubscribeAmendment } from '@/features/amendments/hooks/useSubscribeAmendment';
import { useAmendmentCollaboration } from '@/features/amendments/hooks/useAmendmentCollaboration';
import { ActionBar } from '@/components/ui/ActionBar';
import { SubscribeButton, MembershipButton } from '@/components/shared/action-buttons';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShareButton } from '@/components/shared/ShareButton';
import { useAuthStore } from '@/features/auth';

interface AmendmentWikiProps {
  amendmentId: string;
}

export function AmendmentWiki({ amendmentId }: AmendmentWikiProps) {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);

  // Subscribe hook
  const {
    isSubscribed,
    subscriberCount,
    toggleSubscribe,
    isLoading: subscribeLoading,
  } = useSubscribeAmendment(amendmentId);

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
  } = useAmendmentCollaboration(amendmentId);

  const { data, isLoading } = db.useQuery({
    amendments: {
      $: {
        where: {
          id: amendmentId,
        },
      },
      amendmentRoleCollaborators: {
        user: {},
        role: {},
      },
      hashtags: {},
      votes: {
        user: {},
      },
      changeRequests: {},
    },
  });

  const amendment = data?.amendments?.[0];

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading amendment...</div>
        </div>
      </div>
    );
  }

  if (!amendment) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Amendment Not Found</h1>
          <p className="text-muted-foreground">
            The amendment you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = status === 'admin';
  const collaborators = amendment.amendmentRoleCollaborators || [];

  // Vote handling
  const score = (amendment.upvotes || 0) - (amendment.downvotes || 0);
  const userVote = amendment.votes?.find((v: any) => v.user?.id === user?.id);
  const hasUpvoted = userVote?.vote === 1;
  const hasDownvoted = userVote?.vote === -1;

  const handleVote = async (voteValue: number) => {
    if (!user?.id) {
      toast.error('Please log in to vote');
      return;
    }

    try {
      if (userVote) {
        // Update or remove existing vote
        if (userVote.vote === voteValue) {
          // Remove vote
          await db.transact([
            db.tx.amendmentSupportVotes[userVote.id].delete(),
            db.tx.amendments[amendmentId].update({
              upvotes: voteValue === 1 ? (amendment.upvotes || 1) - 1 : amendment.upvotes,
              downvotes: voteValue === -1 ? (amendment.downvotes || 1) - 1 : amendment.downvotes,
            }),
          ]);
        } else {
          // Change vote
          await db.transact([
            db.tx.amendmentSupportVotes[userVote.id].update({ vote: voteValue }),
            db.tx.amendments[amendmentId].update({
              upvotes:
                voteValue === 1
                  ? (amendment.upvotes || 0) + 1
                  : Math.max(0, (amendment.upvotes || 1) - 1),
              downvotes:
                voteValue === -1
                  ? (amendment.downvotes || 0) + 1
                  : Math.max(0, (amendment.downvotes || 1) - 1),
            }),
          ]);
        }
      } else {
        // Create new vote
        const voteId = id();
        await db.transact([
          db.tx.amendmentSupportVotes[voteId].update({
            vote: voteValue,
            createdAt: Date.now(),
          }),
          db.tx.amendmentSupportVotes[voteId].link({
            amendment: amendmentId,
            user: user.id,
          }),
          db.tx.amendments[amendmentId].update({
            upvotes: voteValue === 1 ? (amendment.upvotes || 0) + 1 : amendment.upvotes,
            downvotes: voteValue === -1 ? (amendment.downvotes || 0) + 1 : amendment.downvotes,
          }),
        ]);
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const statusColors: Record<string, string> = {
    Passed: 'bg-green-500/10 text-green-500 border-green-500/20',
    Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    'Under Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Drafting: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };

  return (
    <div className="container mx-auto max-w-6xl p-4">
      {/* Header with centered title and subtitle */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold">{amendment.title}</h1>
          <Badge className={statusColors[amendment.status] || ''}>{amendment.status}</Badge>
        </div>
        {amendment.subtitle && (
          <p className="text-xl text-muted-foreground">{amendment.subtitle}</p>
        )}

        {/* Collaborators Section */}
        {collaborators.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {collaborators.slice(0, 3).map((collab: any) => (
                <Avatar key={collab.id} className="h-10 w-10 border-2 border-background">
                  <AvatarImage src={collab.user?.avatar || collab.user?.imageURL} />
                  <AvatarFallback>{collab.user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
              ))}
              {collaborators.length > 3 && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                  +{collaborators.length - 3}
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">
                {collaborators.length}{' '}
                {collaborators.length === 1 ? 'Collaborator' : 'Collaborators'}
              </p>
              <p className="text-xs text-muted-foreground">
                {collaborators[0]?.user?.name || 'Unknown'}
                {collaborators.length > 1 &&
                  ` and ${collaborators.length - 1} other${collaborators.length > 2 ? 's' : ''}`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Amendment Image */}
      {amendment.imageURL && (
        <div className="mb-8">
          <img
            src={amendment.imageURL}
            alt={amendment.title}
            className="mx-auto h-64 w-full max-w-4xl rounded-lg object-cover shadow-lg"
          />
        </div>
      )}

      {/* Amendment Video */}
      {amendment.videoURL && (
        <div className="mb-8">
          <video
            controls
            preload="metadata"
            poster={amendment.videoThumbnailURL || undefined}
            className="mx-auto w-full max-w-4xl rounded-lg shadow-lg"
            src={amendment.videoURL}
            onLoadedMetadata={e => {
              const video = e.currentTarget;
              // Only set currentTime if no poster is provided
              if (!amendment.videoThumbnailURL) {
                video.currentTime = 0.1;
              }
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Stats Bar */}
      <StatsBar
        stats={[
          { value: collaboratorCount, labelKey: 'components.labels.collaborators' },
          { value: subscriberCount, labelKey: 'components.labels.subscribers' },
          { value: score, labelKey: 'components.labels.supporters' },
          {
            value: amendment.changeRequests?.length || 0,
            labelKey: 'components.labels.changeRequests',
          },
        ]}
      />

      {/* Action Bar */}
      <ActionBar>
        <SubscribeButton
          entityType="amendment"
          entityId={amendmentId}
          isSubscribed={isSubscribed}
          onToggleSubscribe={toggleSubscribe}
          isLoading={subscribeLoading}
        />
        <MembershipButton
          actionType="collaborate"
          status={status}
          isMember={isCollaborator}
          hasRequested={hasRequested}
          isInvited={isInvited}
          onRequest={requestCollaboration}
          onLeave={leaveCollaboration}
          onAcceptInvitation={acceptInvitation}
          isLoading={collaborationLoading}
        />
        <div className="flex h-10 items-center gap-1 rounded-lg border bg-card px-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${hasUpvoted ? 'text-orange-500' : ''}`}
            onClick={() => handleVote(1)}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${hasDownvoted ? 'text-blue-500' : ''}`}
            onClick={() => handleVote(-1)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
        <ShareButton
          url={`/amendment/${amendmentId}`}
          title={amendment.title}
          description={amendment.subtitle || amendment.code || ''}
        />
        {isAdmin && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/amendment/${amendmentId}/edit`)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </ActionBar>

      {/* Hashtags */}
      {amendment.hashtags && amendment.hashtags.length > 0 && (
        <div className="mb-6">
          <HashtagDisplay hashtags={amendment.hashtags} centered />
        </div>
      )}

      {/* About and Contact Tabs */}
      <InfoTabs
        about={amendment.code || 'No description available.'}
        contact={{}}
        className="mb-12"
      />
    </div>
  );
}
