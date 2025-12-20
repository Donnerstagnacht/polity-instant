'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import db, { id, tx } from '../../../db/db';
import { Settings, ArrowUp, ArrowDown, Users, Copy } from 'lucide-react';
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
import { GroupsCard } from '@/features/user/ui/GroupsCard';
import { GRADIENTS } from '@/features/user/state/gradientColors';
import { findShortestPath } from '@/utils/path-finding';
import { TargetSelectionDialog } from '@/features/amendments/ui/TargetSelectionDialog';
import Link from 'next/link';

interface AmendmentWikiProps {
  amendmentId: string;
}

export function AmendmentWiki({ amendmentId }: AmendmentWikiProps) {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [selectedTargetGroupId, setSelectedTargetGroupId] = useState<string>('');

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

  // Network data query for path calculation
  const { data: networkData } = db.useQuery(
    user?.id
      ? {
          groupMemberships: {
            $: {
              where: {
                'user.id': user.id,
              },
            },
            user: {},
            group: {},
          },
          groups: {},
          groupRelationships: {
            parentGroup: {},
            childGroup: {},
          },
          events: {
            group: {},
          },
        }
      : {}
  );

  // Events for selected target group
  const { data: targetGroupEventsData } = db.useQuery(
    selectedTargetGroupId
      ? {
          events: {
            $: {
              where: {
                'group.id': selectedTargetGroupId,
              },
            },
            group: {},
          },
        }
      : { events: {} }
  );

  // All users for collaborator selection in dialog
  const { data: usersData } = db.useQuery(
    user?.id
      ? {
          $users: {},
        }
      : {}
  );

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
      groupSupporters: {
        memberships: {},
      },
      targetGroup: {},
      path: {
        user: {},
      },
      clones: {},
      clonedFrom: {},
      document: {},
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
  const supportingGroups = amendment.groupSupporters || [];
  const clones = amendment.clones || [];
  const clonedFrom = amendment.clonedFrom;
  const totalSupportingMembers = supportingGroups.reduce(
    (sum: number, group: any) => sum + (group.memberships?.length || 0),
    0
  );
  const targetCollaborator = amendment.path?.user;
  const targetGroup = amendment.targetGroup;

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

  const handleClone = () => {
    if (!user?.id) {
      toast.error('Please log in to clone this amendment');
      return;
    }
    setCloneDialogOpen(true);
  };

  const handleConfirmClone = async (selection: {
    groupId: string;
    groupData: any;
    eventId: string;
    eventData: any;
    collaboratorUserId: string;
  }) => {
    if (!user?.id) {
      toast.error('Please log in to clone this amendment');
      return;
    }

    const {
      groupId: selectedTargetGroupId,
      eventId: selectedEventId,
      collaboratorUserId,
    } = selection;

    setIsCloning(true);
    try {
      const cloneId = id();
      const cloneDocumentId = id();
      const collaboratorId = id();
      const pathId = id();

      // Get original document content
      const originalDocument = amendment.document;

      // Calculate path
      const targetUserId = collaboratorUserId || user.id;
      const userMemberships =
        (networkData as any)?.groupMemberships?.filter(
          (m: any) => (m.status === 'member' || m.status === 'admin') && m.user?.id === targetUserId
        ) || [];
      const userGroupIds = userMemberships.map((m: any) => m.group.id);
      const allGroups = (networkData as any)?.groups || [];
      const relationships = (networkData as any)?.groupRelationships || [];
      const events = (networkData as any)?.events || [];

      // Filter for amendmentRight relationships
      const amendmentRelationships = relationships.filter(
        (r: any) => r.withRight === 'amendmentRight'
      );

      // Build groups map
      const groupsMap = new Map();
      allGroups.forEach((g: any) => {
        groupsMap.set(g.id, {
          id: g.id,
          name: g.name,
          description: g.description,
        });
      });

      // Find shortest path
      const path = findShortestPath(
        userGroupIds,
        selectedTargetGroupId,
        amendmentRelationships,
        groupsMap
      );

      if (!path || path.length === 0) {
        toast.error('No valid path found to target group');
        setIsCloning(false);
        return;
      }

      // For each group in path, find the closest upcoming event
      const now = new Date();
      const pathWithEvents = path.map((segment: any) => {
        const groupId = segment.group.id;
        const groupName = segment.group.name;

        // Find all upcoming events for this group
        const groupEvents = events.filter(
          (e: any) => e.group?.id === groupId && new Date(e.startDate) > now
        );

        // Sort by start date and pick the closest one
        groupEvents.sort(
          (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        const closestEvent = groupEvents[0];

        return {
          groupId,
          groupName,
          eventId: closestEvent?.id || null,
          eventTitle: closestEvent?.title || 'No upcoming event',
          eventStartDate: closestEvent?.startDate || null,
        };
      });

      // Override the last segment's event with the user-selected event
      const lastSegment = pathWithEvents[pathWithEvents.length - 1];
      if (lastSegment && lastSegment.groupId === selectedTargetGroupId) {
        lastSegment.eventId = selectedEventId;
        const selectedEvent = events.find((e: any) => e.id === selectedEventId);
        if (selectedEvent) {
          lastSegment.eventTitle = selectedEvent.title;
          lastSegment.eventStartDate = selectedEvent.startDate;
        }
      }

      // Find the closest event in the path
      const eventsWithDates = pathWithEvents.filter(seg => seg.eventStartDate);
      eventsWithDates.sort((a, b) => {
        const dateA = a.eventStartDate ? new Date(a.eventStartDate).getTime() : 0;
        const dateB = b.eventStartDate ? new Date(b.eventStartDate).getTime() : 0;
        return dateA - dateB;
      });
      const closestEventId = eventsWithDates.length > 0 ? eventsWithDates[0].eventId : null;

      // Create agenda items and votes for each event in the path
      const enrichedPath = [];
      const transactions: any[] = [];

      for (const segment of pathWithEvents) {
        let agendaItemId = null;
        let amendmentVoteId = null;
        let forwardingStatus = 'previous_decision_outstanding';

        // Only create agenda item if the segment has an event
        if (segment.eventId) {
          agendaItemId = id();
          amendmentVoteId = id();

          // Determine forwarding status
          if (segment.eventId === closestEventId) {
            forwardingStatus = 'forward_confirmed';
          }

          // Create agenda item
          transactions.push(
            tx.agendaItems[agendaItemId]
              .update({
                title: `Amendment: ${amendment.title} (Clone)`,
                description: amendment.subtitle || '',
                type: 'amendment',
                status: 'pending',
                forwardingStatus: forwardingStatus,
                order: 999,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .link({
                event: segment.eventId,
                creator: user.id,
                amendment: cloneId,
              })
          );

          // Create amendment vote for the agenda item
          transactions.push(
            tx.amendmentVotes[amendmentVoteId]
              .update({
                title: `${amendment.title} (Clone)`,
                description: amendment.subtitle || '',
                proposedText: amendment.title,
                originalText: '',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .link({
                agendaItem: agendaItemId,
                creator: user.id,
              })
          );
        }

        // Add to enriched path with IDs
        enrichedPath.push({
          ...segment,
          agendaItemId,
          amendmentVoteId,
          forwardingStatus,
        });
      }

      // Create cloned amendment
      transactions.push(
        db.tx.amendments[cloneId]
          .update({
            title: `${amendment.title} (Clone)`,
            subtitle: amendment.subtitle,
            status: 'Drafting',
            supporters: 0,
            date: new Date().toISOString(),
            code: amendment.code ? `${amendment.code}-CLONE` : undefined,
            tags: amendment.tags,
            visibility: amendment.visibility || 'public',
            upvotes: 0,
            downvotes: 0,
            imageURL: amendment.imageURL,
            videoURL: amendment.videoURL,
            videoThumbnailURL: amendment.videoThumbnailURL,
          })
          .link({
            clonedFrom: amendmentId,
            targetGroup: selectedTargetGroupId,
            targetEvent: selectedEventId,
          })
      );

      // Create cloned document
      transactions.push(
        db.tx.documents[cloneDocumentId]
          .update({
            title: `${amendment.title} (Clone)`,
            content: originalDocument?.content || { type: 'doc', content: [] },
            isPublic: originalDocument?.isPublic || false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          .link({
            owner: user.id,
          })
      );

      // Link amendment to document
      transactions.push(
        db.tx.amendments[cloneId].link({
          document: cloneDocumentId,
        })
      );

      // Add current user as admin collaborator
      transactions.push(
        db.tx.amendmentCollaborators[collaboratorId]
          .update({
            status: 'admin',
            createdAt: Date.now(),
            visibility: 'public',
          })
          .link({
            amendment: cloneId,
            user: user.id,
          })
      );

      // Create path record
      const pathUserId = collaboratorUserId || user.id;
      transactions.push(
        tx.amendmentPaths[pathId]
          .update({
            pathLength: enrichedPath.length,
            createdAt: new Date(),
          })
          .link({
            amendment: cloneId,
            user: pathUserId,
          })
      );

      // Create path segments
      enrichedPath.forEach((segment, index) => {
        const segmentId = id();
        const segmentLinks: any = {
          path: pathId,
          group: segment.groupId,
        };

        // Add optional links if they exist
        if (segment.eventId) segmentLinks.event = segment.eventId;
        if (segment.agendaItemId) segmentLinks.agendaItem = segment.agendaItemId;
        if (segment.amendmentVoteId) segmentLinks.amendmentVote = segment.amendmentVoteId;

        transactions.push(
          tx.amendmentPathSegments[segmentId]
            .update({
              order: index,
              forwardingStatus: segment.forwardingStatus,
              createdAt: new Date(),
            })
            .link(segmentLinks)
        );
      });

      await db.transact(transactions);

      toast.success('Amendment cloned successfully!');
      setCloneDialogOpen(false);
      router.push(`/amendment/${cloneId}`);
    } catch (error) {
      console.error('Error cloning amendment:', error);
      toast.error('Failed to clone amendment');
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

        {/* Target Collaborator, Target Group and Cloned From Section */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
          {targetCollaborator && (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={targetCollaborator.imageURL} />
                <AvatarFallback>
                  {targetCollaborator.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">{targetCollaborator.name}</p>
                <p className="text-xs text-muted-foreground">Target Collaborator</p>
              </div>
            </div>
          )}
          {targetGroup && (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={targetGroup.imageURL} />
                <AvatarFallback>{targetGroup.name?.[0]?.toUpperCase() || 'G'}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">{targetGroup.name}</p>
                <p className="text-xs text-muted-foreground">Targets</p>
              </div>
            </div>
          )}
          {clonedFrom && (
            <Link
              href={`/amendment/${clonedFrom.id}`}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={clonedFrom.imageURL || clonedFrom.videoThumbnailURL} />
                <AvatarFallback>
                  <Copy className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">{clonedFrom.title}</p>
                <p className="text-xs text-muted-foreground">Cloned from</p>
              </div>
            </Link>
          )}
        </div>
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
          { value: clones.length, labelKey: 'components.labels.clones' },
          { value: supportingGroups.length, labelKey: 'components.labels.supportingGroups' },
          { value: totalSupportingMembers, labelKey: 'components.labels.supportingMembers' },
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
        <Button variant="outline" size="default" onClick={handleClone}>
          <Copy className="mr-2 h-4 w-4" />
          Clone
        </Button>
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

      {/* Collaborators Carousel */}
      {collaborators.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Collaborators ({collaborators.length})
            </CardTitle>
            <CardDescription>People working on this amendment</CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {collaborators.map((collab: any, index: number) => (
                  <CarouselItem key={collab.id} className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3">
                    <Link
                      href={`/user/${collab.user?.id}`}
                      className="block transition-opacity hover:opacity-90"
                    >
                      <Card
                        className={`h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${GRADIENTS[index % GRADIENTS.length]}`}
                      >
                        <CardHeader className="space-y-3 pb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-background">
                              <AvatarImage src={collab.user?.avatar || collab.user?.imageURL} />
                              <AvatarFallback>
                                {collab.user?.name?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="line-clamp-1 text-lg">
                                {collab.user?.name || 'Unknown'}
                              </CardTitle>
                              {collab.user?.handle && (
                                <CardDescription className="text-xs">
                                  @{collab.user.handle}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {collab.status === 'admin' ? 'Admin' : 'Collaborator'}
                            </Badge>
                          </div>
                        </CardHeader>
                        {collab.user?.bio && (
                          <CardContent className="pt-0">
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {collab.user.bio}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      )}

      {/* Supported By Section */}
      {supportingGroups.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Supported By
            </CardTitle>
            <CardDescription>
              Groups supporting this amendment ({totalSupportingMembers} total members)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {supportingGroups.map((group: any, index: number) => (
                <Link
                  key={group.id}
                  href={`/group/${group.id}`}
                  className="block transition-opacity hover:opacity-90"
                >
                  <GroupsCard
                    group={{
                      id: group.id,
                      groupId: group.id,
                      name: group.name || 'Unknown Group',
                      description: group.description,
                      role: 'Supporter',
                      members: group.memberships?.length || 0,
                    }}
                    gradientClass={GRADIENTS[index % GRADIENTS.length]}
                  />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clones Section */}
      {clones.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Clones ({clones.length})
            </CardTitle>
            <CardDescription>Amendments cloned from this one</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {clones.map((clone: any, index: number) => (
                <Link
                  key={clone.id}
                  href={`/amendment/${clone.id}`}
                  className="block transition-opacity hover:opacity-90"
                >
                  <Card
                    className={`overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${GRADIENTS[index % GRADIENTS.length]}`}
                  >
                    <CardHeader className="space-y-2 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="line-clamp-2 text-lg">{clone.title}</CardTitle>
                          {clone.subtitle && (
                            <CardDescription className="mt-1 line-clamp-2 text-sm">
                              {clone.subtitle}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            statusColors[clone.status] ||
                            'border-gray-500/20 bg-gray-500/10 text-gray-500'
                          }
                        >
                          {clone.status}
                        </Badge>
                        {clone.code && (
                          <Badge variant="outline" className="text-xs">
                            {clone.code}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    {clone.date && (
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(clone.date).toLocaleDateString()}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clone Dialog */}
      <TargetSelectionDialog
        open={cloneDialogOpen}
        onOpenChange={setCloneDialogOpen}
        networkData={networkData}
        targetGroupEventsData={targetGroupEventsData}
        currentUserId={user?.id || ''}
        allUsers={((usersData as any)?.$users || []).map((u: any) => ({
          id: u.id,
          name: u.handle || u.email || 'Unknown User',
          email: u.email,
          avatar: u.imageURL,
        }))}
        onConfirm={handleConfirmClone}
        onGroupSelect={setSelectedTargetGroupId}
        hideCollaboratorSelection={true}
        isSaving={isCloning}
        title="Clone Amendment - Select Target"
        description="Select a target group and event from your network for the cloned amendment"
        confirmButtonText="Clone Amendment"
      />
    </div>
  );
}
