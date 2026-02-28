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
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface GroupedRequest {
  group: { id: string; name: string; description?: string };
  rights: string[];
  rels: any[];
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
  filteredRelationships: { group: any; rights: string[]; type: 'parent' | 'child' }[];
  allRelationships: any[];
  // Handlers
  onAcceptRequest: (rels: any[]) => void;
  onRejectRequest: (rels: any[]) => void;
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

      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('common.network.incomingRequests')}</CardTitle>
            <CardDescription>
              {t('common.network.incomingRequestsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomingRequests.map(req => (
              <div
                key={req.group.id}
                className="flex items-center justify-between rounded-lg border bg-background p-3"
              >
                <div className="space-y-1">
                  <div className="font-medium">{req.group.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {req.type === 'parent'
                        ? t('common.network.wantsToBeParent')
                        : t('common.network.wantsToBeChild')}
                    </span>
                    <div className="flex gap-1">
                      {req.rights.map(r => (
                        <RightBadge key={r} right={r} />
                      ))}
                    </div>
                  </div>
                </div>
                <PermissionGuard
                  action="manage"
                  resource="groupRelationships"
                  context={{ groupId }}
                >
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRejectRequest(req.rels)}
                    >
                      {t('common.network.reject')}
                    </Button>
                    <Button size="sm" onClick={() => onAcceptRequest(req.rels)}>
                      {t('common.network.accept')}
                    </Button>
                  </div>
                </PermissionGuard>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('common.network.outgoingRequests')}</CardTitle>
            <CardDescription>
              {t('common.network.outgoingRequestsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {outgoingRequests.map(req => (
              <div
                key={req.group.id}
                className="flex items-center justify-between rounded-lg border bg-background p-3"
              >
                <div className="space-y-1">
                  <div className="font-medium">{req.group.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {req.type === 'parent'
                        ? t('common.network.requestAsParent')
                        : t('common.network.requestAsChild')}
                    </span>
                    <div className="flex gap-1">
                      {req.rights.map(r => (
                        <RightBadge key={r} right={r} />
                      ))}
                    </div>
                  </div>
                </div>
                <PermissionGuard
                  action="manage"
                  resource="groupRelationships"
                  context={{ groupId }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRejectRequest(req.rels)}
                  >
                    {t('common.network.cancelRequest')}
                  </Button>
                </PermissionGuard>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Relationships — Search, Filters & Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('common.network.activeRelationships')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search + Right Filters */}
          <EntitySearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            placeholder={t('common.network.searchByGroupName')}
            filterOptions={filterOptions}
            onFilterToggle={onToggleRightFilter}
          />

          {/* Direction Filter */}
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

          {/* Table */}
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
