/**
 * Change Role Dialog Component
 *
 * Allows promoting or demoting a member by selecting a new role.
 * Roles are split into promotion and demotion sections based on sort_order.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { GroupRole } from '../types/group.types';

interface ChangeRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentRole: GroupRole | null;
  roles: GroupRole[];
  onConfirm: (newRoleId: string) => void;
}

export function ChangeRoleDialog({
  isOpen,
  onOpenChange,
  memberName,
  currentRole,
  roles,
  onConfirm,
}: ChangeRoleDialogProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const currentSortOrder = currentRole?.sort_order ?? -1;

  const promotionRoles = roles.filter(
    (r) => r.id !== currentRole?.id && (r.sort_order ?? 0) > currentSortOrder
  );
  const demotionRoles = roles.filter(
    (r) => r.id !== currentRole?.id && (r.sort_order ?? 0) < currentSortOrder
  );

  const handleConfirm = () => {
    if (selectedRoleId) {
      onConfirm(selectedRoleId);
      setSelectedRoleId('');
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedRoleId('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Select a new role for <span className="font-medium">{memberName}</span>.
            {currentRole && (
              <> Current role: <span className="font-medium">{currentRole.name}</span>.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedRoleId} onValueChange={setSelectedRoleId} className="space-y-4">
          {promotionRoles.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                <ArrowUp className="h-4 w-4" />
                Promote
              </div>
              <div className="space-y-2 pl-1">
                {promotionRoles.map((role) => (
                  <Label
                    key={role.id}
                    htmlFor={`role-${role.id}`}
                    className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent has-[[data-state=checked]]:border-green-500 has-[[data-state=checked]]:bg-green-50 dark:has-[[data-state=checked]]:bg-green-950/20"
                  >
                    <RadioGroupItem value={role.id} id={`role-${role.id}`} />
                    <div>
                      <div className="font-medium">{role.name}</div>
                      {role.description && (
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      )}
                    </div>
                  </Label>
                ))}
              </div>
            </div>
          )}

          {demotionRoles.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-orange-600 dark:text-orange-400">
                <ArrowDown className="h-4 w-4" />
                Demote
              </div>
              <div className="space-y-2 pl-1">
                {demotionRoles.map((role) => (
                  <Label
                    key={role.id}
                    htmlFor={`role-${role.id}`}
                    className="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent has-[[data-state=checked]]:border-orange-500 has-[[data-state=checked]]:bg-orange-50 dark:has-[[data-state=checked]]:bg-orange-950/20"
                  >
                    <RadioGroupItem value={role.id} id={`role-${role.id}`} />
                    <div>
                      <div className="font-medium">{role.name}</div>
                      {role.description && (
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      )}
                    </div>
                  </Label>
                ))}
              </div>
            </div>
          )}

          {promotionRoles.length === 0 && demotionRoles.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No other roles available.
            </p>
          )}
        </RadioGroup>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedRoleId}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
