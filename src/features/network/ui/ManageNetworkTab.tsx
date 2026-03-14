import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/features/shared/ui/ui/table';
import { Button } from '@/features/shared/ui/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/ui/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/features/shared/ui/ui/alert-dialog';
import { EntitySearchBar, type FilterOption } from '@/features/shared/ui/ui/entity-search-bar';
import { RightBadge } from './RightBadge';
import { RIGHT_TYPES, RIGHT_GRADIENTS } from './RightFilters';
import { LinkGroupDialog } from './LinkGroupDialog';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { Pencil, Trash2, Clock } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { NormalizedGroupRelationship, NetworkGroupEntity } from '../types/network.types';

interface GroupedRequest {
  group: { id: string; name?: string | null; description?: string | null; [key: string]: unknown };
  rels: NormalizedGroupRelationship[];
  type: 'parent' | 'child';
}

interface ManageNetworkTabProps {
  groupId: string;
  groupName: string;
  // Search & filters
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  directionFilter: 'all' | 'parent' | 'child';
  onDirectionFilterChange: (value: 'all' | 'parent' | 'child') => void;
  manageRightFilter: Set<string>;
  onToggleRightFilter: (right: string) => void;
  // Requests
  incomingRequests: GroupedRequest[];
  outgoingRequests: GroupedRequest[];
  // Active relationships
  filteredRelationships: { group: NetworkGroupEntity; rights: string[]; type: 'parent' | 'child' }[];
  allRelationships: NormalizedGroupRelationship[];
  // Handlers
  onAcceptRequest: (rels: NormalizedGroupRelationship[]) => void;
  onRejectRequest: (rels: NormalizedGroupRelationship[]) => void;
  onDeleteRelationship: (targetGroupId: string) => void;
}

export function ManageNetworkTab({
  groupId,
  groupName,
  searchQuery,
  onSearchQueryChange,
  directionFilter,
  onDirectionFilterChange,
  manageRightFilter,
  onToggleRightFilter,
  incomingRequests,
  outgoingRequests,
  filteredRelationships,
  allRelationships,
  onAcceptRequest,
  onRejectRequest,
  onDeleteRelationship,
}: ManageNetworkTabProps) {
  const { t } = useTranslation();
  const incomingRequestCount = incomingRequests.reduce((total, entry) => total + entry.rels.length, 0);
  const outgoingRequestCount = outgoingRequests.reduce((total, entry) => total + entry.rels.length, 0);

  const filterOptions: FilterOption[] = RIGHT_TYPES.map(right => ({
    label: t(`common.rights.${right === 'informationRight' ? 'information' : right === 'amendmentRight' ? 'amendment' : right === 'rightToSpeak' ? 'speak' : right === 'activeVotingRight' ? 'activeVoting' : 'passiveVoting'}`) || right,
    value: right,
    active: manageRightFilter.has(right),
    gradient: RIGHT_GRADIENTS[right as keyof typeof RIGHT_GRADIENTS],
  }));

  return (
    <div className="space-y-6">
      {/* Link Group Action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('common.network.groupRelationships')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('common.network.groupRelationshipsDescription')}
          </p>
        </div>
        <PermissionGuard action="manage" resource="groupRelationships" context={{ groupId }}>
          <LinkGroupDialog
            currentGroupId={groupId}
            currentGroupName={groupName}
            allRelationships={allRelationships}
          />
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('common.network.activeRelationships')}</CardTitle>
          <CardDescription>
            {t('common.network.groupRelationshipsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EntitySearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            placeholder={t('common.network.searchByGroupName')}
            filterOptions={filterOptions}
            onFilterToggle={onToggleRightFilter}
          />

          <div className="flex gap-2">
            <Select
              value={directionFilter}
              onValueChange={v => onDirectionFilterChange(v as 'all' | 'parent' | 'child')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('common.network.allDirections')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.network.allDirections')}</SelectItem>
                <SelectItem value="parent">{t('common.network.parentsOnly')}</SelectItem>
                <SelectItem value="child">{t('common.network.childrenOnly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Clock className="h-5 w-5" />
            {t('common.network.incomingRequests')} ({incomingRequestCount})
          </h2>
          <div className="space-y-4">
            {incomingRequests.map(req => (
              <Card key={req.group.id} className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{req.group.name}</CardTitle>
                  <CardDescription>
                    {req.type === 'parent'
                      ? t('common.network.wantsToBeParent')
                      : t('common.network.wantsToBeChild')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('common.network.relationship')}</TableHead>
                        <TableHead>{t('common.labels.rights')}</TableHead>
                        <TableHead>{t('common.network.requested')}</TableHead>
                        <TableHead>{t('common.actions.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {req.rels.map(rel => (
                        <TableRow key={rel.id}>
                          <TableCell>
                            <Badge variant={req.type === 'parent' ? 'default' : 'secondary'}>
                              {req.type === 'parent'
                                ? t('common.network.parent')
                                : t('common.network.child')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <RightBadge right={rel.with_right ?? ''} />
                          </TableCell>
                          <TableCell>
                            {rel.created_at
                              ? new Date(rel.created_at).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <PermissionGuard
                              action="manage"
                              resource="groupRelationships"
                              context={{ groupId }}
                            >
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => onRejectRequest([rel])}>
                                  {t('common.network.reject')}
                                </Button>
                                <Button size="sm" onClick={() => onAcceptRequest([rel])}>
                                  {t('common.network.accept')}
                                </Button>
                              </div>
                            </PermissionGuard>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">
            {t('common.network.outgoingRequests')} ({outgoingRequestCount})
          </h2>
          <div className="space-y-4">
            {outgoingRequests.map(req => (
              <Card key={req.group.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{req.group.name}</CardTitle>
                  <CardDescription>
                    {req.type === 'parent'
                      ? t('common.network.requestAsParent')
                      : t('common.network.requestAsChild')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('common.network.relationship')}</TableHead>
                        <TableHead>{t('common.labels.rights')}</TableHead>
                        <TableHead>{t('common.network.requested')}</TableHead>
                        <TableHead>{t('common.actions.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {req.rels.map(rel => (
                        <TableRow key={rel.id}>
                          <TableCell>
                            <Badge variant={req.type === 'parent' ? 'default' : 'secondary'}>
                              {req.type === 'parent'
                                ? t('common.network.parent')
                                : t('common.network.child')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <RightBadge right={rel.with_right ?? ''} />
                          </TableCell>
                          <TableCell>
                            {rel.created_at
                              ? new Date(rel.created_at).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <PermissionGuard
                              action="manage"
                              resource="groupRelationships"
                              context={{ groupId }}
                            >
                              <Button size="sm" variant="outline" onClick={() => onRejectRequest([rel])}>
                                {t('common.network.cancelRequest')}
                              </Button>
                            </PermissionGuard>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Relationships — Search, Filters & Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('common.network.activeRelationships')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.network.groupName')}</TableHead>
                  <TableHead>{t('common.network.relationship')}</TableHead>
                  <TableHead>{t('common.labels.rights')}</TableHead>
                  <TableHead className="text-right">{t('common.actions.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRelationships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      {t('common.network.noRelationshipsFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRelationships.map((rel, idx) => (
                    <TableRow key={`${rel.group.id}-${rel.type}-${idx}`}>
                      <TableCell className="font-medium">{rel.group.name}</TableCell>
                      <TableCell>
                        <Badge variant={rel.type === 'parent' ? 'default' : 'secondary'}>
                          {rel.type === 'parent'
                            ? t('common.network.parent')
                            : t('common.network.child')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(rel.rights)).map(r => (
                            <RightBadge key={r} right={r} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <PermissionGuard
                          action="manage"
                          resource="groupRelationships"
                          context={{ groupId }}
                        >
                          <div className="flex items-center justify-end gap-1">
                            <LinkGroupDialog
                              currentGroupId={groupId}
                              currentGroupName={groupName}
                              initialTargetGroupId={rel.group.id}
                              initialRelationshipType={rel.type}
                              initialRights={rel.rights}
                              trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit relationship</span>
                                </Button>
                              }
                              allRelationships={allRelationships}
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete relationship</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t('common.network.deleteAllRelationships')}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('common.network.deleteRelationshipDescription', {
                                      groupName: rel.group.name,
                                    })}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {t('common.actions.cancel')}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDeleteRelationship(rel.group.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {t('common.actions.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
