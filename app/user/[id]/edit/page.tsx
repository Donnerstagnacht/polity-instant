'use client';

import { use, Suspense } from 'react';
import { AuthGuard, OwnerOnlyGuard } from '@/features/auth';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/auth.ts';
import { useUserData } from '@/features/user/hooks/useUserData';
import { useUserProfileForm } from '@/features/user/hooks/useUserProfileForm';
import { useSubscriptionManagement } from '@/features/user/hooks/useSubscriptionManagement';
import { useStripeCheckout } from '@/features/user/hooks/useStripeCheckout';
import { useAvatarUpload } from '@/features/user/hooks/useAvatarUpload';
import { UserProfileEditForm } from '@/features/user/ui/UserProfileEditForm';
import { Loader2 } from 'lucide-react';

export default function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <Suspense
      fallback={
        <AuthGuard requireAuth={true}>
          <PageWrapper className="container mx-auto max-w-4xl py-8">
            <Card>
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
              </CardHeader>
            </Card>
          </PageWrapper>
        </AuthGuard>
      }
    >
      <UserEditContent userId={resolvedParams.id} />
    </Suspense>
  );
}

function UserEditContent({ userId }: { userId: string }) {
  const router = useRouter();
  const { user: authUser } = useAuthStore();
  const { user: dbUser, isLoading, error } = useUserData(userId);

  // Use extracted hooks
  const { formData, isSubmitting, handleSubmit, updateField } = useUserProfileForm({
    userId,
    user: dbUser,
  });

  const { activeSubscription, isPlanActive, hasCustomPlan, getActivePlanAmount, fetchSubscription } =
    useSubscriptionManagement({
      userId: authUser?.id,
    });

  const { isCheckoutLoading, handleSubscribe, handleCustomAmount, handleCancelSubscription } =
    useStripeCheckout({
      userId: authUser?.id,
      onSubscriptionChange: fetchSubscription,
    });

  const { isUploading, handleAvatarUpload } = useAvatarUpload({
    userId: authUser?.id || userId,
  });

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  // Check if user data exists after loading
  if (!dbUser) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold">User not found</p>
              <p className="text-muted-foreground">No user data exists for this user yet</p>
              {error && <p className="mt-2 text-sm text-red-500">Error: {error}</p>}
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  You need to create a user first by clicking the "Seed User Data" button on the
                  user page
                </p>
                <Button onClick={() => router.push(`/user/${userId}`)} variant="default">
                  Go to User Page
                </Button>
              </div>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <OwnerOnlyGuard targetUserId={userId}>
        <PageWrapper>
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
            onCancel={() => router.push(`/user/${userId}`)}
            onAvatarUpload={handleAvatarUpload}
            onFieldChange={updateField}
            onSubscribe={handleSubscribe}
            onCustomAmount={handleCustomAmount}
            onCancelSubscription={() =>
              activeSubscription && handleCancelSubscription(activeSubscription.id)
            }
          />
        </PageWrapper>
      </OwnerOnlyGuard>
    </AuthGuard>
  );
}
