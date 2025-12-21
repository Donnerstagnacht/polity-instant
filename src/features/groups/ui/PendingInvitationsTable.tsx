/**
 * Pending Invitations Table Component
 *
 * Displays pending invitations that haven't been accepted yet.
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
import { Trash2, UserPlus } from 'lucide-react';
import type { GroupMembershipWithUser } from '../types/group.types';

interface PendingInvitationsTableProps {
  invitations: GroupMembershipWithUser[];
  onWithdraw: (membershipId: string) => void;
  onNavigateToUser: (userId: string) => void;
}

export function PendingInvitationsTable({
  invitations,
  onWithdraw,
  onNavigateToUser,
}: PendingInvitationsTableProps) {
  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Pending Invitations ({invitations.length})
        </CardTitle>
        <CardDescription>
          Users who have been invited but haven't accepted yet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((membership) => {
              const user = membership.user;
              const userName = user?.name || 'Unknown User';
              const userAvatar = user?.avatar || '';
              const userHandle = user?.username || '';
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
                  <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onWithdraw(membership.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2">Withdraw Invitation</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
