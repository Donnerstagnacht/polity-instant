import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Users, CheckCircle2, Clock } from 'lucide-react';
import { useEventDelegates } from '@/zero/events/useEventState';
import { getDirectSubgroups } from '@/features/shared/utils/delegate-calculations';

interface DelegatesOverviewProps {
  eventId: string;
  groupId?: string;
}

export function DelegatesOverview({ eventId, groupId }: DelegatesOverviewProps) {
  // Query event details with delegates and allocations + group relationships
  const { event, relationships: relationshipsRows } = useEventDelegates(eventId, groupId);
  const delegates = event?.delegates || [];
  const allocations = event?.delegate_allocations || [];
  const subgroups = groupId
    ? getDirectSubgroups(
        groupId,
        (relationshipsRows || [])
          .filter(rel => rel.related_group && rel.group)
          .map(rel => ({
            id: rel.id,
            parentGroup: { id: rel.group!.id },
            childGroup: {
              id: rel.related_group!.id,
              name: rel.related_group!.name || '',
              memberCount: rel.related_group!.member_count ?? 0,
            },
          }))
      )
    : [];

  // Group delegates by subgroup
  const delegatesByGroup = subgroups.map(subgroup => {
    const allocation = allocations.find(a => a.group_id === subgroup.id);
    const groupDelegates = delegates.filter(d => d.group_id === subgroup.id);

    const confirmedDelegates = groupDelegates.filter(d => d.status === 'confirmed');
    const nominatedDelegates = groupDelegates.filter(d => d.status === 'nominated');
    const standbyDelegates = groupDelegates.filter(d => d.status === 'standby');

    return {
      subgroup,
      allocation: allocation?.allocated_seats || 0,
      delegates: groupDelegates,
      confirmedDelegates,
      nominatedDelegates,
      standbyDelegates,
    };
  });

  const isDelegatesFinalized = event?.delegate_finalized_at;

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
                  {confirmedDelegates.map((delegate) => (
                    <div
                      key={delegate.id}
                      className="flex items-center gap-3 rounded-lg border bg-green-50 p-3 dark:bg-green-900/20"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={delegate.user?.avatar ?? undefined}
                          alt={[delegate.user?.first_name, delegate.user?.last_name].filter(Boolean).join(' ') || 'User'}
                        />
                        <AvatarFallback>
                          {delegate.user?.first_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{[delegate.user?.first_name, delegate.user?.last_name].filter(Boolean).join(' ') || 'Unknown'}</p>
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
                  {nominatedDelegates.map((delegate, index) => (
                    <div
                      key={delegate.id}
                      className="flex items-center gap-3 rounded-lg border bg-blue-50 p-3 dark:bg-blue-900/20"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={delegate.user?.avatar ?? undefined}
                          alt={[delegate.user?.first_name, delegate.user?.last_name].filter(Boolean).join(' ') || 'User'}
                        />
                        <AvatarFallback>
                          {delegate.user?.first_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{[delegate.user?.first_name, delegate.user?.last_name].filter(Boolean).join(' ') || 'Unknown'}</p>
                        {delegate.user?.handle && (
                          <p className="text-sm text-muted-foreground">
                            @{delegate.user.handle}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">
                        #{index + 1}
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
                  {standbyDelegates.map((delegate, index) => (
                    <div
                      key={delegate.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={delegate.user?.avatar ?? undefined}
                          alt={[delegate.user?.first_name, delegate.user?.last_name].filter(Boolean).join(' ') || 'User'}
                        />
                        <AvatarFallback>
                          {delegate.user?.first_name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{[delegate.user?.first_name, delegate.user?.last_name].filter(Boolean).join(' ') || 'Unknown'}</p>
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
