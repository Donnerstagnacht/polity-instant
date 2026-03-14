'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/ui/dialog';
import { Button } from '@/features/shared/ui/ui/button';
import { Badge } from '@/features/shared/ui/ui/badge';
import { ScrollArea } from '@/features/shared/ui/ui/scroll-area';
import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch';
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems';
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers';
import { CalendarIcon, User } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface NetworkDataProp {
  groups: ReadonlyArray<{ id: string; name?: string | null; description?: string | null; memberCount?: number }>;
  groupRelationships: ReadonlyArray<{
    with_right?: string | null;
    group?: { id: string } | null;
    related_group?: { id: string } | null;
  }>;
  groupMemberships: ReadonlyArray<{
    status?: string | null;
    user?: { id: string } | null;
    group?: { id: string } | null;
  }>;
}

interface EventsDataProp {
  events: ReadonlyArray<{
    id: string;
    title?: string | null;
    description?: string | null;
    start_date?: number | null;
  }>;
}

interface TargetSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  networkData: NetworkDataProp;
  targetGroupEventsData: EventsDataProp;
  currentUserId: string;
  allUsers: Array<{ id: string; name: string; email: string | null; avatar?: string | null }>;
  onConfirm: (selection: {
    groupId: string;
    groupData: Record<string, unknown>;
    eventId: string;
    eventData: Record<string, unknown>;
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
  title,
  description,
  confirmButtonText,
}: TargetSelectionDialogProps) {
  const { t } = useTranslation();
  const [targetCollaboratorUserId, setTargetCollaboratorUserId] = useState<string>('');
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<{
    id: string;
    data: Record<string, unknown>;
  } | null>(null);
  const [pendingTarget, setPendingTarget] = useState<{
    groupId: string;
    groupData: Record<string, unknown>;
    eventId: string;
    eventData: Record<string, unknown>;
  } | null>(null);

  const dialogTitle = title || t('features.amendments.targetSelection.defaultTitle');
  const dialogDescription = description || t('features.amendments.targetSelection.defaultDescription');
  const confirmText = confirmButtonText || t('features.amendments.targetSelection.defaultConfirm');

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

  const userMemberships = networkData.groupMemberships.filter(
    (m) => (m.status === 'active' || m.status === 'admin') && m.user?.id === targetUserId
  );

  const userGroupIds = userMemberships.map((m) => m.group?.id).filter((id): id is string => !!id);
  const allGroups = networkData.groups;
  const relationships = networkData.groupRelationships;

  // Filter for amendmentRight relationships
  const amendmentRelationships = relationships.filter((r) => r.with_right === 'amendmentRight');

  // Build set of connected groups (direct and indirect)
  const connectedGroupIds = new Set<string>(userGroupIds);

  // Add directly connected groups
  amendmentRelationships.forEach((rel) => {
    if (userGroupIds.includes(rel.group?.id ?? '')) {
      if (rel.related_group?.id) connectedGroupIds.add(rel.related_group.id);
    }
    if (userGroupIds.includes(rel.related_group?.id ?? '')) {
      if (rel.group?.id) connectedGroupIds.add(rel.group.id);
    }
  });

  // Add indirectly connected groups (2 hops)
  const firstHopGroups = Array.from(connectedGroupIds);
  amendmentRelationships.forEach((rel) => {
    if (firstHopGroups.includes(rel.group?.id ?? '')) {
      if (rel.related_group?.id) connectedGroupIds.add(rel.related_group.id);
    }
    if (firstHopGroups.includes(rel.related_group?.id ?? '')) {
      if (rel.group?.id) connectedGroupIds.add(rel.group.id);
    }
  });

  const connectedGroups = allGroups.filter((g) => connectedGroupIds.has(g.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        {!hideCollaboratorSelection && (
          <div className="border-b px-6 py-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <TypeaheadSearch
                  items={toTypeaheadItems(
                    allUsers,
                    'user',
                    (u) => u.name || 'User',
                    (u) => u.email,
                    (u) => u.avatar,
                  )}
                  value={targetCollaboratorUserId}
                  onChange={(item: TypeaheadItem | null) => setTargetCollaboratorUserId(item?.id ?? '')}
                  placeholder={t('features.amendments.targetSelection.selectCollaboratorPlaceholder')}
                  label={t('features.amendments.targetSelection.selectNetworkFor')}
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
                  ? t('features.amendments.targetSelection.loadingNetwork')
                  : !targetCollaboratorUserId
                    ? t('features.amendments.targetSelection.selectCollaboratorPrompt')
                    : t('features.amendments.targetSelection.loadingGroups')}
              </p>
            ) : connectedGroups.length === 0 ? (
              <p className="px-6 text-sm text-muted-foreground">
                {t('features.amendments.targetSelection.noConnectedGroups')}
              </p>
            ) : (
              connectedGroups.map((group, index: number) => {
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
                                {t('features.amendments.targetSelection.member')}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {group.memberCount || 0} {t('features.amendments.targetSelection.members')}
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
                          const events = targetGroupEventsData.events;
                          const upcomingEvents = [...events]
                            .filter((e) => new Date(e.start_date ?? 0) > new Date())
                            .sort(
                              (a, b) =>
                                new Date(a.start_date ?? 0).getTime() - new Date(b.start_date ?? 0).getTime()
                            );

                          if (upcomingEvents.length === 0) {
                            return (
                              <p className="py-2 text-sm text-muted-foreground">
                                {t('features.amendments.targetSelection.noUpcomingEvents')}
                              </p>
                            );
                          }

                          return upcomingEvents.map((event, eventIndex: number) => {
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
                                      {new Date(event.start_date ?? 0).toLocaleDateString('en-US', {
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
            {t('features.amendments.targetSelection.cancel')}
          </Button>
          {pendingTarget && (
            <Button onClick={handleConfirm} disabled={isSaving}>
              {isSaving ? t('features.amendments.targetSelection.processing') : confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
