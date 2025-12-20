'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Node, Edge, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { NetworkFlowBase, Panel } from '@/components/shared/NetworkFlowBase';
import { RightFilters, formatRights, RIGHT_TYPES } from '@/components/shared/RightFilters';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { NetworkEntityDialog } from '@/components/shared/NetworkEntityDialog';
import db from '../../../db/db';

interface GroupNode extends Node {
  data: {
    label: string;
    description?: string;
    level: number;
  };
}

interface GroupNetworkFlowProps {
  groupId: string;
}

export function GroupNetworkFlow({ groupId }: GroupNetworkFlowProps) {
  const [showIndirect, setShowIndirect] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<GroupNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);
  const [selectedRights, setSelectedRights] = useState<Set<string>>(new Set(RIGHT_TYPES));
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'group' | 'relationship';
    data: any;
  } | null>(null);

  // Fetch the specific group
  const { data: groupData } = db.useQuery({
    groups: {
      $: { where: { id: groupId } },
    },
  });

  // Fetch group relationships
  const { data: relationshipsData } = db.useQuery({
    groupRelationships: {
      parentGroup: {},
      childGroup: {},
    },
  });

  const group = groupData?.groups?.[0];
  const relationships = relationshipsData?.groupRelationships || [];

  // Memoize relationships to prevent infinite loops
  // Only recreate when the actual relationship IDs change
  const stableRelationships = useMemo(() => {
    return relationships;
  }, [
    relationships.length,
    // Create a stable key from relationship IDs
    relationships.map(r => `${r.id}-${r.parentGroup?.id}-${r.childGroup?.id}`).join(','),
  ]);

  // Build direct relationships
  const getDirectRelationships = useCallback(
    (targetGroupId: string) => {
      const parentsMap = new Map<string, { group: any; rights: string[] }>();
      const childrenMap = new Map<string, { group: any; rights: string[] }>();

      stableRelationships.forEach((rel: any) => {
        if (rel.childGroup?.id === targetGroupId) {
          // This is a parent relationship
          const parentId = rel.parentGroup?.id;
          if (!parentId) return;

          if (!parentsMap.has(parentId)) {
            parentsMap.set(parentId, { group: rel.parentGroup, rights: [] });
          }
          const parentEntry = parentsMap.get(parentId);
          if (parentEntry) {
            parentEntry.rights.push(rel.withRight);
          }
        }
        if (rel.parentGroup?.id === targetGroupId) {
          // This is a child relationship
          const childId = rel.childGroup?.id;
          if (!childId) return;

          if (!childrenMap.has(childId)) {
            childrenMap.set(childId, { group: rel.childGroup, rights: [] });
          }
          const childEntry = childrenMap.get(childId);
          if (childEntry) {
            childEntry.rights.push(rel.withRight);
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

      // First, get all direct relationships and their rights
      const directRels = getDirectRelationships(targetGroupId);

      // For parents: Add direct parents first (level 1), then follow chains for each right type
      directRels.parents.forEach(parent => {
        // Add the direct parent at level 1 with all its rights
        parentsMap.set(parent.group.id, {
          group: parent.group,
          rights: [...parent.rights],
          level: 1,
          childId: targetGroupId,
        });

        // Now follow each right type chain separately
        parent.rights.forEach(right => {
          const visited = new Set<string>();
          visited.add(targetGroupId);
          visited.add(parent.group.id); // Mark direct parent as visited

          const findParentsForRight = (id: string, level: number) => {
            stableRelationships.forEach((rel: any) => {
              if (
                rel.childGroup?.id === id &&
                rel.withRight === right &&
                !visited.has(rel.parentGroup?.id)
              ) {
                const parentId = rel.parentGroup?.id;
                if (!parentId) return;

                visited.add(parentId);

                // Add or update parent in map
                if (!parentsMap.has(parentId)) {
                  parentsMap.set(parentId, {
                    group: rel.parentGroup,
                    rights: [],
                    level,
                    childId: id,
                  });
                }
                const parentEntry = parentsMap.get(parentId);
                if (parentEntry && !parentEntry.rights.includes(right)) {
                  parentEntry.rights.push(right);
                }

                // Continue searching with the same right type
                findParentsForRight(parentId, level + 1);
              }
            });
          };

          // Start from the direct parent to find its ancestors
          findParentsForRight(parent.group.id, 2);
        });
      });

      // For children: Add direct children first (level 1), then follow chains for each right type
      directRels.children.forEach(child => {
        // Add the direct child at level 1 with all its rights
        childrenMap.set(child.group.id, {
          group: child.group,
          rights: [...child.rights],
          level: 1,
          parentId: targetGroupId,
        });

        // Now follow each right type chain separately
        child.rights.forEach(right => {
          const visited = new Set<string>();
          visited.add(targetGroupId);
          visited.add(child.group.id); // Mark direct child as visited

          const findChildrenForRight = (id: string, level: number, currentParentId: string) => {
            stableRelationships.forEach((rel: any) => {
              if (
                rel.parentGroup?.id === id &&
                rel.withRight === right &&
                !visited.has(rel.childGroup?.id)
              ) {
                const childId = rel.childGroup?.id;
                if (!childId) return;

                visited.add(childId);

                // Add or update child in map
                if (!childrenMap.has(childId)) {
                  childrenMap.set(childId, {
                    group: rel.childGroup,
                    rights: [],
                    level,
                    parentId: currentParentId,
                  });
                }
                const childEntry = childrenMap.get(childId);
                if (childEntry && !childEntry.rights.includes(right)) {
                  childEntry.rights.push(right);
                }

                // Continue searching with the same right type
                findChildrenForRight(childId, level + 1, childId);
              }
            });
          };

          // Start from the direct child to find its descendants
          findChildrenForRight(child.group.id, 2, child.group.id);
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
    if (!group) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { parents, children } = showIndirect
      ? getIndirectRelationships(groupId)
      : getDirectRelationships(groupId);

    const newNodes: GroupNode[] = [];
    const newEdges: Edge[] = [];

    // Add center node (selected group)
    newNodes.push({
      id: groupId,
      type: 'default',
      position: { x: 400, y: 300 },
      data: {
        label: group.name,
        description: group.description,
        level: 0,
      },
      style: {
        background: '#bbdefb',
        color: '#333',
        border: '2px solid #90caf9',
        borderRadius: '5px',
        padding: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        width: 180,
        textAlign: 'center',
      },
    });

    // Add parent nodes
    parents.forEach((parent: any, index: number) => {
      const level = parent.level || 1;
      const yOffset = -150 * level;
      const xOffset = (index - parents.length / 2) * 200;

      newNodes.push({
        id: parent.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 300 + yOffset },
        data: {
          label: parent.group.name,
          description: parent.group.description,
          level,
        },
        style: {
          background: '#c8e6c9',
          color: '#333',
          border: '2px solid #a5d6a7',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: '500',
          width: 180,
          textAlign: 'center',
        },
      });

      const edgeTarget = showIndirect && parent.childId ? parent.childId : groupId;

      newEdges.push({
        id: `edge-parent-${parent.group.id}-to-${edgeTarget}`,
        source: parent.group.id,
        target: edgeTarget,
        type: 'smoothstep',
        animated: true,
        label: formatRights(parent.rights),
        style: { stroke: '#66bb6a', strokeWidth: 2, strokeDasharray: '5 5' },
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
        data: { rights: parent.rights }, // Store rights in edge data
      });
    });

    // Add child nodes
    children.forEach((child: any, index: number) => {
      const level = child.level || 1;
      const yOffset = 150 * level;
      const xOffset = (index - children.length / 2) * 200;

      newNodes.push({
        id: child.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 300 + yOffset },
        data: {
          label: child.group.name,
          description: child.group.description,
          level,
        },
        style: {
          background: '#ffe0b2',
          color: '#333',
          border: '2px solid #ffcc80',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: '500',
          width: 180,
          textAlign: 'center',
        },
      });

      const edgeSource = showIndirect && child.parentId ? child.parentId : groupId;

      newEdges.push({
        id: `edge-${edgeSource}-to-child-${child.group.id}`,
        source: edgeSource,
        target: child.group.id,
        type: 'smoothstep',
        animated: true,
        label: formatRights(child.rights),
        style: { stroke: '#ffb74d', strokeWidth: 2, strokeDasharray: '5 5' },
        labelStyle: {
          fill: '#f57c00',
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
          color: '#ffb74d',
        },
        data: { rights: child.rights }, // Store rights in edge data
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [group, groupId, showIndirect, getDirectRelationships, getIndirectRelationships]);

  // Filter edges based on selected rights
  const filteredEdges = useMemo(() => {
    return edges
      .map(edge => {
        if (!edge.data?.rights) return edge;

        // Filter to only show selected rights
        const visibleRights = (edge.data.rights as string[]).filter(right =>
          selectedRights.has(right)
        );

        // If no rights are visible, don't show this edge
        if (visibleRights.length === 0) return null;

        // Return edge with filtered label
        return {
          ...edge,
          label: formatRights(visibleRights),
          data: { ...edge.data, visibleRights },
        };
      })
      .filter((edge): edge is Edge => edge !== null);
  }, [edges, selectedRights]);

  // Filter nodes to only show those connected via visible edges
  const filteredNodes = useMemo(() => {
    // Build a set of node IDs that have at least one visible edge
    const connectedNodeIds = new Set<string>();

    // Always include the center node (groupId)
    connectedNodeIds.add(groupId);

    // Add nodes that are source or target of visible edges
    filteredEdges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    return nodes.filter(node => connectedNodeIds.has(node.id));
  }, [nodes, filteredEdges, groupId]);

  // Generate flow chart when group or showIndirect changes
  useEffect(() => {
    generateFlowChart();
  }, [generateFlowChart]);

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: any, node: Node) => {
      if (!isInteractive) return;

      // Find the group data from relationships
      const nodeGroup = stableRelationships.find(
        (rel: any) => rel.parentGroup?.id === node.id || rel.childGroup?.id === node.id
      );

      const groupData =
        nodeGroup?.parentGroup?.id === node.id
          ? nodeGroup.parentGroup
          : nodeGroup?.childGroup || (node.id === groupId ? group : null);

      if (groupData) {
        setSelectedEntity({ type: 'group', data: groupData });
        setDialogOpen(true);
      }
    },
    [isInteractive, stableRelationships, groupId, group]
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

  if (!group) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-background">
        <p className="text-muted-foreground">Loading group network...</p>
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
        <Panel position="top-left" className="rounded bg-white p-4 shadow dark:bg-background">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold">Gruppennetzwerk</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPanelCollapsed(!panelCollapsed)}
              className="h-6 w-6 p-0"
            >
              {panelCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!panelCollapsed && (
            <>
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                Visualisierung der Beziehungen von {group.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {isInteractive && (
                  <>
                    <Button
                      size="sm"
                      variant={!showIndirect ? 'default' : 'outline'}
                      onClick={() => setShowIndirect(false)}
                    >
                      Direkte
                    </Button>
                    <Button
                      size="sm"
                      variant={showIndirect ? 'default' : 'outline'}
                      onClick={() => setShowIndirect(true)}
                    >
                      Indirekte
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant={isInteractive ? 'outline' : 'default'}
                  onClick={() => setIsInteractive(!isInteractive)}
                >
                  {isInteractive ? 'Lock Editor' : 'Unlock Editor'}
                </Button>
              </div>

              {/* Right type filters */}
              <RightFilters selectedRights={selectedRights} onToggleRight={toggleRight} />

              {/* Color legend */}
              <div className="mt-3">
                <button
                  onClick={() => setLegendCollapsed(!legendCollapsed)}
                  className="flex w-full items-center justify-between text-sm font-medium hover:text-primary"
                >
                  <span>Legende</span>
                  {legendCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </button>
                {!legendCollapsed && (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-[#a5d6a7] bg-[#c8e6c9]"></div>
                      <span>Übergeordnet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-[#90caf9] bg-[#bbdefb]"></div>
                      <span>Ausgewählt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-[#ffcc80] bg-[#ffe0b2]"></div>
                      <span>Untergeordnet</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Panel>
      }
    >
      <NetworkEntityDialog open={dialogOpen} onOpenChange={setDialogOpen} entity={selectedEntity} />
    </NetworkFlowBase>
  );
}
