'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { LinkGroupDialog } from '@/components/groups/LinkGroupDialog';
import { UserCheck, BookOpen, Network } from 'lucide-react';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { BlogTimelineCard } from '@/features/timeline/ui/cards/BlogTimelineCard';
import { GRADIENTS } from '@/features/users/state/gradientColors';
import { StatsBar } from '@/components/ui/StatsBar';
import { ActionBar } from '@/components/ui/ActionBar';
import { SubscribeButton, MembershipButton } from '@/components/shared/action-buttons';
import { SocialBar } from '@/features/users/ui/SocialBar';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { GroupTimelineCard } from '@/features/timeline/ui/cards/GroupTimelineCard';
import { Link } from '@tanstack/react-router';
import { useTranslation } from '@/hooks/use-translation';
import { ShareButton } from '@/components/shared/ShareButton';
import { useGroupWikiPage } from '@/features/groups/hooks/useGroupWikiPage';
import { groupRelationshipsByGroup } from '@/features/groups/logic/groupWikiHelpers';

interface GroupWikiProps {
  groupId: string;
}

export function GroupWiki({ groupId }: GroupWikiProps) {
  const { t } = useTranslation();

  const {
    group,
    memberCount,
    eventsCount,
    amendmentsCount,
    subscriberCount,
    isSubscribed,
    subscribeLoading,
    toggleSubscribe,
    status,
    isMember,
    hasRequested,
    isInvited,
    membershipLoading,
    requestJoin,
    leaveGroup,
    acceptInvitation,
  } = useGroupWikiPage(groupId);

  if (!group) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold">Group Not Found</h1>
          <p className="text-muted-foreground">
            The group you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-4">
      {/* Header with centered title and subtitle */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold">{group.name}</h1>
          {group.is_public && (
            <Badge variant="secondary" className="text-sm">
              {t('components.badges.public')}
            </Badge>
          )}
        </div>
        {group.location && <p className="text-muted-foreground">{group.location}</p>}
      </div>

      {/* Stats Bar with Events and Amendments */}
      <StatsBar
        stats={[
          { value: memberCount, labelKey: 'components.labels.members' },
          { value: subscriberCount, labelKey: 'components.labels.subscribers' },
          { value: eventsCount, labelKey: 'components.labels.events' },
          { value: amendmentsCount, labelKey: 'components.labels.amendments' },
        ]}
      />

      {/* Action Bar */}
      <ActionBar>
        <LinkGroupDialog currentGroupId={groupId} currentGroupName={group.name ?? ''} />
        <SubscribeButton
          entityType="group"
          entityId={groupId}
          isSubscribed={isSubscribed}
          onToggleSubscribe={toggleSubscribe}
          isLoading={subscribeLoading}
        />
        <MembershipButton
          actionType="join"
          status={status}
          isMember={isMember}
          hasRequested={hasRequested}
          isInvited={isInvited}
          onRequest={requestJoin}
          onLeave={leaveGroup}
          onAcceptInvitation={acceptInvitation}
          isLoading={membershipLoading}
        />
        <ShareButton
          url={`/group/${groupId}`}
          title={group.name ?? ''}
          description={group.description || ''}
        />
      </ActionBar>

      {/* Hashtags */}
      {group.hashtags && group.hashtags.length > 0 && (
        <div className="mb-6">
          <HashtagDisplay hashtags={group.hashtags.map(h => ({ ...h, tag: h.tag ?? '' }))} centered />
        </div>
      )}

      {/* Social Media */}
      <SocialBar
        socialMedia={{
          twitter: group.x ?? undefined,
        }}
      />

      {/* About and Contact Tabs */}
      <InfoTabs
        about={group.description ?? undefined}
        contact={{
          location: group.location ?? undefined,
          website: group.website ?? undefined,
        }}
        className="mb-12"
      />

      {/* Positions Carousel */}
      {group.positions && group.positions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Positions
            </CardTitle>
            <CardDescription>Current office holders in this group</CardDescription>
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
                {group.positions.map((position: any, index: number) => (
                  <CarouselItem
                    key={position.id}
                    className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3"
                  >
                    <Card
                      className={`h-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${GRADIENTS[index % GRADIENTS.length]}`}
                    >
                      <CardHeader className="space-y-3 pb-4">
                        <CardTitle className="line-clamp-1 text-xl">{position.title}</CardTitle>
                        {position.description && (
                          <CardDescription className="line-clamp-2">
                            {position.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-3">
                          {(() => {
                            const currentHistory = position.holder_history?.find(
                              (h: any) => !h.end_date
                            );
                            const holder = currentHistory?.user;
                            return holder ? (
                              <div className="rounded-lg border bg-background/80 p-3 shadow-sm backdrop-blur-sm">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                  Current Holder
                                </p>
                                <div className="flex items-center gap-3">
                                  {holder.avatar && (
                                    <img
                                      src={holder.avatar}
                                      alt={holder.first_name || 'User'}
                                      className="h-10 w-10 rounded-full object-cover ring-2 ring-background"
                                    />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">
                                      {[holder.first_name, holder.last_name]
                                        .filter(Boolean)
                                        .join(' ') || 'Unknown'}
                                    </p>
                                    {holder.handle && (
                                      <p className="truncate text-sm text-muted-foreground">
                                        @{holder.handle}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed border-border/50 bg-background/50 p-4 text-center">
                                <p className="text-sm font-medium text-muted-foreground">
                                  Vacant Position
                                </p>
                              </div>
                            );
                          })()}
                          {(position.term || position.first_term_start) && (
                            <div className="space-y-2 rounded-lg border border-border/50 bg-background/50 p-3 text-sm">
                              {position.term && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-muted-foreground">Term:</span>
                                  <span className="font-semibold">{position.term}</span>
                                </div>
                              )}
                              {position.first_term_start && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-muted-foreground">
                                    Started:
                                  </span>
                                  <span className="font-semibold">
                                    {new Date(position.first_term_start).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      )}

      {/* Parent & Child Groups */}
      {group.relationships_as_source && group.relationships_as_source.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              {t('pages.groups.childGroups.title')}
            </CardTitle>
            <CardDescription>{t('pages.groups.childGroups.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {groupRelationshipsByGroup([...group.relationships_as_source], 'child').map(
                ({ group: relatedGroup }) => (
                  <Link
                    key={`child-${relatedGroup.id}`}
                    to={`/group/${relatedGroup.id}`}
                    className="block transition-opacity hover:opacity-90"
                  >
                    <GroupTimelineCard
                      group={{
                        id: String(relatedGroup.id),
                        name: relatedGroup.name || t('common.unknown'),
                        description: relatedGroup.description,
                        memberCount:
                          relatedGroup.memberships?.length || relatedGroup.member_count || 0,
                        amendmentCount: relatedGroup.amendments?.length || 0,
                        eventCount: relatedGroup.events?.length || 0,
                      }}
                    />
                  </Link>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blogs Section */}
      {group.blogs && group.blogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Blog Posts
            </CardTitle>
            <CardDescription>Recent posts from this group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.blogs.map((blog: any, index: number) => (
                <BlogTimelineCard
                  key={blog.id}
                  blog={{
                    id: String(blog.id),
                    title: blog.title,
                    excerpt: blog.description,
                    coverImageUrl: blog.imageURL,
                    commentCount: blog.commentCount,
                    hashtags: blog.hashtags,
                    authorName: blog.authorName || group.name,
                    publishedAt: blog.date,
                  }}
                  className={GRADIENTS[index % GRADIENTS.length]}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
