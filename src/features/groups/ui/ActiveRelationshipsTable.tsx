/**
 * Active Relationships Table Component
 *
 * Displays active group relationships with management actions.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Network, Pencil, Trash2 } from 'lucide-react';
import { formatRights } from '@/components/shared/RightFilters';
import { LinkGroupDialog } from '@/components/groups/LinkGroupDialog';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { useState } from 'react';

interface RelationshipItem {
  group: any;
  rights: string[];
  type: 'parent' | 'child';
}

interface ActiveRelationshipsTableProps {
  relationships: RelationshipItem[];
  groupId: string;
  groupName: string;
  allRelationships: any[];
  onDelete: (targetGroupId: string) => void;
}

export function ActiveRelationshipsTable({
  relationships,
  groupId,
  groupName,
  allRelationships,
  onDelete,
}: ActiveRelationshipsTableProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (targetGroupId: string) => {
    setIsDeleting(true);
    try {
      await onDelete(targetGroupId);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Active Relationships ({relationships.length})
        </CardTitle>
        <CardDescription>Current active relationships with other groups</CardDescription>
      </CardHeader>
      <CardContent>
        {relationships.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No active relationships found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Relationship Type</TableHead>
                <TableHead>Rights</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relationships.map((rel, idx) => (
                <TableRow key={`${rel.group.id}-${rel.type}-${idx}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{rel.group.name}</div>
                      {rel.group.description && (
                        <div className="text-sm text-muted-foreground">
                          {rel.group.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rel.type === 'parent' ? 'default' : 'secondary'}>
                      {rel.type === 'parent' ? 'Parent Group' : 'Child Group'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(rel.rights)).map((r) => (
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
                          currentGroupName={groupName}
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
                                onClick={() => handleDelete(rel.group.id)}
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
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
