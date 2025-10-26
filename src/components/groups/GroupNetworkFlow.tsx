'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import db from '../../../db';

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

  // Build direct relationships
  const getDirectRelationships = useCallback(
    (targetGroupId: string) => {
      const parentsMap = new Map<string, { group: any; rights: string[] }>();
      const childrenMap = new Map<string, { group: any; rights: string[] }>();

      relationships.forEach((rel: any) => {
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
    [relationships]
  );

  // Build indirect (recursive) relationships
  const getIndirectRelationships = useCallback(
    (targetGroupId: string) => {
      const visited = new Set<string>();
      const parentsMap = new Map<
        string,
        { group: any; rights: string[]; level: number; parentId?: string }
      >();
      const childrenMap = new Map<
        string,
        { group: any; rights: string[]; level: number; parentId?: string }
      >();

      const findParents = (id: string, level = 1, currentParentId?: string) => {
        if (visited.has(id)) return;
        visited.add(id);

        relationships.forEach((rel: any) => {
          if (rel.childGroup?.id === id && !visited.has(rel.parentGroup?.id)) {
            const parentId = rel.parentGroup?.id;
            if (!parentId) return;

            if (!parentsMap.has(parentId)) {
              parentsMap.set(parentId, {
                group: rel.parentGroup,
                rights: [],
                level,
                parentId: currentParentId,
              });
            }
            const parentEntry = parentsMap.get(parentId);
            if (parentEntry) {
              parentEntry.rights.push(rel.withRight);
            }
            findParents(parentId, level + 1, id);
          }
        });
      };

      const findChildren = (id: string, level = 1, currentParentId?: string) => {
        relationships.forEach((rel: any) => {
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

      findParents(targetGroupId);
      visited.clear();
      visited.add(targetGroupId);
      findChildren(targetGroupId);

      return {
        parents: Array.from(parentsMap.values()),
        children: Array.from(childrenMap.values()),
      };
    },
    [relationships]
  );

  // Helper to format rights for display
  const formatRights = (rights: string[]) => {
    const labels: Record<string, string> = {
      informationRight: 'Info',
      amendmentRight: 'Antrag',
      rightToSpeak: 'Rede',
      activeVotingRight: 'Aktiv',
      passiveVotingRight: 'Passiv',
    };
    return rights.map(r => labels[r] || r).join(', ');
  };

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

      const edgeTarget = showIndirect && parent.parentId ? parent.parentId : groupId;

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
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [
    group,
    groupId,
    showIndirect,
    getDirectRelationships,
    getIndirectRelationships,
    setNodes,
    setEdges,
  ]);

  // Generate flow chart when group or showIndirect changes
  useEffect(() => {
    generateFlowChart();
  }, [generateFlowChart]);

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: any, node: Node) => {
      if (!isInteractive) return;
      setSelectedNodes(prev => {
        if (prev.includes(node.id)) {
          return prev.filter(id => id !== node.id);
        }
        return [...prev, node.id];
      });
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
    <div className="h-[600px] w-full rounded-lg border bg-background">
      <ReactFlow
        nodes={nodes.map(node => ({
          ...node,
          style: {
            ...node.style,
            boxShadow: selectedNodes.includes(node.id) ? '0 0 0 2px #ff0072' : undefined,
          },
        }))}
        edges={edges}
        nodesDraggable={isInteractive}
        nodesFocusable={isInteractive}
        nodesConnectable={isInteractive}
        edgesFocusable={isInteractive}
        onNodesChange={isInteractive ? onNodesChange : undefined}
        onEdgesChange={isInteractive ? onEdgesChange : undefined}
        onNodeClick={onNodeClick}
        fitView
      >
        {/* Control Panel - top left */}
        <Panel position="top-left" className="rounded bg-white p-4 shadow">
          <h2 className="mb-2 text-lg font-bold">Gruppennetzwerk</h2>
          <p className="mb-3 text-sm text-gray-600">
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

          {/* Color legend */}
          <div className="mt-3 space-y-2 text-sm">
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
        </Panel>

        <Controls onInteractiveChange={handleInteractiveChange} />
        <MiniMap zoomable pannable />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}
