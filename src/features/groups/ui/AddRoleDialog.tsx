/**
 * Add Role Dialog Component
 *
 * Dialog for creating a new role in the group.
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface AddRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roleName: string;
  onRoleNameChange: (name: string) => void;
  roleDescription: string;
  onRoleDescriptionChange: (description: string) => void;
  onAdd: () => void;
}

export function AddRoleDialog({
  isOpen,
  onOpenChange,
  roleName,
  onRoleNameChange,
  roleDescription,
  onRoleDescriptionChange,
  onAdd,
}: AddRoleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Role</DialogTitle>
          <DialogDescription>
            Create a new role with custom permissions for this group.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="role-name" className="text-sm font-medium">
              Role Name
            </label>
            <Input
              id="role-name"
              placeholder="e.g., Moderator, Editor, Organizer"
              value={roleName}
              onChange={(e) => onRoleNameChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="role-description" className="text-sm font-medium">
              Description (Optional)
            </label>
            <Input
              id="role-description"
              placeholder="Describe this role's purpose"
              value={roleDescription}
              onChange={(e) => onRoleDescriptionChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={onAdd}>
            Create Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
