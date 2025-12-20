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
import { Check, X, Trash2, LucideIcon } from 'lucide-react';

interface MembershipItem {
  id: string;
  status: string;
  createdAt?: string;
  role?: { name: string };
  [key: string]: any;
}

interface EntityData {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  imageURL?: string;
  imageUrl?: string;
  image?: string;
  thumbnailURL?: string;
}

interface MembershipStatusTableProps {
  title: string;
  description: string;
  icon: LucideIcon;
  items: MembershipItem[];
  statusType: 'invited' | 'active' | 'requested';
  entityKey: string; // 'group', 'event', 'amendment', 'blog'
  fallbackIcon: LucideIcon;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onLeave?: (id: string) => void;
  onWithdraw?: (id: string) => void;
  onNavigate?: (id: string) => void;
}

export function MembershipStatusTable({
  title,
  description,
  icon: Icon,
  items,
  statusType,
  entityKey,
  fallbackIcon: FallbackIcon,
  onAccept,
  onDecline,
  onLeave,
  onWithdraw,
  onNavigate,
}: MembershipStatusTableProps) {
  if (items.length === 0 && statusType === 'active') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">No {statusType} items found</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return null;
  }

  const getEntityData = (item: MembershipItem): EntityData | null => {
    return item[entityKey] || null;
  };

  const getEntityName = (entity: EntityData | null): string => {
    if (!entity) return `Unknown ${entityKey}`;
    return entity.name || entity.title || `Unknown ${entityKey}`;
  };

  const getEntityImage = (entity: EntityData | null): string | undefined => {
    if (!entity) return undefined;
    return entity.imageURL || entity.imageUrl || entity.image || entity.thumbnailURL;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{entityKey.charAt(0).toUpperCase() + entityKey.slice(1)}</TableHead>
              {statusType === 'active' && <TableHead>Role</TableHead>}
              {statusType === 'invited' && <TableHead>Role</TableHead>}
              {statusType === 'requested' && <TableHead>Role</TableHead>}
              <TableHead>
                {statusType === 'invited'
                  ? 'Invited'
                  : statusType === 'requested'
                    ? 'Requested'
                    : 'Joined'}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => {
              const entity = getEntityData(item);
              const entityName = getEntityName(entity);
              const entityImage = getEntityImage(entity);
              const role = item.role?.name || 'Member';
              const createdAt = item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : 'N/A';
              const entityDescription =
                statusType === 'active' ? entity?.description || '' : '';

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-10 w-10 cursor-pointer"
                        onClick={() => entity && onNavigate?.(entity.id)}
                      >
                        {entityImage && <AvatarImage src={entityImage} alt={entityName} />}
                        <AvatarFallback>
                          <FallbackIcon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="cursor-pointer hover:underline"
                        onClick={() => entity && onNavigate?.(entity.id)}
                      >
                        <div className="font-medium">{entityName}</div>
                        {entityDescription && (
                          <div className="line-clamp-1 text-sm text-muted-foreground">
                            {entityDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  {(statusType === 'active' || statusType === 'invited' || statusType === 'requested') && (
                    <TableCell>
                      <Badge variant="outline">{role}</Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                  <TableCell className="text-right">
                    {statusType === 'invited' && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onAccept?.(item.id)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDecline?.(item.id)}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Decline
                        </Button>
                      </div>
                    )}
                    {statusType === 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => onLeave?.(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-2">Leave</span>
                      </Button>
                    )}
                    {statusType === 'requested' && (
                      <Button variant="ghost" size="sm" onClick={() => onWithdraw?.(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-2">Withdraw Request</span>
                      </Button>
                    )}
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
