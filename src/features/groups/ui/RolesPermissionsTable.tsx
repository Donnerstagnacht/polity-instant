/**
 * Roles Permissions Table Component
 *
 * Matrix table for managing role permissions with draggable columns.
 * Column order represents role hierarchy: left = least rights, right = most rights.
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Checkbox } from '@/features/shared/ui/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/ui/ui/table';
import { GripVertical, Shield, Trash2 } from 'lucide-react';
import { ACTION_RIGHTS } from '@/zero/rbac/constants';
import type { GroupRole } from '../types/group.types';

interface RolesPermissionsTableProps {
  roles: GroupRole[];
  onTogglePermission: (roleId: string, resource: string, action: string, currentlyHas: boolean) => void;
  onRemoveRole: (roleId: string) => void;
  onReorderRoles: (orderedRoleIds: string[]) => void;
  addRoleButton: React.ReactNode;
}

export function RolesPermissionsTable({
  roles,
  onTogglePermission,
  onRemoveRole,
  onReorderRoles,
  addRoleButton,
}: RolesPermissionsTableProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      dragCounter.current = 0;
      return;
    }

    const reordered = [...roles];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    onReorderRoles(reordered.map((r) => r.id));

    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
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
            <CardDescription>
              Manage roles and their action rights. Drag columns to reorder — left is least privileged, right is most privileged.
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
                  {roles.map((role, index) => (
                    <TableHead
                      key={role.id}
                      className={`min-w-[120px] text-center transition-colors ${
                        draggedIndex === index ? 'opacity-50' : ''
                      } ${dragOverIndex === index && draggedIndex !== index ? 'bg-accent' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex cursor-grab items-center gap-1">
                          <GripVertical className="h-3 w-3 text-muted-foreground" />
                          <span className="font-semibold">{role.name}</span>
                        </div>
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
                        const hasRight = role.action_rights?.some(
                          ar => ar.resource === resource && ar.action === action
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
