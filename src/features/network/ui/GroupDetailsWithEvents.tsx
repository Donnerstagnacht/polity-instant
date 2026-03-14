'use client';

import { Card, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { GroupSearchCard } from '@/features/search/ui/GroupSearchCard';
import { GroupEventsList } from './GroupEventsList';
import { X } from 'lucide-react';
import { Button } from '@/features/shared/ui/ui/button';
import { useTranslation } from '@/features/shared/hooks/use-translation';

import { type NetworkGroupEntity } from '../types/network.types';

interface GroupDetailsWithEventsProps {
  groupId: string;
  groupData: NetworkGroupEntity;
  onEventClick?: (eventId: string, eventData: Record<string, unknown>) => void;
  onClose?: () => void;
}

export function GroupDetailsWithEvents({
  groupId,
  groupData,
  onEventClick,
  onClose,
}: GroupDetailsWithEventsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold">{t('common.labels.groupDetails')}</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Group Card */}
      <GroupSearchCard group={groupData} />

      {/* Future Events Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('common.labels.upcomingEvents')}</CardTitle>
        </CardHeader>
        <div className="px-6 pb-6">
          <GroupEventsList groupId={groupId} onEventClick={onEventClick} />
        </div>
      </Card>
    </div>
  );
}
