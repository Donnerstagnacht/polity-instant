'use client';

import { useMemo } from 'react';
import { Node, Edge, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import { NetworkFlowBase } from '@/components/shared/NetworkFlowBase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Target } from 'lucide-react';
import db from '../../../../db';
import { useAuthStore } from '@/features/auth';

interface AmendmentPathVisualizationProps {
  amendmentId: string;
}

export function AmendmentPathVisualization({ amendmentId }: AmendmentPathVisualizationProps) {
  const { user } = useAuthStore();
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  // Fetch amendment data with target, event, and path
  const { data: amendmentData, isLoading } = db.useQuery({
    amendments: {
      $: { where: { id: amendmentId } },
      targetGroup: {},
      targetEvent: {},
      path: {},
    },
  } as any);

  const amendment = (amendmentData as any)?.amendments?.[0];
  const hasTarget = amendment?.targetGroup && amendment?.targetEvent;
  const pathData = amendment?.path?.pathData;

  // Generate visualization nodes and edges
  useMemo(() => {
    if (!pathData || pathData.length === 0 || !user?.profile) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // User node at the start
    newNodes.push({
      id: 'path-user-node',
      type: 'default',
      position: { x: 100, y: 200 },
      data: {
        label: user.profile.name || 'You',
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
    });

    // Create nodes for each step in the path
    pathData.forEach((segment: any, index: number) => {
      const xPos = 350 + index * 250;
      const yPos = 200;
      const isTarget = index === pathData.length - 1;

      newNodes.push({
        id: `path-node-${index}`,
        type: 'default',
        position: { x: xPos, y: yPos },
        data: {
          label: segment.groupName,
          event: segment.eventTitle,
          type: 'group',
        },
        style: {
          background: isTarget ? '#ffcdd2' : '#c8e6c9',
          color: '#333',
          border: `2px solid ${isTarget ? '#ef9a9a' : '#a5d6a7'}`,
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: '500',
          width: 180,
          textAlign: 'center',
        },
      });
    });

    // Edge from user to first group
    newEdges.push({
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
        type: MarkerType.ArrowClosed,
        color: '#2196f3',
      },
    });

    // Create edges between groups
    pathData.forEach((segment: any, index: number) => {
      if (index < pathData.length - 1) {
        newEdges.push({
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
            type: MarkerType.ArrowClosed,
            color: '#66bb6a',
          },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [pathData, user, setNodes, setEdges]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Amendment Process Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasTarget) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Amendment Process Path
          </CardTitle>
          <CardDescription>No target group set yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Visit the Process tab to select a target group and event for this amendment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!pathData || pathData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Amendment Process Path
          </CardTitle>
          <CardDescription>Path calculation in progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="font-semibold">Target:</p>
            <div className="ml-4">
              <p>
                <span className="text-muted-foreground">Group:</span> {amendment.targetGroup.name}
              </p>
              <p>
                <span className="text-muted-foreground">Event:</span> {amendment.targetEvent.title}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Amendment Process Path
          </CardTitle>
          <CardDescription>
            Shortest path to target group ({pathData.length} step
            {pathData.length !== 1 ? 's' : ''})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Target information */}
          <div className="mb-4 rounded-lg border bg-muted/50 p-4">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="font-semibold text-muted-foreground">Target Group</div>
                <div className="mt-1">{amendment.targetGroup.name}</div>
              </div>
              <div>
                <div className="font-semibold text-muted-foreground">Target Event</div>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {amendment.targetEvent.title}
                </div>
                {amendment.targetEvent.startDate && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(amendment.targetEvent.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Path visualization */}
          <div className="h-[300px] rounded-lg border bg-background">
            <NetworkFlowBase nodes={nodes} edges={edges} nodesDraggable={false} panel={<div />} />
          </div>

          {/* Path details list */}
          <div className="mt-6 space-y-3">
            {pathData?.map((segment: any, index: number) => (
              <div key={segment.groupId} className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{segment.groupName}</h4>
                    {index === 0 && <Badge variant="secondary">Your Group</Badge>}
                    {index === pathData.length - 1 && <Badge variant="destructive">Target</Badge>}
                  </div>
                  {segment.eventTitle && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{segment.eventTitle}</span>
                    </div>
                  )}
                </div>
                {index < pathData.length - 1 && (
                  <ArrowRight className="mt-2 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
