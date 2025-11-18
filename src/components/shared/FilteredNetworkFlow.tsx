'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Node, Edge, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { NetworkFlowBase, Panel } from '@/components/shared/NetworkFlowBase';
import {
  RightFilters,
  formatRights,
  isEdgeVisible,
  RIGHT_TYPES,
} from '@/components/shared/RightFilters';
import { ChevronDown, ChevronUp } from 'lucide-react';
import db from '../../../db';

interface NetworkNode extends Node {
  data: {
    label: string;
    description?: string;
    level: number;
    type: 'user' | 'group';
    groupData?: any;
  };
}

interface FilteredNetworkFlowProps {
  userId: string;
  filterRight?: string; // Filter by specific right type (e.g., 'amendmentRight')
  onGroupClick?: (groupId: string, groupData: any) => void;
  title?: string;
  description?: string;
}

export function FilteredNetworkFlow({
  userId,
  filterRight,
  onGroupClick,
  title = 'Network',
  description,
}: FilteredNetworkFlowProps) {
  const [showIndirect, setShowIndirect] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<NetworkNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);
  const [selectedRights, setSelectedRights] = useState<Set<string>>(new Set(RIGHT_TYPES));
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Fetch the specific user
  const { data: userData } = db.useQuery({
    $users: {
      $: { where: { id: userId } },
      memberships: {
        group: {},
      },
    },
  });

  // Fetch all group relationships
  const { data: relationshipsData } = db.useQuery({
    groupRelationships: {
      parentGroup: {},
      childGroup: {},
    },
  });

  const user = userData?.$users?.[0];
  const memberships = user?.memberships || [];
  const relationships = relationshipsData?.groupRelationships || [];

  // Get all groups the user is a member of
  const userGroups = useMemo(() => {
    if (!memberships.length) return [];
    return memberships
      .filter(
        (m: any) => m.group && (m.status === 'member' || m.status === 'admin' || m.role === 'admin')
      )
      .map((m: any) => m.group);
  }, [memberships.length, memberships.map((m: any) => `${m.id}-${m.status}-${m.role}`).join(',')]);

  // Memoize relationships to prevent infinite loops
  const stableRelationships = useMemo(() => {
    if (!relationships.length) return [];
    return relationships;
  }, [relationships.length, relationships.map((r: any) => r.id).join(',')]);

  // Build direct relationships for a group
  const getDirectGroupRelationships = useCallback(
    (groupId: string) => {
      const parentsMap = new Map<string, { group: any; rights: string[] }>();
      const childrenMap = new Map<string, { group: any; rights: string[] }>();

      stableRelationships.forEach((rel: any) => {
        // Skip if filtering by right and this relationship doesn't have it
        if (filterRight && rel.withRight !== filterRight) {
          return;
        }

        if (rel.childGroup?.id === groupId) {
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
        if (rel.parentGroup?.id === groupId) {
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
    [stableRelationships, filterRight]
  );

  // Build indirect (recursive) relationships for a group
  const getIndirectGroupRelationships = useCallback(
    (groupId: string) => {
      const visited = new Set<string>();
      const parentsMap = new Map<
        string,
        { group: any; rights: string[]; level: number; childId?: string }
      >();
      const childrenMap = new Map<
        string,
        { group: any; rights: string[]; level: number; parentId?: string }
      >();

      const findParents = (id: string, level = 1) => {
        if (visited.has(id)) return;
        visited.add(id);

        stableRelationships.forEach((rel: any) => {
          // Skip if filtering by right and this relationship doesn't have it
          if (filterRight && rel.withRight !== filterRight) {
            return;
          }

          if (rel.childGroup?.id === id && !visited.has(rel.parentGroup?.id)) {
            const parentId = rel.parentGroup?.id;
            if (!parentId) return;

            if (!parentsMap.has(parentId)) {
              parentsMap.set(parentId, {
                group: rel.parentGroup,
                rights: [],
                level,
                childId: id,
              });
            }
            const parentEntry = parentsMap.get(parentId);
            if (parentEntry) {
              parentEntry.rights.push(rel.withRight);
            }
            findParents(parentId, level + 1);
          }
        });
      };

      const findChildren = (id: string, level = 1, currentParentId?: string) => {
        stableRelationships.forEach((rel: any) => {
          // Skip if filtering by right and this relationship doesn't have it
          if (filterRight && rel.withRight !== filterRight) {
            return;
          }

          if (rel.parentGroup?.id === id && !visited.has(rel.childGroup?.id)) {
            const childId = rel.childGroup?.id;
            if (!childId) return;

            visited.add(childId);
            if (!childrenMap.has(childId)) {
              childrenMap.set(childId, {
                group: rel.childGroup,
                rights: [],
                level,
                parentId: currentParentId,
              });
            }
            const childEntry = childrenMap.get(childId);
            if (childEntry) {
              childEntry.rights.push(rel.withRight);
            }
            findChildren(childId, level + 1, childId);
          }
        });
      };

      findParents(groupId);
      visited.clear();
      visited.add(groupId);
      findChildren(groupId);

      return {
        parents: Array.from(parentsMap.values()),
        children: Array.from(childrenMap.values()),
      };
    },
    [stableRelationships, filterRight]
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

  // Check if edge should be visible based on selected rights
  const checkEdgeVisible = useCallback(
    (rights: string[]) => {
      return isEdgeVisible(rights, selectedRights);
    },
    [selectedRights]
  );

  // Generate flow chart
  const generateFlowChart = useCallback(() => {
    if (!user) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes: NetworkNode[] = [];
    const allEdgesMap = new Map<string, Edge>();

    // Add center node (user)
    newNodes.push({
      id: userId,
      type: 'default',
      position: { x: 400, y: 300 },
      data: {
        label: user.name || 'User',
        description: user.subtitle,
        level: 0,
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

    // Add user's groups as first level
    const groupsPerRow = Math.ceil(Math.sqrt(userGroups.length));
    userGroups.forEach((group: any, index: number) => {
      const row = Math.floor(index / groupsPerRow);
      const col = index % groupsPerRow;
      const totalInRow = Math.min(groupsPerRow, userGroups.length - row * groupsPerRow);
      const xOffset = (col - (totalInRow - 1) / 2) * 250;
      const yOffset = 200 + row * 180;

      newNodes.push({
        id: group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 300 + yOffset },
        data: {
          label: group.name,
          description: group.description,
          level: 1,
          type: 'group',
          groupData: group,
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
          cursor: onGroupClick ? 'pointer' : 'default',
        },
      });

      // Add edge from user to group
      const edgeId = `edge-user-${userId}-to-group-${group.id}`;
      if (!allEdgesMap.has(edgeId)) {
        allEdgesMap.set(edgeId, {
          id: edgeId,
          source: userId,
          target: group.id,
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
          data: { rights: [] },
        });
      }
    });

    // Add parent and child groups for each user group
    const allRelatedGroups = new Map<string, any>();

    userGroups.forEach((group: any) => {
      const { parents, children } = showIndirect
        ? getIndirectGroupRelationships(group.id)
        : getDirectGroupRelationships(group.id);

      // Process parent groups
      parents.forEach((parent: any) => {
        if (
          !allRelatedGroups.has(parent.group.id) &&
          !userGroups.some((g: any) => g.id === parent.group.id)
        ) {
          allRelatedGroups.set(parent.group.id, {
            ...parent,
            isParent: true,
            connectedTo: group.id,
          });
        }

        const edgeTarget = showIndirect && parent.childId ? parent.childId : group.id;
        const edgeId = `edge-parent-${parent.group.id}-to-${edgeTarget}`;

        if (!allEdgesMap.has(edgeId)) {
          allEdgesMap.set(edgeId, {
            id: edgeId,
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
            data: { rights: parent.rights },
          });
        }
      });

      // Process child groups
      children.forEach((child: any) => {
        if (
          !allRelatedGroups.has(child.group.id) &&
          !userGroups.some((g: any) => g.id === child.group.id)
        ) {
          allRelatedGroups.set(child.group.id, {
            ...child,
            isParent: false,
            connectedTo: group.id,
          });
        }

        const edgeSource = showIndirect && child.parentId ? child.parentId : group.id;
        const edgeId = `edge-${edgeSource}-to-child-${child.group.id}`;

        if (!allEdgesMap.has(edgeId)) {
          allEdgesMap.set(edgeId, {
            id: edgeId,
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
            data: { rights: child.rights },
          });
        }
      });
    });

    // Position related groups
    const relatedGroupsArray = Array.from(allRelatedGroups.values());
    const parentGroups = relatedGroupsArray.filter(g => g.isParent);
    const childGroups = relatedGroupsArray.filter(g => !g.isParent);

    // Position parent groups above user groups
    parentGroups.forEach((parent: any, index: number) => {
      const level = parent.level || 1;
      const yOffset = -150 * level - 50;
      const xOffset = (index - parentGroups.length / 2) * 220;

      newNodes.push({
        id: parent.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 300 + yOffset },
        data: {
          label: parent.group.name,
          description: parent.group.description,
          level,
          type: 'group',
          groupData: parent.group,
        },
        style: {
          background: '#b2dfdb',
          color: '#333',
          border: '2px solid #80cbc4',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: '500',
          width: 180,
          textAlign: 'center',
          cursor: onGroupClick ? 'pointer' : 'default',
        },
      });
    });

    // Position child groups below user groups
    childGroups.forEach((child: any, index: number) => {
      const level = child.level || 1;
      const baseYOffset = 200 + Math.ceil(userGroups.length / groupsPerRow) * 180;
      const yOffset = baseYOffset + 100 * level;
      const xOffset = (index - childGroups.length / 2) * 220;

      newNodes.push({
        id: child.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 300 + yOffset },
        data: {
          label: child.group.name,
          description: child.group.description,
          level,
          type: 'group',
          groupData: child.group,
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
          cursor: onGroupClick ? 'pointer' : 'default',
        },
      });
    });

    setNodes(newNodes);
    setEdges(Array.from(allEdgesMap.values()));
  }, [
    user,
    userId,
    userGroups,
    showIndirect,
    getDirectGroupRelationships,
    getIndirectGroupRelationships,
    onGroupClick,
  ]);

  // Filter edges based on selected rights
  const filteredEdges = useMemo(() => {
    return edges.filter(edge => {
      if (!edge.data?.rights) return true;
      if ((edge.data.rights as string[]).length === 0) return true;
      return checkEdgeVisible(edge.data.rights as string[]);
    });
  }, [edges, checkEdgeVisible]);

  // Generate flow chart when data or showIndirect changes
  useEffect(() => {
    generateFlowChart();
  }, [generateFlowChart]);

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: any, node: Node) => {
      if (!isInteractive) return;

      // If this is a group and onGroupClick is provided, call it
      if (node.data.type === 'group' && onGroupClick) {
        onGroupClick(node.id, node.data.groupData);
      }

      setSelectedNodes(prev => {
        if (prev.includes(node.id)) {
          return prev.filter(id => id !== node.id);
        }
        return [...prev, node.id];
      });
    },
    [isInteractive, onGroupClick]
  );

  // Handle interactive mode changes
  const handleInteractiveChange = useCallback((interactiveState: boolean) => {
    setIsInteractive(interactiveState);
    if (!interactiveState) {
      setSelectedNodes([]);
    }
  }, []);

  if (!user) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-background">
        <p className="text-muted-foreground">Loading network...</p>
      </div>
    );
  }

  return (
    <NetworkFlowBase
      nodes={nodes.map(node => ({
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
      onInteractiveChange={handleInteractiveChange}
      panel={
        <Panel position="top-left" className="rounded bg-white p-4 shadow">
          {panelCollapsed ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPanelCollapsed(false)}
              className="flex items-center gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              Show Controls
            </Button>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">{title}</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setPanelCollapsed(true)}
                  className="h-6 w-6 p-0"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
              {description && <p className="mb-3 text-sm text-gray-600">{description}</p>}
              <div className="flex flex-wrap gap-2">
                {isInteractive && (
                  <>
                    <Button
                      size="sm"
                      variant={!showIndirect ? 'default' : 'outline'}
                      onClick={() => setShowIndirect(false)}
                    >
                      Direct
                    </Button>
                    <Button
                      size="sm"
                      variant={showIndirect ? 'default' : 'outline'}
                      onClick={() => setShowIndirect(true)}
                    >
                      Indirect
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

              {/* Right type filters - only show if not filtering by specific right */}
              {!filterRight && (
                <RightFilters selectedRights={selectedRights} onToggleRight={toggleRight} />
              )}

              {filterRight && (
                <div className="mt-3 text-sm text-muted-foreground">
                  Filtered by: {filterRight.replace('Right', '')}
                </div>
              )}

              {/* Color legend */}
              <div className="mt-3">
                <button
                  onClick={() => setLegendCollapsed(!legendCollapsed)}
                  className="flex w-full items-center justify-between text-sm font-medium hover:text-primary"
                >
                  <span>Legend</span>
                  {legendCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </button>
                {!legendCollapsed && (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#2196f3] bg-[#e3f2fd]"></div>
                      <span>User</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-[#a5d6a7] bg-[#c8e6c9]"></div>
                      <span>User's Groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-[#80cbc4] bg-[#b2dfdb]"></div>
                      <span>Parent Groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-[#ffcc80] bg-[#ffe0b2]"></div>
                      <span>Child Groups</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Panel>
      }
    />
  );
}
