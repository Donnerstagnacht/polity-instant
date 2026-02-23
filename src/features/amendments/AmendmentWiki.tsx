'use client';

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
import { Settings, ArrowUp, ArrowDown, Users, Copy } from 'lucide-react';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { extractHashtags } from '@/zero/common/hashtagHelpers';
import { StatsBar } from '@/components/ui/StatsBar';
import { ActionBar } from '@/components/ui/ActionBar';
import { SubscribeButton, MembershipButton } from '@/components/shared/action-buttons';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShareButton } from '@/components/shared/ShareButton';
import { GroupTimelineCard } from '@/features/timeline/ui/cards/GroupTimelineCard';
import { SupporterStatusBadge } from '@/features/amendments/ui/SupporterStatusBadge';
import { GRADIENTS } from '@/features/users/state/gradientColors';
import { TargetSelectionDialog } from '@/features/amendments/ui/TargetSelectionDialog';
import { Link } from '@tanstack/react-router';
import { useTranslation } from '@/hooks/use-translation';
import { useAmendmentWikiPage } from './hooks/useAmendmentWikiPage';

interface AmendmentWikiProps {
  amendmentId: string;
}

export function AmendmentWiki({ amendmentId }: AmendmentWikiProps) {
  const { t } = useTranslation();
  const {
    navigate,
    user,
    isSubscribed,
    subscriberCount,
    toggleSubscribe,
    isLoading: subscribeLoading,
    collaboration,
    amendment,
    isAdmin,
    collaborators,
    supportingGroups,
    clones,
    clonedFrom,
    totalSupportingMembers,
    targetCollaborator,
    targetGroup,
    score,
    hasUpvoted,
    hasDownvoted,
    handleVote,
    cloneDialogOpen,
    setCloneDialogOpen,
    isCloning,
    setSelectedTargetGroupId,
    handleClone,
    handleConfirmClone,
    networkData,
    targetGroupEventsData,
    usersData,
    getSupportStatus,
    statusColors,
  } = useAmendmentWikiPage(amendmentId);

  if (!amendment) {
    return (
      <div>
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Amendment Not Found</h1>
          <p className="text-muted-foreground">
            The amendment you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
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
              to={`/amendment/${clonedFrom.id}`}
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
          { value: collaboration.collaboratorCount, labelKey: 'components.labels.collaborators' },
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
          status={collaboration.status}
          isMember={collaboration.isCollaborator}
          hasRequested={collaboration.hasRequested}
          isInvited={collaboration.isInvited}
          onRequest={collaboration.requestCollaboration}
          onLeave={collaboration.leaveCollaboration}
          onAcceptInvitation={collaboration.acceptInvitation}
          isLoading={collaboration.isLoading}
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
            onClick={() => navigate({ to: `/amendment/${amendmentId}/edit` })}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </ActionBar>

      {/* Hashtags */}
      {amendment.amendment_hashtags && amendment.amendment_hashtags.length > 0 && (
        <div className="mb-6">
          <HashtagDisplay hashtags={extractHashtags(amendment.amendment_hashtags)} centered />
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
                      to={`/user/${collab.user?.id}`}
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
              {supportingGroups
                .filter((group: any) => getSupportStatus(group.id) !== 'declined')
                .map((group: any, index: number) => {
                  const supportStatus = getSupportStatus(group.id);
                  return (
                    <div key={group.id} className="relative">
                      <Link
                        to={`/group/${group.id}`}
                        className="block transition-opacity hover:opacity-90"
                      >
                        <GroupTimelineCard
                          group={{
                            id: String(group.id),
                            name: group.name || t('common.unknown'),
                            description: group.description,
                            memberCount: group.memberships?.length || 0,
                            hashtags: extractHashtags(group.group_hashtags),
                          }}
                        />
                      </Link>
                      <div className="absolute right-2 top-2">
                        <SupporterStatusBadge status={supportStatus} size="sm" />
                      </div>
                    </div>
                  );
                })}
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
                  to={`/amendment/${clone.id}`}
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
