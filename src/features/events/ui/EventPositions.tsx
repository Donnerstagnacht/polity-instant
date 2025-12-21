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
import { useEventPositions } from '../hooks/useEventPositions';

export function EventPositions({ eventId }: { eventId: string }) {
  const { event, positions, dialogs, form, actions } = useEventPositions(eventId);

  return (
      <div className='container mx-auto max-w-7xl p-8'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold'>Manage Event Positions</h1>
          <p className='mt-2 text-muted-foreground'>
            {event?.title || 'Event'} - Create and manage positions for this event
          </p>
        </div>

        {/* Add Position Button */}
        <div className='mb-6 flex justify-end'>
          <Dialog open={dialogs.add.open} onOpenChange={dialogs.add.setOpen}>
            <DialogTrigger asChild>
              <Button onClick={form.reset}>
                <Plus className='mr-2 h-4 w-4' />
                Add Position
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px]'>
              <DialogHeader>
                <DialogTitle>Create New Position</DialogTitle>
                <DialogDescription>
                  Create a position for this event (e.g., Session Chair, Counting Committee).
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='title'>Position Title *</Label>
                  <Input
                    id='title'
                    placeholder='e.g., Session Chair, Counting Committee'
                    value={form.title}
                    onChange={e => form.setTitle(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Description (Optional)</Label>
                  <Textarea
                    id='description'
                    placeholder='Describe the responsibilities of this position'
                    value={form.description}
                    onChange={e => form.setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='capacity'>Number of Holders *</Label>
                  <Input
                    id='capacity'
                    type='number'
                    min='1'
                    placeholder='1'
                    value={form.capacity}
                    onChange={e => form.setCapacity(e.target.value)}
                  />
                  <p className='text-xs text-muted-foreground'>
                    How many participants can hold this position
                  </p>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='create-election'
                    checked={form.createElection}
                    onCheckedChange={checked => form.setCreateElection(checked as boolean)}
                  />
                  <Label htmlFor='create-election' className='cursor-pointer text-sm font-normal'>
                    Create election agenda item at the beginning of the event
                  </Label>
                </div>
              </div>

              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => dialogs.add.setOpen(false)}>
                  Cancel
                </Button>
                <Button type='button' onClick={actions.add}>
                  Create Position
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Position Dialog */}
        <Dialog open={dialogs.edit.open} onOpenChange={dialogs.edit.setOpen}>
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>Edit Position</DialogTitle>
              <DialogDescription>Update the position details.</DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='edit-title'>Position Title *</Label>
                <Input
                  id='edit-title'
                  placeholder='e.g., Session Chair, Counting Committee'
                  value={form.title}
                  onChange={e => form.setTitle(e.target.value)}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit-description'>Description (Optional)</Label>
                <Textarea
                  id='edit-description'
                  placeholder='Describe the responsibilities of this position'
                  value={form.description}
                  onChange={e => form.setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='edit-capacity'>Number of Holders *</Label>
                <Input
                  id='edit-capacity'
                  type='number'
                  min='1'
                  placeholder='1'
                  value={form.capacity}
                  onChange={e => form.setCapacity(e.target.value)}
                />
                <p className='text-xs text-muted-foreground'>
                  How many participants can hold this position
                </p>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='edit-create-election'
                  checked={form.createElection}
                  onCheckedChange={checked => form.setCreateElection(checked as boolean)}
                />
                <Label
                  htmlFor='edit-create-election'
                  className='cursor-pointer text-sm font-normal'
                >
                  Create election agenda item at the beginning of the event
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={() => dialogs.edit.setOpen(false)}>
                Cancel
              </Button>
              <Button type='button' onClick={actions.edit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Positions List */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UserCheck className='h-5 w-5' />
              Event Positions ({positions.length})
            </CardTitle>
            <CardDescription>
              Positions for this event with their holders and election settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {positions.length === 0 ? (
              <div className='py-12 text-center'>
                <UserCheck className='mx-auto h-12 w-12 text-muted-foreground/50' />
                <p className='mt-4 text-muted-foreground'>
                  No positions created yet. Click 'Add Position' to create your first position.
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
                    <TableHead className='text-right'>Actions</TableHead>
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
                            <div className='font-medium'>{position.title}</div>
                            {position.description && (
                              <div className='line-clamp-1 text-sm text-muted-foreground'>
                                {position.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline'>
                            {filledSlots} / {totalSlots}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {holders.length > 0 ? (
                            <div className='flex -space-x-2'>
                              {holders.slice(0, 3).map((holder: any) => (
                                <Avatar
                                  key={holder.id}
                                  className='h-8 w-8 border-2 border-background'
                                >
                                  <AvatarImage src={holder.user?.avatar} alt={holder.user?.name} />
                                  <AvatarFallback>
                                    {holder.user?.name?.[0]?.toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {holders.length > 3 && (
                                <div className='flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium'>
                                  +{holders.length - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className='text-sm text-muted-foreground'>No holders yet</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {hasElection ? (
                            <Badge variant='secondary'>
                              <UserCheck className='mr-1 h-3 w-3' />
                              Election
                            </Badge>
                          ) : (
                            <span className='text-sm text-muted-foreground'>Manual</span>
                          )}
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => actions.openEdit(position)}
                            >
                              <Edit2 className='h-4 w-4' />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <Trash2 className='h-4 w-4 text-destructive' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Position</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete '{position.title}'? This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => actions.delete(position.id)}
                                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
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
  );
}

