/**
 * Pending Requests Table Component
 *
 * Displays pending membership requests for group admins to approve or reject.
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
import { Check, Trash2, Users } from 'lucide-react';
import type { GroupMembershipWithUser } from '../types/group.types';

interface PendingRequestsTableProps {
  requests: GroupMembershipWithUser[];
  onApprove: (membershipId: string) => void;
  onReject: (membershipId: string) => void;
  onNavigateToUser: (userId: string) => void;
}

export function PendingRequestsTable({
  requests,
  onApprove,
  onReject,
  onNavigateToUser,
}: PendingRequestsTableProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Pending Join Requests ({requests.length})
        </CardTitle>
        <CardDescription>Review and approve membership requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((membership) => {
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onApprove(membership.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReject(membership.id)}
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
      </CardContent>
    </Card>
  );
}
