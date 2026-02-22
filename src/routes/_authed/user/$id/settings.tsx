import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { UserProfileEditForm } from '@/features/users/ui/UserProfileEditForm'
import { useUserData } from '@/features/users/hooks/useUserData'
import { useUserProfileForm } from '@/features/users/hooks/useUserProfileForm'
import { useAvatarUpload } from '@/features/users/hooks/useAvatarUpload'
import { useSubscriptionManagement } from '@/features/payments/hooks/useSubscriptionManagement'
import { useStripeCheckout } from '@/features/payments/hooks/useStripeCheckout'

export const Route = createFileRoute('/_authed/user/$id/settings')({
  component: UserSettingsPage,
})

function UserSettingsPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { user, isLoading } = useUserData(id)
  const { formData, isSubmitting, handleSubmit, updateField } = useUserProfileForm({
    userId: id,
    user,
  })
  const { isUploading, handleAvatarUpload } = useAvatarUpload({
    userId: id,
    onSuccess: (avatarUrl) => updateField('avatar', avatarUrl),
  })
  const { activeSubscription, getActivePlanAmount, isPlanActive, hasCustomPlan } =
    useSubscriptionManagement({ userId: id })
  const { isCheckoutLoading, handleSubscribe, handleCustomAmount, handleCancelSubscription } =
    useStripeCheckout({ userId: id })

  if (isLoading) return <div>Loading...</div>

  return (
    <UserProfileEditForm
      formData={formData}
      isSubmitting={isSubmitting}
      isUploading={isUploading}
      userId={id}
      activeSubscriptionAmount={getActivePlanAmount()}
      isCheckoutLoading={isCheckoutLoading}
      isPlanActive={isPlanActive}
      hasCustomPlan={hasCustomPlan()}
      onSubmit={handleSubmit}
      onCancel={() => navigate({ to: `/user/${id}` })}
      onAvatarUpload={handleAvatarUpload}
      onFieldChange={updateField}
      onSubscribe={handleSubscribe}
      onCustomAmount={handleCustomAmount}
      onCancelSubscription={() => handleCancelSubscription(activeSubscription?.id || '')}
    />
  )
}
