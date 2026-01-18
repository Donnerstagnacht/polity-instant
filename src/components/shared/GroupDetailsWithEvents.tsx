'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { GroupSearchCard } from '@/features/search/ui/GroupSearchCard';
import { GroupEventsList } from './GroupEventsList';
import { GRADIENTS } from '@/features/user/state/gradientColors';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

interface GroupDetailsWithEventsProps {
  groupId: string;
  groupData: any;
  onEventClick?: (eventId: string, eventData: any) => void;
  onClose?: () => void;
}

export function GroupDetailsWithEvents({
  groupId,
  groupData,
  onEventClick,
  onClose,
}: GroupDetailsWithEventsProps) {
  const { t } = useTranslation();
  // Use a random gradient based on group ID
  const gradientIndex = parseInt(groupId.substring(0, 8), 16) % GRADIENTS.length;
  const gradientClass = GRADIENTS[gradientIndex];

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
      <GroupSearchCard group={groupData} gradientClass={gradientClass} />

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
