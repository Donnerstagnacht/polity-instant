/**
 * Roles Permissions Table Component
 *
 * Matrix table for managing role permissions.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, Trash2 } from 'lucide-react';
import { ACTION_RIGHTS } from '../../../../db/rbac/constants';
import type { GroupRole } from '../types/group.types';

interface RolesPermissionsTableProps {
  roles: GroupRole[];
  onTogglePermission: (roleId: string, resource: string, action: string, currentlyHas: boolean) => void;
  onRemoveRole: (roleId: string) => void;
  addRoleButton: React.ReactNode;
}

export function RolesPermissionsTable({
  roles,
  onTogglePermission,
  onRemoveRole,
  addRoleButton,
}: RolesPermissionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>
              Manage roles and their action rights for this group
            </CardDescription>
          </div>
          {addRoleButton}
        </div>
      </CardHeader>
      <CardContent>
        {roles && roles.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Action Right</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="min-w-[120px] text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold">{role.name}</span>
                        {role.description && (
                          <span className="text-xs font-normal text-muted-foreground">
                            {role.description}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-6 w-6 p-0"
                          onClick={() => onRemoveRole(role.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
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
                      {roles.map((role) => {
                        const hasRight = role.actionRights?.some(
                          (ar) => ar.resource === resource && ar.action === action
                        );
                        return (
                          <TableCell key={role.id} className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={hasRight}
                                onCheckedChange={() =>
                                  onTogglePermission(
                                    role.id,
                                    resource,
                                    action,
                                    hasRight || false
                                  )
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
