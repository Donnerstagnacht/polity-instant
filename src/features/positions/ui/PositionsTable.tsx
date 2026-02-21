/**
 * Positions Table Component
 *
 * Displays and manages group positions with holders, elections, and history.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Briefcase, Edit, Trash2, UserPlus, History, Vote, Calendar, User } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';

interface PositionsTableProps {
  positions: any[];
  canManage: boolean;
  onEdit: (position: any) => void;
  onDelete: (positionId: string) => void;
  onAssignHolder: (position: any) => void;
  onRemoveHolder: (positionId: string) => void;
  onViewHistory: (position: any) => void;
  onCreateElection: (positionId: string) => void;
  addPositionButton: React.ReactNode;
}

export function PositionsTable({
  positions,
  canManage,
  onEdit,
  onDelete,
  onAssignHolder,
  onRemoveHolder,
  onViewHistory,
  onCreateElection,
  addPositionButton,
}: PositionsTableProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [removeHolderConfirmOpen, setRemoveHolderConfirmOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);

  const handleDeleteClick = (position: any) => {
    setSelectedPosition(position);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPosition) {
      onDelete(selectedPosition.id);
    }
    setDeleteConfirmOpen(false);
    setSelectedPosition(null);
  };

  const handleRemoveHolderClick = (position: any) => {
    setSelectedPosition(position);
    setRemoveHolderConfirmOpen(true);
  };

  const handleRemoveHolderConfirm = () => {
    if (selectedPosition) {
      onRemoveHolder(selectedPosition.id);
    }
    setRemoveHolderConfirmOpen(false);
    setSelectedPosition(null);
  };

  const getTermEndDate = (position: any) => {
    if (!position.firstTermStart || !position.term) return null;
    const start = new Date(position.firstTermStart);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + position.term);
    return end;
  };

  const isTermExpiring = (position: any) => {
    const termEnd = getTermEndDate(position);
    if (!termEnd) return false;
    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return termEnd <= sixMonthsFromNow && termEnd >= now;
  };

  const isTermExpired = (position: any) => {
    const termEnd = getTermEndDate(position);
    if (!termEnd) return false;
    return termEnd < new Date();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Positions
              </CardTitle>
              <CardDescription>
                Manage positions, assign holders, and track elections
              </CardDescription>
            </div>
            {canManage && addPositionButton}
          </div>
        </CardHeader>
        <CardContent>
          {positions && positions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Current Holder</TableHead>
                    <TableHead>Term Info</TableHead>
                    <TableHead>Elections</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => {
                    const termEnd = getTermEndDate(position);
                    const isExpiring = isTermExpiring(position);
                    const isExpired = isTermExpired(position);
                    const activeElections = position.elections?.filter(
                      (e: any) => e.status === 'active' || e.status === 'pending'
                    ) || [];

                    return (
                      <TableRow key={position.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{position.title}</div>
                            {position.description && (
                              <div className="text-sm text-muted-foreground">
                                {position.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {position.currentHolder ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={position.currentHolder.imageURL} />
                                <AvatarFallback>
                                  {position.currentHolder.fullName?.[0] || 
                                   position.currentHolder.handle?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">
                                  {position.currentHolder.fullName || position.currentHolder.handle}
                                </div>
                                {position.currentHolder.handle && (
                                  <div className="text-xs text-muted-foreground">
                                    @{position.currentHolder.handle}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span className="text-sm">Vacant</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span>{position.term} year{position.term > 1 ? 's' : ''}</span>
                            </div>
                            {termEnd && (
                              <div className="flex flex-col gap-1">
                                <div className="text-xs text-muted-foreground">
                                  Ends: {format(termEnd, 'MMM d, yyyy')}
                                </div>
                                {isExpired && (
                                  <Badge variant="destructive" className="w-fit">
                                    Expired
                                  </Badge>
                                )}
                                {isExpiring && !isExpired && (
                                  <Badge variant="outline" className="w-fit border-orange-500 text-orange-500">
                                    Expiring Soon
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {activeElections.length > 0 ? (
                              <Badge variant="secondary" className="gap-1">
                                <Vote className="h-3 w-3" />
                                {activeElections.length} Active
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">No active elections</span>
                            )}
                          </div>
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewHistory(position)}
                                title="View History"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              {position.currentHolder ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveHolderClick(position)}
                                  title="Remove Holder"
                                >
                                  <UserPlus className="h-4 w-4 text-orange-500" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onAssignHolder(position)}
                                  title="Assign Holder"
                                >
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCreateElection(position.id)}
                                title="Create Election"
                              >
                                <Vote className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(position)}
                                title="Edit Position"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(position)}
                                title="Delete Position"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No positions created yet. Click "Add Position" to create your first position.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Position Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Position?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPosition?.title}"? This action cannot be undone.
              {selectedPosition?.currentHolder && (
                <span className="mt-2 block font-semibold text-orange-600">
                  Warning: This position currently has a holder assigned.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Holder Confirmation */}
      <AlertDialog open={removeHolderConfirmOpen} onOpenChange={setRemoveHolderConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Current Holder?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedPosition?.currentHolder?.fullName || selectedPosition?.currentHolder?.handle} from "{selectedPosition?.title}"?
              This will mark the position as vacant and record the removal in the position history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveHolderConfirm}>
              Remove Holder
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
