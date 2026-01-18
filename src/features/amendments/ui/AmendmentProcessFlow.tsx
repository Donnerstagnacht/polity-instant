'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserNetworkFlow } from '@/features/user/ui/UserNetworkFlow';
import { NetworkEntityDialog } from '@/components/shared/NetworkEntityDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import db, { tx, id } from '../../../../db/db';
import { useAuthStore } from '@/features/auth';
import { toast } from 'sonner';
import { findShortestPath } from '@/utils/path-finding';
import { NetworkFlowBase } from '@/components/shared/NetworkFlowBase';
import { CalendarIcon, Target, X, RefreshCw, User } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import { useTranslation } from '@/hooks/use-translation';

interface AmendmentProcessFlowProps {
  amendmentId: string;
}

export function AmendmentProcessFlow({ amendmentId }: AmendmentProcessFlowProps) {
  const { t } = useTranslation();
  const user = useAuthStore((state: any) => state.user);
  const router = useRouter();
  const [entityDialogOpen, setEntityDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'group' | 'event' | 'relationship' | 'user';
    data: any;
  } | null>(null);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<{
    groupId: string;
    groupData: any;
    eventId: string;
    eventData: any;
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
  const [selectedTargetGroup, setSelectedTargetGroup] = useState<{
    id: string;
    data: any;
  } | null>(null);
  const [targetCollaboratorUserId, setTargetCollaboratorUserId] = useState<string>('');

  // Query events for the group in the event change dialog
  const { data: groupEventsData } = db.useQuery(
    eventChangeDialog?.groupId
      ? {
          events: {
            $: {
              where: {
                'group.id': eventChangeDialog.groupId,
              },
            },
            group: {},
          },
        }
      : { events: {} }
  );

  // Query events for selected target group in the new dialog
  const { data: targetGroupEventsData } = db.useQuery(
    selectedTargetGroup?.id
      ? {
          events: {
            $: {
              where: {
                'group.id': selectedTargetGroup.id,
              },
            },
            group: {},
          },
        }
      : { events: {} }
  );

  // Fetch amendment data with target and path (now with segments!)
  const { data: amendmentData, isLoading } = db.useQuery({
    amendments: {
      $: { where: { id: amendmentId } },
      targetGroup: {},
      targetEvent: {},
      agendaItems: {
        amendmentVote: {},
      },
      path: {
        user: {}, // Include the user whose network was used for the path
        segments: {
          group: {},
          event: {},
          agendaItem: {
            amendmentVote: {},
          },
          amendmentVote: {},
        },
      },
    },
  } as any);

  // Fetch all groups and relationships for path finding
  const { data: networkData } = db.useQuery({
    groups: {},
    groupRelationships: {
      parentGroup: {},
      childGroup: {},
    },
    groupMemberships: {
      group: {},
      user: {},
    },
    events: {
      group: {},
    },
  } as any);

  // Fetch collaborators for this specific amendment
  const { data: collaboratorsData } = db.useQuery({
    amendmentCollaborators: {
      $: { where: { 'amendment.id': amendmentId } },
      user: {},
    },
  } as any);

  const allUsers =
    (collaboratorsData as any)?.amendmentCollaborators
      ?.map((collab: any) => collab.user)
      .filter((user: any) => user?.id) || [];

  const amendment = (amendmentData as any)?.amendments?.[0];

  // Default to the user stored on the path, or fallback to current user
  const pathUserId = amendment?.path?.user?.id;
  const displayUserId = selectedUserId || pathUserId || user?.id || '';

  // Check if targetGroup/targetEvent exist (they should be objects with at least an id)
  const hasTarget = Boolean(amendment?.targetGroup?.id && amendment?.targetEvent?.id);

  // Use path segments directly and sort them by order field
  const pathSegments = (amendment?.path?.segments || []).sort(
    (a: any, b: any) => a.order - b.order
  );

  // Create enrichedPathData from segments for backward compatibility
  const enrichedPathData = pathSegments.map((segment: any) => ({
    groupId: segment.group?.id,
    groupName: segment.group?.name || 'Unknown Group',
    eventId: segment.event?.id || null,
    eventTitle: segment.event?.title || 'No Event',
    eventStartDate: segment.event?.startDate || null,
    agendaItemId: segment.agendaItem?.id || null,
    amendmentVoteId: segment.amendmentVote?.id || null,
    forwardingStatus: segment.forwardingStatus,
    order: segment.order,
  }));

  // Set default tab based on whether target exists
  useEffect(() => {
    if (hasTarget) {
      setActiveTab('path');
    } else {
      setActiveTab('network');
    }
  }, [hasTarget]);

  // Handle group click from network
  const handleGroupClick = useCallback((groupId: string, groupData: any) => {
    // Set entity with custom event selection handler
    setSelectedEntity({
      type: 'group',
      data: {
        ...groupData,
        onEventSelect: (eventId: string, eventData: any) => {
          // When an event is selected from the dialog, set it as pending target
          setPendingTarget({
            groupId: groupData.id,
            groupData: groupData,
            eventId,
            eventData,
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
    const userMemberships =
      (networkData as any)?.groupMemberships?.filter(
        (m: any) => (m.status === 'member' || m.status === 'admin') && m.user?.id === selectedUserId
      ) || [];

    const userGroupIds = userMemberships.map((m: any) => m.group.id);
    const allGroups = (networkData as any)?.groups || [];
    const relationships = (networkData as any)?.groupRelationships || [];
    const events = (networkData as any)?.events || [];

    // Filter for amendmentRight relationships
    const amendmentRelationships = relationships.filter(
      (r: any) => r.withRight === 'amendmentRight'
    );

    // Build groups map
    const groupsMap = new Map();
    allGroups.forEach((g: any) => {
      groupsMap.set(g.id, {
        id: g.id,
        name: g.name,
        description: g.description,
      });
    });

    // Find shortest path
    const path = findShortestPath(userGroupIds, targetGroupId, amendmentRelationships, groupsMap);

    if (!path) return null;

    // For each group in path, find the closest upcoming event
    const now = new Date();
    const pathWithEvents = path.map((segment: any) => {
      const groupId = segment.group.id;
      const groupName = segment.group.name;

      // Find all upcoming events for this group
      const groupEvents = events.filter(
        (e: any) => e.group?.id === groupId && new Date(e.startDate) > now
      );

      // Sort by start date and pick the closest one
      groupEvents.sort(
        (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      const closestEvent = groupEvents[0];

      return {
        groupId,
        groupName,
        eventId: closestEvent?.id || null,
        eventTitle: closestEvent?.title || 'No upcoming event',
        eventStartDate: closestEvent?.startDate || null,
      };
    });

    return pathWithEvents;
  };

  // Handle target confirmation (new or update)
  const handleConfirmTarget = async () => {
    if (!pendingTarget || !user) return;

    const { groupId, groupData, eventId, eventData } = pendingTarget;

    setIsSaving(true);
    try {
      const transactions: any[] = [];

      // If there's an existing target, remove old agenda items, votes, path segments, and path
      if (hasTarget && amendment.path?.id) {
        // Delete all path segments first
        if (pathSegments && pathSegments.length > 0) {
          for (const segment of pathSegments) {
            // Delete the segment itself
            if (segment.id) {
              transactions.push(tx.amendmentPathSegments[segment.id].delete());
            }
            // Delete agenda item if it exists
            if (segment.agendaItem?.id) {
              // First delete the vote if it exists
              if (segment.amendmentVote?.id) {
                transactions.push(tx.amendmentVotes[segment.amendmentVote.id].delete());
              }
              // Then delete the agenda item
              transactions.push(tx.agendaItems[segment.agendaItem.id].delete());
            }
          }
        }
        // Delete the path itself
        transactions.push(tx.amendmentPaths[amendment.path.id].delete());
      }

      // Calculate shortest path with events
      const pathWithEvents = calculatePathWithEvents(groupId);

      if (!pathWithEvents || pathWithEvents.length === 0) {
        toast.error(t('features.amendments.process.noValidPath'));
        setIsSaving(false);
        return;
      }

      // Override the last segment's event with the user-selected event
      const lastSegment = pathWithEvents[pathWithEvents.length - 1];
      if (lastSegment && lastSegment.groupId === groupId) {
        lastSegment.eventId = eventId;
        lastSegment.eventTitle = eventData.title;
        lastSegment.eventStartDate = eventData.startDate;
      }

      // Find the closest event (earliest start date) in the path
      const eventsWithDates = pathWithEvents.filter(seg => seg.eventStartDate);
      eventsWithDates.sort((a, b) => {
        const dateA = a.eventStartDate ? new Date(a.eventStartDate).getTime() : 0;
        const dateB = b.eventStartDate ? new Date(b.eventStartDate).getTime() : 0;
        return dateA - dateB;
      });
      const closestEventId = eventsWithDates.length > 0 ? eventsWithDates[0].eventId : null;

      // Create agenda items and votes for each event in the path
      const enrichedPath = [];

      for (const segment of pathWithEvents) {
        let agendaItemId = null;
        let amendmentVoteId = null;
        let forwardingStatus = 'previous_decision_outstanding';

        // Only create agenda item if the segment has an event
        if (segment.eventId) {
          agendaItemId = id();
          amendmentVoteId = id();

          // Determine forwarding status
          // The closest (earliest) event gets 'forward_confirmed'
          // All others get 'previous_decision_outstanding'
          if (segment.eventId === closestEventId) {
            forwardingStatus = 'forward_confirmed';
          }

          // Create agenda item
          transactions.push(
            tx.agendaItems[agendaItemId]
              .update({
                title: `Amendment: ${amendment.title}`,
                description: amendment.subtitle || '',
                type: 'amendment',
                status: 'pending',
                forwardingStatus: forwardingStatus,
                order: 999,
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .link({
                event: segment.eventId,
                creator: user.id,
                amendment: amendmentId,
              })
          );

          // Create amendment vote for the agenda item
          transactions.push(
            tx.amendmentVotes[amendmentVoteId]
              .update({
                title: amendment.title,
                description: amendment.subtitle || '',
                proposedText: amendment.title,
                originalText: '',
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .link({
                agendaItem: agendaItemId,
                creator: user.id,
              })
          );
        }

        // Add to enriched path with IDs
        enrichedPath.push({
          ...segment,
          agendaItemId,
          amendmentVoteId,
          forwardingStatus,
        });
      }

      // Create path record
      const pathUserId = targetCollaboratorUserId || user.id;
      const pathId = id();
      transactions.push(
        tx.amendmentPaths[pathId]
          .update({
            pathLength: enrichedPath.length,
            createdAt: new Date(),
          })
          .link({
            amendment: amendmentId,
            user: pathUserId,
          })
      );

      // Create path segments
      enrichedPath.forEach((segment, index) => {
        const segmentId = id();
        const segmentLinks: any = {
          path: pathId,
          group: segment.groupId,
        };

        // Add optional links if they exist
        if (segment.eventId) segmentLinks.event = segment.eventId;
        if (segment.agendaItemId) segmentLinks.agendaItem = segment.agendaItemId;
        if (segment.amendmentVoteId) segmentLinks.amendmentVote = segment.amendmentVoteId;

        transactions.push(
          tx.amendmentPathSegments[segmentId]
            .update({
              order: index,
              forwardingStatus: segment.forwardingStatus,
              createdAt: new Date(),
            })
            .link(segmentLinks)
        );
      });

      // Update amendment with target group and event
      transactions.push(
        tx.amendments[amendmentId]
          .update({
            updatedAt: new Date(),
          })
          .link({
            targetGroup: groupId,
            targetEvent: eventId,
          })
      );

      await db.transact(transactions);

      toast.success(hasTarget ? t('features.amendments.process.targetUpdatedSuccess') : t('features.amendments.process.targetSetSuccess'), {
        description: t('features.amendments.process.pathDescription', { groupName: groupData.name, count: enrichedPath.length }),
      });

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
      const transactions: any[] = [];

      // Remove all agenda items and votes from the path
      if (enrichedPathData && enrichedPathData.length > 0) {
        for (const segment of enrichedPathData) {
          if (segment.agendaItemId) {
            // First delete the vote if it exists
            if (segment.amendmentVoteId) {
              transactions.push(tx.amendmentVotes[segment.amendmentVoteId].delete());
            }
            // Then delete the agenda item
            transactions.push(tx.agendaItems[segment.agendaItemId].delete());
          }
        }
      }

      // Remove path
      if (amendment.path) {
        transactions.push(tx.amendmentPaths[amendment.path.id].delete());
      }

      // Update amendment to remove target
      transactions.push(
        tx.amendments[amendmentId].update({
          updatedAt: new Date(),
        })
      );

      await db.transact(transactions);

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
    if (!amendment || !amendment.path || !enrichedPathData || enrichedPathData.length === 0) return;

    try {
      setIsSaving(true);

      const pathData = enrichedPathData;
      const segmentIndex = pathData.findIndex((s: any) => s.groupId === groupId);

      if (segmentIndex === -1) {
      toast.error(t('features.amendments.process.groupNotFound'));
      }

      const segment = pathData[segmentIndex];
      const transactions = [];

      // Remove old agenda item and vote if they exist
      if (segment.agendaItemId) {
        transactions.push(tx.agendaItems[segment.agendaItemId].delete());
      }
      if (segment.amendmentVoteId) {
        transactions.push(tx.amendmentVotes[segment.amendmentVoteId].delete());
      }

      // Fetch the new event to get its details - we'll get it from the existing query data
      // For now, create the agenda item without event title/date and rely on the query to refresh
      const newAgendaItemId = id();
      const newAmendmentVoteId = id();

      // Determine forwarding status
      const isTarget = groupId === amendment.targetGroup.id;
      const forwardingStatus = isTarget
        ? 'forward_confirmed'
        : segmentIndex === 0
          ? 'forward_confirmed'
          : 'previous_decision_outstanding';

      transactions.push(
        tx.agendaItems[newAgendaItemId]
          .update({
            title: `Amendment: ${amendment.title}`,
            description: amendment.subtitle || '',
            type: 'vote',
            status: 'pending',
            order: 999,
            forwardingStatus: forwardingStatus,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          .link({
            event: newEventId,
            amendment: amendmentId,
            creator: user.id,
          })
      );

      transactions.push(
        tx.amendmentVotes[newAmendmentVoteId]
          .update({
            title: `Vote on: ${amendment.title}`,
            description: amendment.subtitle || '',
            proposedText: amendment.title,
            status: 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          .link({
            agendaItem: newAgendaItemId,
          })
      );

      // Note: Segment is updated through the entity system, no need to update pathData

      // If this is the target group, also update the amendment's targetEvent
      if (isTarget) {
        transactions.push(
          tx.amendments[amendmentId]
            .update({ updatedAt: Date.now() })
            .link({ targetEvent: newEventId })
        );
      }

      await db.transact(transactions);

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

  // Handle node click in path visualization
  const handlePathNodeClick = useCallback(
    (event: any, node: any) => {
      // Only handle clicks on the target node with an event
      if (node.data.eventId) {
        router.push(`/event/${node.data.eventId}`);
      }
    },
    [router]
  );

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

  // Render path visualization
  const renderPathVisualization = () => {
    if (!enrichedPathData || enrichedPathData.length === 0) {
      return null;
    }

    const pathData = enrichedPathData;

    // Get the user from the path, or fallback to current user
    const pathUser = amendment?.path?.user || user;

    // Start with user node
    const nodes = [
      // User node (start)
      {
        id: 'path-user-node',
        type: 'default',
        position: { x: 100, y: 200 },
        data: {
          label: pathUser?.name || 'You',
          description: 'Starting point',
          type: 'user',
        },
        style: {
          background: '#e3f2fd',
          color: '#333',
          border: '3px solid #2196f3',
          borderRadius: '50%',
          padding: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        },
      },
      // Path nodes (groups with events)
      ...pathData.map((segment: any, index: number) => {
        const isTargetNode = index === pathData.length - 1;
        const isForwardConfirmed = segment.forwardingStatus === 'forward_confirmed';

        // Determine node background color based on status
        let backgroundColor = '#c8e6c9'; // Default green
        let borderColor = '#a5d6a7';

        if (isTargetNode) {
          backgroundColor = '#ffcdd2'; // Target node in red
          borderColor = '#ef9a9a';
        } else if (isForwardConfirmed) {
          backgroundColor = '#b3e5fc'; // Forward confirmed in cyan
          borderColor = '#81d4fa';
        }

        return {
          id: `path-node-${index}`,
          type: 'default',
          position: { x: 350 + index * 280, y: 200 },
          data: {
            label: (
              <div>
                {/* Group Name */}
                <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>
                  {segment.groupName}
                </div>

                {/* Event Information */}
                {segment.eventId ? (
                  <div
                    style={{
                      fontSize: '11px',
                      marginTop: '8px',
                      padding: '8px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    className="hover:border-blue-200 hover:bg-white hover:shadow-md"
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '4px',
                      }}
                    >
                      <CalendarIcon style={{ width: '12px', height: '12px', color: '#1976d2' }} />
                      <span style={{ fontWeight: '600', color: '#555' }}>
                        {isTargetNode ? 'Target Event' : 'Event'}
                      </span>
                    </div>
                    <div
                      style={{
                        color: '#1976d2',
                        fontWeight: '500',
                        textDecoration: 'underline',
                        lineHeight: '1.3',
                      }}
                    >
                      {segment.eventTitle}
                    </div>
                    {segment.eventStartDate && (
                      <div
                        style={{
                          marginTop: '4px',
                          fontSize: '10px',
                          color: '#666',
                        }}
                      >
                        {new Date(segment.eventStartDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: '10px',
                      marginTop: '8px',
                      padding: '6px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '4px',
                      color: '#999',
                      fontStyle: 'italic',
                    }}
                  >
                    No upcoming event
                  </div>
                )}

                {/* Forwarding Status Badge */}
                {isForwardConfirmed && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '3px 6px',
                      background: '#4caf50',
                      color: 'white',
                      borderRadius: '3px',
                      fontSize: '9px',
                      fontWeight: '600',
                      textAlign: 'center',
                      textTransform: 'uppercase',
                    }}
                  >
                    ✓ Ready
                  </div>
                )}
              </div>
            ),
            event: segment.eventTitle,
            type: 'group',
            eventId: segment.eventId,
          },
          style: {
            background: backgroundColor,
            color: '#333',
            border: `2px solid ${borderColor}`,
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12px',
            fontWeight: '500',
            width: 220,
            minHeight: '120px',
            textAlign: 'center',
            cursor: segment.eventId ? 'pointer' : 'default',
            boxShadow: isForwardConfirmed ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
          },
        };
      }),
    ];

    const edges = [
      // Edge from user to first group
      {
        id: 'path-edge-user',
        source: 'path-user-node',
        target: 'path-node-0',
        type: 'smoothstep',
        animated: true,
        label: 'Member',
        style: { stroke: '#2196f3', strokeWidth: 2 },
        labelStyle: {
          fill: '#1976d2',
          fontWeight: 600,
          fontSize: '11px',
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.9,
        },
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: 'ArrowClosed',
          color: '#2196f3',
        },
      },
      // Edges between groups
      ...pathData.slice(0, -1).map((segment: any, index: number) => ({
        id: `path-edge-${index}`,
        source: `path-node-${index}`,
        target: `path-node-${index + 1}`,
        type: 'smoothstep',
        animated: true,
        label: 'amendmentRight',
        style: { stroke: '#66bb6a', strokeWidth: 2 },
        labelStyle: {
          fill: '#2e7d32',
          fontWeight: 600,
          fontSize: '11px',
        },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.9,
        },
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: 'ArrowClosed',
          color: '#66bb6a',
        },
      })),
    ];

    return { nodes, edges };
  };

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
                    if (amendment?.agendaItems && amendment.agendaItems.length > 0) {
                      try {
                        const transactions: any[] = [];

                        for (const agendaItem of amendment.agendaItems) {
                          // Delete the amendment vote if it exists
                          if (agendaItem.amendmentVote?.id) {
                            transactions.push(
                              tx.amendmentVotes[agendaItem.amendmentVote.id].delete()
                            );
                          }
                          // Delete the agenda item
                          transactions.push(tx.agendaItems[agendaItem.id].delete());
                        }

                        if (transactions.length > 0) {
                          await db.transact(transactions);
                        }
                      } catch (error) {
                        console.error('Error removing agenda items:', error);
                      }
                    }

                    // Pre-select the user from the existing path
                    setTargetCollaboratorUserId(amendment?.path?.user?.id || '');
                    setTargetSelectionDialog(true);
                    setSelectedTargetGroup(null);
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
            {amendment.path && enrichedPathData && enrichedPathData.length > 0 && (
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  {t('features.amendments.process.amendmentPath')} ({enrichedPathData.length} {t('common.groups')})
                </div>

                {/* Timeline */}
                <div className="relative pl-8">
                  {/* Vertical line */}
                  <div className="absolute bottom-0 left-3 top-0 w-0.5 bg-gradient-to-b from-cyan-500 via-green-500 to-red-500"></div>

                  {/* Timeline items */}
                  <div className="space-y-6">
                    {enrichedPathData.map((segment: any, index: number) => {
                      const isTarget = segment.groupId === amendment.targetGroup.id;
                      const isNextEvent = segment.forwardingStatus === 'forward_confirmed';
                      const isPending =
                        segment.forwardingStatus === 'previous_decision_outstanding';

                      return (
                        <div key={segment.groupId} className="relative">
                          {/* Timeline dot */}
                          <div
                            className={`absolute -left-[22px] top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              isNextEvent
                                ? 'border-cyan-600 bg-cyan-500 shadow-lg shadow-cyan-500/50'
                                : isTarget
                                  ? 'border-red-600 bg-red-500 shadow-lg shadow-red-500/50'
                                  : isPending
                                    ? 'border-yellow-400 bg-yellow-100'
                                    : 'border-green-600 bg-green-500'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-white">{index + 1}</span>
                          </div>

                          {/* Content */}
                          <div
                            className={`rounded-lg border-2 p-4 transition-all ${
                              isNextEvent
                                ? 'border-cyan-500 bg-cyan-50 shadow-md dark:bg-cyan-950/20'
                                : isTarget
                                  ? 'border-red-300 bg-red-50 shadow-md dark:bg-red-950/20'
                                  : isPending
                                    ? 'border-yellow-300 bg-yellow-50/50 opacity-75 dark:bg-yellow-950/10'
                                    : 'border-border bg-muted/30'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                {/* Group name */}
                                <div className="mb-2 flex items-center gap-2">
                                  <h4 className="text-base font-semibold">{segment.groupName}</h4>
                                  {isNextEvent && (
                                    <Badge className="bg-cyan-500 text-xs hover:bg-cyan-600">
                                      {t('features.amendments.process.nextEvent')}
                                    </Badge>
                                  )}
                                  {isTarget && (
                                    <Badge className="bg-red-500 text-xs hover:bg-red-600">
                                      {t('features.amendments.process.target')}
                                    </Badge>
                                  )}
                                  {isPending && (
                                    <Badge
                                      variant="outline"
                                      className="border-yellow-600 text-xs text-yellow-700"
                                    >
                                      {t('features.amendments.process.awaitingPrevious')}
                                    </Badge>
                                  )}
                                </div>

                                {/* Event mapping - Arrow style */}
                                {segment.eventId && segment.eventTitle ? (
                                  <div className="mt-3 flex items-center gap-2 rounded-md border border-gray-200 bg-white/60 p-3 dark:border-gray-700 dark:bg-black/20">
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                      <div className="text-2xl">→</div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <CalendarIcon className="h-4 w-4 flex-shrink-0 text-blue-600" />
                                          <span className="truncate text-sm font-medium">
                                            {segment.eventTitle}
                                          </span>
                                        </div>
                                        {segment.eventStartDate && (
                                          <div className="ml-6 mt-1 text-xs text-muted-foreground">
                                            {new Date(segment.eventStartDate).toLocaleDateString(
                                              'en-US',
                                              {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                              }
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setEventChangeDialog({
                                          open: true,
                                          groupId: segment.groupId,
                                          groupName: segment.groupName,
                                          currentEventId: segment.eventId,
                                        })
                                      }
                                      className="flex-shrink-0"
                                    >
                                      <RefreshCw className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-100 p-3 dark:border-gray-700 dark:bg-gray-900">
                                    <div className="text-2xl opacity-50">→</div>
                                    <div className="flex-1">
                                      <span className="text-sm italic text-muted-foreground">
                                        {t('features.amendments.process.noUpcomingEvent')}
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setEventChangeDialog({
                                          open: true,
                                          groupId: segment.groupId,
                                          groupName: segment.groupName,
                                          currentEventId: null,
                                        })
                                      }
                                      className="flex-shrink-0"
                                    >
                                      <RefreshCw className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-4 flex items-center gap-2 border-t pt-4">
                  <Badge variant="secondary">
                    {enrichedPathData.filter((s: any) => s.agendaItemId).length} {t('common.agendaItems')}
                  </Badge>
                  {enrichedPathData.filter((s: any) => s.amendmentVoteId).length > 0 && (
                    <Badge variant="secondary">
                      {enrichedPathData.filter((s: any) => s.amendmentVoteId).length} {t('common.votes')}
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
            <Target className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">{t('features.amendments.process.noTargetSelected')}</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {t('features.amendments.process.chooseTargetPrompt')}
            </p>
            <p className="text-xs text-muted-foreground">
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
                  <TabsTrigger value="network">{t('features.amendments.process.availableTargets')}</TabsTrigger>
                  <TabsTrigger value="path" disabled={!hasTarget}>
                    {t('features.amendments.process.targetPath')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* User Selection for Network View */}
            {activeTab === 'network' && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <TypeAheadSelect
                    items={allUsers}
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    placeholder="Search users to view their network..."
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
                    label="View Network For:"
                  />
                </div>
                {selectedUserId && selectedUserId !== pathUserId && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedUserId('')}>
                    {pathUserId ? 'View Path User Network' : 'View My Network'}
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
              <>
                {(() => {
                  const pathViz = renderPathVisualization();
                  if (!pathViz) {
                    return (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">{t('features.amendments.process.noPathAvailable')}</p>
                      </div>
                    );
                  }
                  return (
                    <NetworkFlowBase
                      nodes={pathViz.nodes}
                      edges={pathViz.edges}
                      panel={<div />}
                      onNodeClick={handlePathNodeClick}
                    />
                  );
                })()}
              </>
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
              {hasTarget ? t('features.amendments.process.updateAmendmentTarget') : t('features.amendments.process.setAmendmentTarget')}
            </DialogTitle>
            <DialogDescription>
              {hasTarget
                ? t('features.amendments.process.updateTargetDescription')
                : t('features.amendments.process.setTargetDescription')}
            </DialogDescription>
          </DialogHeader>

          {pendingTarget && (
            <div className="space-y-4 py-4">
              {/* Group Card (matching GroupsCard design) */}
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
                  {t('features.amendments.process.targetGroup')}
                </h4>
                <Card className="overflow-hidden border-2 bg-gradient-to-br from-blue-100 to-purple-100 transition-all duration-300 dark:from-blue-900/40 dark:to-purple-900/50">
                  <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {pendingTarget.groupData.abbr && (
                          <Badge variant="secondary" className="mb-2 w-fit font-semibold">
                            {pendingTarget.groupData.abbr}
                          </Badge>
                        )}
                        <CardTitle className="line-clamp-1 text-xl">
                          {pendingTarget.groupData.name}
                        </CardTitle>
                        {pendingTarget.groupData.description && (
                          <CardDescription className="mt-1.5 line-clamp-2">
                            {pendingTarget.groupData.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex flex-wrap gap-3 border-t border-border/50 pt-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {pendingTarget.groupData.memberCount || 0} {t('features.amendments.process.members')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Event Card (matching GroupEventsList design) */}
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
                  {t('features.amendments.process.targetEvent')}
                </h4>
                <div className="rounded-lg border-2 bg-gradient-to-br from-green-100 to-blue-100 p-4 dark:from-green-900/40 dark:to-blue-900/50">
                  {/* Header with title and badges */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h4 className="flex-1 text-lg font-semibold leading-tight">
                      {pendingTarget.eventData.title}
                    </h4>
                    <div className="flex gap-1">
                      {pendingTarget.eventData.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          {t('features.amendments.process.public')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Event details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {/* Date and time */}
                    {pendingTarget.eventData.startDate && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>
                            {new Date(pendingTarget.eventData.startDate).toLocaleDateString(
                              'en-US',
                              {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>
                            {new Date(pendingTarget.eventData.startDate).toLocaleTimeString(
                              'en-US',
                              {
                                hour: 'numeric',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {pendingTarget.eventData.location && (
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5" />
                        <span className="truncate">{pendingTarget.eventData.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {pendingTarget.eventData.description && (
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {pendingTarget.eventData.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <p className="font-semibold">{t('features.amendments.process.whatWillHappen')}</p>
                <ul className="ml-4 mt-1 list-disc space-y-1">
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
              {isSaving ? t('features.amendments.process.processing') : hasTarget ? t('features.amendments.process.updateTarget') : t('features.amendments.process.confirmTarget')}
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

          <div className="rounded-md bg-destructive/10 p-3 text-sm">
            <p className="font-semibold text-destructive">{t('features.amendments.process.thisActionWill')}</p>
            <ul className="ml-4 mt-1 list-disc space-y-1 text-destructive/80">
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
              {isSaving ? t('features.amendments.process.removing') : t('features.amendments.process.removeTarget')}
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
              <DialogTitle>{t('features.amendments.process.changeEventFor', { groupName: eventChangeDialog.groupName })}</DialogTitle>
              <DialogDescription>
                {t('features.amendments.process.selectNewEvent')}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2 pr-4">
                {(() => {
                  const events = (groupEventsData as any)?.events || [];
                  const upcomingEvents = events
                    .filter((e: any) => new Date(e.startDate) > new Date())
                    .sort(
                      (a: any, b: any) =>
                        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                    );

                  if (upcomingEvents.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        {t('features.amendments.process.noUpcomingEvents')}
                      </p>
                    );
                  }

                  // Gradient classes for events (matching GroupEventsList style)
                  const gradients = [
                    'bg-gradient-to-br from-pink-100 to-blue-100 dark:from-pink-900/40 dark:to-blue-900/50',
                    'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/50',
                    'bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/40 dark:to-blue-900/50',
                    'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/50',
                    'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50',
                    'bg-gradient-to-br from-red-100 to-yellow-100 dark:from-red-900/40 dark:to-yellow-900/50',
                    'bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/40 dark:to-green-900/50',
                  ];

                  return upcomingEvents.map((event: any, index: number) => {
                    const gradientClass = gradients[index % gradients.length];
                    const isCurrentEvent = event.id === eventChangeDialog?.currentEventId;

                    return (
                      <div
                        key={event.id}
                        className={`group rounded-lg border p-4 transition-all ${gradientClass} ${
                          isCurrentEvent
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'cursor-pointer hover:border-primary hover:shadow-md'
                        }`}
                        onClick={() => {
                          if (!isCurrentEvent && !isSaving && eventChangeDialog) {
                            handleChangeEvent(eventChangeDialog.groupId, event.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold group-hover:text-primary">
                                {event.title}
                              </h4>
                              {isCurrentEvent && <Badge variant="secondary">{t('features.amendments.process.current')}</Badge>}
                            </div>
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
                          {!isCurrentEvent && (
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
                              {isSaving ? t('features.amendments.process.updating') : t('features.amendments.process.select')}
                            </Button>
                          )}
                        </div>
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

          <div className="border-b px-6 py-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <TypeAheadSelect
                  items={allUsers}
                  value={targetCollaboratorUserId}
                  onChange={setTargetCollaboratorUserId}
                  placeholder={t('features.amendments.process.selectCollaboratorPlaceholder')}
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
                  label={t('features.amendments.process.selectNetworkFor')}
                />
              </div>
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1 pr-4">
            <div className="space-y-2 pb-20">
              {(() => {
                const targetUserId = targetCollaboratorUserId || user?.id;

                if (!targetUserId || !networkData) {
                  return (
                    <p className="px-6 text-sm text-muted-foreground">
                      {!targetCollaboratorUserId
                        ? t('features.amendments.process.selectCollaboratorPrompt')
                        : t('features.amendments.process.loadingGroups')}
                    </p>
                  );
                }

                const userMemberships =
                  (networkData as any)?.groupMemberships?.filter(
                    (m: any) =>
                      (m.status === 'member' || m.status === 'admin') && m.user?.id === targetUserId
                  ) || [];

                const userGroupIds = userMemberships.map((m: any) => m.group.id);
                const allGroups = (networkData as any)?.groups || [];
                const relationships = (networkData as any)?.groupRelationships || [];

                // Filter for amendmentRight relationships
                const amendmentRelationships = relationships.filter(
                  (r: any) => r.withRight === 'amendmentRight'
                );

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

                if (connectedGroups.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground">
                      {t('features.amendments.process.noConnectedGroups')}
                    </p>
                  );
                }

                // Gradient classes for groups
                const gradients = [
                  'bg-gradient-to-br from-pink-100 to-blue-100 dark:from-pink-900/40 dark:to-blue-900/50',
                  'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/50',
                  'bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/40 dark:to-blue-900/50',
                  'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/50',
                  'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50',
                  'bg-gradient-to-br from-red-100 to-yellow-100 dark:from-red-900/40 dark:to-yellow-900/50',
                  'bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/40 dark:to-green-900/50',
                ];

                return connectedGroups.map((group: any, index: number) => {
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
                        onClick={() => setSelectedTargetGroup({ id: group.id, data: group })}
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
                                  {t('features.amendments.process.member')}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {group.memberCount || 0} {t('features.amendments.process.members')}
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
                                  {t('features.amendments.process.noUpcomingEvents')}
                                </p>
                              );
                            }

                            const eventGradients = [
                              'bg-gradient-to-br from-pink-100 to-blue-100 dark:from-pink-900/40 dark:to-blue-900/50',
                              'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/50',
                              'bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/40 dark:to-blue-900/50',
                              'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/50',
                              'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/50',
                              'bg-gradient-to-br from-red-100 to-yellow-100 dark:from-red-900/40 dark:to-yellow-900/50',
                              'bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-900/40 dark:to-green-900/50',
                            ];

                            return upcomingEvents.map((event: any, eventIndex: number) => {
                              const eventGradientClass =
                                eventGradients[eventIndex % eventGradients.length];

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
                });
              })()}
            </div>
          </ScrollArea>

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
