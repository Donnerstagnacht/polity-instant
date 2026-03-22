'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { UserNetworkFlow } from '@/features/network/ui/UserNetworkFlow';
import { NetworkEntityDialog } from '@/features/network/ui/NetworkEntityDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/ui/dialog';
import { Button } from '@/features/shared/ui/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useVoteActions } from '@/zero/votes/useVoteActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import {
  calculateUpwardPathWithClosestEvents,
  enrichPathSegments,
  getActiveUserGroupIds,
} from '@/features/amendments/logic/amendmentPathHelpers';
import { useCreateAmendmentPath } from '@/features/amendments/hooks/useCreateAmendmentPath';
import { CalendarIcon, Target, X, RefreshCw, User, Users, ArrowDown, MapPin } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/features/shared/ui/ui/tabs';
import { ScrollArea } from '@/features/shared/ui/ui/scroll-area';
import { TypeaheadSearch } from '@/features/shared/ui/typeahead/TypeaheadSearch';
import { toTypeaheadItems } from '@/features/shared/ui/typeahead/toTypeaheadItems';
import type { TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { notifyAmendmentTargetSet } from '@/features/notifications/utils/notification-helpers.ts';
import type { NetworkGroupEntity } from '@/features/network/types/network.types';
import type { EventByGroupRow } from '@/zero/events/useEventState';
import { AmendmentPathVisualization } from '@/features/network/ui/AmendmentPathVisualization';
import { GroupTimelineCard } from '@/features/timeline/ui/cards/GroupTimelineCard';
import { EventTimelineCard } from '@/features/timeline/ui/cards/EventTimelineCard';
import { TargetGroupEventSelector } from '@/features/amendments/ui/TargetGroupEventSelector';
import type { PathWithEventSegment } from '@/features/amendments/logic/amendmentPathHelpers';

interface PendingTargetGroupData {
  id: string;
  name: string | null;
  description?: string | null;
  member_count?: number | null;
  event_count?: number | null;
  amendment_count?: number | null;
}

interface PendingTargetEventData {
  id: string;
  title: string | null;
  description?: string | null;
  is_public?: boolean;
  start_date?: number | null;
  location_name?: string | null;
  participant_count?: number | null;
}

import type { EnrichedPathSegment } from '@/features/network/types/network.types';

interface AmendmentProcessFlowProps {
  amendmentId: string;
}

export function AmendmentProcessFlow({ amendmentId }: AmendmentProcessFlowProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entityDialogOpen, setEntityDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] =
    useState<React.ComponentProps<typeof NetworkEntityDialog>['entity']>(null);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<{
    groupId: string;
    groupData: PendingTargetGroupData;
    eventId: string;
    eventData: PendingTargetEventData;
    pathWithEvents?: PathWithEventSegment[];
    pathMode: 'hierarchy' | 'workflow';
    workflowId: string | null;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'path' | 'network'>('network');

  const [eventChangeDialog, setEventChangeDialog] = useState<{
    open: boolean;
    groupId: string;
    groupName: string;
    currentEventId: string | null;
  } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [targetSelectionDialog, setTargetSelectionDialog] = useState(false);
  const [targetCollaboratorUserId, setTargetCollaboratorUserId] = useState<string>('');

  const {
    updateAmendment,
    deletePathSegment,
    deletePath,
  } = useAmendmentActions();
  const { createVote, deleteVote } = useVoteActions();
  const { createAgendaItem: createAgendaItemAction, deleteAgendaItem: deleteAgendaItemAction } =
    useAgendaActions();
  const { createAmendmentPath } = useCreateAmendmentPath();

  // All query data via facade
  const {
    amendmentProcess: amendmentResults,
    collaborators: collaboratorsResult,
    allGroups,
    allGroupRelationships,
    allGroupMemberships,
    allEvents,
    eventsByGroup: groupEventsResult,
    isLoading: facadeLoading,
  } = useAmendmentState({
    amendmentId,
    includeProcessData: true,
    includeNetworkData: true,
    includeEventsByGroup: !!eventChangeDialog?.groupId,
    eventGroupId: eventChangeDialog?.groupId,
  });

  const amendment = amendmentResults;
  const isLoading = facadeLoading;

  const networkData = {
    groups: allGroups ?? [],
    groupRelationships: allGroupRelationships ?? [],
    groupMemberships: allGroupMemberships ?? [],
    events: allEvents ?? [],
  };

  const groupTypeById = new Map(
    (networkData.groups as { id: string; group_type?: string | null }[]).map(group => [
      group.id,
      group.group_type ?? null,
    ])
  );

  // Use the same events query for the change event dialog
  const groupEventsData = { events: groupEventsResult ?? [] };

  const allUsers = (collaboratorsResult ?? [])
    .map(collab => collab.user)
    .filter((u): u is NonNullable<typeof u> => !!u?.id);

  // Default to the user stored on the path, or fallback to current user
  const amendmentPath = amendment?.paths?.[0];
  const displayUserId = selectedUserId || user?.id || '';

  // Check if targetGroup/targetEvent exist (they should be objects with at least an id)
  const hasTarget = Boolean(amendment?.group?.id && amendment?.event?.id);

  // Use path segments directly and sort them by order field
  const pathSegments = [...(amendmentPath?.segments || [])].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  // Create enrichedPathData from segments for backward compatibility
  const enrichedPathData: EnrichedPathSegment[] = pathSegments.map(segment => {
    // Look up agenda item and amendment vote by event_id
    const agendaItem = amendment?.agenda_items?.find(ai => ai.event_id === segment.event_id);
    const amendmentVote = amendment?.vote_entries?.find(v => v.agenda_item_id === agendaItem?.id);
    return {
      groupId: segment.group_id ?? null,
      groupName: segment.group?.name || 'Unknown Group',
      eventId: segment.event_id || null,
      eventTitle: segment.event?.title || 'No Event',
      eventStartDate: segment.event?.start_date || null,
      agendaItemId: agendaItem?.id || null,
      amendmentVoteId: amendmentVote?.id || null,
      forwardingStatus: segment.status,
      order: segment.order_index,
    };
  });

  // Set default tab based on whether target exists
  useEffect(() => {
    if (hasTarget) {
      setActiveTab('path');
    } else {
      setActiveTab('network');
    }
  }, [hasTarget]);

  // Handle group click from network
  const handleGroupClick = useCallback((groupId: string, groupData: NetworkGroupEntity) => {
    // Set entity with custom event selection handler
    setSelectedEntity({
      type: 'group',
      data: {
        ...groupData,
        onEventSelect: (eventId: string, eventData: EventByGroupRow) => {
          // When an event is selected from the dialog, set it as pending target
          setPendingTarget({
            groupId,
            groupData: {
              id: groupData.id,
              name: groupData.name ?? null,
              description: groupData.description ?? null,
              member_count: groupData.member_count ?? null,
              event_count: groupData.event_count ?? null,
              amendment_count: groupData.amendment_count ?? null,
            },
            eventId,
            eventData: {
              id: eventId,
              title: eventData.title ?? null,
              description: eventData.description ?? null,
              is_public: eventData.is_public,
              start_date: eventData.start_date ?? null,
              location_name: eventData.location_name ?? null,
              participant_count: eventData.participant_count ?? null,
            },
            pathMode: 'hierarchy',
            workflowId: null,
          });
          setEntityDialogOpen(false);
          setTargetDialogOpen(true);
        },
      },
    });
    setEntityDialogOpen(true);
  }, []);

  // Calculate path from user to target group with events for each step
  const calculatePathWithEvents = (targetGroupId: string) => {
    if (!user || !networkData) return null;

    const selectedUserId = targetCollaboratorUserId || user.id;
    const userGroupIds = getActiveUserGroupIds(networkData.groupMemberships, selectedUserId);

    return calculateUpwardPathWithClosestEvents({
      userGroupIds,
      targetGroupId,
      groups: networkData.groups,
      relationships: networkData.groupRelationships,
      events: networkData.events,
    });
  };

  // Handle target confirmation (new or update)
  const handleConfirmTarget = async () => {
    if (!pendingTarget || !user || !amendment) return;

    const { groupId, groupData, eventId, eventData } = pendingTarget;

    setIsSaving(true);
    try {
      // If there's an existing target, remove old agenda items, votes, path segments, and path
      if (hasTarget && amendmentPath?.id) {
        // Delete amendment votes first
        if (amendment.vote_entries && amendment.vote_entries.length > 0) {
          for (const vote of amendment.vote_entries) {
            await deleteVote(vote.id);
          }
        }
        // Delete agenda items
        if (amendment.agenda_items && amendment.agenda_items.length > 0) {
          for (const ai of amendment.agenda_items) {
            await deleteAgendaItemAction(ai.id);
          }
        }
        // Delete all path segments
        if (pathSegments && pathSegments.length > 0) {
          for (const segment of pathSegments) {
            if (segment.id) {
              await deletePathSegment({ id: segment.id });
            }
          }
        }
        // Delete the path itself
        await deletePath({ id: amendmentPath.id });
      }

      // Use the pre-calculated path from the selector (supports both hierarchy and workflow)
      const pathWithEvents = pendingTarget.pathWithEvents && pendingTarget.pathWithEvents.length > 0
        ? pendingTarget.pathWithEvents
        : calculatePathWithEvents(groupId);

      if (!pathWithEvents || pathWithEvents.length === 0) {
        toast.error(t('features.amendments.process.noValidPath'));
        setIsSaving(false);
        return;
      }

      // Enrich path with agenda item/vote IDs and forwarding status
      const enrichedPath = enrichPathSegments(
        pathWithEvents,
        groupId,
        eventId,
        eventData.title ?? null,
        eventData.start_date ?? null,
      );

      // Persist agenda items, votes, path and segments
      await createAmendmentPath({
        amendmentId,
        amendmentTitle: amendment.title ?? '',
        amendmentReason: amendment.reason || null,
        enrichedPath,
        workflowId: pendingTarget.workflowId,
      });

      // Update amendment with target group and event
      await updateAmendment({
        id: amendmentId,
        group_id: groupId,
        event_id: eventId,
      });

      // Notify about target being set
      await notifyAmendmentTargetSet({
        senderId: user.id,
        amendmentId,
        amendmentTitle: amendment.title ?? '',
        groupId,
        groupName: groupData.name ?? undefined,
        eventId,
        eventTitle: eventData.title ?? undefined,
      });

      toast.success(
        hasTarget
          ? t('features.amendments.process.targetUpdatedSuccess')
          : t('features.amendments.process.targetSetSuccess'),
        {
          description: t('features.amendments.process.pathDescription', {
            groupName: groupData.name ?? '',
            count: enrichedPath.length,
          }),
        }
      );

      setTargetDialogOpen(false);
      setPendingTarget(null);
    } catch (error) {
      console.error('Error setting target:', error);
      toast.error(t('features.amendments.process.setTargetFailed'), {
        description: t('features.amendments.process.tryAgain'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle target removal
  const handleRemoveTarget = async () => {
    if (!amendment || !hasTarget) return;

    setIsSaving(true);
    try {
      // Remove all agenda items and votes from the path
      if (enrichedPathData && enrichedPathData.length > 0) {
        for (const segment of enrichedPathData) {
          if (segment.agendaItemId) {
            // First delete the vote if it exists
            if (segment.amendmentVoteId) {
              await deleteVote(segment.amendmentVoteId);
            }
            // Then delete the agenda item
            await deleteAgendaItemAction(segment.agendaItemId);
          }
        }
      }

      // Remove path
      if (amendmentPath) {
        await deletePath({ id: amendmentPath.id });
      }

      // Update amendment to remove target
      await updateAmendment({
        id: amendmentId,
      });

      toast.success(t('features.amendments.process.targetRemovedSuccess'));
      setRemoveDialogOpen(false);
    } catch (error) {
      console.error('Error removing target:', error);
      toast.error(t('features.amendments.process.removeTargetFailed'), {
        description: t('features.amendments.process.tryAgain'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle changing event for a specific group in the path
  const handleChangeEvent = async (groupId: string, newEventId: string) => {
    if (!amendment || !amendmentPath || !enrichedPathData || enrichedPathData.length === 0 || !user) return;

    try {
      setIsSaving(true);

      const pathData = enrichedPathData;
      const segmentIndex = pathData.findIndex(s => s.groupId === groupId);

      if (segmentIndex === -1) {
        toast.error(t('features.amendments.process.groupNotFound'));
      }

      const segment = pathData[segmentIndex];

      // Remove old agenda item and vote if they exist
      if (segment.agendaItemId) {
        await deleteAgendaItemAction(segment.agendaItemId);
      }
      if (segment.amendmentVoteId) {
        await deleteVote(segment.amendmentVoteId);
      }

      // Fetch the new event to get its details - we'll get it from the existing query data
      // For now, create the agenda item without event title/date and rely on the query to refresh
      const newAgendaItemId = crypto.randomUUID();
      const newAmendmentVoteId = crypto.randomUUID();

      // Determine forwarding status
      const isTarget = groupId === amendment.group?.id;
      const forwardingStatus = isTarget
        ? 'forward_confirmed'
        : segmentIndex === 0
          ? 'forward_confirmed'
          : 'previous_decision_outstanding';

      await createAgendaItemAction({
        id: newAgendaItemId,
        title: `Amendment: ${amendment.title ?? ''}`,
        description: amendment.reason || '',
        type: 'vote',
        status: 'pending',
        order_index: 999,
        forwarding_status: forwardingStatus,
        duration: 0,
        scheduled_time: '',
        start_time: 0,
        end_time: 0,
        activated_at: 0,
        completed_at: 0,
        event_id: newEventId,
        amendment_id: amendmentId,
        majority_type: null,
        time_limit: null,
        voting_phase: null,
      });

      // Create vote record for the new agenda item (voting infrastructure)
      await createVote({
        id: newAmendmentVoteId,
        agenda_item_id: newAgendaItemId,
        amendment_id: amendmentId,
        title: `Amendment: ${amendment.title ?? ''}`,
        description: amendment.reason || null,
        closing_duration_seconds: null,
        closing_end_time: null,
      });

      // Note: Segment is updated through the entity system, no need to update pathData

      // If this is the target group, also update the amendment's targetEvent
      if (isTarget) {
        await updateAmendment({
          id: amendmentId,
          event_id: newEventId,
        });
      }

      toast.success(t('features.amendments.process.eventUpdatedSuccess'));
      setEventChangeDialog(null);
    } catch (error) {
      console.error('Error changing event:', error);
      toast.error(t('features.amendments.process.eventUpdateFailed'), {
        description: t('features.amendments.process.tryAgain'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-muted-foreground">{t('features.amendments.process.pleaseLogin')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-muted-foreground">{t('features.amendments.process.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Show current target if set, otherwise show prompt */}
      {hasTarget ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                {t('features.amendments.process.currentTarget')}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    // Remove currently associated agenda item if it exists
                    if (amendment?.agenda_items && amendment.agenda_items.length > 0) {
                      try {
                        // Delete amendment votes first
                        if (amendment.vote_entries && amendment.vote_entries.length > 0) {
                          for (const vote of amendment.vote_entries) {
                            await deleteVote(vote.id);
                          }
                        }
                        // Delete agenda items
                        for (const agendaItem of amendment.agenda_items) {
                          await deleteAgendaItemAction(agendaItem.id);
                        }
                      } catch (error) {
                        console.error('Error removing agenda items:', error);
                      }
                    }

                    // Pre-select the user from the existing path
                    setTargetCollaboratorUserId(user?.id || '');
                    setTargetSelectionDialog(true);
                  }}
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  {t('features.amendments.process.update')}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRemoveDialogOpen(true)}>
                  <X className="mr-2 h-3 w-3" />
                  {t('features.amendments.process.remove')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Path Overview - Timeline Style */}
            {amendmentPath && enrichedPathData && enrichedPathData.length > 0 && (
              <div className="space-y-4">
                <div className="text-muted-foreground text-xs font-semibold uppercase">
                  {t('features.amendments.process.amendmentPath')} ({enrichedPathData.length}{' '}
                  {t('common.groups')})
                </div>

                {/* Timeline */}
                <div className="relative pl-10">
                  {/* Vertical connector line */}
                  <div className="absolute top-0 bottom-0 left-[18px] w-px bg-border"></div>

                  {/* Timeline items */}
                  <div className="space-y-1">
                    {enrichedPathData.map((segment, index: number) => {
                      const isTarget = segment.groupId === amendment.group?.id;
                      const isNextEvent = segment.forwardingStatus === 'forward_confirmed';
                      const isPending =
                        segment.forwardingStatus === 'previous_decision_outstanding';
                      const isLast = index === enrichedPathData.length - 1;

                      return (
                        <div key={segment.groupId}>
                          {/* Group node */}
                          <div className="relative flex items-start gap-3 py-3">
                            {/* Timeline dot */}
                            <div
                              className={`absolute -left-10 top-3.5 z-10 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-2 ring-background ${
                                isNextEvent
                                  ? 'bg-primary shadow-sm shadow-primary/30'
                                  : isTarget
                                    ? 'bg-destructive shadow-sm shadow-destructive/30'
                                    : isPending
                                      ? 'bg-muted-foreground/40'
                                      : 'bg-primary/70'
                              }`}
                            >
                              <span className="text-[9px] font-bold text-primary-foreground">
                                {index + 1}
                              </span>
                            </div>

                            {/* Group card */}
                            <div
                              className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                                isNextEvent
                                  ? 'border-primary/40 bg-primary/5'
                                  : isTarget
                                    ? 'border-destructive/40 bg-destructive/5'
                                    : isPending
                                      ? 'border-border bg-muted/30 opacity-60'
                                      : 'border-border bg-card'
                              }`}
                            >
                              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${
                                isTarget ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                              }`}>
                                <Users className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-semibold">
                                    {segment.groupName}
                                  </span>
                                  {isNextEvent && (
                                    <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                                      {t('features.amendments.process.nextEvent')}
                                    </Badge>
                                  )}
                                  {isTarget && (
                                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                      {t('features.amendments.process.target')}
                                    </Badge>
                                  )}
                                  {isPending && (
                                    <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-muted-foreground">
                                      {t('features.amendments.process.awaitingPrevious')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Event sub-node (indented, connected to group) */}
                          <div className="relative ml-6 flex items-start gap-3 pb-2">
                            {/* Small connector dot */}
                            <div className="absolute -left-[33px] top-3 z-10 h-2 w-2 rounded-full bg-muted-foreground/30 ring-2 ring-background"></div>

                            {segment.eventId && segment.eventTitle ? (
                              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
                                {/* Date badge */}
                                {segment.eventStartDate ? (
                                  <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                    <span className="text-[10px] font-medium uppercase leading-none">
                                      {new Date(segment.eventStartDate).toLocaleDateString('en-US', { month: 'short' })}
                                    </span>
                                    <span className="text-sm font-bold leading-tight">
                                      {new Date(segment.eventStartDate).getDate()}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium">
                                    {segment.eventTitle}
                                  </span>
                                  {segment.eventStartDate && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(segment.eventStartDate).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  )}
                                </div>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground"
                                  onClick={() =>
                                    setEventChangeDialog({
                                      open: true,
                                      groupId: segment.groupId ?? '',
                                      groupName: segment.groupName,
                                      currentEventId: segment.eventId,
                                    })
                                  }
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2.5">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground/50" />
                                </div>
                                <span className="flex-1 text-sm italic text-muted-foreground">
                                  {t('features.amendments.process.noUpcomingEvent')}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground"
                                  onClick={() =>
                                    setEventChangeDialog({
                                      open: true,
                                      groupId: segment.groupId ?? '',
                                      groupName: segment.groupName,
                                      currentEventId: null,
                                    })
                                  }
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Arrow connector between nodes */}
                          {!isLast && (
                            <div className="relative flex justify-start py-0.5">
                              <div className="absolute -left-10 top-0 flex h-5 w-[18px] items-center justify-center">
                                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-4 flex items-center gap-2 border-t pt-4">
                  <Badge variant="secondary">
                    {enrichedPathData.filter(s => s.agendaItemId).length} {t('common.agendaItems')}
                  </Badge>
                  {enrichedPathData.filter(s => s.amendmentVoteId).length > 0 && (
                    <Badge variant="secondary">
                      {enrichedPathData.filter(s => s.amendmentVoteId).length} {t('common.votes')}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Target className="text-muted-foreground/50 mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">
              {t('features.amendments.process.noTargetSelected')}
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              {t('features.amendments.process.chooseTargetPrompt')}
            </p>
            <p className="text-muted-foreground text-xs">
              {t('features.amendments.process.clickGroupPrompt')}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>{t('features.amendments.process.amendmentNetwork')}</CardTitle>
              <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'path' | 'network')}>
                <TabsList>
                  <TabsTrigger value="network">
                    {t('features.amendments.process.availableTargets')}
                  </TabsTrigger>
                  <TabsTrigger value="path" disabled={!hasTarget}>
                    {t('features.amendments.process.targetPath')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* User Selection for Network View */}
            {activeTab === 'network' && (
              <div className="flex items-center gap-3">
                <User className="text-muted-foreground h-4 w-4" />
                <div className="flex-1">
                  <TypeaheadSearch
                    items={toTypeaheadItems(
                      allUsers,
                      'user',
                      u => `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || 'User',
                      u => u.email ?? undefined,
                      u => u.avatar
                    )}
                    value={selectedUserId}
                    onChange={(item: TypeaheadItem | null) => setSelectedUserId(item?.id ?? '')}
                    placeholder="Search users to view their network..."
                    label="View Network For:"
                  />
                </div>
                {selectedUserId && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedUserId('')}>
                    {'View My Network'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px]">
            {activeTab === 'network' ? (
              <UserNetworkFlow
                userId={displayUserId}
                filterRight="amendmentRight"
                onGroupClick={handleGroupClick}
              />
            ) : (
              <AmendmentPathVisualization
                enrichedPathData={enrichedPathData}
                groupTypeById={groupTypeById}
                onNodeClick={eventId => navigate({ to: `/event/${eventId}` })}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Entity Dialog (Groups, Events, and Relationships) */}
      <NetworkEntityDialog
        open={entityDialogOpen}
        onOpenChange={setEntityDialogOpen}
        entity={selectedEntity}
      />

      {/* Target Selection Dialog */}
      <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasTarget
                ? t('features.amendments.process.updateAmendmentTarget')
                : t('features.amendments.process.setAmendmentTarget')}
            </DialogTitle>
            <DialogDescription>
              {hasTarget
                ? t('features.amendments.process.updateTargetDescription')
                : t('features.amendments.process.setTargetDescription')}
            </DialogDescription>
          </DialogHeader>

          {pendingTarget && (
            <div className="space-y-4 py-4">
              {/* Group Card */}
              <div>
                <h4 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">
                  {t('features.amendments.process.targetGroup')}
                </h4>
                <GroupTimelineCard
                  group={{
                    id: pendingTarget.groupData.id,
                    name: pendingTarget.groupData.name ?? '',
                    description: pendingTarget.groupData.description ?? undefined,
                    memberCount: pendingTarget.groupData.member_count ?? 0,
                    eventCount: pendingTarget.groupData.event_count ?? 0,
                    amendmentCount: pendingTarget.groupData.amendment_count ?? 0,
                  }}
                />
              </div>

              {/* Event Card */}
              <div>
                <h4 className="text-muted-foreground mb-2 text-sm font-semibold uppercase">
                  {t('features.amendments.process.targetEvent')}
                </h4>
                <EventTimelineCard
                  event={{
                    id: pendingTarget.eventData.id,
                    title: pendingTarget.eventData.title ?? '',
                    description: pendingTarget.eventData.description ?? undefined,
                    startDate: pendingTarget.eventData.start_date
                      ? new Date(pendingTarget.eventData.start_date)
                      : new Date(),
                    location: pendingTarget.eventData.location_name ?? undefined,
                    attendeeCount: pendingTarget.eventData.participant_count ?? 0,
                  }}
                />
              </div>

              <div className="bg-muted text-muted-foreground rounded-md p-3 text-xs">
                <p className="font-semibold">{t('features.amendments.process.whatWillHappen')}</p>
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li>{t('features.amendments.process.agendaItemWillBeCreated')}</li>
                  <li>{t('features.amendments.process.voteWillBeCreated')}</li>
                  <li>{t('features.amendments.process.pathWillBeCalculated')}</li>
                  {hasTarget && (
                    <>
                      <li>{t('features.amendments.process.previousAgendaItemRemoved')}</li>
                      <li>{t('features.amendments.process.previousPathDeleted')}</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTargetDialogOpen(false)}>
              {t('features.amendments.process.cancel')}
            </Button>
            <Button onClick={handleConfirmTarget} disabled={isSaving}>
              {isSaving
                ? t('features.amendments.process.processing')
                : hasTarget
                  ? t('features.amendments.process.updateTarget')
                  : t('features.amendments.process.confirmTarget')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Target Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('features.amendments.process.removeAmendmentTarget')}</DialogTitle>
            <DialogDescription>
              {t('features.amendments.process.removeTargetConfirmation')}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-destructive/10 rounded-md p-3 text-sm">
            <p className="text-destructive font-semibold">
              {t('features.amendments.process.thisActionWill')}
            </p>
            <ul className="text-destructive/80 mt-1 ml-4 list-disc space-y-1">
              <li>{t('features.amendments.process.removeTargetGroupAndEvent')}</li>
              <li>{t('features.amendments.process.deleteAgendaItem')}</li>
              <li>{t('features.amendments.process.deleteVote')}</li>
              <li>{t('features.amendments.process.deletePath')}</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              {t('features.amendments.process.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleRemoveTarget} disabled={isSaving}>
              {isSaving
                ? t('features.amendments.process.removing')
                : t('features.amendments.process.removeTarget')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Event Dialog */}
      {eventChangeDialog && (
        <Dialog
          open={eventChangeDialog.open}
          onOpenChange={open => !open && setEventChangeDialog(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {t('features.amendments.process.changeEventFor', {
                  groupName: eventChangeDialog.groupName,
                })}
              </DialogTitle>
              <DialogDescription>
                {t('features.amendments.process.selectNewEvent')}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2 pr-4">
                {(() => {
                  const events = groupEventsData.events;
                  const upcomingEvents = events
                    .filter(e => new Date(e.start_date ?? 0) > new Date())
                    .sort(
                      (a, b) =>
                        new Date(a.start_date ?? 0).getTime() -
                        new Date(b.start_date ?? 0).getTime()
                    );

                  if (upcomingEvents.length === 0) {
                    return (
                      <p className="text-muted-foreground text-sm">
                        {t('features.amendments.process.noUpcomingEvents')}
                      </p>
                    );
                  }

                  return upcomingEvents.map((event) => {
                    const isCurrentEvent = event.id === eventChangeDialog?.currentEventId;

                    return (
                      <div
                        key={event.id}
                        className={`rounded-lg border-2 transition-all ${
                          isCurrentEvent
                            ? 'border-primary ring-primary/20 ring-2'
                            : 'hover:border-primary cursor-pointer hover:shadow-md'
                        }`}
                        onClick={() => {
                          if (!isCurrentEvent && !isSaving && eventChangeDialog) {
                            handleChangeEvent(eventChangeDialog.groupId, event.id);
                          }
                        }}
                      >
                        <EventTimelineCard
                          event={{
                            id: event.id,
                            title: event.title ?? '',
                            description: event.description ?? undefined,
                            startDate: event.start_date
                              ? new Date(event.start_date)
                              : new Date(),
                            location: event.location_name ?? undefined,
                            attendeeCount: event.participant_count ?? 0,
                          }}
                        />
                        {isCurrentEvent && (
                          <div className="px-4 pb-3">
                            <Badge variant="secondary">
                              {t('features.amendments.process.current')}
                            </Badge>
                          </div>
                        )}
                        {!isCurrentEvent && (
                          <div className="px-4 pb-3">
                            <Button
                              size="sm"
                              disabled={isSaving}
                              onClick={e => {
                                e.stopPropagation();
                                if (eventChangeDialog) {
                                  handleChangeEvent(eventChangeDialog.groupId, event.id);
                                }
                              }}
                            >
                              {isSaving
                                ? t('features.amendments.process.updating')
                                : t('features.amendments.process.select')}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEventChangeDialog(null)}>
                {t('features.amendments.process.cancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Target Selection Dialog - Connected Groups & Events */}
      <Dialog open={targetSelectionDialog} onOpenChange={setTargetSelectionDialog}>
        <DialogContent className="flex h-[85vh] max-w-4xl flex-col">
          <DialogHeader>
            <DialogTitle>{t('features.amendments.process.selectTargetGroupAndEvent')}</DialogTitle>
            <DialogDescription>
              {t('features.amendments.process.selectCollaboratorDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <TargetGroupEventSelector
              userId={user?.id ?? ''}
              disablePortal
              collaborators={allUsers.map(u => ({
                id: u.id,
                name: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || 'User',
                email: u.email ?? undefined,
                avatar: u.avatar ?? undefined,
              }))}
              onSelect={({ groupId, groupData, eventId, eventData, pathWithEvents, selectedUserId: selUserId, pathMode, workflowId }) => {
                setPendingTarget({
                  groupId,
                  groupData: {
                    id: groupData.id,
                    name: groupData.name ?? null,
                    description: groupData.description ?? null,
                    member_count: groupData.member_count ?? null,
                    event_count: groupData.event_count ?? null,
                    amendment_count: groupData.amendment_count ?? null,
                  },
                  eventId,
                  eventData: {
                    id: eventId,
                    title: eventData.title ?? null,
                    description: eventData.description ?? null,
                    is_public: eventData.is_public,
                    start_date: eventData.start_date ?? null,
                    location_name: eventData.location_name ?? null,
                    participant_count: eventData.participant_count ?? null,
                  },
                  pathWithEvents,
                  pathMode,
                  workflowId,
                });
                setTargetCollaboratorUserId(selUserId);
              }}
            />
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setTargetSelectionDialog(false);
                setPendingTarget(null);
              }}
            >
              {t('features.amendments.process.cancel')}
            </Button>
            {pendingTarget && (
              <Button
                onClick={() => {
                  setTargetSelectionDialog(false);
                  setTargetDialogOpen(true);
                }}
              >
                {t('features.amendments.process.confirmSelection')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
