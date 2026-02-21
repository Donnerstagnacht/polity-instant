import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { stripeCreateCheckoutFn } from '@/server/stripe-create-checkout';
import { stripeCancelSubscriptionFn } from '@/server/stripe-cancel-subscription';

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
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as Record<string, string>;
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Show success/cancel message from Stripe redirect
  useEffect(() => {
    const success = searchParams.success;
    const canceled = searchParams.canceled;

    if (success === 'true') {
      toast.success('Subscription successful! Thank you for your support! 🎉');
      // Clear the query param to prevent duplicate toasts
      navigate({ to: window.location.pathname, replace: true });
      onSubscriptionChange?.();
    } else if (canceled === 'true') {
      toast.info('Subscription canceled. You can subscribe anytime.');
      // Clear the query param to prevent duplicate toasts
      navigate({ to: window.location.pathname, replace: true });
    }
  }, [searchParams, navigate, onSubscriptionChange]);

  const handleSubscribe = async (priceId: string) => {
    setIsCheckoutLoading(true);
    try {
      const data = await stripeCreateCheckoutFn({
        data: { priceId, userId, origin: window.location.origin },
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create checkout session');
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
      const data = await stripeCreateCheckoutFn({
        data: { amount: euros * 100, userId, origin: window.location.origin },
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to create checkout session');
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
      const data = await stripeCancelSubscriptionFn({
        data: { subscriptionId },
      });

      if (data.success) {
        toast.success('Subscription canceled successfully');
        onSubscriptionChange?.();
      } else {
        toast.error('Failed to cancel subscription');
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
