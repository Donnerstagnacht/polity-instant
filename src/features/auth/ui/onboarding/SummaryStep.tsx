'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, User, Users, Mail, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import type { Group } from './useOnboarding';

interface SummaryStepProps {
  firstName: string;
  lastName: string;
  selectedGroup: Group | null;
  membershipRequestSent: boolean;
  onGoToProfile: () => void;
  onGoToGroup: () => void;
  onGoToAssistant: () => void;
  isLoading?: boolean;
}

export function SummaryStep({
  firstName,
  lastName,
  selectedGroup,
  membershipRequestSent,
  onGoToProfile,
  onGoToGroup,
  onGoToAssistant,
  isLoading,
}: SummaryStepProps) {
  const { t } = useTranslation();
  const fullName = `${firstName} ${lastName}`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">{t('onboarding.summaryStep.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('onboarding.summaryStep.description')}</p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
        {/* Name Updated */}
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-full bg-green-500 p-2">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('onboarding.summaryStep.nameUpdated')}
              </p>
              <p className="font-semibold text-green-900 dark:text-green-100">{fullName}</p>
            </div>
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardContent>
        </Card>

        {/* Group Selected */}
        {selectedGroup ? (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-blue-500 p-2">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('onboarding.summaryStep.groupSelected')}
                </p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  {selectedGroup.name}
                </p>
              </div>
              <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-gray-400 p-2">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('onboarding.summaryStep.noGroup')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Membership Request */}
        {selectedGroup && membershipRequestSent && (
          <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-purple-500 p-2">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {t('onboarding.summaryStep.membershipRequested')}
                </p>
                <p className="font-semibold text-purple-900 dark:text-purple-100">
                  {selectedGroup.name}
                </p>
              </div>
              <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Button onClick={onGoToAssistant} disabled={isLoading} className="w-full" size="lg">
          <MessageCircle className="mr-2 h-4 w-4" />
          Show me my assistant location
        </Button>
        
        <Button onClick={onGoToProfile} disabled={isLoading} variant="outline" className="w-full" size="lg">
          {t('onboarding.summaryStep.goToProfile')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        {selectedGroup && (
          <Button
            variant="outline"
            onClick={onGoToGroup}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {t('onboarding.summaryStep.goToGroup')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
