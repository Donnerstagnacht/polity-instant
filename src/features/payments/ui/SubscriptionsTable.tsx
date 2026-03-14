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
import { Badge } from '@/features/shared/ui/ui/badge';
import { Trash2, User, Users, Scale, Calendar, BookOpen } from 'lucide-react';

import { useCommonState } from '@/zero/common/useCommonState';

type SubscriptionRow = NonNullable<ReturnType<typeof useCommonState>['userSubscriptions']>[number];

interface SubscriptionsTableProps {
  subscriptions: SubscriptionRow[];
  onUnsubscribe: (id: string) => void;
  onNavigateToUser: (id: string) => void;
  onNavigateToGroup: (id: string) => void;
  onNavigateToAmendment: (id: string) => void;
  onNavigateToEvent: (id: string) => void;
  onNavigateToBlog: (id: string, groupId?: string | null) => void;
}

export function SubscriptionsTable({
  subscriptions,
  onUnsubscribe,
  onNavigateToUser,
  onNavigateToGroup,
  onNavigateToAmendment,
  onNavigateToEvent,
  onNavigateToBlog,
}: SubscriptionsTableProps) {
  const getEntityInfo = (subscription: SubscriptionRow) => {
    if (subscription.user) {
      const u = subscription.user;
      return {
        name: [u.first_name, u.last_name].filter(Boolean).join(' ') || 'Unknown User',
        type: 'User',
        icon: User,
        avatar: u.avatar,
        onNavigate: () => onNavigateToUser(u.id),
      };
    } else if (subscription.group) {
      const g = subscription.group;
      return {
        name: g.name || 'Unknown Group',
        type: 'Group',
        icon: Users,
        avatar: g.image_url,
        onNavigate: () => onNavigateToGroup(g.id),
      };
    } else if (subscription.amendment) {
      const a = subscription.amendment;
      return {
        name: a.title || 'Unknown Amendment',
        type: 'Amendment',
        icon: Scale,
        avatar: a.image_url,
        onNavigate: () => onNavigateToAmendment(a.id),
      };
    } else if (subscription.event) {
      const e = subscription.event;
      return {
        name: e.title || 'Unknown Event',
        type: 'Event',
        icon: Calendar,
        avatar: e.image_url,
        onNavigate: () => onNavigateToEvent(e.id),
      };
    } else if (subscription.blog) {
      const b = subscription.blog;
      return {
        name: b.title || 'Unknown Blog',
        type: 'Blog',
        icon: BookOpen,
        avatar: b.image_url,
        onNavigate: () => onNavigateToBlog(b.id, b.group_id),
      };
    }
    return null;
  };

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Subscriptions</CardTitle>
          <CardDescription>Entities you're subscribed to</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            No subscriptions found. Start following users, groups, amendments, events, or blogs to
            see them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Subscriptions ({subscriptions.length})</CardTitle>
        <CardDescription>Entities you're subscribed to</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map(subscription => {
              const entityInfo = getEntityInfo(subscription);
              if (!entityInfo) return null;

              const { name, type, icon: Icon, avatar, onNavigate } = entityInfo;
              const createdAt = subscription.created_at
                ? new Date(subscription.created_at).toLocaleDateString()
                : 'N/A';

              return (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 cursor-pointer" onClick={onNavigate}>
                        {avatar && <AvatarImage src={avatar} alt={name} />}
                        <AvatarFallback>
                          <Icon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="cursor-pointer hover:underline" onClick={onNavigate}>
                        <div className="font-medium">{name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUnsubscribe(subscription.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="ml-2">Unsubscribe</span>
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
