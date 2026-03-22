'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Avatar, AvatarFallback } from '@/features/shared/ui/ui/avatar';
import { ShieldCheck, CheckCircle2, Loader2, Users } from 'lucide-react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuth } from '@/providers/auth-provider';
import { useAccreditationState } from '@/zero/accreditation/useAccreditationState';
import { useAccreditationActions } from '@/zero/accreditation/useAccreditationActions';
import { VotePasswordInput } from '@/features/vote-cast/ui/VotePasswordInput';

interface AccreditationSectionProps {
  eventId: string;
  agendaItemId: string;
}

export function AccreditationSection({ eventId, agendaItemId }: AccreditationSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;

  const {
    accreditationsByAgendaItem,
    isAccredited,
    accreditedCount,
    isLoading,
  } = useAccreditationState({ eventId, agendaItemId, userId });

  const { confirmAccreditation } = useAccreditationActions();

  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleConfirmClick = () => {
    setShowPasswordInput(true);
    setPasswordError(null);
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!userId) return;
    setIsConfirming(true);
    setPasswordError(null);
    try {
      await confirmAccreditation({
        event_id: eventId,
        agenda_item_id: agendaItemId,
        password,
      });
      setShowPasswordInput(false);
    } catch {
      setPasswordError(t('common.accreditation.wrongPassword', 'Invalid password'));
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <CardTitle>{t('features.events.agenda.accreditation.title', 'Accreditation')}</CardTitle>
          </div>
          <Badge variant="secondary">
            <Users className="mr-1 h-3 w-3" />
            {accreditedCount} {t('features.events.agenda.accreditation.accredited', 'accredited')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User's accreditation status */}
        {isAccredited ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-700 dark:text-green-300">
              {t('features.events.agenda.accreditation.confirmed', 'Your attendance is confirmed')}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            {!showPasswordInput ? (
              <Button onClick={handleConfirmClick} className="w-full">
                <ShieldCheck className="mr-2 h-4 w-4" />
                {t('features.events.agenda.accreditation.confirmAttendance', 'Confirm Attendance')}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t('features.events.agenda.accreditation.enterPassword', 'Enter your 4-digit voting password to confirm attendance')}
                </p>
                <VotePasswordInput
                  onSubmit={handlePasswordSubmit}
                  error={passwordError}
                  isLoading={isConfirming}
                />
              </div>
            )}
          </div>
        )}

        {/* List of accredited participants */}
        {accreditationsByAgendaItem.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {t('features.events.agenda.accreditation.participants', 'Accredited Participants')}
            </p>
            <div className="flex flex-wrap gap-2">
              {accreditationsByAgendaItem.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {acc.user_id?.charAt(0)?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
