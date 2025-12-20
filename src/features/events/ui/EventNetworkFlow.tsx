'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react';
import db from '../../../../db/db';
import { NetworkFlowBase } from '@/components/shared/NetworkFlowBase';
import { NetworkEntityDialog } from '@/components/shared/NetworkEntityDialog';
import { RIGHT_TYPES, formatRights } from '@/components/shared/RightFilters';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface EventNode extends Node {
  data: {
    label: string;
    description?: string;
    level: number;
    type: 'event' | 'group';
    groupData?: any;
  };
}

interface EventNetworkFlowProps {
  eventId: string;
}

export function EventNetworkFlow({ eventId }: EventNetworkFlowProps) {
  const [showIndirect, setShowIndirect] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<EventNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);
  const [selectedRights, setSelectedRights] = useState<Set<string>>(new Set(RIGHT_TYPES));
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'event' | 'group' | 'relationship';
    data: any;
  } | null>(null);

  // Fetch the specific event with its group
  const { data: eventData, isLoading: eventLoading } = db.useQuery({
    events: {
      $: { where: { id: eventId } },
      group: {},
    },
  });

  // Fetch group relationships
  const { data: relationshipsData } = db.useQuery({
    groupRelationships: {
      parentGroup: {},
      childGroup: {},
    },
  });

  const event = eventData?.events?.[0];
  const group = event?.group;
  const relationships = relationshipsData?.groupRelationships || [];

  console.log('EventNetworkFlow Debug:', { event, group, eventData });

  // Memoize relationships to prevent infinite loops
  const stableRelationships = useMemo(() => {
    return relationships;
  }, [
    relationships.length,
    relationships.map(r => `${r.id}-${r.parentGroup?.id}-${r.childGroup?.id}`).join(','),
  ]);

  // Build direct relationships
  const getDirectRelationships = useCallback(
    (targetGroupId: string) => {
      const parentsMap = new Map<string, { group: any; rights: string[] }>();
      const childrenMap = new Map<string, { group: any; rights: string[] }>();

      stableRelationships.forEach((rel: any) => {
        if (rel.childGroup?.id === targetGroupId) {
          const existing = parentsMap.get(rel.parentGroup.id);
          if (existing) {
            existing.rights.push(rel.rightType);
          } else {
            parentsMap.set(rel.parentGroup.id, {
              group: rel.parentGroup,
              rights: [rel.rightType],
            });
          }
        }
        if (rel.parentGroup?.id === targetGroupId) {
          const existing = childrenMap.get(rel.childGroup.id);
          if (existing) {
            existing.rights.push(rel.rightType);
          } else {
            childrenMap.set(rel.childGroup.id, {
              group: rel.childGroup,
              rights: [rel.rightType],
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
      const parentsMap = new Map<
        string,
        { group: any; rights: string[]; level: number; childId?: string }
      >();
      const childrenMap = new Map<
        string,
        { group: any; rights: string[]; level: number; parentId?: string }
      >();

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
              (rel: any) =>
                rel.childGroup?.id === current.groupId && rel.rightType === current.right
            );

            currentParents.forEach((rel: any) => {
              if (!visited.has(rel.parentGroup.id)) {
                visited.add(rel.parentGroup.id);
                const existing = parentsMap.get(rel.parentGroup.id);
                if (existing) {
                  if (!existing.rights.includes(right)) {
                    existing.rights.push(right);
                  }
                  existing.level = Math.min(existing.level, current.level + 1);
                } else {
                  parentsMap.set(rel.parentGroup.id, {
                    group: rel.parentGroup,
                    rights: [right],
                    level: current.level + 1,
                    childId: current.groupId,
                  });
                }
                queue.push({
                  groupId: rel.parentGroup.id,
                  level: current.level + 1,
                  right,
                });
              }
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
              (rel: any) =>
                rel.parentGroup?.id === current.groupId && rel.rightType === current.right
            );

            currentChildren.forEach((rel: any) => {
              if (!visited.has(rel.childGroup.id)) {
                visited.add(rel.childGroup.id);
                const existing = childrenMap.get(rel.childGroup.id);
                if (existing) {
                  if (!existing.rights.includes(right)) {
                    existing.rights.push(right);
                  }
                  existing.level = Math.min(existing.level, current.level + 1);
                } else {
                  childrenMap.set(rel.childGroup.id, {
                    group: rel.childGroup,
                    rights: [right],
                    level: current.level + 1,
                    parentId: current.groupId,
                  });
                }
                queue.push({
                  groupId: rel.childGroup.id,
                  level: current.level + 1,
                  right,
                });
              }
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
        label: event.title,
        description: event.description,
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
        label: group.name,
        description: group.description,
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
    parents.forEach((parent: any) => {
      const level = parent.level || 1;
      const yOffset = -150 * level;
      const totalAtLevel = parents.filter((p: any) => (p.level || 1) === level).length;
      const indexAtLevel = parents
        .filter((p: any) => (p.level || 1) === level)
        .findIndex((p: any) => p.group.id === parent.group.id);
      const xOffset = (indexAtLevel - (totalAtLevel - 1) / 2) * 250;

      newNodes.push({
        id: parent.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 450 + yOffset },
        data: {
          label: parent.group.name,
          description: parent.group.description,
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

      const rightsText = formatRights(parent.rights);
      newEdges.push({
        id: `${parent.group.id}-${parent.childId || group.id}`,
        source: parent.group.id,
        target: parent.childId || group.id,
        type: 'smoothstep',
        animated: true,
        label: rightsText,
        data: { rights: parent.rights },
        style: { stroke: '#fbc02d', strokeWidth: 2 },
        labelStyle: { fontSize: '9px', fontWeight: 'bold' },
        labelBgStyle: { fill: '#fff9c4' },
      });
    });

    // Add child nodes
    children.forEach((child: any) => {
      const level = child.level || 1;
      const yOffset = 150 * level;
      const totalAtLevel = children.filter((c: any) => (c.level || 1) === level).length;
      const indexAtLevel = children
        .filter((c: any) => (c.level || 1) === level)
        .findIndex((c: any) => c.group.id === child.group.id);
      const xOffset = (indexAtLevel - (totalAtLevel - 1) / 2) * 250;

      newNodes.push({
        id: child.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 450 + yOffset },
        data: {
          label: child.group.name,
          description: child.group.description,
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

      const rightsText = formatRights(child.rights);
      newEdges.push({
        id: `${child.parentId || group.id}-${child.group.id}`,
        source: child.parentId || group.id,
        target: child.group.id,
        type: 'smoothstep',
        animated: true,
        label: rightsText,
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
          label: formatRights(visibleRights),
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
    (_event: any, node: Node) => {
      if (!isInteractive) return;

      if (node.data.type === 'event') {
        setSelectedEntity({
          type: 'event',
          data: event,
        });
        setDialogOpen(true);
      } else if (node.data.type === 'group' && node.data.groupData) {
        setSelectedEntity({
          type: 'group',
          data: node.data.groupData,
        });
        setDialogOpen(true);
      }
    },
    [isInteractive, event]
  );

  // Handle edge click
  const onEdgeClick = useCallback(
    (_event: any, edge: Edge) => {
      if (!isInteractive) return;

      setSelectedEntity({
        type: 'relationship',
        data: {
          source: edge.source,
          target: edge.target,
          rights: edge.data?.rights || [],
          label: edge.label,
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

  if (eventLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-muted-foreground">Loading event network...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">This event is not associated with a group</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Network visualization is only available for events that belong to a group
          </p>
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
        <div className="absolute right-4 top-4 z-10 w-72 rounded-lg border bg-white shadow-lg">
          {/* Header */}
          <div
            className="flex cursor-pointer items-center justify-between border-b p-4"
            onClick={() => setPanelCollapsed(!panelCollapsed)}
          >
            <h3 className="font-semibold">Network Controls</h3>
            {panelCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </div>

          {/* Content */}
          {!panelCollapsed && (
            <div className="space-y-4 p-4">
              {/* Show Indirect Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="show-indirect">Show Indirect</Label>
                <Switch
                  id="show-indirect"
                  checked={showIndirect}
                  onCheckedChange={setShowIndirect}
                />
              </div>

              {/* Rights Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Rights:</Label>
                {RIGHT_TYPES.map(right => (
                  <div key={right} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`right-${right}`}
                      checked={selectedRights.has(right)}
                      onChange={() => toggleRight(right)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`right-${right}`} className="text-sm">
                      {formatRights([right])}
                    </label>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="space-y-2 border-t pt-4">
                <div
                  className="flex cursor-pointer items-center justify-between"
                  onClick={() => setLegendCollapsed(!legendCollapsed)}
                >
                  <Label className="text-sm font-medium">Legend</Label>
                  {legendCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
                {!legendCollapsed && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded border-2 border-[#66bb6a] bg-[#e8f5e9]"></div>
                      <span>Event (Center)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded border border-[#90caf9] bg-[#bbdefb]"></div>
                      <span>Event's Group</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded border border-[#fbc02d] bg-[#fff9c4]"></div>
                      <span>Parent Groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded border border-[#4caf50] bg-[#c8e6c9]"></div>
                      <span>Child Groups</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      }
    >
      <NetworkEntityDialog open={dialogOpen} onOpenChange={setDialogOpen} entity={selectedEntity} />
    </NetworkFlowBase>
  );
}
