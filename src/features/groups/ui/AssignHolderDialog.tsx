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
} from '@/components/ui/dialog';
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
import { Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/utils';

interface AssignHolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: any;
  groupId: string;
  onAssign: (userId: string, reason: 'elected' | 'appointed') => void;
}

export function AssignHolderDialog({
  open,
  onOpenChange,
  position,
  groupId,
  onAssign,
}: AssignHolderDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reason, setReason] = useState<'elected' | 'appointed'>('appointed');

  // Query group members only
  const { data } = db.useQuery({
    groupMemberships: {
      $: {
        where: {
          'group.id': groupId,
          status: 'member',
        },
      },
      user: {},
    },
  });

  const members = data?.groupMemberships || [];

  // Filter members based on search query
  const filteredMembers = members.filter((membership: any) => {
    const user = membership.user;
    if (!user?.id) return false;
    const query = searchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(query) ||
      user.handle?.toLowerCase().includes(query) ||
      user.contactEmail?.toLowerCase().includes(query)
    );
  });

  const selectedMember = members.find((m: any) => m.user?.id === selectedUserId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error('Please select a member');
      return;
    }

    onAssign(selectedUserId, reason);
    onOpenChange(false);
    setSelectedUserId(null);
    setSearchQuery('');
    setReason('appointed');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Holder to Position</DialogTitle>
            <DialogDescription>
              {position?.currentHolder
                ? `Replace the current holder of "${position?.title}" with a new member.`
                : `Assign a member to the "${position?.title}" position.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {position?.currentHolder && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={position.currentHolder.imageURL} />
                    <AvatarFallback>
                      {position.currentHolder.fullName?.[0] || 
                       position.currentHolder.handle?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      Current: {position.currentHolder.fullName || position.currentHolder.handle}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Will be replaced
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="holder-select">
                Select Member <span className="text-destructive">*</span>
              </Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="holder-select"
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between"
                  >
                    {selectedMember?.user ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedMember.user.imageURL} />
                          <AvatarFallback>
                            {selectedMember.user.name?.[0] || 
                             selectedMember.user.handle?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {selectedMember.user.name || selectedMember.user.handle}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select a member...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[460px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search members..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No members found.</CommandEmpty>
                      <CommandGroup>
                        {filteredMembers.map((membership: any) => {
                          const user = membership.user;
                          return (
                            <CommandItem
                              key={user.id}
                              value={user.id}
                              onSelect={(value) => {
                                setSelectedUserId(value);
                                setPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedUserId === user.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <Avatar className="mr-2 h-8 w-8">
                                <AvatarImage src={user.imageURL} />
                                <AvatarFallback>
                                  {user.name?.[0] || user.handle?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {user.name || user.handle}
                                </span>
                                {user.handle && (
                                  <span className="text-xs text-muted-foreground">
                                    @{user.handle}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-reason">Assignment Reason</Label>
              <Select value={reason} onValueChange={(value) => setReason(value as 'elected' | 'appointed')}>
                <SelectTrigger id="assignment-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointed">Appointed</SelectItem>
                  <SelectItem value="elected">Elected</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will be recorded in the position's history
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {position?.currentHolder ? 'Replace Holder' : 'Assign Holder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
