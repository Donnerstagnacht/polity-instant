'use client';

import { useEffect } from 'react';
import { Node, Edge, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import { NetworkFlowBase, Panel } from '@/components/shared/NetworkFlowBase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Target } from 'lucide-react';
import db from '../../../../db/db';
import { useTranslation } from '@/hooks/use-translation';

interface AmendmentPathVisualizationProps {
  amendmentId: string;
}

export function AmendmentPathVisualization({ amendmentId }: AmendmentPathVisualizationProps) {
  const { t } = useTranslation();
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  // Fetch amendment data with target, event, and path segments
  const { data: amendmentData, isLoading } = db.useQuery({
    amendments: {
      $: { where: { id: amendmentId } },
      targetGroup: {},
      targetEvent: {},
      path: {
        segments: {
          group: {},
          event: {},
        },
      },
    },
  } as any);

  const amendment = (amendmentData as any)?.amendments?.[0];
  const hasTarget = amendment?.targetGroup && amendment?.targetEvent;

  // Derive pathSegments for use in JSX
  const pathSegments = (amendment?.path?.segments || []).sort(
    (a: any, b: any) => a.order - b.order
  );

  // Generate visualization nodes and edges
  useEffect(() => {
    const segments = (amendment?.path?.segments || []).sort((a: any, b: any) => a.order - b.order);

    if (!segments || segments.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Create nodes for each step in the path
    segments.forEach((segment: any, index: number) => {
      const xPos = 100 + index * 250;
      const yPos = 200;
      const isFirst = index === 0;
      const isTarget = index === segments.length - 1;

      newNodes.push({
        id: `path-node-${index}`,
        type: 'default',
        position: { x: xPos, y: yPos },
        data: {
          label: segment.group?.name || 'Unknown Group',
          event: segment.event?.title || 'No Event',
          type: 'group',
        },
        style: {
          background: isTarget ? '#ffcdd2' : isFirst ? '#e3f2fd' : '#c8e6c9',
          color: '#333',
          border: `2px solid ${isTarget ? '#ef9a9a' : isFirst ? '#90caf9' : '#a5d6a7'}`,
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: '500',
          width: 180,
          textAlign: 'center',
        },
      });
    });

    // Create edges between groups
    segments.forEach((segment: any, index: number) => {
      if (index < segments.length - 1) {
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
  }, [amendment?.path?.segments, setNodes, setEdges]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('features.amendments.pathVisualization.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('features.amendments.process.loading')}</p>
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
            {t('features.amendments.pathVisualization.title')}
          </CardTitle>
          <CardDescription>{t('features.amendments.pathVisualization.noTargetSet')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('features.amendments.pathVisualization.visitProcessTab')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!pathSegments || pathSegments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t('features.amendments.pathVisualization.title')}
          </CardTitle>
          <CardDescription>{t('features.amendments.pathVisualization.pathCalculating')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="font-semibold">{t('features.amendments.process.target')}:</p>
            <div className="ml-4">
              <p>
                <span className="text-muted-foreground">{t('features.amendments.process.targetGroup')}:</span> {amendment.targetGroup.name}
              </p>
              <p>
                <span className="text-muted-foreground">{t('features.amendments.process.event')}:</span> {amendment.targetEvent.title}
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
            {t('features.amendments.pathVisualization.title')}
          </CardTitle>
          <CardDescription>
            {t('features.amendments.pathVisualization.shortestPath', { count: pathSegments.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Target information */}
          <div className="mb-4 rounded-lg border bg-muted/50 p-4">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div>
                <div className="font-semibold text-muted-foreground">{t('features.amendments.process.targetGroup')}</div>
                <div className="mt-1">{amendment.targetGroup.name}</div>
              </div>
              <div>
                <div className="font-semibold text-muted-foreground">{t('features.amendments.process.targetEvent')}</div>
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
          <div className="h-[250px] overflow-hidden rounded-lg border bg-background">
            <NetworkFlowBase
              nodes={nodes}
              edges={edges}
              nodesDraggable={false}
              panel={
                <Panel
                  position="top-right"
                  className="rounded bg-white p-3 shadow dark:bg-background"
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-[#90caf9] bg-[#e3f2fd]"></div>
                      <span>{t('features.amendments.pathVisualization.start')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-[#a5d6a7] bg-[#c8e6c9]"></div>
                      <span>{t('features.amendments.pathVisualization.path')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-[#ef9a9a] bg-[#ffcdd2]"></div>
                      <span>{t('features.amendments.process.target')}</span>
                    </div>
                  </div>
                </Panel>
              }
            />
          </div>

          {/* Path details list */}
          <div className="mt-6 space-y-3">
            {pathSegments?.map((segment: any, index: number) => (
              <div key={segment.group?.id || index} className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{segment.group?.name || t('common.unknown')}</h4>
                    {index === 0 && <Badge variant="secondary">{t('features.amendments.pathVisualization.start')}</Badge>}
                    {index === pathSegments.length - 1 && (
                      <Badge variant="destructive">{t('features.amendments.process.target')}</Badge>
                    )}
                  </div>
                  {segment.event?.title && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{segment.event.title}</span>
                    </div>
                  )}
                </div>
                {index < pathSegments.length - 1 && (
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
