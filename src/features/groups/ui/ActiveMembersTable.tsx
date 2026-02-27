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
import { ArrowUpDown, Trash2, Users } from 'lucide-react';
import type { GroupMembershipWithUser, GroupRole } from '../types/group.types';

interface ActiveMembersTableProps {
  members: GroupMembershipWithUser[];
  roles: GroupRole[];
  onChangeRole: (membershipId: string, roleId: string, userId: string) => void;
  onOpenChangeRoleDialog: (membership: GroupMembershipWithUser) => void;
  onRemove: (membershipId: string, userId: string) => void;
  onNavigateToUser: (userId: string) => void;
}

export function ActiveMembersTable({
  members,
  roles,
  onChangeRole,
  onOpenChangeRoleDialog,
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
                const userName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Unknown User';
                const userAvatar = user?.avatar || '';
                const userHandle = user?.handle || '';
                const role = membership.role?.name || 'Member';
                const createdAt = membership.created_at
                  ? new Date(membership.created_at).toLocaleDateString()
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
                      <span className="text-sm font-medium">{role}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenChangeRoleDialog(membership)}
                        >
                          <ArrowUpDown className="mr-1 h-4 w-4" />
                          Promote / Demote
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => user?.id && onRemove(membership.id, user.id)}
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
