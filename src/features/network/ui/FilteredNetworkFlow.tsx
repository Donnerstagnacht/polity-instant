'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { Node, Edge, useNodesState, useEdgesState, MarkerType } from '@xyflow/react';
import { NetworkFlowBase } from '@/features/network/ui/NetworkFlowBase';
import { NetworkControlPanel } from '@/features/network/ui/NetworkControlPanel';
import { useNetworkFlowControls } from '@/features/network/hooks/useNetworkFlowControls';
import { buildDirectRelationships, buildIndirectRelationships, type RelationshipEntry } from '@/features/network/logic/networkRelationshipHelpers';
import { filterEdgesByRights, filterNodesByEdges } from '@/features/network/logic/networkFilterHelpers';
import { useUserState } from '@/zero/users/useUserState';
import { useGroupState } from '@/zero/groups/useGroupState';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { normalizeGroupRelationship, type NormalizedGroupRelationship, type NetworkGroupEntity } from '../types/network.types';

interface NetworkNode extends Node {
  data: {
    label: string;
    description?: string;
    level: number;
    type: 'user' | 'group';
    groupData?: NetworkGroupEntity;
  };
}

interface FilteredNetworkFlowProps {
  userId: string;
  filterRight?: string; // Filter by specific right type (e.g., 'amendmentRight')
  onGroupClick?: (groupId: string, groupData: NetworkGroupEntity) => void;
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
  const { t } = useTranslation();
  const controls = useNetworkFlowControls();
  const {
    showIndirect, setShowIndirect,
    selectedNodes, setSelectedNodes,
    isInteractive, setIsInteractive,
    selectedRights,
    legendCollapsed, setLegendCollapsed,
    panelCollapsed, setPanelCollapsed,
    toggleRight, handleInteractiveChange,
  } = controls;
  const [nodes, setNodes, onNodesChange] = useNodesState<NetworkNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Fetch the specific user
  const { user } = useUserState({ userId });

  // Fetch user's group memberships (current user)
  const { currentUserMembershipsWithGroups: membershipsRaw, allRelationshipsWithGroups: relationshipsRaw } = useGroupState({
    includeCurrentUserMembershipsWithGroups: true,
    includeAllRelationshipsWithGroups: true,
  });

  const memberships = membershipsRaw || [];
  const relationships = useMemo(
    () => (relationshipsRaw || []).map(rel => normalizeGroupRelationship(rel)),
    [relationshipsRaw]
  ) as NormalizedGroupRelationship[];

  // Get all groups the user is a member of
  const userGroups = useMemo(() => {
    if (!memberships.length) return [] as NetworkGroupEntity[];
    return memberships
      .filter(
        (m) => m.group && (m.status === 'member' || m.status === 'admin')
      )
      .map((m) => m.group)
      .filter((g): g is NonNullable<typeof g> => g != null);
  }, [memberships.length, memberships.map((m) => `${m.id}-${m.status}`).join(',')]);
  // Memoize relationships to prevent infinite loops
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
    const allEdgesMap = new Map<string, Edge>();

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
          label: group.name ?? '',
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
            data: { rights: parent.rights },
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
    parentGroups.forEach((parent, index: number) => {
      const level = parent.level || 1;
      const yOffset = -150 * level - 50;
      const xOffset = (index - parentGroups.length / 2) * 220;

      newNodes.push({
        id: parent.group.id,
        type: 'default',
        position: { x: 400 + xOffset, y: 300 + yOffset },
        data: {
          label: parent.group.name ?? '',
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
          label: child.group.name ?? '',
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

  // Generate flow chart when data or showIndirect changes
  useEffect(() => {
    generateFlowChart();
  }, [generateFlowChart]);

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (!isInteractive) return;

      // If this is a group and onGroupClick is provided, call it
      if (node.data.type === 'group' && onGroupClick) {
        onGroupClick(node.id, node.data.groupData as NetworkGroupEntity);
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

  if (!user) {
    return (
      <div className="flex h-[calc(100dvh-12rem)] min-h-[400px] w-full items-center justify-center rounded-lg border bg-background">
        <p className="text-muted-foreground">{t('common.network.loadingNetwork')}</p>
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
        <NetworkControlPanel
          title={title}
          description={description}
          panelCollapsed={panelCollapsed}
          onPanelCollapsedChange={setPanelCollapsed}
          legendCollapsed={legendCollapsed}
          onLegendCollapsedChange={setLegendCollapsed}
          legendTitle={t('common.network.legend')}
          legendItems={[
            {
              id: 'user',
              label: t('common.network.user'),
              swatchClassName: 'h-4 w-4 rounded-full border-2 border-[#2196f3] bg-[#e3f2fd]',
            },
            {
              id: 'user-groups',
              label: t('common.network.userGroups'),
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
    />
  );
}
