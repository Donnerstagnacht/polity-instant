'use client';

import { useState, useMemo } from 'react';
import { db } from '../../../../db/db';
import { usePermissions } from '@db/rbac';
import { useAgendaItemMutations } from '../hooks/useAgendaItemMutations';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TypeAheadSelect } from '@/components/ui/type-ahead-select';
import { EventSelectCard } from '@/components/ui/entity-select-cards';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';

interface TransferAgendaItemDialogProps {
  agendaItemId: string;
  agendaItemTitle: string;
  currentEventId: string;
  currentEventTitle: string;
  onTransferComplete?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface EventWithPermission {
  id: string;
  title: string;
  startDate?: string;
  location?: string;
  group?: { name: string };
  participantCount?: number;
}

export function TransferAgendaItemDialog({
  agendaItemId,
  agendaItemTitle,
  currentEventId,
  currentEventTitle,
  onTransferComplete,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: TransferAgendaItemDialogProps) {
  const { t } = useTranslation();
  const { user } = db.useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');

  // Support both controlled and uncontrolled modes
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const { handleTransfer, transferLoading } = useAgendaItemMutations(agendaItemId, currentEventId);

  // Query all events where user is a participant
  const { data: participationsData, isLoading: participationsLoading } = db.useQuery(
    user?.id
      ? {
          eventParticipants: {
            $: { where: { 'user.id': user.id } },
            event: {
              group: {},
            },
            role: {
              actionRights: {
                event: {},
              },
            },
          },
        }
      : null
  );

  // Filter events where user has agendaItems.manage permission
  const eventsWithPermission = useMemo(() => {
    if (!participationsData?.eventParticipants) return [];

    const events: EventWithPermission[] = [];

    participationsData.eventParticipants.forEach((participation: any) => {
      // Skip current event
      if (participation.event?.id === currentEventId) return;
      if (!participation.event) return;

      // Check if user has agendaItems.manage permission via role
      const hasManagePermission = participation.role?.actionRights?.some(
        (right: any) =>
          right.resource === 'agendaItems' &&
          (right.action === 'manage' || right.action === 'create') &&
          right.event?.id === participation.event?.id
      );

      if (hasManagePermission) {
        events.push({
          id: participation.event.id,
          title: participation.event.title || 'Untitled Event',
          startDate: participation.event.startDate,
          location: participation.event.location,
          group: participation.event.group,
        });
      }
    });

    // Remove duplicates
    return events.filter((event, index, self) => self.findIndex(e => e.id === event.id) === index);
  }, [participationsData, currentEventId]);

  const selectedEvent = eventsWithPermission.find(e => e.id === selectedEventId);

  const handleConfirmTransfer = async () => {
    if (!selectedEvent) return;

    try {
      await handleTransfer({
        targetEventId: selectedEvent.id,
        agendaItemTitle,
        sourceEventTitle: currentEventTitle,
        targetEventTitle: selectedEvent.title,
      });

      toast.success(t('features.events.agenda.transferSuccess'));
      setOpen(false);
      setSelectedEventId('');
      onTransferComplete?.();
    } catch (error) {
      console.error('Transfer failed:', error);
      toast.error(t('features.events.agenda.transferError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <ArrowRight className="mr-2 h-4 w-4" />
            {t('features.events.agenda.moveToEvent')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('features.events.agenda.transferItem')}</DialogTitle>
          <DialogDescription>
            {t('features.events.agenda.selectDestinationEvent')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Event Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              {t('features.events.agenda.currentEvent')}
            </label>
            <Card className="bg-muted/50">
              <CardContent className="flex items-center gap-3 p-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{currentEventTitle}</p>
                  <p className="text-sm text-muted-foreground">{agendaItemTitle}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Arrow Indicator */}
          <div className="flex justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </div>

          {/* Destination Event Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('features.events.agenda.destinationEvent')}
            </label>
            {participationsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : eventsWithPermission.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>{t('features.events.agenda.noEventsWithPermission')}</p>
                </CardContent>
              </Card>
            ) : (
              <TypeAheadSelect
                items={eventsWithPermission}
                value={selectedEventId}
                onChange={setSelectedEventId}
                placeholder={t('features.events.agenda.searchEvents')}
                searchKeys={['title', 'location']}
                renderItem={event => <EventSelectCard event={event} />}
                getItemId={event => event.id}
              />
            )}
          </div>

          {/* Warning Message */}
          {selectedEvent && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {t('features.events.agenda.transferWarning')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={transferLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirmTransfer} disabled={!selectedEventId || transferLoading}>
            {transferLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('features.events.agenda.transferring')}
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                {t('features.events.agenda.transferConfirm')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
