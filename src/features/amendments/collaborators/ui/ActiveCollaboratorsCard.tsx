/**
 * Card displaying active collaborators with management options
 */

import { Button } from '@/features/shared/ui/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/ui/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/ui/select';
import { Users, Shield, Trash2 } from 'lucide-react';
import type { Collaborator, Role } from '../hooks/useCollaborators';

interface ActiveCollaboratorsCardProps {
  collaborators: Collaborator[];
  roles: Role[];
  onNavigateToUser: (userId: string) => void;
  onChangeRole: (collaboratorId: string, newRoleId: string) => Promise<void>;
  onPromoteToAdmin: (collaboratorId: string, roles: Role[]) => Promise<void>;
  onDemoteToMember: (collaboratorId: string, roles: Role[]) => Promise<void>;
  onRemoveCollaborator: (collaboratorId: string) => Promise<void>;
}

export function ActiveCollaboratorsCard({
  collaborators,
  roles,
  onNavigateToUser,
  onChangeRole,
  onPromoteToAdmin,
  onDemoteToMember,
  onRemoveCollaborator,
}: ActiveCollaboratorsCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Active Collaborators ({collaborators.length})
        </CardTitle>
        <CardDescription>Current amendment collaborators and administrators</CardDescription>
      </CardHeader>
      <CardContent>
        {collaborators.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No active collaborators found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.map(collaboration => {
                const user = collaboration.user;
                const userName = user
                  ? [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Unknown User'
                  : 'Unknown User';
                const userAvatar = user?.avatar || '';
                const userHandle = user?.handle || '';
                const matchedRole = roles.find(r => r.id === collaboration.role_id);
                const roleName = matchedRole?.name || 'Collaborator';
                const roleId = collaboration.role_id ?? undefined;
                const createdAt = collaboration.created_at
                  ? new Date(collaboration.created_at).toLocaleDateString()
                  : 'N/A';

                return (
                  <TableRow key={collaboration.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="h-10 w-10 cursor-pointer"
                          onClick={() => user && onNavigateToUser(user.id)}
                        >
                          <AvatarImage src={userAvatar} alt={userName} />
                          <AvatarFallback>
                            {userName
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className="cursor-pointer hover:underline"
                          onClick={() => user && onNavigateToUser(user.id)}
                        >
                          <div className="font-medium">{userName}</div>
                          {userHandle && (
                            <div className="text-sm text-muted-foreground">@{userHandle}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={roleId}
                        onValueChange={newRoleId =>
                          onChangeRole(collaboration.id, newRoleId)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder={roleName} />
                        </SelectTrigger>
                        <SelectContent>
                          {roles?.map(roleOption => (
                            <SelectItem key={roleOption.id} value={roleOption.id}>
                              {roleOption.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {roleName !== 'Author' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPromoteToAdmin(collaboration.id, roles)}
                          >
                            <Shield className="mr-1 h-4 w-4" />
                            Promote to Author
                          </Button>
                        )}
                        {roleName === 'Author' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDemoteToMember(collaboration.id, roles)}
                          >
                            Demote to Collaborator
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveCollaborator(collaboration.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="ml-2">Remove</span>
                        </Button>
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
  );
}
