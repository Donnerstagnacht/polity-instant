'use client';

import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/ui/ui/card.tsx';
import { Progress } from '@/features/shared/ui/ui/progress.tsx';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';
import { useOnboarding, type OnboardingStep } from '../hooks/useOnboarding.ts';
import { NameStep } from './NameStep.tsx';
import { GroupSearchStep } from './GroupSearchStep.tsx';
import { MembershipConfirmStep } from './MembershipConfirmStep.tsx';
import { SummaryStep } from './SummaryStep.tsx';
import { AriaKaiStep } from './AriaKaiStep.tsx';
import { useUserActions } from '@/zero/users/useUserActions.ts';
import { useAuth } from '@/providers/auth-provider.tsx';

interface OnboardingWizardProps {
  userId: string;
  userEmail: string;
  onComplete: () => void;
}

const STEP_PROGRESS: Record<OnboardingStep, number> = {
  name: 20,
  groupSearch: 40,
  confirm: 60,
  ariaKai: 80,
  summary: 100,
};

export function OnboardingWizard({ userId, userEmail, onComplete }: OnboardingWizardProps) {
  console.log('🎯 OnboardingWizard RENDERING:', { userId, userEmail, onComplete: !!onComplete });
  
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useUserActions();

  const {
    step,
    data,
    isLoading,
    setFirstName,
    setLastName,
    setSelectedGroup,
    setDontShowAriaKaiAgain,
    nextStep,
    previousStep,
    goToStep,
    sendMembershipRequest,
    skipMembership,
    completeOnboarding,
  } = useOnboarding();
  
  console.log('🎯 OnboardingWizard state:', { step, isLoading, data });

  const handleNameNext = async () => {
    // Save name to database immediately after name step
    await completeOnboarding(userId);
    nextStep();
  };

  const handleGroupNext = async () => {
    // Name is already saved in handleNameNext
    nextStep();
  };

  const handleMembershipConfirm = async () => {
    const success = await sendMembershipRequest();
    if (success) {
      // Move to ariaKai step
      goToStep('ariaKai');
    }
  };

  const handleMembershipDecline = async () => {
    // Name is already saved in handleNameNext
    skipMembership();
  };

  const handleAriaKaiNext = async () => {
    console.log('🎭 AriaKai step next, moving to summary');
    
    // Save the "don't show again" preference if user checked it
    if (data.dontShowAriaKaiAgain && user?.id) {
      console.log('💾 Saving assistantIntroduction preference');
      try {
        await updateProfile({
          assistant_introduction: false,
        });
        console.log('✅ assistantIntroduction preference saved');
      } catch (error) {
        console.error('❌ Error saving preference:', error);
      }
    }
    
    goToStep('summary');
  };

  const handleGoToProfile = async () => {
    console.log('🏠 handleGoToProfile called');
    try {
      console.log('✅ Redirecting to /user/' + userId);
      navigate({ to: `/user/${userId}` });
      onComplete();
      console.log('✅ onComplete called');
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error);
    }
  };

  const handleGoToGroup = async () => {
    console.log('👥 handleGoToGroup called');
    if (!data.selectedGroup) {
      console.warn('⚠️ No selected group');
      return;
    }

    try {
      console.log('✅ Redirecting to group:', data.selectedGroup.id);
      navigate({ to: `/group/${data.selectedGroup.id}` });
      onComplete();
      console.log('✅ onComplete called');
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error);
    }
  };

  const handleGoToAssistant = async () => {
    console.log('💬 handleGoToAssistant called');
    try {
      console.log('✅ Redirecting to messages with AriaKai');
      navigate({ to: '/messages', search: { openAriaKai: 'true' } });
      onComplete();
      console.log('✅ onComplete called');
    } catch (error) {
      console.error('❌ Failed to complete onboarding:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <div className="mb-2 flex items-center justify-between">
            <CardTitle className="text-lg text-muted-foreground">
              {t('onboarding.welcome')}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {step === 'name' && '1/5'}
              {step === 'groupSearch' && '2/5'}
              {step === 'confirm' && '3/5'}
              {step === 'ariaKai' && '4/5'}
              {step === 'summary' && '5/5'}
            </span>
          </div>
          <Progress value={STEP_PROGRESS[step]} className="h-2" />
        </CardHeader>
        <CardContent className="pt-4">
          {step === 'name' && (
            <NameStep
              firstName={data.firstName}
              lastName={data.lastName}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onNext={handleNameNext}
              isLoading={isLoading}
            />
          )}

          {step === 'groupSearch' && (
            <GroupSearchStep
              selectedGroup={data.selectedGroup}
              onSelectGroup={setSelectedGroup}
              onNext={handleGroupNext}
              onBack={previousStep}
              isLoading={isLoading}
            />
          )}

          {step === 'confirm' && data.selectedGroup && (
            <MembershipConfirmStep
              group={data.selectedGroup}
              onConfirm={handleMembershipConfirm}
              onDecline={handleMembershipDecline}
              onBack={previousStep}
              isLoading={isLoading}
              requestSent={data.membershipRequestSent}
            />
          )}

          {step === 'ariaKai' && (
            <AriaKaiStep
              onNext={handleAriaKaiNext}
              dontShowAgain={data.dontShowAriaKaiAgain}
              onDontShowAgainChange={setDontShowAriaKaiAgain}
            />
          )}

          {step === 'summary' && (
            <SummaryStep
              firstName={data.firstName}
              lastName={data.lastName}
              selectedGroup={data.selectedGroup}
              membershipRequestSent={data.membershipRequestSent}
              onGoToProfile={handleGoToProfile}
              onGoToGroup={handleGoToGroup}
              onGoToAssistant={handleGoToAssistant}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
