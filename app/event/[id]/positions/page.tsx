'use client';

import { use, useState } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import db, { tx, id } from '../../../../db/db';
import { useEventMutations } from '@/features/events/hooks/useEventMutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Trash2, UserCheck, Plus, Edit2 } from 'lucide-react';
import { useToast } from '@/global-state/use-toast';
import { useAuthStore } from '@/features/auth/auth';

export default function EventPositionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const { user: authUser } = useAuthStore();

  // Initialize event mutations hook
  const mutations = useEventMutations(resolvedParams.id);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('1');
  const [createElection, setCreateElection] = useState(false);

  // Query event and positions
  const { data: eventData } = db.useQuery({
    events: {
      $: {
        where: {
          id: resolvedParams.id,
        },
      },
      creator: {},
      group: {},
    },
    eventPositions: {
      $: {
        where: {
          'event.id': resolvedParams.id,
        },
      },
      holders: {
        user: {},
      },
      election: {},
    },
  });

  const event = eventData?.events?.[0];
  const positions = eventData?.eventPositions || [];

  // Check if current user is event creator
  const isCreator = event?.creator?.id === authUser?.id;
  const isAdmin = isCreator; // For now, only creator is admin

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCapacity('1');
    setCreateElection(false);
  };

  const handleAddPosition = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Position title is required',
        variant: 'destructive',
      });
      return;
    }

    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum < 1) {
      toast({
        title: 'Error',
        description: 'Capacity must be at least 1',
        variant: 'destructive',
      });
      return;
    }

    try {
      const positionId = id();
      const now = Date.now();

      await db.transact([
        tx.eventPositions[positionId]
          .create({
            title: title.trim(),
            description: description.trim() || null,
            capacity: capacityNum,
            createElectionOnAgenda: createElection,
            createdAt: now,
            updatedAt: now,
          })
          .link({ event: resolvedParams.id }),
      ]);

      toast({
        title: 'Success',
        description: 'Position created successfully',
      });

      resetForm();
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to create position:', error);
      toast({
        title: 'Error',
        description: 'Failed to create position. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditPosition = async () => {
    if (!editingPosition || !title.trim()) {
      toast({
        title: 'Error',
        description: 'Position title is required',
        variant: 'destructive',
      });
      return;
    }

    const capacityNum = parseInt(capacity, 10);
    if (isNaN(capacityNum) || capacityNum < 1) {
      toast({
        title: 'Error',
        description: 'Capacity must be at least 1',
        variant: 'destructive',
      });
      return;
    }

    try {
      await db.transact([
        tx.eventPositions[editingPosition.id].update({
          title: title.trim(),
          description: description.trim() || null,
          capacity: capacityNum,
          createElectionOnAgenda: createElection,
          updatedAt: Date.now(),
        }),
      ]);

      toast({
        title: 'Success',
        description: 'Position updated successfully',
      });

      resetForm();
      setEditingPosition(null);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update position:', error);
      toast({
        title: 'Error',
        description: 'Failed to update position. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    try {
      await db.transact([tx.eventPositions[positionId].delete()]);

      toast({
        title: 'Success',
        description: 'Position deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete position:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete position. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (position: any) => {
    setEditingPosition(position);
    setTitle(position.title || '');
    setDescription(position.description || '');
    setCapacity(String(position.capacity || 1));
    setCreateElection(position.createElectionOnAgenda || false);
    setEditDialogOpen(true);
  };

  if (!isAdmin) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="container mx-auto max-w-4xl p-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Only event administrators can manage event positions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto max-w-7xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Manage Event Positions</h1>
          <p className="mt-2 text-muted-foreground">
            {event?.title || 'Event'} - Create and manage positions for this event
          </p>
        </div>

        {/* Add Position Button */}
        <div className="mb-6 flex justify-end">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Position
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Position</DialogTitle>
                <DialogDescription>
                  Create a position for this event (e.g., Session Chair, Counting Committee).
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Position Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Session Chair, Counting Committee"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the responsibilities of this position"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Number of Holders *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    How many participants can hold this position
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-election"
                    checked={createElection}
                    onCheckedChange={checked => setCreateElection(checked as boolean)}
                  />
                  <Label htmlFor="create-election" className="cursor-pointer text-sm font-normal">
                    Create election agenda item at the beginning of the event
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddPosition}>
                  Create Position
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Position Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Position</DialogTitle>
              <DialogDescription>Update the position details.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Position Title *</Label>
                <Input
                  id="edit-title"
                  placeholder="e.g., Session Chair, Counting Committee"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe the responsibilities of this position"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Number of Holders *</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={capacity}
                  onChange={e => setCapacity(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  How many participants can hold this position
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-create-election"
                  checked={createElection}
                  onCheckedChange={checked => setCreateElection(checked as boolean)}
                />
                <Label
                  htmlFor="edit-create-election"
                  className="cursor-pointer text-sm font-normal"
                >
                  Create election agenda item at the beginning of the event
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleEditPosition}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Positions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Event Positions ({positions.length})
            </CardTitle>
            <CardDescription>
              Positions for this event with their holders and election settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {positions.length === 0 ? (
              <div className="py-12 text-center">
                <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  No positions created yet. Click "Add Position" to create your first position.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Current Holders</TableHead>
                    <TableHead>Election</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position: any) => {
                    const holders = position.holders || [];
                    const filledSlots = holders.length;
                    const totalSlots = position.capacity || 1;
                    const hasElection = position.createElectionOnAgenda;

                    return (
                      <TableRow key={position.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{position.title}</div>
                            {position.description && (
                              <div className="line-clamp-1 text-sm text-muted-foreground">
                                {position.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {filledSlots} / {totalSlots}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {holders.length > 0 ? (
                            <div className="flex -space-x-2">
                              {holders.slice(0, 3).map((holder: any) => (
                                <Avatar
                                  key={holder.id}
                                  className="h-8 w-8 border-2 border-background"
                                >
                                  <AvatarImage src={holder.user?.avatar} alt={holder.user?.name} />
                                  <AvatarFallback>
                                    {holder.user?.name?.[0]?.toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {holders.length > 3 && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                                  +{holders.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No holders yet</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {hasElection ? (
                            <Badge variant="secondary">
                              <UserCheck className="mr-1 h-3 w-3" />
                              Election
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Manual</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(position)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Position</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{position.title}"? This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePosition(position.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
