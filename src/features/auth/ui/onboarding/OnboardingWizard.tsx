'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/use-translation';
import { useOnboarding, type OnboardingStep } from './useOnboarding';
import { NameStep } from './NameStep';
import { GroupSearchStep } from './GroupSearchStep';
import { MembershipConfirmStep } from './MembershipConfirmStep';
import { SummaryStep } from './SummaryStep';
import { AriaKaiStep } from './AriaKaiStep';
import { db, tx, id } from '../../../../../db/db';
import { ARIA_KAI_USER_ID, ARIA_KAI_WELCOME_MESSAGE } from 'e2e/aria-kai';

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
  const router = useRouter();
  const { user } = db.useAuth();

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

  const initializeUserAndAriaKai = async () => {
    console.log('🚀 initializeUserAndAriaKai started for user:', userId);
    const now = Date.now();
    const threeYearsAgo = now - 3 * 365 * 24 * 60 * 60 * 1000;
    const conversationId = id();
    const messageId = id();
    console.log('📝 Generated IDs:', { conversationId, messageId });

    // Generate random handle
    const adjectives = [
      'Quick',
      'Lazy',
      'Happy',
      'Sad',
      'Bright',
      'Dark',
      'Clever',
      'Bold',
      'Swift',
      'Calm',
    ];
    const nouns = [
      'Fox',
      'Dog',
      'Cat',
      'Bird',
      'Fish',
      'Mouse',
      'Lion',
      'Bear',
      'Wolf',
      'Eagle',
    ];
    const randomHandle = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 9000) + 1000}`;
    console.log('🎲 Generated random handle:', randomHandle);

    // First ensure Aria & Kai exists
    console.log('👥 Creating/updating Aria & Kai user...');
    await db.transact([
      tx.$users[ARIA_KAI_USER_ID].update({
        name: 'Aria & Kai',
        handle: '@ariakai',
        subtitle: 'Your Personal Assistants',
        bio: 'Aria & Kai are your personal AI assistants dedicated to helping you get the most out of Polity.',
        createdAt: threeYearsAgo,
        updatedAt: threeYearsAgo,
        lastSeenAt: now,
        visibility: 'public',
      }),
    ]);
    console.log('✅ Aria & Kai user created/updated');

    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
    console.log('👤 Setting up user:', { userId, fullName, randomHandle });

    // Initialize user and create conversation
    console.log('💬 Creating conversation and initial message...');
    await db.transact([
      tx.$users[userId].update({
        handle: randomHandle,
        name: fullName,
        updatedAt: now,
        lastSeenAt: now,
      }),
      tx.conversations[conversationId].update({
        lastMessageAt: now,
        createdAt: now,
        type: 'direct',
        status: 'accepted',
      }),
      tx.conversations[conversationId].link({
        requestedBy: ARIA_KAI_USER_ID,
      }),
      tx.conversationParticipants[id()]
        .update({
          lastReadAt: null,
          joinedAt: now,
          leftAt: null,
        })
        .link({ user: userId, conversation: conversationId }),
      tx.conversationParticipants[id()]
        .update({
          lastReadAt: now,
          joinedAt: now,
          leftAt: null,
        })
        .link({ user: ARIA_KAI_USER_ID, conversation: conversationId }),
      tx.messages[messageId]
        .update({
          content: ARIA_KAI_WELCOME_MESSAGE,
          isRead: false,
          createdAt: now,
          updatedAt: null,
          deletedAt: null,
        })
        .link({ conversation: conversationId, sender: ARIA_KAI_USER_ID }),
    ]);

    console.log('✅ User and Aria & Kai conversation created successfully', {
      conversationId,
      messageId,
      fullName,
      handle: randomHandle
    });
  };

  const handleNameNext = async () => {
    // Basic validation is done in NameStep component
    nextStep();
  };

  const handleGroupNext = () => {
    nextStep();
  };

  const handleMembershipConfirm = async () => {
    const success = await sendMembershipRequest();
    if (success) {
      // Initialize user and Aria & Kai before moving to ariaKai step
      await initializeUserAndAriaKai();
      goToStep('ariaKai');
    }
  };

  const handleMembershipDecline = () => {
    skipMembership();
  };

  const handleAriaKaiNext = async () => {
    console.log('🎭 AriaKai step next, moving to summary');
    
    // Save the "don't show again" preference if user checked it
    if (data.dontShowAriaKaiAgain && user?.id) {
      console.log('💾 Saving assistantIntroduction preference');
      try {
        await db.transact(
          tx.$users[user.id].update({
            assistantIntroduction: false,
          })
        );
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
      router.push(`/user/${userId}`);
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
      router.push(`/group/${data.selectedGroup.id}`);
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
      router.push('/messages?openAriaKai=true');
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
