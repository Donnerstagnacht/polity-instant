'use client';

import { useState, useCallback } from 'react';
import { db, tx, id } from '../../../../../db/db';
import { toast } from 'sonner';
import { notifyMembershipRequest } from '@/utils/notification-helpers';

export type OnboardingStep = 'name' | 'groupSearch' | 'confirm' | 'ariaKai' | 'summary';

export interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  location?: string;
  isPublic: boolean;
}

export interface OnboardingData {
  firstName: string;
  lastName: string;
  selectedGroup: Group | null;
  requestMembership: boolean;
  membershipRequestSent: boolean;
  dontShowAriaKaiAgain: boolean;
}

interface UseOnboardingReturn {
  step: OnboardingStep;
  data: OnboardingData;
  isLoading: boolean;
  error: string | null;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setSelectedGroup: (group: Group | null) => void;
  setDontShowAriaKaiAgain: (value: boolean) => void;
  goToStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  submitName: () => Promise<boolean>;
  sendMembershipRequest: () => Promise<boolean>;
  skipMembership: () => void;
  completeOnboarding: (userId: string) => Promise<void>;
}

const STEP_ORDER: OnboardingStep[] = ['name', 'groupSearch', 'confirm', 'ariaKai', 'summary'];

export function useOnboarding(): UseOnboardingReturn {
  const { user } = db.useAuth();
  const [step, setStep] = useState<OnboardingStep>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    selectedGroup: null,
    requestMembership: false,
    membershipRequestSent: false,
    dontShowAriaKaiAgain: false,
  });

  const setFirstName = useCallback((value: string) => {
    setData(prev => ({ ...prev, firstName: value }));
  }, []);

  const setLastName = useCallback((value: string) => {
    setData(prev => ({ ...prev, lastName: value }));
  }, []);

  const setSelectedGroup = useCallback((group: Group | null) => {
    setData(prev => ({ ...prev, selectedGroup: group }));
  }, []);
  const setDontShowAriaKaiAgain = useCallback((value: boolean) => {
    setData(prev => ({ ...prev, dontShowAriaKaiAgain: value }));
  }, []);
  const goToStep = useCallback((newStep: OnboardingStep) => {
    setStep(newStep);
    setError(null);
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex < STEP_ORDER.length - 1) {
      // Skip confirm step if no group selected
      if (step === 'groupSearch' && !data.selectedGroup) {
        setStep('summary');
      } else {
        setStep(STEP_ORDER[currentIndex + 1]);
      }
    }
  }, [step, data.selectedGroup]);

  const previousStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex > 0) {
      // Skip confirm step when going back if no group
      if (step === 'summary' && !data.selectedGroup) {
        setStep('groupSearch');
      } else {
        setStep(STEP_ORDER[currentIndex - 1]);
      }
    }
  }, [step, data.selectedGroup]);

  const submitName = useCallback(async (): Promise<boolean> => {
    if (!data.firstName.trim() || !data.lastName.trim()) {
      setError('Bitte fülle beide Felder aus');
      return false;
    }

    if (data.firstName.length < 2 || data.lastName.length < 2) {
      setError('Name muss mindestens 2 Zeichen lang sein');
      return false;
    }

    setError(null);
    return true;
  }, [data.firstName, data.lastName]);

  const sendMembershipRequest = useCallback(async (): Promise<boolean> => {
    if (!data.selectedGroup) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const membershipId = id();

      // Build transactions
      const transactions: any[] = [
        tx.groupMemberships[membershipId]
          .update({
            createdAt: new Date().toISOString(),
            status: 'requested',
          })
          .link({
            user: user.id,
            group: data.selectedGroup.id,
          }),
      ];

      // Add notification to group admins/members with manage rights
      const notificationTxs = notifyMembershipRequest({
        senderId: user.id,
        senderName: user.email?.split('@')[0] || 'A user',
        groupId: data.selectedGroup.id,
        groupName: data.selectedGroup.name,
      });
      transactions.push(...notificationTxs);

      await db.transact(transactions);

      setData(prev => ({ ...prev, requestMembership: true, membershipRequestSent: true }));
      toast.success('Beitrittsanfrage gesendet!');
      return true;
    } catch (err) {
      console.error('Failed to send membership request:', err);
      setError('Anfrage konnte nicht gesendet werden');
      toast.error('Anfrage konnte nicht gesendet werden');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [data.selectedGroup, user?.id, user?.email]);

  const skipMembership = useCallback(() => {
    setData(prev => ({ ...prev, requestMembership: false }));
    setStep('summary');
  }, []);

  const completeOnboarding = useCallback(
    async (userId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
        const now = Date.now();

        await db.transact([
          tx.$users[userId].update({
            name: fullName,
            updatedAt: now,
            lastSeenAt: now,
          }),
        ]);

        console.log('✅ Onboarding completed:', { userId, fullName });
      } catch (err) {
        console.error('Failed to complete onboarding:', err);
        setError('Profil konnte nicht aktualisiert werden');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [data.firstName, data.lastName]
  );

  return {
    step,
    data,
    isLoading,
    error,
    setFirstName,
    setLastName,
    setSelectedGroup,
    setDontShowAriaKaiAgain,
    goToStep,
    nextStep,
    previousStep,
    submitName,
    sendMembershipRequest,
    skipMembership,
    completeOnboarding,
  };
}
