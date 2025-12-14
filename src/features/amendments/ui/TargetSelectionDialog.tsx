'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import { CalendarIcon, User } from 'lucide-react';

interface TargetSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networkData: any;
  targetGroupEventsData: any;
  currentUserId: string;
  allUsers: any[];
  onConfirm: (selection: {
    groupId: string;
    groupData: any;
    eventId: string;
    eventData: any;
    collaboratorUserId: string;
  }) => void;
  onGroupSelect?: (groupId: string) => void;
  hideCollaboratorSelection?: boolean;
  isSaving?: boolean;
  title?: string;
  description?: string;
  confirmButtonText?: string;
}

export function TargetSelectionDialog({
  open,
  onOpenChange,
  networkData,
  targetGroupEventsData,
  currentUserId,
  allUsers,
  onConfirm,
  hideCollaboratorSelection = false,
  onGroupSelect,
  isSaving = false,
  title = 'Select Target Group and Event',
  description = 'Choose a collaborator to view their network, then select a group and event',
  confirmButtonText = 'Confirm Selection',
}: TargetSelectionDialogProps) {
  const [targetCollaboratorUserId, setTargetCollaboratorUserId] = useState<string>('');
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<{
    id: string;
    data: any;
  } | null>(null);
  const [pendingTarget, setPendingTarget] = useState<{
    groupId: string;
    groupData: any;
    eventId: string;
    eventData: any;
  } | null>(null);

  const handleCancel = () => {
    onOpenChange(false);
    setPendingTarget(null);
    setSelectedTargetGroup(null);
    setTargetCollaboratorUserId('');
  };

  const handleConfirm = () => {
    if (pendingTarget) {
      onConfirm({
        ...pendingTarget,
        collaboratorUserId: targetCollaboratorUserId || currentUserId,
      });
      handleCancel();
    }
  };

  const gradients = [
    'bg-gradient-to-br from-pink-100 to-blue-100 dark:from-pink-900/40 dark:to-blue-900/50',
    'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/50',
    'bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/40 dark:to-blue-900/50',
    'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/50',
    'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50',
    'bg-gradient-to-br from-red-100 to-yellow-100 dark:from-red-900/40 dark:to-yellow-900/50',
    'bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/40 dark:to-green-900/50',
  ];

  const targetUserId = targetCollaboratorUserId || currentUserId;

  const userMemberships =
    (networkData as any)?.groupMemberships?.filter(
      (m: any) => (m.status === 'member' || m.status === 'admin') && m.user?.id === targetUserId
    ) || [];

  const userGroupIds = userMemberships.map((m: any) => m.group.id);
  const allGroups = (networkData as any)?.groups || [];
  const relationships = (networkData as any)?.groupRelationships || [];

  // Filter for amendmentRight relationships
  const amendmentRelationships = relationships.filter((r: any) => r.withRight === 'amendmentRight');

  // Build set of connected groups (direct and indirect)
  const connectedGroupIds = new Set<string>(userGroupIds);

  // Add directly connected groups
  amendmentRelationships.forEach((rel: any) => {
    if (userGroupIds.includes(rel.parentGroup?.id)) {
      connectedGroupIds.add(rel.childGroup?.id);
    }
    if (userGroupIds.includes(rel.childGroup?.id)) {
      connectedGroupIds.add(rel.parentGroup?.id);
    }
  });

  // Add indirectly connected groups (2 hops)
  const firstHopGroups = Array.from(connectedGroupIds);
  amendmentRelationships.forEach((rel: any) => {
    if (firstHopGroups.includes(rel.parentGroup?.id)) {
      connectedGroupIds.add(rel.childGroup?.id);
    }
    if (firstHopGroups.includes(rel.childGroup?.id)) {
      connectedGroupIds.add(rel.parentGroup?.id);
    }
  });

  const connectedGroups = allGroups.filter((g: any) => connectedGroupIds.has(g.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!hideCollaboratorSelection && (
          <div className="border-b px-6 py-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <TypeAheadSelect
                  items={allUsers}
                  value={targetCollaboratorUserId}
                  onChange={setTargetCollaboratorUserId}
                  placeholder="Select collaborator to view their network..."
                  searchKeys={['name', 'email']}
                  getItemId={(user: any) => user.id}
                  renderItem={(user: any) => (
                    <div className="flex items-center gap-3 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || undefined} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            ?.split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{user.name}</div>
                        {user.email && (
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        )}
                      </div>
                    </div>
                  )}
                  renderSelected={(user: any) => (
                    <div className="flex items-center justify-between rounded-md border bg-background p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              ?.split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          {user.email && (
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  label="Select Network For:"
                />
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="min-h-0 flex-1 pr-4">
          <div className="space-y-2 pb-20">
            {!targetUserId || !networkData ? (
              <p className="px-6 text-sm text-muted-foreground">
                {hideCollaboratorSelection
                  ? 'Loading your network...'
                  : !targetCollaboratorUserId
                    ? 'Please select a collaborator to view their network'
                    : 'Loading groups...'}
              </p>
            ) : connectedGroups.length === 0 ? (
              <p className="px-6 text-sm text-muted-foreground">
                No connected groups found. You need to be a member of groups with amendment rights.
              </p>
            ) : (
              connectedGroups.map((group: any, index: number) => {
                const gradientClass = gradients[index % gradients.length];
                const isSelected = selectedTargetGroup?.id === group.id;
                const isMemberGroup = userGroupIds.includes(group.id);

                return (
                  <div key={group.id}>
                    {/* Group Card */}
                    <div
                      className={`cursor-pointer rounded-lg border p-3 transition-all ${
                        gradientClass
                      } ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'hover:border-primary hover:shadow-md'
                      }`}
                      onClick={() => {
                        setSelectedTargetGroup({ id: group.id, data: group });
                        onGroupSelect?.(group.id);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-semibold">{group.name}</h4>
                          {group.description && (
                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                              {group.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            {isMemberGroup && (
                              <Badge variant="secondary" className="text-xs">
                                Member
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {group.memberCount || 0} members
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                              <CalendarIcon className="h-4 w-4 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Events (shown inline below selected group) */}
                    {isSelected && (
                      <div className="ml-6 mt-2 space-y-2 border-l-2 border-primary/30 pl-4">
                        {(() => {
                          const events = (targetGroupEventsData as any)?.events || [];
                          const upcomingEvents = events
                            .filter((e: any) => new Date(e.startDate) > new Date())
                            .sort(
                              (a: any, b: any) =>
                                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                            );

                          if (upcomingEvents.length === 0) {
                            return (
                              <p className="py-2 text-sm text-muted-foreground">
                                No upcoming events for this group
                              </p>
                            );
                          }

                          return upcomingEvents.map((event: any, eventIndex: number) => {
                            const eventGradientClass = gradients[eventIndex % gradients.length];

                            return (
                              <div
                                key={event.id}
                                className={`cursor-pointer rounded-lg border p-3 transition-all ${eventGradientClass} ${
                                  pendingTarget?.eventId === event.id
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'hover:border-primary hover:shadow-md'
                                }`}
                                onClick={() => {
                                  if (!isSaving) {
                                    setPendingTarget({
                                      groupId: group.id,
                                      groupData: group,
                                      eventId: event.id,
                                      eventData: event,
                                    });
                                  }
                                }}
                              >
                                <div className="space-y-2">
                                  <h4 className="font-semibold">{event.title}</h4>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>
                                      {new Date(event.startDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  {event.description && (
                                    <p className="line-clamp-2 text-xs text-muted-foreground">
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          {pendingTarget && (
            <Button onClick={handleConfirm} disabled={isSaving}>
              {isSaving ? 'Processing...' : confirmButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
