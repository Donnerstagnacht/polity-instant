/**
 * Active Members Table Component
 *
 * Displays active group members with role management and actions.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Trash2, Users } from 'lucide-react';
import type { GroupMembershipWithUser, GroupRole } from '../types/group.types';

interface ActiveMembersTableProps {
  members: GroupMembershipWithUser[];
  roles: GroupRole[];
  onChangeRole: (membershipId: string, roleId: string) => void;
  onPromote: (membershipId: string) => void;
  onDemote: (membershipId: string) => void;
  onRemove: (membershipId: string) => void;
  onNavigateToUser: (userId: string) => void;
}

export function ActiveMembersTable({
  members,
  roles,
  onChangeRole,
  onPromote,
  onDemote,
  onRemove,
  onNavigateToUser,
}: ActiveMembersTableProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Active Members ({members.length})
        </CardTitle>
        <CardDescription>Current group members and administrators</CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No active members found</p>
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
              {members.map((membership) => {
                const user = membership.user;
                const userName = user?.name || 'Unknown User';
                const userAvatar = user?.avatar || '';
                const userHandle = user?.username || '';
                const role = membership.role?.name || 'Member';
                const roleId = membership.role?.id || '';
                const createdAt = membership.createdAt
                  ? new Date(membership.createdAt).toLocaleDateString()
                  : 'N/A';

                return (
                  <TableRow key={membership.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="h-10 w-10 cursor-pointer"
                          onClick={() => user?.id && onNavigateToUser(user.id)}
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
                          onClick={() => user?.id && onNavigateToUser(user.id)}
                        >
                          <div className="font-medium">{userName}</div>
                          {userHandle && (
                            <div className="text-sm text-muted-foreground">
                              @{userHandle}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={roleId}
                        onValueChange={(newRoleId) =>
                          onChangeRole(membership.id, newRoleId)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder={role} />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((roleOption) => (
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
                        {role !== 'Board Member' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPromote(membership.id)}
                          >
                            <Shield className="mr-1 h-4 w-4" />
                            Promote to Board Member
                          </Button>
                        )}
                        {role === 'Board Member' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDemote(membership.id)}
                          >
                            Demote to Member
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemove(membership.id)}
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
