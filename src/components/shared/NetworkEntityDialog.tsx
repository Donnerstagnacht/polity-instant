'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GroupSearchCard } from '@/features/search/ui/GroupSearchCard';
import { GroupEventsList } from './GroupEventsList';
import { GRADIENTS } from '@/features/user/state/gradientColors';
import { formatRights } from './RightFilters';
import { useRouter } from 'next/navigation';

interface NetworkEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: {
    type: 'group' | 'relationship' | 'user';
    data: any;
  } | null;
}

export function NetworkEntityDialog({ open, onOpenChange, entity }: NetworkEntityDialogProps) {
  const router = useRouter();

  if (!entity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {entity.type === 'group'
              ? 'Group Details'
              : entity.type === 'user'
                ? 'User Details'
                : 'Relationship Details'}
          </DialogTitle>
          <DialogDescription>
            {entity.type === 'group'
              ? 'View information about this group'
              : entity.type === 'user'
                ? 'View information about this user'
                : 'View information about this relationship'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Group Details with Events */}
          {entity.type === 'group' && entity.data && (
            <div className="space-y-4">
              <GroupSearchCard
                group={entity.data}
                gradientClass={GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]}
              />

              {/* Upcoming Events Section */}
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 text-sm font-semibold">Upcoming Events</h4>
                <GroupEventsList
                  groupId={entity.data.id}
                  onEventClick={eventId => {
                    router.push(`/event/${eventId}`);
                    onOpenChange(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* User Details */}
          {entity.type === 'user' && entity.data && (
            <div className="rounded-lg border p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {entity.data.avatarFile?.url && (
                    <img
                      src={entity.data.avatarFile.url}
                      alt={entity.data.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{entity.data.name}</h3>
                    {entity.data.subtitle && (
                      <p className="text-sm text-muted-foreground">{entity.data.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Relationship Details */}
          {entity.type === 'relationship' && entity.data && (
            <div>
              {entity.data.rights && (entity.data.rights as string[]).length > 0 ? (
                <div className="space-y-3">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Relationship Rights</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(entity.data.rights as string[]).length} right(s) granted
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {(entity.data.rights as string[]).map((right: string, index: number) => {
                      const gradientClass = GRADIENTS[index % GRADIENTS.length];
                      return (
                        <div
                          key={right}
                          className={`rounded-lg border p-4 ${gradientClass} shadow-sm`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-semibold">{formatRights([right])}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Relationship Right
                              </p>
                            </div>
                            <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium">
                              {right}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Connection Type</p>
                      <p className="text-lg font-semibold">{entity.data.label || 'Connection'}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entity.data.label ? entity.data.label : 'Membership connection'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {entity.type === 'group' && entity.data?.id && (
            <Button
              onClick={() => {
                router.push(`/group/${entity.data.id}`);
                onOpenChange(false);
              }}
            >
              Show Group
            </Button>
          )}
          {entity.type === 'user' && entity.data?.id && (
            <Button
              onClick={() => {
                router.push(`/user/${entity.data.id}`);
                onOpenChange(false);
              }}
            >
              Show User
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
