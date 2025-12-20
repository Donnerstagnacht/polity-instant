import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trash2, User, Users, Scale, Calendar, BookOpen } from 'lucide-react';

interface SubscriptionsTableProps {
  subscriptions: any[];
  onUnsubscribe: (id: string) => void;
  onNavigateToUser: (id: string) => void;
  onNavigateToGroup: (id: string) => void;
  onNavigateToAmendment: (id: string) => void;
  onNavigateToEvent: (id: string) => void;
  onNavigateToBlog: (id: string) => void;
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
  const getEntityInfo = (subscription: any) => {
    if (subscription.user) {
      return {
        name: subscription.user.name || 'Unknown User',
        type: 'User',
        icon: User,
        avatar: subscription.user.avatar,
        onNavigate: () => onNavigateToUser(subscription.user.id),
      };
    } else if (subscription.group) {
      return {
        name: subscription.group.name || 'Unknown Group',
        type: 'Group',
        icon: Users,
        avatar: subscription.group.imageURL,
        onNavigate: () => onNavigateToGroup(subscription.group.id),
      };
    } else if (subscription.amendment) {
      return {
        name: subscription.amendment.title || 'Unknown Amendment',
        type: 'Amendment',
        icon: Scale,
        avatar: subscription.amendment.imageURL,
        onNavigate: () => onNavigateToAmendment(subscription.amendment.id),
      };
    } else if (subscription.event) {
      return {
        name: subscription.event.title || 'Unknown Event',
        type: 'Event',
        icon: Calendar,
        avatar: subscription.event.imageURL,
        onNavigate: () => onNavigateToEvent(subscription.event.id),
      };
    } else if (subscription.blog) {
      return {
        name: subscription.blog.title || 'Unknown Blog',
        type: 'Blog',
        icon: BookOpen,
        avatar: subscription.blog.imageURL || subscription.blog.thumbnailURL,
        onNavigate: () => onNavigateToBlog(subscription.blog.id),
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
              const createdAt = subscription.createdAt
                ? new Date(subscription.createdAt).toLocaleDateString()
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
