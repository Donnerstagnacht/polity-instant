'use client';

import { useGroupData } from '@/features/groups/hooks/useGroupData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { LinkGroupDialog } from './LinkGroupDialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGroupNetwork } from '@/features/groups/hooks/useGroupNetwork';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Pencil, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { formatRights, RIGHT_TYPES } from '@/components/shared/RightFilters';
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
} from '@/components/ui/alert-dialog';
import db from '../../../db/db';
import { useState as useStateForDelete } from 'react';


interface GroupRelationshipsManagerProps {
  groupId: string;
}

export function GroupRelationshipsManager({ groupId }: GroupRelationshipsManagerProps) {
  const { group } = useGroupData(groupId);
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

  const handleAcceptRequest = async (relationships: any[]) => {
      const transactions = relationships.map(rel => 
          db.tx.groupRelationships[rel.id].update({ status: 'active' })
      );
      await db.transact(transactions);
  };

  const handleRejectRequest = async (relationships: any[]) => {
       const transactions = relationships.map(rel => 
          db.tx.groupRelationships[rel.id].delete()
      );
      await db.transact(transactions);
  };

  const groupedIncoming = useMemo(() => {
      const groups = new Map();
      incomingRequests.forEach(rel => {
          const checkParent = rel.childGroup?.id === groupId;
          const otherGroup = checkParent ? rel.parentGroup : rel.childGroup;
          if (!otherGroup) return;
          
          if (!groups.has(otherGroup.id)) {
              groups.set(otherGroup.id, { group: otherGroup, rights: [], rels: [], type: checkParent ? 'parent' : 'child' });
          }
          const entry = groups.get(otherGroup.id);
          entry.rights.push(rel.withRight);
          entry.rels.push(rel);
      });
      return Array.from(groups.values());
  }, [incomingRequests, groupId]);

  const groupedOutgoing = useMemo(() => {
      const groups = new Map();
      outgoingRequests.forEach(rel => {
          const checkParent = rel.childGroup?.id === groupId;
          const otherGroup = checkParent ? rel.parentGroup : rel.childGroup;
          if (!otherGroup) return;

          if (!groups.has(otherGroup.id)) {
              groups.set(otherGroup.id, { group: otherGroup, rights: [], rels: [], type: checkParent ? 'parent' : 'child' });
          }
          const entry = groups.get(otherGroup.id);
          entry.rights.push(rel.withRight);
          entry.rels.push(rel);
      });
      return Array.from(groups.values());
  }, [outgoingRequests, groupId]);

  const filteredRelationships = useMemo(() => {
    let items: { group: any; rights: string[]; type: 'parent' | 'child' }[] = [];

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
            item.group.name.toLowerCase().includes(lowerQuery) ||
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
          (rel.parentGroup?.id === groupId && rel.childGroup?.id === targetGroupId) ||
          (rel.childGroup?.id === groupId && rel.parentGroup?.id === targetGroupId)
      );

      // Delete all relationships
      const transactions = relationshipsToDelete.map((rel) =>
        db.tx.groupRelationships[rel.id].delete()
      );

      await db.transact(transactions);
    } catch (error) {
      console.error('Error deleting relationship:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Group Relationships</CardTitle>
            <CardDescription>
              Manage how this group connects to other groups.
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
                        <h3 className="mb-4 font-semibold">Eingehende Anfragen</h3>
                        <div className="space-y-4">
                            {groupedIncoming.map((req) => (
                                <div key={req.group.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                                    <div>
                                        <div className="font-medium">{req.group.name}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span>Möchte {req.type === 'parent' ? 'übergeordnete' : 'untergeordnete'} Gruppe sein mit Rechten:</span>
                                            {req.rights.map((r: string) => (
                                                <Badge key={r} variant="outline" className="text-xs">{formatRights([r])}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <PermissionGuard action="manage" resource="groupRelationships" context={{ groupId }}>
                                            <Button size="sm" variant="outline" onClick={() => handleRejectRequest(req.rels)}>Ablehnen</Button>
                                            <Button size="sm" onClick={() => handleAcceptRequest(req.rels)}>Akzeptieren</Button>
                                        </PermissionGuard>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {groupedOutgoing.length > 0 && (
                    <div className="rounded-md border p-4">
                        <h3 className="mb-4 font-semibold">Ausstehende Anfragen</h3>
                        <div className="space-y-4">
                             {groupedOutgoing.map((req) => (
                                <div key={req.group.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                                    <div>
                                        <div className="font-medium">{req.group.name}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span>Anfrage als {req.type === 'parent' ? 'übergeordnete' : 'untergeordnete'} Gruppe:</span>
                                            {req.rights.map((r: string) => (
                                                <Badge key={r} variant="outline" className="text-xs">{formatRights([r])}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                      <PermissionGuard action="manage" resource="groupRelationships" context={{ groupId }}>
                                        <Button size="sm" variant="outline" onClick={() => handleRejectRequest(req.rels)}>Abbrechen</Button>
                                      </PermissionGuard>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
           <h3 className="font-semibold">Aktive Beziehungen</h3>
        </div>
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                    placeholder="Search by group name..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                 <Select value={directionFilter} onValueChange={(v: any) => setDirectionFilter(v)}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Direction" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Directions</SelectItem>
                        <SelectItem value="parent">Parents Only</SelectItem>
                        <SelectItem value="child">Children Only</SelectItem>
                    </SelectContent>
                </Select>
                 <Button 
                    variant={showIndirect ? "default" : "outline"}
                    onClick={() => setShowIndirect(!showIndirect)}
                 >
                    {showIndirect ? "Indirect Included" : "Direct Only"}
                 </Button>
            </div>
        </div>

        {/* Rights Filter - Simple Multi-select visual or reuse component logic */}
        <div className="mb-4 flex flex-wrap gap-2">
            {RIGHT_TYPES.map(right => (
                 <Badge 
                    key={right}
                    variant={selectedRights.has(right) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleRight(right)}
                 >
                    {/* Reuse formatRights but stripping newlines strictly for single line badge if needed, 
                        or just map right codes to simple labels. formatRights returns valid string.*/}
                    {formatRights([right])}
                 </Badge>
            ))}
        </div>

        <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead>Rights</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRelationships.length === 0 ? (
                 <TableRow>
                 <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No relationships found matching your filters.
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
                                {rel.type === 'parent' ? 'Parent' : 'Child'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {Array.from(new Set(rel.rights)).map(r => (
                                    <Badge key={r} variant="outline" className="text-xs">
                                        {formatRights([r])}
                                    </Badge>
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
                                                <AlertDialogTitle>Delete all relationships?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will remove all relationships (both parent and child directions) between this group and <strong>{rel.group.name}</strong>. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDeleteRelationship(rel.group.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
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
