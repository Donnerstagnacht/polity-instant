'use client';

import { useState } from 'react';
import db from '../../../../db/db';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    label: string;
    type: string;
    amount: number;
    direction: 'income' | 'expense';
    payerUserId?: string;
    payerGroupId?: string;
    receiverUserId?: string;
    receiverGroupId?: string;
  }) => void;
  direction: 'income' | 'expense';
  groupId: string;
}

export function AddPaymentDialog({
  open,
  onOpenChange,
  onSubmit,
  direction,
  groupId,
}: AddPaymentDialogProps) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('donation');
  const [amount, setAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [entityType, setEntityType] = useState<'user' | 'group'>('user');
  const [selectedEntity, setSelectedEntity] = useState<{
    id: string;
    name: string;
    type: 'user' | 'group';
  } | null>(null);

  // Query all users for user search
  const { data: usersData } = db.useQuery({
    $users: {},
  });

  // Query all groups for group search
  const { data: groupsData } = db.useQuery({
    groups: {},
  });

  // Filter entities based on search query and selected entity type
  const filteredUsers =
    entityType === 'user'
      ? usersData?.$users?.filter((user: any) => {
          if (!user?.id) return false;
          const query = searchQuery.toLowerCase();
          return (
            user.name?.toLowerCase().includes(query) ||
            user.handle?.toLowerCase().includes(query) ||
            user.contactEmail?.toLowerCase().includes(query)
          );
        })
      : [];

  const filteredGroups =
    entityType === 'group'
      ? groupsData?.groups?.filter((group: any) => {
          const query = searchQuery.toLowerCase();
          return group.name?.toLowerCase().includes(query);
        })
      : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that an entity is selected
    if (!selectedEntity) {
      toast.error(`Please select a ${direction === 'income' ? 'payer' : 'receiver'}`);
      return;
    }

    const paymentData: any = {
      label,
      type,
      amount: parseFloat(amount),
      direction,
    };

    // Set payer and receiver based on direction
    if (direction === 'income') {
      // Group is receiver, selected entity is payer
      paymentData.receiverGroupId = groupId;
      if (selectedEntity.type === 'user') {
        paymentData.payerUserId = selectedEntity.id;
      } else {
        paymentData.payerGroupId = selectedEntity.id;
      }
    } else {
      // Group is payer, selected entity is receiver
      paymentData.payerGroupId = groupId;
      if (selectedEntity.type === 'user') {
        paymentData.receiverUserId = selectedEntity.id;
      } else {
        paymentData.receiverGroupId = selectedEntity.id;
      }
    }

    onSubmit(paymentData);
    setLabel('');
    setType('donation');
    setAmount('');
    setSelectedEntity(null);
    setSearchQuery('');
    setEntityType('user');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add {direction === 'income' ? 'Income' : 'Expense'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add {direction === 'income' ? 'Income' : 'Expense'}</DialogTitle>
            <DialogDescription>
              Record a new {direction} transaction for this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-label">Label</Label>
              <Input
                id="payment-label"
                placeholder="Description of payment"
                value={label}
                onChange={e => setLabel(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="payment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="membership_fee">Membership Fee</SelectItem>
                  <SelectItem value="donation">Donation</SelectItem>
                  <SelectItem value="subsidies">Subsidies</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount ($)</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-entity">
                {direction === 'income' ? 'From (Payer)' : 'To (Receiver)'}
              </Label>

              {/* Toggle between User and Group */}
              <div className="mb-2 flex gap-2">
                <Button
                  type="button"
                  variant={entityType === 'user' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setEntityType('user');
                    setSelectedEntity(null);
                    setSearchQuery('');
                  }}
                  className="flex-1"
                >
                  User
                </Button>
                <Button
                  type="button"
                  variant={entityType === 'group' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setEntityType('group');
                    setSelectedEntity(null);
                    setSearchQuery('');
                  }}
                  className="flex-1"
                >
                  Group
                </Button>
              </div>

              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="payment-entity"
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between"
                  >
                    {selectedEntity ? (
                      <div className="flex items-center gap-2">
                        {selectedEntity.type === 'user' && (
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs">
                              {selectedEntity.name[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span>{selectedEntity.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({selectedEntity.type})
                        </span>
                      </div>
                    ) : (
                      `Select ${entityType}...`
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={`Search ${entityType === 'user' ? 'users' : 'groups'}...`}
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>
                        No {entityType === 'user' ? 'users' : 'groups'} found.
                      </CommandEmpty>
                      {filteredUsers && filteredUsers.length > 0 && (
                        <CommandGroup heading="Users">
                          {filteredUsers.map((user: any) => {
                            if (!user?.id) return null;
                            const userId = user.id;
                            const isSelected = selectedEntity?.id === userId;
                            return (
                              <CommandItem
                                key={userId}
                                value={`user-${userId}`}
                                onSelect={() => {
                                  setSelectedEntity({
                                    id: userId,
                                    name: user.name || 'Unnamed User',
                                    type: 'user',
                                  });
                                  setPopoverOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-1 items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    {user.avatar ? (
                                      <AvatarImage src={user.avatar} alt={user.name || ''} />
                                    ) : null}
                                    <AvatarFallback className="text-xs">
                                      {user.name?.[0]?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {user.name || 'Unnamed User'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {user.handle ? `@${user.handle}` : user.contactEmail}
                                    </div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="ml-2 h-4 w-4 text-primary" strokeWidth={3} />
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}
                      {filteredGroups && filteredGroups.length > 0 && (
                        <CommandGroup heading="Groups">
                          {filteredGroups.map((group: any) => {
                            const isSelected = selectedEntity?.id === group.id;
                            return (
                              <CommandItem
                                key={group.id}
                                value={`group-${group.id}`}
                                onSelect={() => {
                                  setSelectedEntity({
                                    id: group.id,
                                    name: group.name,
                                    type: 'group',
                                  });
                                  setPopoverOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-1 items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                    {group.name[0]?.toUpperCase()}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{group.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {group.memberCount} members
                                    </div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="ml-2 h-4 w-4 text-primary" strokeWidth={3} />
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
