'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, ArrowLeft, Check, X, Loader2, UserPlus } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import type { Group } from './useOnboarding';

interface MembershipConfirmStepProps {
  group: Group;
  onConfirm: () => Promise<void>;
  onDecline: () => void;
  onBack: () => void;
  isLoading?: boolean;
  requestSent?: boolean;
}

export function MembershipConfirmStep({
  group,
  onConfirm,
  onDecline,
  onBack,
  isLoading,
  requestSent,
}: MembershipConfirmStepProps) {
  const { t } = useTranslation();

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-purple-500 to-violet-600 p-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">{t('onboarding.confirmStep.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('onboarding.confirmStep.description')}</p>
      </div>

      {/* Selected Group Card */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <Badge variant="outline" className="flex-shrink-0">
              <Users className="mr-1 h-3 w-3" />
              {group.memberCount}
            </Badge>
          </div>
          {group.description && (
            <CardDescription className="text-sm">{group.description}</CardDescription>
          )}
        </CardHeader>
        {group.location && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{group.location}</span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Confirmation Buttons */}
      {requestSent ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950">
          <div className="mb-2 flex justify-center">
            <div className="rounded-full bg-green-500 p-2">
              <Check className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="font-medium text-green-800 dark:text-green-200">
            {t('onboarding.confirmStep.requestSent')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Button onClick={handleConfirm} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('onboarding.confirmStep.requestSending')}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t('onboarding.confirmStep.yes')}
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onDecline}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <X className="mr-2 h-4 w-4" />
            {t('onboarding.confirmStep.no')}
          </Button>
        </div>
      )}

      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} disabled={isLoading} className="w-full">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('common.goBack')}
      </Button>
    </div>
  );
}
