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
import { Check, X, Trash2, LucideIcon } from 'lucide-react';
import type { FilterableRecord } from '../hooks/useUserMembershipsFilters';
import type { GroupMembershipsByUserRow } from '@/zero/groups/queries';
import type { EventParticipantsByUserRow } from '@/zero/events/queries';
import type { AmendmentCollaboratorsByUserRow } from '@/zero/amendments/queries';
import type { BloggersByUserRow } from '@/zero/blogs/queries';

type EntityKey = 'group' | 'event' | 'amendment' | 'blog';

/** Minimal display shape shared by group, event, amendment, and blog entities */
interface DisplayEntity {
  id: string;
  name?: string | null;
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
}

interface MembershipStatusTableProps {
  title: string;
  description: string;
  icon: LucideIcon;
  items: FilterableRecord[];
  statusType: 'invited' | 'active' | 'requested';
  entityKey: EntityKey;
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

  const getEntityData = (item: FilterableRecord): DisplayEntity | null => {
    switch (entityKey) {
      case 'group':
        return (item as GroupMembershipsByUserRow).group ?? null;
      case 'event':
        return (item as EventParticipantsByUserRow).event ?? null;
      case 'amendment':
        return (item as AmendmentCollaboratorsByUserRow).amendment ?? null;
      case 'blog':
        return (item as BloggersByUserRow).blog ?? null;
    }
  };

  const getEntityName = (entity: DisplayEntity | null): string => {
    if (!entity) return `Unknown ${entityKey}`;
    return entity.name || entity.title || `Unknown ${entityKey}`;
  };

  const getEntityImage = (entity: DisplayEntity | null): string | undefined => {
    if (!entity) return undefined;
    return entity.image_url ?? undefined;
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
              const role = (item as { role?: { name?: string | null } }).role?.name || 'Member';
              const createdAt = item.created_at
                ? new Date(item.created_at).toLocaleDateString()
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
