'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { Node, Edge, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import { NetworkFlowBase } from '@/features/network/ui/NetworkFlowBase';
import { getGroupDisplayLabel } from '@/features/network/ui/networkVisualHelpers';
import { NetworkControlPanel } from '@/features/network/ui/NetworkControlPanel';
import { NetworkEntityDialog } from '@/features/network/ui/NetworkEntityDialog';
import { useNetworkFlowControls } from '@/features/network/hooks/useNetworkFlowControls';
import { buildDirectRelationships, buildIndirectRelationships } from '@/features/network/logic/networkRelationshipHelpers';
import { filterEdgesByRights, filterNodesByEdges } from '@/features/network/logic/networkFilterHelpers';
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
  const [nodes, setNodes, onNodesChange] = useNodesState<GroupNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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

  // Generate flow chart
  const generateFlowChart = useCallback(() => {
    if (!group) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const { parents, children } = showIndirect
      ? buildIndirectRelationships(stableRelationships, groupId)
      : buildDirectRelationships(stableRelationships, groupId);

    const newNodes: GroupNode[] = [];
    const newEdges: Edge[] = [];

    // Build a name lookup for resolving edge source/target names
    const groupNameMap = new Map<string, string>();
    groupNameMap.set(groupId, group.name ?? '');
    parents.forEach((p) => groupNameMap.set(`parent-${p.group.id}`, p.group.name ?? ''));
    parents.forEach((p) => groupNameMap.set(p.group.id, p.group.name ?? ''));
    children.forEach((c) => groupNameMap.set(`child-${c.group.id}`, c.group.name ?? ''));
    children.forEach((c) => groupNameMap.set(c.group.id, c.group.name ?? ''));

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
        type: 'rightsLabel',
        animated: true,
        style: { stroke: '#66bb6a', strokeWidth: 2, strokeDasharray: '5 5' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#66bb6a',
        },
        data: { rights: parent.rights, sourceName: groupNameMap.get(parentNodeId) ?? null, targetName: groupNameMap.get(edgeTarget) ?? null },
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
        type: 'rightsLabel',
        animated: true,
        style: { stroke: '#ffb74d', strokeWidth: 2, strokeDasharray: '5 5' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#ffb74d',
        },
        data: { rights: child.rights, sourceName: groupNameMap.get(edgeSource) ?? null, targetName: groupNameMap.get(childNodeId) ?? null },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [group, groupId, showIndirect, stableRelationships]);

  // Filter edges based on selected rights
  const filteredEdges = useMemo(() => {
    return filterEdgesByRights(edges, selectedRights);
  }, [edges, selectedRights]);

  // Filter nodes to only show those connected via visible edges
  const filteredNodes = useMemo(() => {
    return filterNodesByEdges(nodes, filteredEdges, [groupId]);
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

  if (!group) {
    return (
      <div className="flex h-[calc(100dvh-12rem)] min-h-[400px] w-full items-center justify-center rounded-lg border bg-background">
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
          showRightsLegend
        />
      }
    >
      <NetworkEntityDialog open={dialogOpen} onOpenChange={setDialogOpen} entity={selectedEntity} />
    </NetworkFlowBase>
  );
}
