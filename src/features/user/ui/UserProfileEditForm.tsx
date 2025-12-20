import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AvatarUploadSection } from './AvatarUploadSection';
import { BasicInformationSection } from './BasicInformationSection';
import { AboutSection } from './AboutSection';
import { ContactInformationSection } from './ContactInformationSection';
import { HashtagsSection } from './HashtagsSection';
import { SubscriptionPlansGrid } from './SubscriptionPlansGrid';
import { SubscriptionStatus } from '../components/SubscriptionStatus';
import type { UserProfileFormData } from '../hooks/useUserProfileForm';

interface UserProfileEditFormProps {
  formData: UserProfileFormData;
  isSubmitting: boolean;
  isUploading: boolean;
  userId: string;
  activeSubscriptionAmount: number;
  isCheckoutLoading: boolean;
  isPlanActive: (amount: number) => boolean;
  hasCustomPlan: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFieldChange: <K extends keyof UserProfileFormData>(
    field: K,
    value: UserProfileFormData[K]
  ) => void;
  onSubscribe: (priceId: string) => void;
  onCustomAmount: (euros: number) => void;
  onCancelSubscription: () => void;
}

export function UserProfileEditForm({
  formData,
  isSubmitting,
  isUploading,
  userId,
  activeSubscriptionAmount,
  isCheckoutLoading,
  isPlanActive,
  hasCustomPlan,
  onSubmit,
  onCancel,
  onAvatarUpload,
  onFieldChange,
  onSubscribe,
  onCustomAmount,
  onCancelSubscription,
}: UserProfileEditFormProps) {
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-muted-foreground">Update your user information</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <AvatarUploadSection
          avatar={formData.avatar}
          userName={formData.name}
          isUploading={isUploading}
          onUpload={onAvatarUpload}
        />

        <BasicInformationSection
          name={formData.name}
          subtitle={formData.subtitle}
          onNameChange={value => onFieldChange('name', value)}
          onSubtitleChange={value => onFieldChange('subtitle', value)}
        />

        <AboutSection
          about={formData.about}
          onAboutChange={value => onFieldChange('about', value)}
        />

        <ContactInformationSection
          email={formData.email}
          twitter={formData.twitter}
          website={formData.website}
          location={formData.location}
          onEmailChange={value => onFieldChange('email', value)}
          onTwitterChange={value => onFieldChange('twitter', value)}
          onWebsiteChange={value => onFieldChange('website', value)}
          onLocationChange={value => onFieldChange('location', value)}
        />

        <HashtagsSection
          hashtags={formData.hashtags}
          onHashtagsChange={value => onFieldChange('hashtags', value)}
        />

        <SubscriptionStatus userId={userId} />

        <SubscriptionPlansGrid
          activeAmount={activeSubscriptionAmount}
          isLoading={isCheckoutLoading}
          onSubscribe={onSubscribe}
          onCustomAmount={onCustomAmount}
          onCancel={onCancelSubscription}
          isPlanActive={isPlanActive}
          hasCustomPlan={hasCustomPlan}
        />

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
