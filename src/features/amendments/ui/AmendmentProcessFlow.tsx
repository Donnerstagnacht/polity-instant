'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FilteredNetworkFlow } from '@/components/shared/FilteredNetworkFlow';
import { GroupDetailsWithEvents } from '@/components/shared/GroupDetailsWithEvents';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import db, { tx, id } from '../../../../db';
import { useAuthStore } from '@/features/auth';
import { toast } from 'sonner';
import { findShortestPath } from '@/utils/path-finding';
import { NetworkFlowBase } from '@/components/shared/NetworkFlowBase';
import { CalendarIcon, Target, X, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AmendmentProcessFlowProps {
  amendmentId: string;
}

export function AmendmentProcessFlow({ amendmentId }: AmendmentProcessFlowProps) {
  const user = useAuthStore((state: any) => state.user);
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<{
    id: string;
    data: any;
  } | null>(null);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    data: any;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'path' | 'network'>('network');
  const [eventChangeDialog, setEventChangeDialog] = useState<{
    open: boolean;
    groupId: string;
    groupName: string;
    currentEventId: string | null;
  } | null>(null);

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

  // Fetch amendment data with target and path
  const { data: amendmentData, isLoading } = db.useQuery({
    amendments: {
      $: { where: { id: amendmentId } },
      targetGroup: {},
      targetEvent: {},
      agendaItems: {
        amendmentVote: {}, // Fetch the related amendment vote
      },
      path: {},
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
      $: { where: { user: user?.id || '' } },
      group: {},
    },
    events: {
      group: {},
    },
  } as any);

  const amendment = (amendmentData as any)?.amendments?.[0];
  const hasTarget = Boolean(amendment?.targetGroup && amendment?.targetEvent);

  // Set default tab based on whether target exists
  useEffect(() => {
    if (hasTarget) {
      setActiveTab('path');
    } else {
      setActiveTab('network');
    }
  }, [hasTarget]);

  // Handle group click from network
  const handleGroupClick = (groupId: string, groupData: any) => {
    setSelectedGroup({ id: groupId, data: groupData });
  };

  // Handle event click from events list
  const handleEventClick = (eventId: string, eventData: any) => {
    setSelectedEvent({ id: eventId, data: eventData });
    setTargetDialogOpen(true);
  };

  // Calculate path from user to target group with events for each step
  const calculatePathWithEvents = (targetGroupId: string) => {
    if (!user || !networkData) return null;

    const userMemberships =
      (networkData as any)?.groupMemberships?.filter(
        (m: any) => m.status === 'member' || m.status === 'admin'
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
    if (!selectedGroup || !selectedEvent || !user) return;

    setIsSaving(true);
    try {
      const transactions: any[] = [];

      // If there's an existing target, remove old agenda items, votes, and path
      if (hasTarget && amendment.path?.pathData) {
        // Delete all agenda items and votes from the previous path
        for (const segment of amendment.path.pathData) {
          if (segment.agendaItemId) {
            // First delete the vote if it exists
            if (segment.amendmentVoteId) {
              transactions.push(tx.amendmentVotes[segment.amendmentVoteId].delete());
            }
            // Then delete the agenda item
            transactions.push(tx.agendaItems[segment.agendaItemId].delete());
          }
        }
        // Delete the path
        transactions.push(tx.amendmentPaths[amendment.path.id].delete());
      }

      // Calculate shortest path with events
      const pathWithEvents = calculatePathWithEvents(selectedGroup.id);

      if (!pathWithEvents || pathWithEvents.length === 0) {
        toast.error('No valid path found to target group');
        setIsSaving(false);
        return;
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

      // Create path record with enriched data
      const pathId = id();
      transactions.push(
        tx.amendmentPaths[pathId]
          .update({
            pathData: enrichedPath,
            pathLength: enrichedPath.length,
            createdAt: new Date(),
          })
          .link({
            amendment: amendmentId,
          })
      );

      // Update amendment with target group and event
      transactions.push(
        tx.amendments[amendmentId]
          .update({
            updatedAt: new Date(),
          })
          .link({
            targetGroup: selectedGroup.id,
            targetEvent: selectedEvent.id,
          })
      );

      await db.transact(transactions);

      toast.success(hasTarget ? 'Target updated successfully' : 'Target set successfully', {
        description: `Amendment will be processed through ${selectedGroup.data.name} with ${enrichedPath.length} events in the path`,
      });

      setTargetDialogOpen(false);
      setSelectedGroup(null);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error setting target:', error);
      toast.error('Failed to set target', {
        description: 'Please try again',
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
      if (amendment.path?.pathData) {
        for (const segment of amendment.path.pathData) {
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

      toast.success('Target removed successfully');
      setRemoveDialogOpen(false);
    } catch (error) {
      console.error('Error removing target:', error);
      toast.error('Failed to remove target', {
        description: 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle changing event for a specific group in the path
  const handleChangeEvent = async (groupId: string, newEventId: string) => {
    if (!amendment || !amendment.path || !amendment.path.pathData) return;

    try {
      setIsSaving(true);

      const pathData = Array.isArray(amendment.path.pathData) ? amendment.path.pathData : [];
      const segmentIndex = pathData.findIndex((s: any) => s.groupId === groupId);

      if (segmentIndex === -1) {
        toast.error('Group not found in path');
        return;
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

      // Look up the new event details from networkData
      const allEvents = (networkData as any)?.events || [];
      const newEvent = allEvents.find((e: any) => e.id === newEventId);

      // Update path data with the new event information
      pathData[segmentIndex] = {
        ...segment,
        eventId: newEventId,
        eventTitle: newEvent?.title || 'Event',
        eventStartDate: newEvent?.startDate || null,
        agendaItemId: newAgendaItemId,
        amendmentVoteId: newAmendmentVoteId,
        forwardingStatus: forwardingStatus,
      };

      // Update amendment path
      transactions.push(
        tx.amendmentPaths[amendment.path.id].update({
          pathData: pathData, // Store as JSON directly, not stringified
        })
      );

      // If this is the target group, also update the amendment's targetEvent
      if (isTarget) {
        transactions.push(
          tx.amendments[amendmentId]
            .update({ updatedAt: Date.now() })
            .link({ targetEvent: newEventId })
        );
      }

      await db.transact(transactions);

      toast.success('Event updated successfully');
      setEventChangeDialog(null);
    } catch (error) {
      console.error('Error changing event:', error);
      toast.error('Failed to update event', {
        description: 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-muted-foreground">Please log in to view the amendment process.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

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

  // Render path visualization
  const renderPathVisualization = () => {
    if (!amendment?.path?.pathData || amendment.path.pathData.length === 0) {
      return null;
    }

    const pathData = amendment.path.pathData;

    // Start with user node
    const nodes = [
      // User node (start)
      {
        id: 'path-user-node',
        type: 'default',
        position: { x: 100, y: 200 },
        data: {
          label: user?.name || 'You',
          description: 'Your starting point',
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
                Current Target
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedGroup({ id: amendment.targetGroup.id, data: amendment.targetGroup });
                    // Open the group to see events and update
                  }}
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Update
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRemoveDialogOpen(true)}>
                  <X className="mr-2 h-3 w-3" />
                  Remove
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Path Overview - Timeline Style */}
            {amendment.path && amendment.path.pathData && (
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  Amendment Path (
                  {Array.isArray(amendment.path.pathData) ? amendment.path.pathData.length : 0}{' '}
                  groups)
                </div>

                {/* Timeline */}
                <div className="relative pl-8">
                  {/* Vertical line */}
                  <div className="absolute bottom-0 left-3 top-0 w-0.5 bg-gradient-to-b from-cyan-500 via-green-500 to-red-500"></div>

                  {/* Timeline items */}
                  <div className="space-y-6">
                    {(Array.isArray(amendment.path.pathData) ? amendment.path.pathData : []).map(
                      (segment: any, index: number) => {
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
                                        Next Event
                                      </Badge>
                                    )}
                                    {isTarget && (
                                      <Badge className="bg-red-500 text-xs hover:bg-red-600">
                                        Target
                                      </Badge>
                                    )}
                                    {isPending && (
                                      <Badge
                                        variant="outline"
                                        className="border-yellow-600 text-xs text-yellow-700"
                                      >
                                        Awaiting Previous
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
                                          No upcoming event
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
                      }
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-4 flex items-center gap-2 border-t pt-4">
                  <Badge variant="secondary">
                    {
                      (Array.isArray(amendment.path.pathData)
                        ? amendment.path.pathData
                        : []
                      ).filter((s: any) => s.agendaItemId).length
                    }{' '}
                    agenda items created
                  </Badge>
                  {(Array.isArray(amendment.path.pathData) ? amendment.path.pathData : []).filter(
                    (s: any) => s.amendmentVoteId
                  ).length > 0 && (
                    <Badge variant="secondary">
                      {
                        (Array.isArray(amendment.path.pathData)
                          ? amendment.path.pathData
                          : []
                        ).filter((s: any) => s.amendmentVoteId).length
                      }{' '}
                      votes created
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
            <h3 className="mb-2 text-lg font-semibold">No Target Selected</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Choose a target group and event from the network below to begin the amendment process.
            </p>
            <p className="text-xs text-muted-foreground">
              Click on a group in the network, then select an event to set your target.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Network Flow - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Amendment Network</CardTitle>
                <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'path' | 'network')}>
                  <TabsList>
                    <TabsTrigger value="network">Available Targets</TabsTrigger>
                    <TabsTrigger value="path" disabled={!hasTarget}>
                      Target Path
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px]">
                {activeTab === 'network' ? (
                  <FilteredNetworkFlow
                    userId={user.id}
                    filterRight="amendmentRight"
                    onGroupClick={handleGroupClick}
                    title="Amendment Network"
                    description="Click on a group to view details and upcoming events"
                  />
                ) : (
                  <>
                    {(() => {
                      const pathViz = renderPathVisualization();
                      if (!pathViz) {
                        return (
                          <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">No path available</p>
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
        </div>

        {/* Group Details and Events - Takes 1 column */}
        <div className="lg:col-span-1">
          {selectedGroup ? (
            <GroupDetailsWithEvents
              groupId={selectedGroup.id}
              groupData={selectedGroup.data}
              onEventClick={handleEventClick}
              onClose={() => setSelectedGroup(null)}
            />
          ) : (
            <Card className="h-full">
              <CardContent className="flex h-[600px] items-center justify-center">
                <p className="text-center text-sm text-muted-foreground">
                  Click on a group in the network to view its details and upcoming events
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Target Selection Dialog */}
      <Dialog open={targetDialogOpen} onOpenChange={setTargetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasTarget ? 'Update Amendment Target' : 'Set Amendment Target'}
            </DialogTitle>
            <DialogDescription>
              {hasTarget
                ? 'Update the target group and event for your amendment. This will remove the previous agenda item and path.'
                : 'Set the target group and event for your amendment. An agenda item will be created automatically.'}
            </DialogDescription>
          </DialogHeader>

          {selectedGroup && selectedEvent && (
            <div className="space-y-4 py-4">
              <div>
                <h4 className="mb-2 text-sm font-semibold">Target Group</h4>
                <p className="text-sm">{selectedGroup.data.name}</p>
                {selectedGroup.data.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedGroup.data.description}
                  </p>
                )}
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Target Event</h4>
                <p className="text-sm">{selectedEvent.data.title}</p>
                {selectedEvent.data.startDate && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(selectedEvent.data.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>

              <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <p className="font-semibold">What will happen:</p>
                <ul className="ml-4 mt-1 list-disc space-y-1">
                  <li>An agenda item will be created for the selected event</li>
                  <li>An amendment vote will be created for the agenda item</li>
                  <li>The shortest path to the target group will be calculated and stored</li>
                  {hasTarget && (
                    <>
                      <li>The previous agenda item and vote will be removed</li>
                      <li>The previous path will be deleted</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTargetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmTarget} disabled={isSaving}>
              {isSaving ? 'Processing...' : hasTarget ? 'Update Target' : 'Confirm Target'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Target Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Amendment Target</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the target for this amendment? This will also delete
              the associated agenda item, amendment vote, and path.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-destructive/10 p-3 text-sm">
            <p className="font-semibold text-destructive">This action will:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1 text-destructive/80">
              <li>Remove the target group and event</li>
              <li>Delete the agenda item from the event</li>
              <li>Delete the amendment vote</li>
              <li>Delete the calculated process path</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveTarget} disabled={isSaving}>
              {isSaving ? 'Removing...' : 'Remove Target'}
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
              <DialogTitle>Change Event for {eventChangeDialog.groupName}</DialogTitle>
              <DialogDescription>
                Select a new event for this group in the amendment path
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
                        No upcoming events for this group
                      </p>
                    );
                  }

                  return upcomingEvents.map((event: any) => (
                    <div
                      key={event.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                        event.id === eventChangeDialog?.currentEventId
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium">{event.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
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
                      </div>
                      <div className="flex items-center gap-2">
                        {event.id === eventChangeDialog?.currentEventId && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                        <Button
                          size="sm"
                          variant={
                            event.id === eventChangeDialog?.currentEventId ? 'outline' : 'default'
                          }
                          disabled={event.id === eventChangeDialog?.currentEventId || isSaving}
                          onClick={() =>
                            eventChangeDialog &&
                            handleChangeEvent(eventChangeDialog.groupId, event.id)
                          }
                        >
                          {isSaving ? 'Updating...' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEventChangeDialog(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
