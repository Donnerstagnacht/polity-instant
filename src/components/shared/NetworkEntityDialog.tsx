'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GroupSearchCard } from '@/features/search/ui/GroupSearchCard';
import { GroupEventsList } from './GroupEventsList';
import { GRADIENTS } from '@/features/user/state/gradientColors';
import { formatRights } from './RightFilters';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';

interface NetworkEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: {
    type: 'group' | 'relationship' | 'user' | 'event';
    data: any;
  } | null;
}

export function NetworkEntityDialog({ open, onOpenChange, entity }: NetworkEntityDialogProps) {
  const router = useRouter();
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
                      router.push(`/event/${eventId}`);
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
                    alt={entity.data.title}
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
                      alt={entity.data.name}
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
            <div>
              {entity.data.rights && (entity.data.rights as string[]).length > 0 ? (
                <div className="space-y-3">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">{t('common.labels.relationshipRights')}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(entity.data.rights as string[]).length} {t('common.labels.rightsGranted')}
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {(entity.data.rights as string[]).map((right: string, index: number) => {
                      const gradientClass = GRADIENTS[index % GRADIENTS.length];
                      return (
                        <div
                          key={right}
                          className={`rounded-lg border p-4 ${gradientClass} shadow-sm`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-semibold">{formatRights([right])}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {t('common.labels.relationshipRight')}
                              </p>
                            </div>
                            <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium">
                              {right}
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                router.push(`/group/${entity.data.id}`);
                onOpenChange(false);
              }}
            >
              {t('common.labels.showGroup')}
            </Button>
          )}
          {entity.type === 'user' && entity.data?.id && (
            <Button
              onClick={() => {
                router.push(`/user/${entity.data.id}`);
                onOpenChange(false);
              }}
            >
              {t('common.labels.showUser')}
            </Button>
          )}
          {entity.type === 'event' && entity.data?.id && (
            <Button
              onClick={() => {
                router.push(`/event/${entity.data.id}`);
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
