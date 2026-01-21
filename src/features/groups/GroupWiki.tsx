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
import { LinkGroupDialog } from '@/components/groups/LinkGroupDialog';
import db from '../../../db/db';
import { UserCheck, BookOpen, Network } from 'lucide-react';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { BlogSearchCard } from '@/features/search/ui/BlogSearchCard';
import { GRADIENTS } from '@/features/user/state/gradientColors';
import { useSubscribeGroup } from '@/features/groups/hooks/useSubscribeGroup';
import { StatsBar } from '@/components/ui/StatsBar';
import { useGroupMembership } from '@/features/groups/hooks/useGroupMembership';
import { ActionBar } from '@/components/ui/ActionBar';
import { SubscribeButton, MembershipButton } from '@/components/shared/action-buttons';
import { SocialBar } from '@/features/user/ui/SocialBar';
import { InfoTabs } from '@/components/shared/InfoTabs';
import { useRouter } from 'next/navigation';
import { GroupsCard } from '@/features/user/ui/GroupsCard';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { ShareButton } from '@/components/shared/ShareButton';

interface GroupWikiProps {
  groupId: string;
}

export function GroupWiki({ groupId }: GroupWikiProps) {
  const router = useRouter();
  const { t } = useTranslation();

  // Subscribe hook
  const {
    isSubscribed,
    subscriberCount,
    isLoading: subscribeLoading,
    toggleSubscribe,
  } = useSubscribeGroup(groupId);

  // Membership hook
  const {
    status,
    isMember,
    hasRequested,
    isInvited,
    memberCount: membershipCount,
    isLoading: membershipLoading,
    requestJoin,
    leaveGroup,
    acceptInvitation,
  } = useGroupMembership(groupId);

  // Fetch group data
  const { data, isLoading } = db.useQuery({
    groups: {
      $: { where: { id: groupId } },
      owner: {},
      events: {},
      amendments: {},
      memberships: {
        user: {},
      },
      childRelationships: {
        childGroup: {
          memberships: {},
          events: {},
          amendments: {},
        },
      },
      hashtags: {},
      positions: {
        currentHolder: {},
      },
      blogs: {
        hashtags: {},
      },
    },
  });

  const group = data?.groups?.[0];

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-muted-foreground">Loading group...</div>
        </div>
      </div>
    );
  }

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

  const memberCount = membershipCount || group.memberships?.length || group.memberCount || 0;
  const eventsCount = group.events?.length || 0;
  const amendmentsCount = group.amendments?.length || 0;

  const formatRight = (right: string) => {
    const labels: Record<string, string> = {
      informationRight: 'Informationsrecht',
      amendmentRight: 'Antragsrecht',
      rightToSpeak: 'Rederecht',
      activeVotingRight: 'Aktives Stimmrecht',
      passiveVotingRight: 'Passives Stimmrecht',
    };
    return labels[right] || right.replace(/([A-Z])/g, ' $1').trim();
  };

  const groupRelationshipsByGroup = (relationships: any[], type: 'parent' | 'child') => {
    const grouped = new Map<string, { group: any; rights: string[] }>();

    relationships?.forEach((rel: any) => {
      const targetGroup = type === 'parent' ? rel.parentGroup : rel.childGroup;
      if (!targetGroup) return;

      if (!grouped.has(targetGroup.id)) {
        grouped.set(targetGroup.id, { group: targetGroup, rights: [] });
      }
      const entry = grouped.get(targetGroup.id);
      if (entry) {
        entry.rights.push(rel.withRight);
      }
    });

    return Array.from(grouped.values());
  };

  return (
    <div className="container mx-auto max-w-6xl p-4">
      {/* Header with centered title and subtitle */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold">{group.name}</h1>
          {group.isPublic && (
            <Badge variant="secondary" className="text-sm">
              {t('components.badges.public')}
            </Badge>
          )}
        </div>
        {(group.location || group.region || group.country) && (
          <p className="text-muted-foreground">
            {[group.location, group.region, group.country].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      {/* Group Image */}
      {group.imageURL && (
        <div className="mb-8">
          <img
            src={group.imageURL}
            alt={group.name}
            className="mx-auto h-64 w-full max-w-4xl rounded-lg object-cover shadow-lg"
          />
        </div>
      )}

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
        <LinkGroupDialog currentGroupId={groupId} currentGroupName={group.name} />
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
          title={group.name}
          description={group.description || ''}
        />
      </ActionBar>

      {/* Hashtags */}
      {group.hashtags && group.hashtags.length > 0 && (
        <div className="mb-6">
          <HashtagDisplay hashtags={group.hashtags} centered />
        </div>
      )}

      {/* Social Media */}
      <SocialBar
        socialMedia={{
          whatsapp: group.whatsapp,
          instagram: group.instagram,
          twitter: group.twitter,
          facebook: group.facebook,
          snapchat: group.snapchat,
        }}
      />

      {/* About and Contact Tabs */}
      <InfoTabs
        about={group.description}
        contact={{
          location: group.location,
          region: group.region,
          country: group.country,
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
                          {position.currentHolder ? (
                            <div className="rounded-lg border bg-background/80 p-3 shadow-sm backdrop-blur-sm">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Current Holder
                              </p>
                              <div className="flex items-center gap-3">
                                {position.currentHolder.imageURL && (
                                  <img
                                    src={position.currentHolder.imageURL}
                                    alt={position.currentHolder?.name || 'User'}
                                    className="h-10 w-10 rounded-full object-cover ring-2 ring-background"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold">
                                    {position.currentHolder?.name || 'Unknown'}
                                  </p>
                                  {position.currentHolder?.handle && (
                                    <p className="truncate text-sm text-muted-foreground">
                                      @{position.currentHolder.handle}
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
                          )}
                          {(position.term || position.firstTermStart) && (
                            <div className="space-y-2 rounded-lg border border-border/50 bg-background/50 p-3 text-sm">
                              {position.term && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-muted-foreground">Term:</span>
                                  <span className="font-semibold">{position.term}</span>
                                </div>
                              )}
                              {position.firstTermStart && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-muted-foreground">
                                    Started:
                                  </span>
                                  <span className="font-semibold">
                                    {new Date(position.firstTermStart).toLocaleDateString()}
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
      {group.childRelationships && group.childRelationships.length > 0 && (
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
              {groupRelationshipsByGroup(group.childRelationships, 'child').map(
                ({ group: childGroup, rights }, index) => (
                  <Link
                    key={`child-${childGroup.id}`}
                    href={`/group/${childGroup.id}`}
                    className="block transition-opacity hover:opacity-90"
                  >
                    <GroupsCard
                      group={{
                        id: childGroup.id,
                        groupId: childGroup.id,
                        name: childGroup.name || 'Unbekannt',
                        description: childGroup.description,
                        role: rights.map(formatRight).join(', '),
                        members: childGroup.memberships?.length || childGroup.memberCount || 0,
                        amendments: childGroup.amendments?.length || 0,
                        events: childGroup.events?.length || 0,
                      }}
                      gradientClass={GRADIENTS[index % GRADIENTS.length]}
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
                <BlogSearchCard
                  key={blog.id}
                  blog={blog}
                  gradientClass={GRADIENTS[index % GRADIENTS.length]}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
