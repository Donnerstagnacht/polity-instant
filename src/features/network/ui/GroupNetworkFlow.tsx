'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Node, Edge, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import { NetworkFlowBase } from '@/features/network/ui/NetworkFlowBase';
import { RIGHT_TYPES } from '@/features/network/ui/RightFilters';
import { getGroupDisplayLabel, renderRightsEdgeLabel } from '@/features/network/ui/networkVisualHelpers';
import { NetworkControlPanel } from '@/features/network/ui/NetworkControlPanel';
import { NetworkEntityDialog, type NetworkDialogEntity } from '@/features/network/ui/NetworkEntityDialog';
import { useGroupState } from '@/zero/groups/useGroupState';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { normalizeGroupRelationship, type NormalizedGroupRelationship, type NetworkGroupEntity } from '../types/network.types';

interface GroupNode extends Node {
  data: {
    label: string;
    description?: string;
    level: number;
    role?: 'parent' | 'child' | 'center';
    groupType?: 'base' | 'hierarchical';
  };
}

interface GroupNetworkFlowProps {
  groupId: string;
}

export function GroupNetworkFlow({ groupId }: GroupNetworkFlowProps) {
  const { t } = useTranslation();
  const [showIndirect, setShowIndirect] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState<GroupNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isInteractive, setIsInteractive] = useState<boolean>(true);
  const [selectedRights, setSelectedRights] = useState<Set<string>>(new Set(RIGHT_TYPES));
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<NetworkDialogEntity | null>(null);

  // Fetch the specific group and relationships (both directions)
  const { group, relationships: relationshipsRaw, relationshipsAsTarget: relationshipsAsTargetRaw } = useGroupState({ groupId });

  const relationships = useMemo(
    () => [
      ...(relationshipsRaw || []).map(rel => normalizeGroupRelationship(rel)),
      ...(relationshipsAsTargetRaw || []).map(rel => normalizeGroupRelationship(rel)),
    ],
    [relationshipsRaw, relationshipsAsTargetRaw],
  ) as NormalizedGroupRelationship[];

  // Memoize relationships to prevent infinite loops
  // Only recreate when the actual relationship IDs change
  const stableRelationships = useMemo(() => {
    return relationships.filter((r) => !r.status || r.status === 'active');
  }, [
    relationships
  ]);

  // Build direct relationships
  const getDirectRelationships = useCallback(
    (targetGroupId: string) => {
      const parentsMap = new Map<string, { group: NetworkGroupEntity; rights: string[]; level?: number; childId?: string }>();
      const childrenMap = new Map<string, { group: NetworkGroupEntity; rights: string[]; level?: number; parentId?: string }>();

      stableRelationships.forEach((rel) => {
        if (rel.related_group?.id === targetGroupId) {
          // This is a parent relationship
          const parentId = rel.group?.id;
          if (!parentId) return;

          if (!parentsMap.has(parentId) && rel.group) {
            parentsMap.set(parentId, { group: rel.group, rights: [] });
          }
          const parentEntry = parentsMap.get(parentId);
          if (parentEntry) {
            parentEntry.rights.push(rel.with_right ?? '');
          }
        }
        if (rel.group?.id === targetGroupId) {
          // This is a child relationship
          const childId = rel.related_group?.id;
          if (!childId) return;

          if (!childrenMap.has(childId) && rel.related_group) {
            childrenMap.set(childId, { group: rel.related_group, rights: [] });
          }
          const childEntry = childrenMap.get(childId);
          if (childEntry) {
            childEntry.rights.push(rel.with_right ?? '');
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
        { group: NetworkGroupEntity; rights: string[]; level: number; childId?: string }
      >();
      const childrenMap = new Map<
        string,
        { group: NetworkGroupEntity; rights: string[]; level: number; parentId?: string }
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
            stableRelationships.forEach((rel) => {
              if (
                rel.related_group?.id === id &&
                (rel.with_right ?? '') === right &&
                rel.group?.id && !visited.has(rel.group.id)
              ) {
                const parentId = rel.group.id;

                visited.add(parentId);

                // Add or update parent in map
                if (!parentsMap.has(parentId)) {
                  parentsMap.set(parentId, {
                    group: rel.group,
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
            stableRelationships.forEach((rel) => {
              if (
                rel.group?.id === id &&
                (rel.with_right ?? '') === right &&
                rel.related_group?.id && !visited.has(rel.related_group.id)
              ) {
                const childId = rel.related_group.id;

                visited.add(childId);

                // Add or update child in map
                if (!childrenMap.has(childId)) {
                  childrenMap.set(childId, {
                    group: rel.related_group,
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
        label: getGroupDisplayLabel(group.name, (group as { group_type?: string }).group_type),
        description: group.description ?? '',
        level: 0,
        role: 'center',
        groupType: (group as { group_type?: string }).group_type === 'hierarchical' ? 'hierarchical' : 'base',
      },
      style: {
        background: '#bbdefb',
        color: '#333',
        border: (group as { group_type?: string }).group_type === 'hierarchical' ? '3px dashed #64b5f6' : '2px solid #90caf9',
        borderRadius: '5px',
        padding: '10px',
        fontSize: '14px',
        fontWeight: 'bold',
        width: 180,
        textAlign: 'center',
      },
    });

    // Add parent nodes
    parents.forEach((parent, index: number) => {
      const level = parent.level || 1;
      const yOffset = -150 * level;
      const xOffset = (index - parents.length / 2) * 200;

      // Use a unique ID for the parent node instance in the graph
      const parentNodeId = `parent-${parent.group.id}`;

      const isHierarchical = parent.group.group_type === 'hierarchical';

      newNodes.push({
        id: parentNodeId,
        type: 'default',
        position: { x: 400 + xOffset, y: 300 + yOffset },
        data: {
          label: getGroupDisplayLabel(parent.group.name, parent.group.group_type),
          description: parent.group.description ?? undefined,
          level,
          role: 'parent',
          groupType: isHierarchical ? 'hierarchical' : 'base',
        },
        style: {
          background: '#c8e6c9',
          color: '#333',
          border: isHierarchical ? '3px dashed #81c784' : '2px solid #a5d6a7',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: '500',
          width: 180,
          textAlign: 'center',
        },
      });

      let edgeTarget = groupId;
      if (showIndirect && parent.childId && parent.childId !== groupId) {
          // If it's an indirect connection, the target is another parent node
          edgeTarget = `parent-${parent.childId}`;
      }

      newEdges.push({
        id: `edge-parent-${parent.group.id}-to-${edgeTarget}`,
        source: parentNodeId,
        target: edgeTarget,
        type: 'smoothstep',
        animated: true,
        label: renderRightsEdgeLabel(parent.rights),
        style: { stroke: '#66bb6a', strokeWidth: 2, strokeDasharray: '5 5' },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.9,
        },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 6,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#66bb6a',
        },
        data: { rights: parent.rights }, // Store rights in edge data
      });
    });

    // Add child nodes
    children.forEach((child, index: number) => {
      const level = child.level || 1;
      const yOffset = 150 * level;
      const xOffset = (index - children.length / 2) * 200;

      const childNodeId = `child-${child.group.id}`;
      const isHierarchicalChild = child.group.group_type === 'hierarchical';

      newNodes.push({
        id: childNodeId,
        type: 'default',
        position: { x: 400 + xOffset, y: 300 + yOffset },
        data: {
          label: getGroupDisplayLabel(child.group.name, child.group.group_type),
          description: child.group.description ?? undefined,
          level,
          role: 'child',
          groupType: isHierarchicalChild ? 'hierarchical' : 'base',
        },
        style: {
          background: '#ffe0b2',
          color: '#333',
          border: isHierarchicalChild ? '3px dashed #ffa726' : '2px solid #ffcc80',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: '500',
          width: 180,
          textAlign: 'center',
        },
      });

      let edgeSource = groupId;
      if (showIndirect && child.parentId && child.parentId !== groupId) {
           edgeSource = `child-${child.parentId}`;
      }

      newEdges.push({
        id: `edge-${edgeSource}-to-child-${child.group.id}`,
        source: edgeSource,
        target: childNodeId,
        type: 'smoothstep',
        animated: true,
        label: renderRightsEdgeLabel(child.rights),
        style: { stroke: '#ffb74d', strokeWidth: 2, strokeDasharray: '5 5' },
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.9,
        },
        labelBgPadding: [6, 3] as [number, number],
        labelBgBorderRadius: 6,
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
          label: renderRightsEdgeLabel(visibleRights),
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
    (_event: React.MouseEvent, node: Node) => {
      if (!isInteractive) return;

      const nodeData = node.data as GroupNode['data'];

      const rawId = node.id.replace(/^(parent-|child-)/, '');

      // Find the group data from relationships
      const nodeGroup = stableRelationships.find(
        (rel) => rel.group_id === rawId || rel.related_group_id === rawId
      );

      const groupData = nodeGroup
        ? { id: rawId, name: nodeData.label, description: nodeData.description ?? null }
        : (node.id === groupId || rawId === groupId ? group : null);

      if (groupData) {
        setSelectedEntity({ type: 'group', data: groupData });
        setDialogOpen(true);
      }
    },
    [isInteractive, stableRelationships, groupId, group]
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

  if (!group) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center rounded-lg border bg-background">
        <p className="text-muted-foreground">{t('common.network.loadingGroupNetwork')}</p>
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
          title={t('common.network.groupNetwork')}
          description={t('common.network.groupNetworkDescription', { groupName: group.name })}
          panelCollapsed={panelCollapsed}
          onPanelCollapsedChange={setPanelCollapsed}
          legendCollapsed={legendCollapsed}
          onLegendCollapsedChange={setLegendCollapsed}
          legendTitle={t('common.network.legend')}
          legendItems={[
            {
              id: 'parent-groups',
              label: t('common.network.parentGroups'),
              swatchClassName: 'h-4 w-4 rounded border border-[#a5d6a7] bg-[#c8e6c9]',
            },
            {
              id: 'selected-group',
              label: t('common.network.selectedGroup'),
              swatchClassName: 'h-4 w-4 rounded border border-[#90caf9] bg-[#bbdefb]',
            },
            {
              id: 'child-groups',
              label: t('common.network.childGroups'),
              swatchClassName: 'h-4 w-4 rounded border border-[#ffcc80] bg-[#ffe0b2]',
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
