import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

// Co-located types
export interface UseStripeCheckoutOptions {
  userId: string | undefined;
  onSubscriptionChange?: () => void;
}

export interface UseStripeCheckoutReturn {
  isCheckoutLoading: boolean;
  handleSubscribe: (priceId: string) => Promise<void>;
  handleCustomAmount: (euros: number) => Promise<void>;
  handleCancelSubscription: (subscriptionId: string) => Promise<void>;
}

export function useStripeCheckout({
  userId,
  onSubscriptionChange,
}: UseStripeCheckoutOptions): UseStripeCheckoutReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Show success/cancel message from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('Subscription successful! Thank you for your support! 🎉');
      // Clear the query param to prevent duplicate toasts
      router.replace(window.location.pathname, { scroll: false });
      onSubscriptionChange?.();
    } else if (canceled === 'true') {
      toast.info('Subscription canceled. You can subscribe anytime.');
      // Clear the query param to prevent duplicate toasts
      router.replace(window.location.pathname, { scroll: false });
    }
  }, [searchParams, router, onSubscriptionChange]);

  const handleSubscribe = async (priceId: string) => {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        const errorMessage = data.error || 'Failed to create checkout session';
        toast.error(errorMessage);
        console.error('Checkout error:', data);
      }
    } catch (error) {
      toast.error('Checkout error');
      console.error('Checkout error:', error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleCustomAmount = async (euros: number) => {
    if (euros <= 0) return;

    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: euros * 100, userId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        const errorMessage = data.error || 'Failed to create checkout session';
        toast.error(errorMessage);
        console.error('Checkout error:', data);
      }
    } catch (error) {
      toast.error('Checkout error');
      console.error('Checkout error:', error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!subscriptionId) return;

    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Subscription canceled successfully');
        onSubscriptionChange?.();
      } else {
        const errorMessage = data.error || 'Failed to cancel subscription';
        toast.error(errorMessage);
        console.error('Cancel error:', data);
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
      console.error('Cancel error:', error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return {
    isCheckoutLoading,
    handleSubscribe,
    handleCustomAmount,
    handleCancelSubscription,
  };
}
