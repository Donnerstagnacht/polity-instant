import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, CheckCircle2, Clock } from 'lucide-react';
import db from '../../../../db/db';
import { getDirectSubgroups } from '@/utils/delegate-calculations';

interface DelegatesOverviewProps {
  eventId: string;
  groupId?: string;
}

export function DelegatesOverview({ eventId, groupId }: DelegatesOverviewProps) {
  // Query event details with delegates and allocations
  const { data: eventData } = db.useQuery({
    events: {
      $: { where: { id: eventId } },
      delegates: {
        user: {},
        group: {},
      },
      delegateAllocations: {
        group: {},
      },
    },
  });

  // Query group relationships to get subgroups
  const { data: relationshipsData } = db.useQuery(
    groupId
      ? {
          groupRelationships: {
            $: {
              where: {
                'parentGroup.id': groupId,
              },
            },
            childGroup: {},
            parentGroup: {},
          },
        }
      : { groupRelationships: {} }
  );

  const event = eventData?.events?.[0];
  const delegates = event?.delegates || [];
  const allocations = event?.delegateAllocations || [];
  const subgroups = groupId
    ? getDirectSubgroups(
        groupId,
        (relationshipsData?.groupRelationships || []).filter(
          (rel: any) => rel.childGroup && rel.parentGroup
        ) as any
      )
    : [];

  // Group delegates by subgroup
  const delegatesByGroup = subgroups.map(subgroup => {
    const allocation = allocations.find((a: any) => a.group?.id === subgroup.id);
    const groupDelegates = delegates.filter((d: any) => d.group?.id === subgroup.id);

    const confirmedDelegates = groupDelegates.filter((d: any) => d.status === 'confirmed');
    const nominatedDelegates = groupDelegates.filter((d: any) => d.status === 'nominated');
    const standbyDelegates = groupDelegates.filter((d: any) => d.status === 'standby');

    return {
      subgroup,
      allocation: allocation?.allocatedDelegates || 0,
      delegates: groupDelegates,
      confirmedDelegates,
      nominatedDelegates,
      standbyDelegates,
    };
  });

  const isDelegatesFinalized = event?.delegatesFinalized;

  if (subgroups.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No subgroups found for this group
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isDelegatesFinalized && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-50 p-3 dark:bg-yellow-900/20">
          <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Delegates will be finalized when the event starts. Current allocations may change based
            on membership numbers.
          </p>
        </div>
      )}

      {delegatesByGroup.map(({ subgroup, allocation, delegates, confirmedDelegates, nominatedDelegates, standbyDelegates }) => (
        <Card key={subgroup.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{subgroup.name}</CardTitle>
                <CardDescription>
                  {subgroup.memberCount} members · {allocation} delegate{allocation !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Badge variant={isDelegatesFinalized ? 'default' : 'secondary'}>
                {isDelegatesFinalized ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Finalized
                  </>
                ) : (
                  <>
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Confirmed Delegates */}
            {confirmedDelegates.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Confirmed Delegates ({confirmedDelegates.length})
                </p>
                <div className="space-y-2">
                  {confirmedDelegates.map((delegate: any) => (
                    <div
                      key={delegate.id}
                      className="flex items-center gap-3 rounded-lg border bg-green-50 p-3 dark:bg-green-900/20"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={delegate.user?.avatar}
                          alt={delegate.user?.name || 'User'}
                        />
                        <AvatarFallback>
                          {delegate.user?.name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{delegate.user?.name || 'Unknown'}</p>
                        {delegate.user?.handle && (
                          <p className="text-sm text-muted-foreground">
                            @{delegate.user.handle}
                          </p>
                        )}
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Confirmed
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nominated Delegates (not yet finalized) */}
            {!isDelegatesFinalized && nominatedDelegates.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Nominated ({nominatedDelegates.length})
                </p>
                <div className="space-y-2">
                  {nominatedDelegates.map((delegate: any, index: number) => (
                    <div
                      key={delegate.id}
                      className="flex items-center gap-3 rounded-lg border bg-blue-50 p-3 dark:bg-blue-900/20"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={delegate.user?.avatar}
                          alt={delegate.user?.name || 'User'}
                        />
                        <AvatarFallback>
                          {delegate.user?.name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{delegate.user?.name || 'Unknown'}</p>
                        {delegate.user?.handle && (
                          <p className="text-sm text-muted-foreground">
                            @{delegate.user.handle}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        #{delegate.priority || index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Standby Delegates */}
            {standbyDelegates.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Standby ({standbyDelegates.length})
                </p>
                <div className="space-y-2">
                  {standbyDelegates.map((delegate: any, index: number) => (
                    <div
                      key={delegate.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={delegate.user?.avatar}
                          alt={delegate.user?.name || 'User'}
                        />
                        <AvatarFallback>
                          {delegate.user?.name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{delegate.user?.name || 'Unknown'}</p>
                        {delegate.user?.handle && (
                          <p className="text-sm text-muted-foreground">
                            @{delegate.user.handle}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">Standby</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No delegates yet */}
            {delegates.length === 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-muted p-4 text-center text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <p>No delegates nominated yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
