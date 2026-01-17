'use client';

import { use, useState, useMemo } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { GroupNetworkFlow } from '@/components/groups/GroupNetworkFlow';
import { LinkGroupDialog } from '@/components/groups/LinkGroupDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { usePermissions } from 'db/rbac/usePermissions';
import { useGroupData } from '@/features/groups/hooks/useGroupData';
import { useGroupNetwork } from '@/features/groups/hooks/useGroupNetwork';
import { IncomingRelationshipRequestsTable } from '@/features/groups/ui/IncomingRelationshipRequestsTable';
import { ActiveRelationshipsTable } from '@/features/groups/ui/ActiveRelationshipsTable';
import { OutgoingRelationshipRequestsTable } from '@/features/groups/ui/OutgoingRelationshipRequestsTable';
import { formatRights, RIGHT_TYPES } from '@/components/shared/RightFilters';
import db, { tx } from '../../../../db/db';
import {
  notifyRelationshipApproved,
  notifyRelationshipRejected,
} from '@/utils/notification-helpers';

export default function GroupNetworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const groupId = resolvedParams.id;
  const { user } = db.useAuth();
  const { can } = usePermissions({ groupId });
  const canManageRelationships = can('manage', 'groupRelationships');
  
  const { group } = useGroupData(groupId);
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'parent' | 'child'>('all');
  const [selectedRights, setSelectedRights] = useState<Set<string>>(new Set());

  const toggleRight = (right: string) => {
    setSelectedRights((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(right)) {
        newSet.delete(right);
      } else {
        newSet.add(right);
      }
      return newSet;
    });
  };

  const {
    networkData,
    activeRelationships: stableRelationships,
    incomingRequests,
    outgoingRequests,
    allRelationships,
  } = useGroupNetwork(groupId);

  // Group incoming requests
  const groupedIncoming = useMemo(() => {
    const groups = new Map();
    incomingRequests.forEach((rel) => {
      const checkParent = rel.childGroup?.id === groupId;
      const otherGroup = checkParent ? rel.parentGroup : rel.childGroup;
      if (!otherGroup) return;

      if (!groups.has(otherGroup.id)) {
        groups.set(otherGroup.id, {
          group: otherGroup,
          rights: [],
          rels: [],
          type: checkParent ? 'parent' : 'child',
        });
      }
      const entry = groups.get(otherGroup.id);
      entry.rights.push(rel.withRight);
      entry.rels.push(rel);
    });
    
    let items = Array.from(groups.values());
    
    // Apply filters
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.group.name.toLowerCase().includes(lowerQuery) ||
          (item.group.description && item.group.description.toLowerCase().includes(lowerQuery))
      );
    }
    
    if (directionFilter !== 'all') {
      items = items.filter((item) => item.type === directionFilter);
    }
    
    if (selectedRights.size > 0) {
      items = items.filter((item) =>
        item.rights.some((right: string) => selectedRights.has(right))
      );
    }
    
    return items;
  }, [incomingRequests, groupId, searchQuery, directionFilter, selectedRights]);

  // Group outgoing requests
  const groupedOutgoing = useMemo(() => {
    const groups = new Map();
    outgoingRequests.forEach((rel) => {
      const checkParent = rel.childGroup?.id === groupId;
      const otherGroup = checkParent ? rel.parentGroup : rel.childGroup;
      if (!otherGroup) return;

      if (!groups.has(otherGroup.id)) {
        groups.set(otherGroup.id, {
          group: otherGroup,
          rights: [],
          rels: [],
          type: checkParent ? 'parent' : 'child',
        });
      }
      const entry = groups.get(otherGroup.id);
      entry.rights.push(rel.withRight);
      entry.rels.push(rel);
    });
    
    let items = Array.from(groups.values());
    
    // Apply filters
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.group.name.toLowerCase().includes(lowerQuery) ||
          (item.group.description && item.group.description.toLowerCase().includes(lowerQuery))
      );
    }
    
    if (directionFilter !== 'all') {
      items = items.filter((item) => item.type === directionFilter);
    }
    
    if (selectedRights.size > 0) {
      items = items.filter((item) =>
        item.rights.some((right: string) => selectedRights.has(right))
      );
    }
    
    return items;
  }, [outgoingRequests, groupId, searchQuery, directionFilter, selectedRights]);

  // Group active relationships for display
  const groupedActiveRelationships = useMemo(() => {
    let items: { group: any; rights: string[]; type: 'parent' | 'child' }[] = [];

    // Add parents and children based on direction filter
    if (directionFilter !== 'child') {
      items = items.concat(networkData.parents.map((p) => ({ ...p, type: 'parent' as const })));
    }
    if (directionFilter !== 'parent') {
      items = items.concat(networkData.children.map((c) => ({ ...c, type: 'child' as const })));
    }

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.group.name.toLowerCase().includes(lowerQuery) ||
          (item.group.description && item.group.description.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Filter by rights
    if (selectedRights.size > 0) {
      items = items.filter((item) =>
        item.rights.some((right) => selectedRights.has(right))
      );
    }

    return items;
  }, [networkData, searchQuery, directionFilter, selectedRights]);

  // Handlers
  const handleAcceptRequest = async (relationships: any[]) => {
    const transactions: any[] = relationships.map((rel) =>
      tx.groupRelationships[rel.id].update({ status: 'active' })
    );

    // Send notifications to the requesting group
    if (user?.id && group?.name) {
      for (const rel of relationships) {
        const sourceGroup = rel.parentGroup;
        if (sourceGroup?.id) {
          const notificationTxs = notifyRelationshipApproved({
            senderId: user.id,
            sourceGroupId: sourceGroup.id,
            sourceGroupName: sourceGroup.name || 'Unknown Group',
            targetGroupId: groupId,
            targetGroupName: group.name,
          });
          transactions.push(...notificationTxs);
        }
      }
    }

    await db.transact(transactions);
  };

  const handleRejectRequest = async (relationships: any[]) => {
    const transactions: any[] = relationships.map((rel) => tx.groupRelationships[rel.id].delete());

    // Send notifications to the requesting group
    if (user?.id && group?.name) {
      for (const rel of relationships) {
        const sourceGroup = rel.parentGroup;
        if (sourceGroup?.id) {
          const notificationTxs = notifyRelationshipRejected({
            senderId: user.id,
            sourceGroupId: sourceGroup.id,
            sourceGroupName: sourceGroup.name || 'Unknown Group',
            targetGroupId: groupId,
            targetGroupName: group.name,
          });
          transactions.push(...notificationTxs);
        }
      }
    }

    await db.transact(transactions);
  };

  const handleDeleteRelationship = async (targetGroupId: string) => {
    // Find all relationships between the two groups (both directions)
    const relationshipsToDelete = stableRelationships.filter(
      (rel) =>
        (rel.parentGroup?.id === groupId && rel.childGroup?.id === targetGroupId) ||
        (rel.childGroup?.id === groupId && rel.parentGroup?.id === targetGroupId)
    );

    // Delete all relationships
    const transactions = relationshipsToDelete.map((rel) =>
      db.tx.groupRelationships[rel.id].delete()
    );

    await db.transact(transactions);
  };

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard action="view" resource="groupRelationships" context={{ groupId }}>
        <PageWrapper className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">Group Network</h1>
            <p className="text-muted-foreground">
              {group?.name || 'Group'} - Manage relationships and network visualization
            </p>
          </div>

          <Tabs defaultValue="relationships" className="w-full">
            <TabsList>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="network">Network Visualization</TabsTrigger>
            </TabsList>

            <TabsContent value="relationships" className="mt-6">
              {/* Search Bar and Add Relationship Button */}
              <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search relationships by group name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={directionFilter} onValueChange={(v: any) => setDirectionFilter(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Directions</SelectItem>
                    <SelectItem value="parent">Parents Only</SelectItem>
                    <SelectItem value="child">Children Only</SelectItem>
                  </SelectContent>
                </Select>
                {canManageRelationships && (
                  <LinkGroupDialog
                    currentGroupId={groupId}
                    currentGroupName={group?.name || 'Group'}
                    allRelationships={allRelationships}
                  />
                )}
              </div>

              {/* Rights Filter */}
              <div className="mb-6 flex flex-wrap gap-2">
                {RIGHT_TYPES.map((right) => (
                  <Badge
                    key={right}
                    variant={selectedRights.has(right) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleRight(right)}
                  >
                    {formatRights([right])}
                  </Badge>
                ))}
                {selectedRights.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRights(new Set())}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Relationship Tables */}
              {canManageRelationships && (
                <IncomingRelationshipRequestsTable
                  requests={groupedIncoming}
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                />
              )}

              <ActiveRelationshipsTable
                relationships={groupedActiveRelationships}
                groupId={groupId}
                groupName={group?.name || 'Group'}
                allRelationships={allRelationships}
                onDelete={handleDeleteRelationship}
              />

              {canManageRelationships && (
                <OutgoingRelationshipRequestsTable
                  requests={groupedOutgoing}
                  onCancel={handleRejectRequest}
                />
              )}
            </TabsContent>

            <TabsContent value="network" className="mt-6">
              <GroupNetworkFlow groupId={groupId} />
            </TabsContent>
          </Tabs>
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
