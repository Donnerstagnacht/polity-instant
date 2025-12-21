/**
 * Card displaying pending invitations
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPlus, Trash2 } from 'lucide-react';
import { withdrawInvitation } from '../utils/collaborator-operations';
import type { Collaborator } from '../hooks/useCollaborators';

interface PendingInvitationsCardProps {
  invitations: Collaborator[];
  onNavigateToUser: (userId: string) => void;
}

export function PendingInvitationsCard({
  invitations,
  onNavigateToUser,
}: PendingInvitationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Pending Invitations ({invitations.length})
        </CardTitle>
        <CardDescription>Users who have been invited but haven't accepted yet</CardDescription>
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
            {invitations.map(collaboration => {
              const user = collaboration.user;
              const userName = user?.name || 'Unknown User';
              const userAvatar = user?.avatar || '';
              const userHandle = user?.handle || '';
              const createdAt = collaboration.createdAt
                ? new Date(collaboration.createdAt).toLocaleDateString()
                : 'N/A';

              return (
                <TableRow key={collaboration.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-10 w-10 cursor-pointer"
                        onClick={() => onNavigateToUser(user.id)}
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
                        onClick={() => onNavigateToUser(user.id)}
                      >
                        <div className="font-medium">{userName}</div>
                        {userHandle && (
                          <div className="text-sm text-muted-foreground">@{userHandle}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => withdrawInvitation(collaboration.id)}
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
