'use client';

import type { ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/ui/ui/dialog';
import { Button } from '@/features/shared/ui/ui/button';
import { GroupSearchCard } from '@/features/search/ui/GroupSearchCard';
import { GroupEventsList } from './GroupEventsList';
import { RightBadge } from './RightBadge';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { SearchResultItem } from '@/features/search/types/search.types';
import type { EventByGroupRow } from '@/zero/events/useEventState';
import type { NetworkGroupEntity } from '../types/network.types';

interface NetworkEventData {
  id?: string;
  imageURL?: string | null;
  title?: string | null;
  description?: string | null;
  startDate?: string | number | Date | null;
  location?: string | null;
}

interface NetworkUserData {
  id?: string;
  name?: string | null;
  subtitle?: string | null;
  avatarFile?: { url?: string | null } | null;
}

interface NetworkRelationshipData {
  id?: string;
  source?: string;
  target?: string;
  sourceName?: string | null;
  targetName?: string | null;
  rights?: string[];
  label?: string | null | ReactNode;
}

interface NetworkGroupData extends Partial<NetworkGroupEntity> {
  id: string;
  name?: string | null;
  description?: string | null;
  onEventSelect?: (eventId: string, eventData: EventByGroupRow) => void;
}

export type NetworkDialogEntity =
  | { type: 'group'; data: NetworkGroupData }
  | { type: 'event'; data: NetworkEventData }
  | { type: 'user'; data: NetworkUserData }
  | { type: 'relationship'; data: NetworkRelationshipData };

interface NetworkEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: NetworkDialogEntity | null;
}

export function NetworkEntityDialog({ open, onOpenChange, entity }: NetworkEntityDialogProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!entity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {entity.type === 'group'
              ? t('common.labels.groupDetails')
              : entity.type === 'user'
                ? t('common.labels.userDetails')
                : entity.type === 'event'
                  ? t('common.labels.eventDetails')
                  : t('common.labels.relationshipDetails')}
          </DialogTitle>
          <DialogDescription>
            {entity.type === 'group'
              ? t('common.labels.viewGroupInfo')
              : entity.type === 'user'
                ? t('common.labels.viewUserInfo')
                : entity.type === 'event'
                  ? t('common.labels.viewEventInfo')
                  : t('common.labels.viewRelationshipInfo')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Group Details with Events */}
          {entity.type === 'group' && entity.data && (
            <div className="space-y-4">
              <GroupSearchCard group={entity.data} />

              {/* Upcoming Events Section */}
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 text-sm font-semibold">{t('common.labels.upcomingEvents')}</h4>
                <GroupEventsList
                  groupId={entity.data.id}
                  onEventClick={(eventId, eventData) => {
                    // If custom onEventSelect handler provided, use it
                    if (entity.data.onEventSelect) {
                      entity.data.onEventSelect(eventId, eventData);
                    } else {
                      // Default behavior: navigate to event page
                      navigate({ to: `/event/${eventId}` });
                      onOpenChange(false);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Event Details */}
          {entity.type === 'event' && entity.data && (
            <div className="rounded-lg border p-4">
              <div className="space-y-3">
                {entity.data.imageURL && (
                  <img
                    src={entity.data.imageURL}
                    alt={entity.data.title ?? undefined}
                    className="h-32 w-full rounded-md object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold">{entity.data.title}</h3>
                  {entity.data.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{entity.data.description}</p>
                  )}
                  {entity.data.startDate && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">{t('common.labels.date')}:</span>{' '}
                      {new Date(entity.data.startDate).toLocaleDateString()}
                    </p>
                  )}
                  {entity.data.location && (
                    <p className="text-sm">
                      <span className="font-medium">{t('common.labels.location')}:</span> {entity.data.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* User Details */}
          {entity.type === 'user' && entity.data && (
            <div className="rounded-lg border p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {entity.data.avatarFile?.url && (
                    <img
                      src={entity.data.avatarFile.url}
                    alt={entity.data.name ?? undefined}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{entity.data.name}</h3>
                    {entity.data.subtitle && (
                      <p className="text-sm text-muted-foreground">{entity.data.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Relationship Details */}
          {entity.type === 'relationship' && entity.data && (
            <div className="space-y-4">
              {/* Direction: Parent → Child */}
              {(entity.data.sourceName || entity.data.targetName) && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                  <button
                    type="button"
                    className="flex-1 text-center transition-colors hover:bg-muted/50 rounded-md p-1.5 cursor-pointer"
                    onClick={() => {
                      if (entity.data.source) {
                        const groupId = entity.data.source.replace(/^(parent-|child-)/, '');
                        navigate({ to: `/group/${groupId}` });
                        onOpenChange(false);
                      }
                    }}
                  >
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      {t('common.labels.parentGroup', 'Parent')}
                    </p>
                    <p className="text-sm font-semibold text-primary underline-offset-2 hover:underline">{entity.data.sourceName ?? entity.data.source}</p>
                  </button>
                  <div className="text-muted-foreground">→</div>
                  <button
                    type="button"
                    className="flex-1 text-center transition-colors hover:bg-muted/50 rounded-md p-1.5 cursor-pointer"
                    onClick={() => {
                      if (entity.data.target) {
                        const groupId = entity.data.target.replace(/^(parent-|child-)/, '');
                        navigate({ to: `/group/${groupId}` });
                        onOpenChange(false);
                      }
                    }}
                  >
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      {t('common.labels.childGroup', 'Child')}
                    </p>
                    <p className="text-sm font-semibold text-primary underline-offset-2 hover:underline">{entity.data.targetName ?? entity.data.target}</p>
                  </button>
                </div>
              )}

              {entity.data.rights && (entity.data.rights as string[]).length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('common.labels.relationshipRights')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(entity.data.rights as string[]).length} {t('common.labels.rightsGranted')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(entity.data.rights as string[]).map((right: string) => (
                      <RightBadge key={right} right={right} className="px-3 py-1.5 text-sm" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('common.labels.connectionType')}</p>
                      <p className="text-lg font-semibold">{entity.data.label || t('common.labels.connection')}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entity.data.label ? entity.data.label : t('common.labels.membershipConnection')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel')}
          </Button>
          {entity.type === 'group' && entity.data?.id && (
            <Button
              onClick={() => {
                navigate({ to: `/group/${entity.data.id}` });
                onOpenChange(false);
              }}
            >
              {t('common.labels.showGroup')}
            </Button>
          )}
          {entity.type === 'user' && entity.data?.id && (
            <Button
              onClick={() => {
                navigate({ to: `/user/${entity.data.id}` });
                onOpenChange(false);
              }}
            >
              {t('common.labels.showUser')}
            </Button>
          )}
          {entity.type === 'event' && entity.data?.id && (
            <Button
              onClick={() => {
                navigate({ to: `/event/${entity.data.id}` });
                onOpenChange(false);
              }}
            >
              {t('common.labels.showEvent')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
