/**
 * ConfirmationRequestNotice Component
 *
 * Displays a notice to supporters when they have pending
 * confirmation requests for changes made to amendments they support.
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';
import { Bell, Check, X, Eye } from 'lucide-react';
import { useState } from 'react';
import { db } from 'db/db';

interface PendingConfirmation {
  id: string;
  amendmentId: string;
  amendmentTitle: string;
  changeRequestId?: string;
  changeRequestTitle?: string;
  requestedAt: number;
}

interface ConfirmationRequestNoticeProps {
  userId: string;
  onConfirm?: (confirmationId: string) => void;
  onDecline?: (confirmationId: string) => void;
  onViewChanges?: (confirmationId: string, amendmentId: string) => void;
}

export function ConfirmationRequestNotice({
  userId,
  onConfirm,
  onDecline,
  onViewChanges,
}: ConfirmationRequestNoticeProps) {
  const { t } = useTranslation();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Query pending confirmations for this user
  // Note: supportConfirmations is a new entity - schema must be pushed first
  const { data, isLoading } = db.useQuery({
    supportConfirmations: {
      $: {
        where: {
          'supporter.id': userId,
          status: 'pending',
        },
      },
      amendment: {},
      changeRequest: {},
    },
  } as any) as { data: any; isLoading: boolean };

  const pendingConfirmations = data?.supportConfirmations ?? [];

  const handleConfirm = async (confirmationId: string) => {
    setProcessingId(confirmationId);
    try {
      onConfirm?.(confirmationId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (confirmationId: string) => {
    setProcessingId(confirmationId);
    try {
      onDecline?.(confirmationId);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading || pendingConfirmations.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <Bell className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        {t('features.amendments.supportConfirmation.pendingNotice.title')}
        <Badge variant="secondary" className="ml-2">
          {pendingConfirmations.length}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-3">
        <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">
          {t('features.amendments.supportConfirmation.pendingNotice.description')}
        </p>

        <div className="space-y-2">
          {pendingConfirmations.map((confirmation: any) => (
            <div
              key={confirmation.id}
              className="flex items-center justify-between gap-2 rounded-md border bg-white p-2 dark:bg-gray-900"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {confirmation.amendment?.title ?? t('features.amendments.common.untitled')}
                </p>
                {confirmation.changeRequest?.title && (
                  <p className="truncate text-xs text-muted-foreground">
                    {t('features.amendments.changeRequests.changeRequest')}:{' '}
                    {confirmation.changeRequest.title}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onViewChanges?.(confirmation.id, confirmation.amendment?.id)}
                  title={t('features.amendments.supportConfirmation.actions.viewChanges')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                  onClick={() => handleConfirm(confirmation.id)}
                  disabled={processingId === confirmation.id}
                  title={t('features.amendments.supportConfirmation.actions.confirm')}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDecline(confirmation.id)}
                  disabled={processingId === confirmation.id}
                  title={t('features.amendments.supportConfirmation.actions.decline')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
}
