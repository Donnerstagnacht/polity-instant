import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/ui/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Trash2, User } from 'lucide-react';

import { useCommonState } from '@/zero/common/useCommonState';

type SubscriberRow = NonNullable<ReturnType<typeof useCommonState>['userSubscribers']>[number];

interface SubscribersTableProps {
  subscribers: SubscriberRow[];
  onRemove: (id: string) => void;
  onNavigate: (id: string) => void;
}

export function SubscribersTable({ subscribers, onRemove, onNavigate }: SubscribersTableProps) {
  if (subscribers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Subscribers</CardTitle>
          <CardDescription>Users subscribed to you</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            No subscribers yet. When users subscribe to you, they'll appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Subscribers ({subscribers.length})</CardTitle>
        <CardDescription>Users subscribed to you</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.map(subscription => {
              const subscriber = subscription.subscriber_user;
              if (!subscriber) return null;

              const name = [subscriber.first_name, subscriber.last_name].filter(Boolean).join(' ') || 'Unknown User';
              const avatar = subscriber.avatar;
              const createdAt = subscription.created_at
                ? new Date(subscription.created_at).toLocaleDateString()
                : 'N/A';

              return (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-10 w-10 cursor-pointer"
                        onClick={() => onNavigate(subscriber.id)}
                      >
                        {avatar && <AvatarImage src={avatar} alt={name} />}
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => onNavigate(subscriber.id)}
                      >
                        <div className="font-medium">{name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onRemove(subscription.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2">Remove</span>
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
