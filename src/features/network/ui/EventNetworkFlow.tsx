'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react';
import { useEventWithGroup, useGroupRelationships } from '@/zero/events/useEventState';
import { NetworkFlowBase } from '@/features/network/ui/NetworkFlowBase';
import { type NetworkGroupEntity } from '../types/network.types';
import { NetworkEntityDialog } from '@/features/network/ui/NetworkEntityDialog';
import { NetworkControlPanel } from '@/features/network/ui/NetworkControlPanel';
import { useNetworkFlowControls } from '@/features/network/hooks/useNetworkFlowControls';
import { buildDirectRelationships, buildIndirectRelationships } from '@/features/network/logic/networkRelationshipHelpers';
import { filterEdgesByRights, filterNodesByEdges } from '@/features/network/logic/networkFilterHelpers';
import { getGroupDisplayLabel } from '@/features/network/ui/networkVisualHelpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { usePermissions } from '@/zero/rbac';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface EventNode extends Node {
  data: {
    label: string;
    description?: string;
    level: number;
    type: 'event' | 'group';
    groupData?: NetworkGroupEntity;
  };
}

interface EventNetworkFlowProps {
  eventId: string;
}

export function EventNetworkFlow({ eventId }: EventNetworkFlowProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const controls = useNetworkFlowControls();
  const {
    showIndirect, setShowIndirect,
    selectedNodes, isInteractive, setIsInteractive,
    selectedRights,
    panelCollapsed, setPanelCollapsed,
    legendCollapsed, setLegendCollapsed,
    dialogOpen, setDialogOpen,
    selectedEntity, setSelectedEntity,
    toggleRight, handleInteractiveChange,
  } = controls;
  const [nodes, setNodes, onNodesChange] = useNodesState<EventNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Fetch the specific event with its group
  const { event } = useEventWithGroup(eventId);
  const { can } = usePermissions({ eventId });
  const group = event?.group;
  const canManageEvent = can('manage', 'events');

  // Fetch group relationships
  const { relationships } = useGroupRelationships();

  console.log('EventNetworkFlow Debug:', { event, group });

  // Memoize relationships to prevent infinite loops
  const stableRelationships = useMemo(() => {
    return relationships;
  }, [
    relationships.length,
    relationships.map(r => `${r.id}-${r.group?.id}-${r.related_group?.id}`).join(','),
  ]);

  if (event && !group) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>This event is not associated with a group</CardTitle>
          <CardDescription>
            Network visualization is only available for events that belong to a group.
            Associate this event with a group in the settings page to enable the network view.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {canManageEvent ? (
            <Button onClick={() => navigate({ to: `/event/${eventId}/settings` })}>
              Zur Event-Einstellungen
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate({ to: `/event/${eventId}` })}>
              Zurück zur Veranstaltung
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Generate flow chart
  const generateFlowChart = useCallback(() => {
    if (!event || !group) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { parents, children } = showIndirect
      ? buildIndirectRelationships(stableRelationships, group.id)
      : buildDirectRelationships(stableRelationships, group.id);

    const newNodes: EventNode[] = [];
    const newEdges: Edge[] = [];

    // Build a name lookup for resolving edge source/target names
    const groupNameMap = new Map<string, string>();
    groupNameMap.set(group.id, group.name ?? '');
    groupNameMap.set(eventId, event.title ?? '');
    parents.forEach((p) => groupNameMap.set(p.group.id, p.group.name ?? ''));
    children.forEach((c) => groupNameMap.set(c.group.id, c.group.name ?? ''));

    // Add center node (event)
    newNodes.push({
      id: eventId,
      type: 'default',
      position: { x: 400, y: 300 },
      data: {
        label: event.title ?? '',
        description: event.description ?? '',
        level: 0,
        type: 'event',
      },
      style: {
        background: '#e8f5e9',
        color: '#333',
        border: '3px solid #66bb6a',
        borderRadius: '8px',
        padding: '15px',
        fontSize: '14px',
        fontWeight: 'bold',
        width: 200,
        textAlign: 'center',
      },
    });

    // Add the event's group node
    newNodes.push({
      id: group.id,
      type: 'default',
      position: { x: 400, y: 450 },
      data: {
          label: getGroupDisplayLabel(group.name, group.group_type),
        description: group.description ?? '',
        level: 1,
        type: 'group',
        groupData: group,
      },
      style: {
        background: '#bbdefb',
        color: '#333',
        border: '2px solid #90caf9',
        borderRadius: '5px',
        padding: '10px',
        fontSize: '13px',
        fontWeight: 'bold',
        width: 180,
        textAlign: 'center',
      },
    });

    // Add edge from event to its group
    newEdges.push({
      id: `${eventId}-${group.id}`,
      source: eventId,
      target: group.id,
      type: 'smoothstep',
      animated: false,
      label: 'Hosted by',
      style: { stroke: '#66bb6a', strokeWidth: 2 },
      labelStyle: { fontSize: '10px', fontWeight: 'bold' },
      labelBgStyle: { fill: '#e8f5e9' },
    });

    // Add parent nodes
    parents.forEach((parent) => {
      const level = parent.level || 1;
      const yOffset = -150 * level;
      const totalAtLevel = parents.filter((p) => (p.level || 1) === level).length;
      const indexAtLevel = parents
        .filter((p) => (p.level || 1) === level)
        .findIndex((p) => p.group.id === parent.group.id);
      const xOffset = (indexAtLevel - (totalAtLevel - 1) / 2) * 250;

      newNodes.push({
        id: parent.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 450 + yOffset },
        data: {
          label: getGroupDisplayLabel(parent.group.name, parent.group.group_type),
          description: parent.group.description ?? undefined,
          level: level + 1,
          type: 'group',
          groupData: parent.group,
        },
        style: {
          background: level === 1 ? '#fff9c4' : '#ffe0b2',
          color: '#333',
          border: '1px solid #fbc02d',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          width: 160,
          textAlign: 'center',
        },
      });

      newEdges.push({
        id: `${parent.group.id}-${parent.childId || group.id}`,
        source: parent.group.id,
        target: parent.childId || group.id,
        type: 'rightsLabel',
        animated: true,
        data: { rights: parent.rights, sourceName: groupNameMap.get(parent.group.id) ?? null, targetName: groupNameMap.get(parent.childId || group.id) ?? null },
        style: { stroke: '#fbc02d', strokeWidth: 2 },
      });
    });

    // Add child nodes
    children.forEach((child) => {
      const level = child.level || 1;
      const yOffset = 150 * level;
      const totalAtLevel = children.filter((c) => (c.level || 1) === level).length;
      const indexAtLevel = children
        .filter((c) => (c.level || 1) === level)
        .findIndex((c) => c.group.id === child.group.id);
      const xOffset = (indexAtLevel - (totalAtLevel - 1) / 2) * 250;

      newNodes.push({
        id: child.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 450 + yOffset },
        data: {
          label: getGroupDisplayLabel(child.group.name, child.group.group_type),
          description: child.group.description ?? undefined,
          level: level + 1,
          type: 'group',
          groupData: child.group,
        },
        style: {
          background: level === 1 ? '#c8e6c9' : '#b2dfdb',
          color: '#333',
          border: '1px solid #4caf50',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          width: 160,
          textAlign: 'center',
        },
      });

      newEdges.push({
        id: `${child.parentId || group.id}-${child.group.id}`,
        source: child.parentId || group.id,
        target: child.group.id,
        type: 'rightsLabel',
        animated: true,
        data: { rights: child.rights, sourceName: groupNameMap.get(child.parentId || group.id) ?? null, targetName: groupNameMap.get(child.group.id) ?? null },
        style: { stroke: '#4caf50', strokeWidth: 2 },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [event, group, eventId, showIndirect, stableRelationships]);

  // Filter edges based on selected rights (always show event-to-group edge)
  const eventToGroupEdgeIds = useMemo(() => {
    return new Set(edges.filter(e => e.source === eventId).map(e => e.id));
  }, [edges, eventId]);

  const filteredEdges = useMemo(() => {
    return filterEdgesByRights(edges, selectedRights, eventToGroupEdgeIds);
  }, [edges, selectedRights, eventToGroupEdgeIds]);

  // Filter nodes to only show those connected via visible edges
  const alwaysIncludeIds = useMemo(() => {
    const ids = [eventId];
    if (group) ids.push(group.id);
    return ids;
  }, [eventId, group]);

  const filteredNodes = useMemo(() => {
    return filterNodesByEdges(nodes, filteredEdges, alwaysIncludeIds);
  }, [nodes, filteredEdges, alwaysIncludeIds]);

  // Generate flow chart when event or showIndirect changes
  useEffect(() => {
    generateFlowChart();
  }, [generateFlowChart]);

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!isInteractive) return;

      const nodeData = node.data as EventNode['data'];

      if (nodeData.type === 'event') {
        setSelectedEntity({
          type: 'event',
          data: { id: eventId, title: event?.title ?? '', description: event?.description ?? '' },
        });
        setDialogOpen(true);
      } else if (nodeData.type === 'group' && nodeData.groupData) {
        setSelectedEntity({
          type: 'group',
          data: nodeData.groupData,
        });
        setDialogOpen(true);
      }
    },
    [isInteractive, event]
  );

  // Handle edge click
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (!isInteractive) return;

      setSelectedEntity({
        type: 'relationship',
        data: {
          source: edge.source,
          target: edge.target,
          sourceName: typeof edge.data?.sourceName === 'string' ? edge.data.sourceName : null,
          targetName: typeof edge.data?.targetName === 'string' ? edge.data.targetName : null,
          rights: Array.isArray(edge.data?.rights) ? (edge.data.rights as string[]) : [],
          label: typeof edge.label === 'string' ? edge.label : null,
        },
      });
      setDialogOpen(true);
    },
    [isInteractive]
  );

  if (!event) {
    return (
      <div className="flex h-[calc(100dvh-12rem)] min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex h-[calc(100dvh-12rem)] min-h-[400px] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground">This event is not associated with a group</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Network visualization is only available for events that belong to a group.
            Associate this event with a group in the settings page to enable the network view.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            {canManageEvent ? (
              <Button onClick={() => navigate({ to: `/event/${eventId}/settings` })}>
                Zur Event-Einstellungen
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate({ to: `/event/${eventId}` })}>
                Zurück zur Veranstaltung
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NetworkFlowBase
      nodes={filteredNodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          boxShadow: selectedNodes.includes(node.id) ? '0 0 0 2px #ff0072' : undefined,
        },
      }))}
      edges={filteredEdges}
      nodesDraggable={isInteractive}
      nodesFocusable={isInteractive}
      nodesConnectable={isInteractive}
      edgesFocusable={isInteractive}
      onNodesChange={isInteractive ? onNodesChange : undefined}
      onEdgesChange={isInteractive ? onEdgesChange : undefined}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onInteractiveChange={handleInteractiveChange}
      panel={
        <NetworkControlPanel
          title={t('common.network.eventNetwork', 'Event Network')}
          description={t('common.network.eventNetworkDescription', {
            eventName: event.title ?? '',
            groupName: group.name ?? '',
          })}
          panelCollapsed={panelCollapsed}
          onPanelCollapsedChange={setPanelCollapsed}
          legendCollapsed={legendCollapsed}
          onLegendCollapsedChange={setLegendCollapsed}
          legendTitle={t('common.network.legend')}
          legendItems={[
            {
              id: 'event-center',
              label: t('common.network.eventCenter', 'Event (Center)'),
              swatchClassName: 'h-4 w-4 rounded border-2 border-[#66bb6a] bg-[#e8f5e9]',
            },
            {
              id: 'event-group',
              label: t('common.network.eventGroup', "Event's Group"),
              swatchClassName: 'h-4 w-4 rounded border border-[#90caf9] bg-[#bbdefb]',
            },
            {
              id: 'parent-groups',
              label: t('common.network.parentGroups'),
              swatchClassName: 'h-4 w-4 rounded border border-[#fbc02d] bg-[#fff9c4]',
            },
            {
              id: 'child-groups',
              label: t('common.network.childGroups'),
              swatchClassName: 'h-4 w-4 rounded border border-[#4caf50] bg-[#c8e6c9]',
            },
          ]}
          showGroupTypeLegend
          baseGroupLabel={t('common.network.baseGroup', '◉ Base group')}
          hierarchicalGroupLabel={t('common.network.hierarchicalGroup', '🏛 Hierarchical group')}
          showDisplayControls
          showIndirect={showIndirect}
          onShowIndirectChange={setShowIndirect}
          isInteractive={isInteractive}
          onInteractiveChange={setIsInteractive}
          directLabel={t('common.network.direct')}
          indirectLabel={t('common.network.indirect')}
          lockLabel={t('common.network.lockEditor')}
          unlockLabel={t('common.network.unlockEditor')}
          showRightsFilter
          selectedRights={selectedRights}
          onToggleRight={toggleRight}
          showRightsLegend
        />
      }
    >
      <NetworkEntityDialog open={dialogOpen} onOpenChange={setDialogOpen} entity={selectedEntity} />
    </NetworkFlowBase>
  );
}
