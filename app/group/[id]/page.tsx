'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db from '../../../db';
import { Users, Calendar, Settings, UserPlus } from 'lucide-react';

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
