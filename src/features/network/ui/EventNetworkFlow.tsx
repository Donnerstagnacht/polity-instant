'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react';
import { useEventWithGroup, useGroupRelationships } from '@/zero/events/useEventState';
import { NetworkFlowBase } from '@/features/network/ui/NetworkFlowBase';
import { type NetworkGroupEntity } from '../types/network.types';
import { NetworkEntityDialog, type NetworkDialogEntity } from '@/features/network/ui/NetworkEntityDialog';
import { NetworkControlPanel } from '@/features/network/ui/NetworkControlPanel';
import { RIGHT_TYPES } from '@/features/network/ui/RightFilters';
import { getGroupDisplayLabel, renderRightsEdgeLabel } from '@/features/network/ui/networkVisualHelpers';
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

interface RelationshipEntry {
  group: NetworkGroupEntity;
  rights: string[];
  level?: number;
  childId?: string;
  parentId?: string;
}

export function EventNetworkFlow({ eventId }: EventNetworkFlowProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showIndirect, setShowIndirect] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<EventNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);
  const [selectedRights, setSelectedRights] = useState<Set<string>>(new Set(RIGHT_TYPES));
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<NetworkDialogEntity | null>(null);

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

  // Build direct relationships
  const getDirectRelationships = useCallback(
    (targetGroupId: string) => {
      const parentsMap = new Map<string, RelationshipEntry>();
      const childrenMap = new Map<string, RelationshipEntry>();

      stableRelationships.forEach((rel) => {
        if (rel.related_group?.id === targetGroupId && rel.group) {
          const parentId = rel.group.id;
          const existing = parentsMap.get(parentId);
          if (existing) {
            existing.rights.push(rel.with_right ?? '');
          } else {
            parentsMap.set(parentId, {
              group: rel.group,
              rights: [rel.with_right ?? ''],
            });
          }
        }
        if (rel.group?.id === targetGroupId && rel.related_group) {
          const childId = rel.related_group.id;
          const existing = childrenMap.get(childId);
          if (existing) {
            existing.rights.push(rel.with_right ?? '');
          } else {
            childrenMap.set(childId, {
              group: rel.related_group,
              rights: [rel.with_right ?? ''],
            });
          }
        }
      });

      return {
        parents: Array.from(parentsMap.values()),
        children: Array.from(childrenMap.values()),
      };
    },
    [stableRelationships]
  );

  // Build indirect (recursive) relationships
  const getIndirectRelationships = useCallback(
    (targetGroupId: string) => {
      const parentsMap = new Map<string, RelationshipEntry>();
      const childrenMap = new Map<string, RelationshipEntry>();

      const directRels = getDirectRelationships(targetGroupId);

      // For parents: Add direct parents first (level 1), then follow chains for each right type
      directRels.parents.forEach(parent => {
        parentsMap.set(parent.group.id, {
          group: parent.group,
          rights: [...parent.rights],
          level: 1,
          childId: targetGroupId,
        });

        parent.rights.forEach(right => {
          const visited = new Set<string>([targetGroupId, parent.group.id]);
          const queue: { groupId: string; level: number; right: string }[] = [
            { groupId: parent.group.id, level: 1, right },
          ];

          while (queue.length > 0) {
            const current = queue.shift();
            if (!current) continue;
            const currentParents = stableRelationships.filter(
              (rel) =>
                rel.related_group?.id === current.groupId && rel.with_right === current.right
            );

            currentParents.forEach((rel) => {
              if (!rel.group || visited.has(rel.group.id)) return;
              visited.add(rel.group.id);
              const existing = parentsMap.get(rel.group.id);
                if (existing) {
                  if (!existing.rights.includes(right)) {
                    existing.rights.push(right);
                  }
                  existing.level = Math.min(existing.level ?? Infinity, current.level + 1);
                } else {
                  parentsMap.set(rel.group.id, {
                    group: rel.group,
                    rights: [right],
                    level: current.level + 1,
                    childId: current.groupId,
                  });
                }
                queue.push({
                  groupId: rel.group.id,
                  level: current.level + 1,
                  right,
                });
            });
          }
        });
      });

      // For children: Add direct children first (level 1), then follow chains for each right type
      directRels.children.forEach(child => {
        childrenMap.set(child.group.id, {
          group: child.group,
          rights: [...child.rights],
          level: 1,
          parentId: targetGroupId,
        });

        child.rights.forEach(right => {
          const visited = new Set<string>([targetGroupId, child.group.id]);
          const queue: { groupId: string; level: number; right: string }[] = [
            { groupId: child.group.id, level: 1, right },
          ];

          while (queue.length > 0) {
            const current = queue.shift();
            if (!current) continue;
            const currentChildren = stableRelationships.filter(
              (rel) =>
                rel.group?.id === current.groupId && rel.with_right === current.right
            );

            currentChildren.forEach((rel) => {
              if (!rel.related_group || visited.has(rel.related_group.id)) return;
              visited.add(rel.related_group.id);
              const existing = childrenMap.get(rel.related_group.id);
                if (existing) {
                  if (!existing.rights.includes(right)) {
                    existing.rights.push(right);
                  }
                  existing.level = Math.min(existing.level ?? Infinity, current.level + 1);
                } else {
                  childrenMap.set(rel.related_group.id, {
                    group: rel.related_group,
                    rights: [right],
                    level: current.level + 1,
                    parentId: current.groupId,
                  });
                }
                queue.push({
                  groupId: rel.related_group.id,
                  level: current.level + 1,
                  right,
                });

            });
          }
        });
      });

      return {
        parents: Array.from(parentsMap.values()),
        children: Array.from(childrenMap.values()),
      };
    },
    [stableRelationships, getDirectRelationships]
  );

  // Toggle right filter
  const toggleRight = useCallback((right: string) => {
    setSelectedRights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(right)) {
        newSet.delete(right);
      } else {
        newSet.add(right);
      }
      return newSet;
    });
  }, []);

  // Generate flow chart
  const generateFlowChart = useCallback(() => {
    if (!event || !group) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { parents, children } = showIndirect
      ? getIndirectRelationships(group.id)
      : getDirectRelationships(group.id);

    const newNodes: EventNode[] = [];
    const newEdges: Edge[] = [];

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
        type: 'smoothstep',
        animated: true,
        label: renderRightsEdgeLabel(parent.rights),
        data: { rights: parent.rights },
        style: { stroke: '#fbc02d', strokeWidth: 2 },
        labelStyle: { fontSize: '9px', fontWeight: 'bold' },
        labelBgStyle: { fill: '#fff9c4' },
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
        type: 'smoothstep',
        animated: true,
        label: renderRightsEdgeLabel(child.rights),
        data: { rights: child.rights },
        style: { stroke: '#4caf50', strokeWidth: 2 },
        labelStyle: { fontSize: '9px', fontWeight: 'bold' },
        labelBgStyle: { fill: '#c8e6c9' },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [event, group, eventId, showIndirect, getDirectRelationships, getIndirectRelationships]);

  // Filter edges based on selected rights
  const filteredEdges = useMemo(() => {
    return edges
      .map(edge => {
        // Always show the event-to-group edge
        if (edge.source === eventId) {
          return edge;
        }

        if (!edge.data?.rights || !Array.isArray(edge.data.rights)) {
          return edge;
        }

        const visibleRights = edge.data.rights.filter((r: string) => selectedRights.has(r));
        if (visibleRights.length === 0) {
          return null;
        }

        if (visibleRights.length === edge.data.rights.length) {
          return edge;
        }

        return {
          ...edge,
          label: renderRightsEdgeLabel(visibleRights),
          data: { ...edge.data, rights: visibleRights },
        };
      })
      .filter((edge): edge is Edge => edge !== null);
  }, [edges, selectedRights, eventId]);

  // Filter nodes to only show those connected via visible edges
  const filteredNodes = useMemo(() => {
    const connectedNodeIds = new Set<string>();

    // Always include the center nodes (event and its group)
    connectedNodeIds.add(eventId);
    if (group) {
      connectedNodeIds.add(group.id);
    }

    // Add nodes that are source or target of visible edges
    filteredEdges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    return nodes.filter(node => connectedNodeIds.has(node.id));
  }, [nodes, filteredEdges, eventId, group]);

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
          rights: Array.isArray(edge.data?.rights) ? (edge.data.rights as string[]) : [],
          label: typeof edge.label === 'string' ? edge.label : null,
        },
      });
      setDialogOpen(true);
    },
    [isInteractive]
  );

  // Handle interactive mode changes
  const handleInteractiveChange = useCallback((interactiveState: boolean) => {
    setIsInteractive(interactiveState);
    if (!interactiveState) {
      setSelectedNodes([]);
    }
  }, []);

  if (!event) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex h-[600px] items-center justify-center px-4">
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
        />
      }
    >
      <NetworkEntityDialog open={dialogOpen} onOpenChange={setDialogOpen} entity={selectedEntity} />
    </NetworkFlowBase>
  );
}
