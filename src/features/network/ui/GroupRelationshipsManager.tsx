'use client';

import { useGroupData } from '@/features/groups/hooks/useGroupData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { LinkGroupDialog } from './LinkGroupDialog';
import { Badge } from '@/features/shared/ui/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/ui/ui/table';
import { useGroupNetwork } from '@/features/network/hooks/useGroupNetwork';
import type { NormalizedGroupRelationship, NetworkGroupEntity } from '@/features/network/types/network.types';
import { Input } from '@/features/shared/ui/ui/input';
import { Button } from '@/features/shared/ui/ui/button';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { PropagationProgress } from '@/features/shared/ui/PropagationProgress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/features/shared/ui/ui/select';
import { formatRights, RIGHT_TYPES } from '@/features/network/ui/RightFilters';
import { RightBadge } from '@/features/network/ui/RightBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/features/shared/ui/ui/alert-dialog';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useState as useStateForDelete } from 'react';
import { useTranslation } from '@/features/shared/hooks/use-translation';


interface GroupRelationshipsManagerProps {
  groupId: string;
}

export function GroupRelationshipsManager({ groupId }: GroupRelationshipsManagerProps) {
  const { t } = useTranslation();
  const { group } = useGroupData(groupId);
  const { updateRelationship, deleteRelationship } = useGroupActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'parent' | 'child'>('all');
  const [isDeleting, setIsDeleting] = useStateForDelete(false);

  const {
      networkData,
      showIndirect,
      setShowIndirect,
      selectedRights,
      toggleRight,
      activeRelationships: stableRelationships,
      incomingRequests,
      outgoingRequests,
      allRelationships
  } = useGroupNetwork(groupId);

  const [isPropagating, setIsPropagating] = useState(false);

  const handleAcceptRequest = async (relationships: NormalizedGroupRelationship[]) => {
      const hasPvr = relationships.some((r) => r.with_right === 'passiveVotingRight');
      if (hasPvr) setIsPropagating(true);
      try {
        for (const rel of relationships) {
          await updateRelationship({
            id: rel.id,
            status: 'active',
          });
        }
      } finally {
        setIsPropagating(false);
      }
  };

  const handleRejectRequest = async (relationships: NormalizedGroupRelationship[]) => {
      for (const rel of relationships) {
        await deleteRelationship({ id: rel.id });
      }
  };

  const groupedIncoming = useMemo(() => {
      const groups = new Map();
      incomingRequests.forEach(rel => {
          const checkParent = rel.related_group?.id === groupId;
          const otherGroup = checkParent ? rel.group : rel.related_group;
          if (!otherGroup) return;
          
          if (!groups.has(otherGroup.id)) {
              groups.set(otherGroup.id, { group: otherGroup, rights: [], rels: [], type: checkParent ? 'parent' : 'child' });
          }
          const entry = groups.get(otherGroup.id);
          entry.rights.push(rel.with_right ?? '');
          entry.rels.push(rel);
      });
      return Array.from(groups.values());
  }, [incomingRequests, groupId]);

  const groupedOutgoing = useMemo(() => {
      const groups = new Map();
      outgoingRequests.forEach(rel => {
          const checkParent = rel.related_group?.id === groupId;
          const otherGroup = checkParent ? rel.group : rel.related_group;
          if (!otherGroup) return;

          if (!groups.has(otherGroup.id)) {
              groups.set(otherGroup.id, { group: otherGroup, rights: [], rels: [], type: checkParent ? 'parent' : 'child' });
          }
          const entry = groups.get(otherGroup.id);
          entry.rights.push(rel.with_right ?? '');
          entry.rels.push(rel);
      });
      return Array.from(groups.values());
  }, [outgoingRequests, groupId]);

  const filteredRelationships = useMemo(() => {
    let items: { group: NetworkGroupEntity; rights: string[]; type: 'parent' | 'child' }[] = [];

    // Flatten data for the table
    if (directionFilter !== 'child') {
        items = items.concat(networkData.parents.map(p => ({ ...p, type: 'parent' as const })));
    }
    if (directionFilter !== 'parent') {
        items = items.concat(networkData.children.map(c => ({ ...c, type: 'child' as const })));
    }

    // Filter by Search Query
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        items = items.filter(item => 
            item.group.name?.toLowerCase().includes(lowerQuery) ||
            (item.group.description && item.group.description.toLowerCase().includes(lowerQuery))
        );
    }

    return items;
  }, [networkData, searchQuery, directionFilter]);

  const handleDeleteRelationship = async (targetGroupId: string) => {
    setIsDeleting(true);
    try {
      // Find all relationships between the two groups (both directions)
      const relationshipsToDelete = stableRelationships.filter(
        (rel) =>
        (rel.group?.id === groupId && rel.related_group?.id === targetGroupId) ||
        (rel.related_group?.id === groupId && rel.group?.id === targetGroupId)
      );

      // Delete all relationships
      for (const rel of relationshipsToDelete) {
        await deleteRelationship({ id: rel.id });
      }
    } catch (error) {
      console.error('Error deleting relationship:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
    <Card className="relative">
      {isPropagating && (
        <PropagationProgress message={t('common.network.propagatingMemberships')} />
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('common.network.groupRelationships')}</CardTitle>
            <CardDescription>
              {t('common.network.groupRelationshipsDescription')}
            </CardDescription>
          </div>
          <PermissionGuard
             action="manage"
             resource="groupRelationships"
             context={{ groupId }}
          >
            <LinkGroupDialog 
              currentGroupId={groupId}
              currentGroupName={group?.name || 'Group'} 
              allRelationships={allRelationships}
            />
          </PermissionGuard>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Requests Section */}
        {(groupedIncoming.length > 0 || groupedOutgoing.length > 0) && (
            <div className="space-y-6">
                {groupedIncoming.length > 0 && (
                    <div className="rounded-md border p-4 bg-muted/60">
                        <h3 className="mb-4 font-semibold">{t('common.network.incomingRequests')}</h3>
                        <div className="space-y-4">
                            {groupedIncoming.map((req) => (
                                <div key={req.group.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                                    <div>
                                        <div className="font-medium">{req.group.name}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span>{req.type === 'parent' ? t('common.network.wantsToBeParent') : t('common.network.wantsToBeChild')}</span>
                                            {req.rights.map((r: string) => (
                                                <RightBadge key={r} right={r} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <PermissionGuard action="manage" resource="groupRelationships" context={{ groupId }}>
                                            <Button size="sm" variant="outline" onClick={() => handleRejectRequest(req.rels)}>{t('common.network.reject')}</Button>
                                            <Button size="sm" onClick={() => handleAcceptRequest(req.rels)}>{t('common.network.accept')}</Button>
                                        </PermissionGuard>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {groupedOutgoing.length > 0 && (
                    <div className="rounded-md border p-4">
                        <h3 className="mb-4 font-semibold">{t('common.network.outgoingRequests')}</h3>
                        <div className="space-y-4">
                             {groupedOutgoing.map((req) => (
                                <div key={req.group.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                                    <div>
                                        <div className="font-medium">{req.group.name}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span>{req.type === 'parent' ? t('common.network.requestAsParent') : t('common.network.requestAsChild')}</span>
                                            {req.rights.map((r: string) => (
                                                <RightBadge key={r} right={r} />
                                            ))}
                                        </div>
                                    </div>
                                      <PermissionGuard action="manage" resource="groupRelationships" context={{ groupId }}>
                                        <Button size="sm" variant="outline" onClick={() => handleRejectRequest(req.rels)}>{t('common.network.cancelRequest')}</Button>
                                      </PermissionGuard>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
           <h3 className="font-semibold">{t('common.network.activeRelationships')}</h3>
        </div>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder={t('common.network.searchByGroupName')} 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                 <Select value={directionFilter} onValueChange={(v) => setDirectionFilter(v as typeof directionFilter)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Direction" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('common.network.allDirections')}</SelectItem>
                        <SelectItem value="parent">{t('common.network.parentsOnly')}</SelectItem>
                        <SelectItem value="child">{t('common.network.childrenOnly')}</SelectItem>
                    </SelectContent>
                </Select>
                 <Button 
                    variant={showIndirect ? "default" : "outline"}
                    onClick={() => setShowIndirect(!showIndirect)}
                 >
                    {showIndirect ? t('common.network.indirectIncluded') : t('common.network.directOnly')}
                 </Button>
            </div>
        </div>

        {/* Rights Filter */}
        <div className="mb-4 flex flex-wrap gap-2">
            {RIGHT_TYPES.map(right => (
                 <div key={right} className="cursor-pointer" onClick={() => toggleRight(right)}>
                    <RightBadge
                      right={right}
                      variant={selectedRights.has(right) ? 'gradient' : 'outline'}
                    />
                 </div>
            ))}
        </div>

        <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.network.groupName')}</TableHead>
              <TableHead>{t('common.network.relationship')}</TableHead>
              <TableHead>{t('common.labels.rights')}</TableHead>
              <TableHead className="text-right">{t('common.actions.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRelationships.length === 0 ? (
                 <TableRow>
                 <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    {t('common.network.noRelationshipsFound')}
                 </TableCell>
              </TableRow>
            ) : (
                filteredRelationships.map((rel, idx) => (
                    <TableRow key={`${rel.group.id}-${rel.type}-${idx}`}>
                        <TableCell className="font-medium">
                            {rel.group.name}
                            {/* <div className="text-xs text-muted-foreground">{rel.group.description}</div> */}
                        </TableCell>
                        <TableCell>
                            <Badge variant={rel.type === 'parent' ? 'default' : 'secondary'}>
                                {rel.type === 'parent' ? t('common.network.parent') : t('common.network.child')}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {Array.from(new Set(rel.rights)).map(r => (
                                    <RightBadge key={r} right={r} />
                                ))}
                            </div>
                        </TableCell>
                         <TableCell className="text-right">
                             <PermissionGuard
                                 action="manage"
                                 resource="groupRelationships"
                                 context={{ groupId }}
                             >
                                <div className="flex items-center justify-end gap-1">
                                    <LinkGroupDialog
                                        currentGroupId={groupId}
                                        currentGroupName={group?.name || 'Group'}
                                        initialTargetGroupId={rel.group.id}
                                        initialRelationshipType={rel.type}
                                        initialRights={rel.rights}
                                        trigger={
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit relationship</span>
                                            </Button>
                                        }
                                        allRelationships={allRelationships}
                                    />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8"
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete relationship</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('common.network.deleteAllRelationships')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('common.network.deleteRelationshipDescription', { groupName: rel.group.name })}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteRelationship(rel.group.id)}
                                                  className="bg-destructive text-white hover:bg-destructive/90"
                                                >
                                                    {t('common.actions.delete')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                             </PermissionGuard>
                         </TableCell>
                    </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
