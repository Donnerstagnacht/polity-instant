/**
 * CancelledEventBanner Component
 *
 * Displays a prominent banner on cancelled event pages showing
 * the cancellation reason, date, and link to reassignment event.
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { CalendarX, ArrowRight, User, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';

interface CancelledEventBannerProps {
  cancellationReason?: string;
  cancelledAt?: number;
  cancelledByName?: string;
  reassignmentEventId?: string;
  reassignmentEventTitle?: string;
}

export function CancelledEventBanner({
  cancellationReason,
  cancelledAt,
  cancelledByName,
  reassignmentEventId,
  reassignmentEventTitle,
}: CancelledEventBannerProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'de' ? de : enUS;

  return (
    <Alert variant="destructive" className="mb-6">
      <CalendarX className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">
        {t('features.events.detail.status.cancelled')}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        {/* Cancellation reason */}
        {cancellationReason && <p className="text-sm">{cancellationReason}</p>}

        {/* Cancellation metadata */}
        <div className="flex flex-wrap gap-4 text-sm opacity-90">
          {cancelledAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(new Date(cancelledAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </span>
          )}
          {cancelledByName && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {cancelledByName}
            </span>
          )}
        </div>

        {/* Reassignment link */}
        {reassignmentEventId && reassignmentEventTitle && (
          <div className="pt-2">
            <p className="mb-2 text-sm">{t('features.events.cancel.reassign.itemCount')}:</p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/event/${reassignmentEventId}`}>
                {reassignmentEventTitle}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
