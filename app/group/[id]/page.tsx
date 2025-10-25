'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LinkGroupDialog } from '../../../src/components/groups/LinkGroupDialog';
import db from '../../../db';
import { Users, Calendar, Settings, UserPlus } from 'lucide-react';
import { HashtagDisplay } from '@/components/ui/hashtag-display';

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  // Fetch group data from InstantDB
  const { data, isLoading } = db.useQuery({
    groups: {
      $: { where: { id: resolvedParams.id } },
      owner: {
        profile: {},
      },
      memberships: {
        user: {
          profile: {},
        },
      },
      childRelationships: {
        childGroup: {},
      },
      parentRelationships: {
        parentGroup: {},
      },
      hashtags: {},
    },
  });

  const group = data?.groups?.[0];

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">Loading group details...</div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!group) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Group Not Found</h1>
            <p className="text-muted-foreground">
              The group you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  const memberCount = group.memberships?.length || group.memberCount || 0;
  const owner = group.owner?.profile;

  // Group relationships by target group
  const groupRelationshipsByGroup = (relationships: any[], type: 'parent' | 'child') => {
    const grouped = new Map<string, { group: any; rights: string[]; relationshipIds: string[] }>();

    relationships?.forEach((rel: any) => {
      const targetGroup = type === 'parent' ? rel.parentGroup : rel.childGroup;
      if (!targetGroup) return;

      if (!grouped.has(targetGroup.id)) {
        grouped.set(targetGroup.id, { group: targetGroup, rights: [], relationshipIds: [] });
      }
      const entry = grouped.get(targetGroup.id);
      if (entry) {
        entry.rights.push(rel.withRight);
        entry.relationshipIds.push(rel.id);
      }
    });

    return Array.from(grouped.values());
  };

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

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-4xl font-bold">{group.name}</h1>
                {group.isPublic && (
                  <Badge variant="secondary" className="text-sm">
                    Public
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {memberCount} member{memberCount !== 1 ? 's' : ''}
                  </span>
                </div>
                {group.createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <LinkGroupDialog currentGroupId={resolvedParams.id} currentGroupName={group.name} />
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Join Group
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{group.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Hashtags */}
        {group.hashtags && group.hashtags.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <HashtagDisplay hashtags={group.hashtags} title="Tags" />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Owner Info */}
          {owner && (
            <Card>
              <CardHeader>
                <CardTitle>Group Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{owner.name || 'Unknown'}</p>
                  {owner.handle && <p className="text-sm text-muted-foreground">@{owner.handle}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                {memberCount} total member{memberCount !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {group.memberships && group.memberships.length > 0 ? (
                <div className="space-y-2">
                  {group.memberships.slice(0, 5).map((membership: any) => (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div>
                        <p className="font-medium">
                          {membership.user?.profile?.name || 'Unknown User'}
                        </p>
                        {membership.user?.profile?.handle && (
                          <p className="text-xs text-muted-foreground">
                            @{membership.user.profile.handle}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">{membership.role}</Badge>
                    </div>
                  ))}
                  {memberCount > 5 && (
                    <p className="pt-2 text-sm text-muted-foreground">
                      +{memberCount - 5} more member{memberCount - 5 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No members yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Parent & Child Groups */}
        {((group.parentRelationships && group.parentRelationships.length > 0) ||
          (group.childRelationships && group.childRelationships.length > 0)) && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {/* Parent Groups */}
            {group.parentRelationships && group.parentRelationships.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Übergeordnete Gruppen</CardTitle>
                  <CardDescription>Gruppen, denen diese Gruppe untergeordnet ist</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupRelationshipsByGroup(group.parentRelationships, 'parent').map(
                      ({ group: parentGroup, rights, relationshipIds }) => (
                        <div
                          key={`parent-group-${parentGroup.id}`}
                          className="rounded-lg border p-3"
                        >
                          <p className="mb-1 font-medium">{parentGroup.name || 'Unbekannt'}</p>
                          <div className="flex flex-wrap gap-1">
                            {rights.map((right, idx) => (
                              <Badge
                                key={`rel-${relationshipIds[idx]}-${right}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {formatRight(right)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Child Groups */}
            {group.childRelationships && group.childRelationships.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Untergeordnete Gruppen</CardTitle>
                  <CardDescription>Gruppen, die dieser Gruppe untergeordnet sind</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupRelationshipsByGroup(group.childRelationships, 'child').map(
                      ({ group: childGroup, rights, relationshipIds }) => (
                        <div key={`child-group-${childGroup.id}`} className="rounded-lg border p-3">
                          <p className="mb-1 font-medium">{childGroup.name || 'Unbekannt'}</p>
                          <div className="flex flex-wrap gap-1">
                            {rights.map((right, idx) => (
                              <Badge
                                key={`rel-${relationshipIds[idx]}-${right}`}
                                variant="secondary"
                                className="text-xs"
                              >
                                {formatRight(right)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Activity Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and discussions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity to display.</p>
          </CardContent>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
