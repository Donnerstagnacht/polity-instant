/**
 * CancelEventDialog Component
 *
 * Dialog for cancelling an event with options to reassign agenda items
 * to another event.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/use-translation';
import { useCancelEvent } from '../hooks/useCancelEvent';
import { db } from '../../../../db/db';
import { AlertTriangle, CalendarX, ArrowRight, FileText, Vote } from 'lucide-react';

interface CancelEventDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: string;
}

export function CancelEventDialog({
  eventId,
  open,
  onOpenChange,
  groupId,
}: CancelEventDialogProps) {
  const { t } = useTranslation();
  const { isLoading, agendaItems, cancelEvent } = useCancelEvent(eventId);

  const [reason, setReason] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [targetEventId, setTargetEventId] = useState<string>('');

  // Query other events in the group for reassignment
  const { data: eventsData } = db.useQuery(
    groupId
      ? {
          events: {
            $: {
              where: {
                'group.id': groupId,
                status: { $ne: 'cancelled' },
              },
            },
          },
        }
      : null
  );

  const availableEvents =
    eventsData?.events?.filter((e: any) => e.id !== eventId && e.startDate > Date.now()) || [];

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setReason('');
      setSelectedItems([]);
      setTargetEventId('');
    }
  }, [open]);

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === agendaItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(agendaItems.map(item => item.id));
    }
  };

  const handleCancel = async () => {
    if (!reason.trim()) {
      return;
    }

    await cancelEvent({
      eventId,
      reason: reason.trim(),
      reassignToEventId: targetEventId || undefined,
      itemsToReassign: selectedItems.length > 0 ? selectedItems : undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <CalendarX className="h-5 w-5" />
            {t('features.events.cancel.title')}
          </DialogTitle>
          <DialogDescription>{t('features.events.cancel.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning */}
          <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                {t('features.events.cancel.warning.title')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('features.events.cancel.warning.description')}
              </p>
            </div>
          </div>

          {/* Reason input */}
          <div className="space-y-2">
            <Label htmlFor="reason">{t('features.events.cancel.reason.label')}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t('features.events.cancel.reason.placeholder')}
              className="min-h-[100px]"
            />
          </div>

          {/* Agenda items to reassign */}
          {agendaItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t('features.events.cancel.reassign.label')}</Label>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedItems.length === agendaItems.length
                    ? t('common.deselectAll')
                    : t('common.selectAll')}
                </Button>
              </div>

              <ScrollArea className="h-48 rounded-md border p-2">
                <div className="space-y-2">
                  {agendaItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
                    >
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => handleItemToggle(item.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {item.amendment ? (
                            <FileText className="h-4 w-4 text-blue-500" />
                          ) : item.election ? (
                            <Vote className="h-4 w-4 text-purple-500" />
                          ) : null}
                          <span className="truncate font-medium">{item.title}</span>
                        </div>
                        {item.amendment && (
                          <p className="text-xs text-muted-foreground">
                            {t('features.events.cancel.reassign.amendment')}: {item.amendment.title}
                          </p>
                        )}
                        {item.election?.position && (
                          <p className="text-xs text-muted-foreground">
                            {t('features.events.cancel.reassign.election')}:{' '}
                            {item.election.position.name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Target event selection */}
          {selectedItems.length > 0 && (
            <div className="space-y-2">
              <Label>{t('features.events.cancel.reassign.targetEvent')}</Label>
              <Select value={targetEventId} onValueChange={setTargetEventId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('features.events.cancel.reassign.selectEvent')} />
                </SelectTrigger>
                <SelectContent>
                  {availableEvents.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {t('features.events.cancel.reassign.noEvents')}
                    </div>
                  ) : (
                    availableEvents.map((event: any) => (
                      <SelectItem key={event.id} value={event.id}>
                        <div className="flex items-center gap-2">
                          <span>{event.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {new Date(event.startDate).toLocaleDateString()}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {targetEventId && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{selectedItems.length}</Badge>
                  <span>{t('features.events.cancel.reassign.itemCount')}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span>{availableEvents.find((e: any) => e.id === targetEventId)?.title}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? t('common.loading') : t('features.events.cancel.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
