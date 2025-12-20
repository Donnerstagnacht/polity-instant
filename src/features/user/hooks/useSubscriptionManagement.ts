import { useState, useEffect } from 'react';

// Co-located types
export interface SubscriptionData {
  id: string;
  amount: number;
  status: string;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
}

export interface UseSubscriptionManagementOptions {
  userId: string | undefined;
}

export interface UseSubscriptionManagementReturn {
  activeSubscription: SubscriptionData | null;
  isLoading: boolean;
  fetchSubscription: () => Promise<void>;
  isPlanActive: (amount: number) => boolean;
  hasCustomPlan: () => boolean;
  getActivePlanAmount: () => number;
}

export function useSubscriptionManagement({
  userId,
}: UseSubscriptionManagementOptions): UseSubscriptionManagementReturn {
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubscription = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/subscription-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch active subscription on mount and when userId changes
  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  // Helper to check if a plan is currently active
  const isPlanActive = (amount: number): boolean => {
    if (!activeSubscription) return false;
    return activeSubscription.amount === amount;
  };

  // Helper to check if user has a custom plan (not €2 or €10)
  const hasCustomPlan = (): boolean => {
    if (!activeSubscription) return false;
    return activeSubscription.amount !== 200 && activeSubscription.amount !== 1000;
  };

  // Helper to get the active plan amount (0 for free, otherwise the subscription amount)
  const getActivePlanAmount = (): number => {
    if (!activeSubscription) return 0; // Free plan
    return activeSubscription.amount;
  };

  return {
    activeSubscription,
    isLoading,
    fetchSubscription,
    isPlanActive,
    hasCustomPlan,
    getActivePlanAmount,
  };
}
