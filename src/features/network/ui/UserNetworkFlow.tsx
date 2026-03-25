'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { Node, Edge, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import { NetworkFlowBase } from '@/features/network/ui/NetworkFlowBase';
import { NetworkControlPanel } from '@/features/network/ui/NetworkControlPanel';
import { NetworkEntityDialog } from '@/features/network/ui/NetworkEntityDialog';
import { useNetworkFlowControls } from '@/features/network/hooks/useNetworkFlowControls';
import { buildDirectRelationships, buildIndirectRelationships, type RelationshipEntry } from '@/features/network/logic/networkRelationshipHelpers';
import { filterEdgesByRights, filterNodesByEdges } from '@/features/network/logic/networkFilterHelpers';
import { getGroupDisplayLabel } from '@/features/network/ui/networkVisualHelpers';
import { useUserState } from '@/zero/users/useUserState';
import { useGroupState } from '@/zero/groups/useGroupState';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { type NetworkGroupEntity } from '../types/network.types';

interface NetworkNode extends Node {
  data: {
    label: string;
    description?: string;
    level: number;
    type: 'user' | 'group';
    groupData?: NetworkGroupEntity;
  };
}

interface UserNetworkFlowProps {
  userId: string;
  onGroupClick?: (groupId: string, groupData: NetworkGroupEntity) => void;
  filterRight?: string; // Optional filter by specific right type
}

export function UserNetworkFlow({ userId, onGroupClick, filterRight }: UserNetworkFlowProps) {
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
  const [nodes, setNodes, onNodesChange] = useNodesState<NetworkNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { userWithGroupMemberships } = useUserState({ userId, includeGroupMemberships: true });

  // Fetch all group relationships
  const { allRelationshipsWithGroups: allRelationships } = useGroupState({ includeAllRelationshipsWithGroups: true });

  const user = userWithGroupMemberships?.[0];
  const memberships = user?.group_memberships || [];
  const relationships = allRelationships || [];

  // Get all groups the user is a member of - use stable dependencies
  const userGroups = useMemo(() => {
    if (!memberships.length) return [] as NetworkGroupEntity[];
    return memberships
      .filter(
        (m) => m.group && (m.status === 'active' || m.status === 'member' || m.status === 'admin')
      )
      .map((m) => m.group)
      .filter((g): g is NonNullable<typeof g> => g != null);
  }, [memberships.length, memberships.map((m) => `${m.id}-${m.status}`).join(',')]);
  // Memoize relationships to prevent infinite loops - use stable dependencies
  const stableRelationships = useMemo(() => {
    if (!relationships.length) return [];
    return relationships;
}, [relationships.length, relationships.map((r) => r.id).join(',')]);

  // Generate flow chart
  const generateFlowChart = useCallback(() => {
    if (!user) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes: NetworkNode[] = [];
    const allEdgesMap = new Map<string, Edge>(); // Use Map to prevent ALL duplicate edges

    // Build a name lookup for resolving edge source/target names
    const groupNameMap = new Map<string, string>();
    groupNameMap.set(userId, [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User');
    userGroups.forEach((g) => groupNameMap.set(g.id, g.name ?? ''));
    stableRelationships.forEach((r) => {
      if (r.group_id && r.group && !groupNameMap.has(r.group_id)) groupNameMap.set(r.group_id, r.group.name ?? r.group_id);
      if (r.related_group_id && r.related_group && !groupNameMap.has(r.related_group_id)) groupNameMap.set(r.related_group_id, r.related_group.name ?? r.related_group_id);
    });

    // Add center node (user)
    newNodes.push({
      id: userId,
      type: 'default',
      position: { x: 400, y: 300 },
      data: {
        label: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User',
        description: user.bio ?? '',
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
    userGroups.forEach((group, index: number) => {
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
          label: getGroupDisplayLabel(group.name, group.group_type),
          description: group.description ?? '',
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

      // Add edge from user to group - check for duplicates
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
          data: { rights: [] }, // Member edge has no specific rights
        });
      }
    });

    // Add parent and child groups for each user group
    const allRelatedGroups = new Map<string, RelationshipEntry & { isParent: boolean; connectedTo: string }>();

    userGroups.forEach((group) => {
      const { parents, children } = showIndirect
        ? buildIndirectRelationships(stableRelationships, group.id, filterRight)
        : buildDirectRelationships(stableRelationships, group.id, filterRight);

      // Process parent groups
      parents.forEach((parent) => {
        if (
          !allRelatedGroups.has(parent.group.id) &&
          !userGroups.some((g) => g.id === parent.group.id)
        ) {
          allRelatedGroups.set(parent.group.id, {
            group: parent.group,
            rights: parent.rights,
            level: parent.level,
            childId: parent.childId,
            isParent: true,
            connectedTo: group.id,
          });
        }

        const edgeTarget = showIndirect && parent.childId ? parent.childId : group.id;
        const edgeId = `edge-parent-${parent.group.id}-to-${edgeTarget}`;

        // Only add edge if it doesn't already exist
        if (!allEdgesMap.has(edgeId)) {
          allEdgesMap.set(edgeId, {
            id: edgeId,
            source: parent.group.id,
            target: edgeTarget,
            type: 'rightsLabel',
            animated: true,
            style: { stroke: '#66bb6a', strokeWidth: 2, strokeDasharray: '5 5' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#66bb6a',
            },
            data: { rights: parent.rights, sourceName: groupNameMap.get(parent.group.id) ?? null, targetName: groupNameMap.get(edgeTarget) ?? null },
          });
        }
      });

      // Process child groups
      children.forEach((child) => {
        if (
          !allRelatedGroups.has(child.group.id) &&
          !userGroups.some((g) => g.id === child.group.id)
        ) {
          allRelatedGroups.set(child.group.id, {
            group: child.group,
            rights: child.rights,
            level: child.level,
            parentId: child.parentId,
            isParent: false,
            connectedTo: group.id,
          });
        }

        const edgeSource = showIndirect && child.parentId ? child.parentId : group.id;
        const edgeId = `edge-${edgeSource}-to-child-${child.group.id}`;

        // Only add edge if it doesn't already exist
        if (!allEdgesMap.has(edgeId)) {
          allEdgesMap.set(edgeId, {
            id: edgeId,
            source: edgeSource,
            target: child.group.id,
            type: 'rightsLabel',
            animated: true,
            style: { stroke: '#ffb74d', strokeWidth: 2, strokeDasharray: '5 5' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#ffb74d',
            },
            data: { rights: child.rights, sourceName: groupNameMap.get(edgeSource) ?? null, targetName: groupNameMap.get(child.group.id) ?? null },
          });
        }
      });
    });

    // Position related groups
    const relatedGroupsArray = Array.from(allRelatedGroups.values());
    const parentGroups = relatedGroupsArray.filter(g => g.isParent);
    const childGroups = relatedGroupsArray.filter(g => !g.isParent);

    // Position parent groups above user groups
    parentGroups.forEach((parent, index: number) => {
      const level = parent.level || 1;
      const yOffset = -150 * level - 50;
      const xOffset = (index - parentGroups.length / 2) * 220;

      newNodes.push({
        id: parent.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 300 + yOffset },
        data: {
          label: getGroupDisplayLabel(parent.group.name, parent.group.group_type),
          description: parent.group.description ?? '',
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
    childGroups.forEach((child, index: number) => {
      const level = child.level || 1;
      const baseYOffset = 200 + Math.ceil(userGroups.length / groupsPerRow) * 180;
      const yOffset = baseYOffset + 100 * level;
      const xOffset = (index - childGroups.length / 2) * 220;

      newNodes.push({
        id: child.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 300 + yOffset },
        data: {
          label: getGroupDisplayLabel(child.group.name, child.group.group_type),
          description: child.group.description ?? '',
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
    stableRelationships,
    filterRight,
    onGroupClick,
  ]);

  // Filter edges based on selected rights
  const filteredEdges = useMemo(() => {
    return filterEdgesByRights(edges, selectedRights);
  }, [edges, selectedRights]);

  // Filter nodes to only show those connected via visible edges
  const filteredNodes = useMemo(() => {
    return filterNodesByEdges(nodes, filteredEdges, [userId]);
  }, [nodes, filteredEdges, userId]);

  // Generate flow chart when data or showIndirect changes
  useEffect(() => {
    generateFlowChart();
  }, [generateFlowChart]);

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!isInteractive) return;

      const nodeData = node.data as NetworkNode['data'];

      // Open dialog with entity data
      if (nodeData.type === 'group' && nodeData.groupData) {
        setSelectedEntity({ type: 'group', data: nodeData.groupData });
        setDialogOpen(true);

        // Still call onGroupClick if provided
        if (onGroupClick) {
          onGroupClick(node.id, nodeData.groupData as NetworkGroupEntity);
        }
      } else if (nodeData.type === 'user') {
        setSelectedEntity({ type: 'user', data: { id: userId, name: [user?.first_name, user?.last_name].filter(Boolean).join(' ') } });
        setDialogOpen(true);
      }
    },
    [isInteractive, onGroupClick, user]
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

  if (!user) {
    return (
      <div className="flex h-[calc(100dvh-12rem)] min-h-[400px] w-full items-center justify-center rounded-lg border bg-background">
        <p className="text-muted-foreground">Loading user network...</p>
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
          title={t('common.network.userNetwork', 'User Network')}
          description={t('common.network.userNetworkDescription', {
            userName: [user.first_name, user.last_name].filter(Boolean).join(' '),
          })}
          panelCollapsed={panelCollapsed}
          onPanelCollapsedChange={setPanelCollapsed}
          legendCollapsed={legendCollapsed}
          onLegendCollapsedChange={setLegendCollapsed}
          legendTitle={t('common.network.legend')}
          legendItems={[
            {
              id: 'user',
              label: t('common.network.user', 'User'),
              swatchClassName: 'h-4 w-4 rounded-full border-2 border-[#2196f3] bg-[#e3f2fd]',
            },
            {
              id: 'user-groups',
              label: t('common.network.userGroups', "User's Groups"),
              swatchClassName: 'h-4 w-4 rounded border border-[#a5d6a7] bg-[#c8e6c9]',
            },
            {
              id: 'parent-groups',
              label: t('common.network.parentGroups'),
              swatchClassName: 'h-4 w-4 rounded border border-[#80cbc4] bg-[#b2dfdb]',
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
          showRightsFilter={!filterRight}
          selectedRights={selectedRights}
          onToggleRight={toggleRight}
          filterRight={filterRight}
          filteredByPrefix={t('common.network.filteredBy')}
          showRightsLegend
        />
      }
    >
      <NetworkEntityDialog open={dialogOpen} onOpenChange={setDialogOpen} entity={selectedEntity} />
    </NetworkFlowBase>
  );
}
