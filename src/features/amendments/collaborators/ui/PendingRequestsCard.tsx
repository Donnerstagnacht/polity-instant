/**
 * Card displaying pending collaboration requests
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
import { Users, Check, Trash2 } from 'lucide-react';
import { approveRequest, rejectRequest } from '../utils/collaborator-operations';
import type { Collaborator } from '../hooks/useCollaborators';

interface PendingRequestsCardProps {
  requests: Collaborator[];
  onNavigateToUser: (userId: string) => void;
}

export function PendingRequestsCard({ requests, onNavigateToUser }: PendingRequestsCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Pending Collaboration Requests ({requests.length})
        </CardTitle>
        <CardDescription>Review and approve collaboration requests</CardDescription>
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
            {requests.map(collaboration => {
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => approveRequest(collaboration.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rejectRequest(collaboration.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-2">Decline</span>
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
