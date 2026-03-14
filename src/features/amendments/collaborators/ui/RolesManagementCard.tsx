/**
 * Card for managing roles and permissions
 */

import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Input } from '@/features/shared/ui/ui/input';
import { Checkbox } from '@/features/shared/ui/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/ui/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/features/shared/ui/ui/dialog';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { ACTION_RIGHTS } from '../utils/action-rights';
import type { Role } from '../hooks/useCollaborators';

interface RolesManagementCardProps {
  amendmentId: string;
  roles: Role[];
  onCreateRole: (name: string, description: string, amendmentId: string) => Promise<void>;
  onDeleteRole: (roleId: string) => Promise<void>;
  onToggleActionRight: (
    roleId: string,
    resource: string,
    action: string,
    currentlyHas: boolean,
    roles: Role[],
    amendmentId: string
  ) => Promise<void>;
}

export function RolesManagementCard({ amendmentId, roles, onCreateRole, onDeleteRole, onToggleActionRight }: RolesManagementCardProps) {
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);

  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;

    try {
      await onCreateRole(newRoleName, newRoleDescription, amendmentId);

      setNewRoleName('');
      setNewRoleDescription('');
      setAddRoleDialogOpen(false);
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await onDeleteRole(roleId);
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  const handleToggleActionRight = async (
    roleId: string,
    resource: string,
    action: string,
    currentlyHas: boolean
  ) => {
    try {
      await onToggleActionRight(roleId, resource, action, currentlyHas, roles, amendmentId);
    } catch (error) {
      console.error('Error toggling action right:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>Manage roles and their action rights for this amendment</CardDescription>
          </div>
          <Dialog open={addRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
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
                  Create a new role with custom permissions for this amendment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="role-name" className="text-sm font-medium">
                    Role Name
                  </label>
                  <Input
                    id="role-name"
                    placeholder="e.g., Editor, Reviewer, Contributor"
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="role-description" className="text-sm font-medium">
                    Description (Optional)
                  </label>
                  <Input
                    id="role-description"
                    placeholder="Describe this role's purpose"
                    value={newRoleDescription}
                    onChange={e => setNewRoleDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddRoleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddRole}>
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {roles && roles.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Action Right</TableHead>
                  {roles.map(role => (
                    <TableHead key={role.id} className="min-w-[120px] text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{role.name}</span>
                          <Badge
                            variant={role.scope === 'amendment' ? 'default' : 'secondary'}
                            className="px-1.5 py-0 text-[10px]"
                          >
                            {role.scope}
                          </Badge>
                        </div>
                        {role.description && (
                          <span className="text-xs font-normal text-muted-foreground">
                            {role.description}
                          </span>
                        )}
                        {role.scope === 'amendment' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-6 w-6 p-0"
                            onClick={() => handleRemoveRole(role.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ACTION_RIGHTS.map(({ resource, action, label }) => {
                  const rightKey = `${resource}-${action}`;
                  return (
                    <TableRow key={rightKey}>
                      <TableCell className="font-medium">{label}</TableCell>
                      {roles.map(role => {
                        const hasRight = role.action_rights?.some(
                          (ar: { resource: string; action: string }) => ar.resource === resource && ar.action === action
                        );
                        return (
                          <TableCell key={role.id} className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={hasRight}
                                onCheckedChange={() =>
                                  handleToggleActionRight(role.id, resource, action, hasRight || false)
                                }
                              />
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              No roles created yet. Click "Add Role" to create your first role.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
