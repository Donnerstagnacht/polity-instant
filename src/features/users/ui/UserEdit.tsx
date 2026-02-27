import { Loader2 } from 'lucide-react';
import { useUserData } from '../hooks/useUserData';
import { useUserProfileForm } from '../hooks/useUserProfileForm';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import { useSubscriptionManagement } from '@/features/payments/hooks/useSubscriptionManagement';
import { useStripeCheckout } from '@/features/payments/hooks/useStripeCheckout';
import { UserProfileEditForm } from './UserProfileEditForm';

interface UserEditProps {
  userId: string;
}

export function UserEdit({ userId }: UserEditProps) {
  const { user, isLoading } = useUserData(userId);

  const { formData, isSubmitting, handleSubmit, updateField } = useUserProfileForm({
    userId,
    user,
  });

  const { isUploading, handleAvatarUpload } = useAvatarUpload({
    userId,
    onSuccess: (avatarUrl) => updateField('avatar', avatarUrl),
  });

  const {
    activeSubscription,
    isPlanActive,
    hasCustomPlan,
    getActivePlanAmount,
    fetchSubscription,
  } = useSubscriptionManagement({ userId });

  const { isCheckoutLoading, handleSubscribe, handleCustomAmount, handleCancelSubscription } =
    useStripeCheckout({ userId, onSubscriptionChange: fetchSubscription });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserProfileEditForm
      formData={formData}
      isSubmitting={isSubmitting}
      isUploading={isUploading}
      userId={userId}
      activeSubscriptionAmount={getActivePlanAmount()}
      isCheckoutLoading={isCheckoutLoading}
      isPlanActive={isPlanActive}
      hasCustomPlan={hasCustomPlan()}
      onSubmit={handleSubmit}
      onCancel={() => window.history.back()}
      onAvatarUpload={handleAvatarUpload}
      onFieldChange={updateField}
      onSubscribe={handleSubscribe}
      onCustomAmount={handleCustomAmount}
      onCancelSubscription={() =>
        activeSubscription?.id
          ? handleCancelSubscription(activeSubscription.id)
          : undefined
      }
    />
  );
}
