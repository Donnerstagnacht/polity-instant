import { Button } from '@/features/shared/ui/ui/button';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/ui/ui/tabs';
import { VisibilityInput } from '@/features/create/ui/inputs/VisibilityInput';
import { AvatarUploadSection } from './AvatarUploadSection';
import { BasicInformationSection } from './BasicInformationSection';
import { AboutSection } from './AboutSection';
import { ContactInformationSection } from './ContactInformationSection';
import { HashtagsSection } from './HashtagsSection';
import { SubscriptionPlansGrid } from '@/features/payments/ui/SubscriptionPlansGrid';
import { SubscriptionStatus } from '@/features/payments/ui/SubscriptionStatus';
import { FormStyleSelector } from '@/features/create/ui/FormStyleSelector';
import { ThemeToggle } from '@/features/navigation/toggles/theme-toggle';
import { LanguageToggle } from '@/features/navigation/toggles/language-toggle';
import { StateToggle } from '@/features/navigation/toggles/state-toggle';
import { useNavigationStore } from '@/features/navigation/state/navigation.store';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { VotingPasswordTab } from './VotingPasswordTab';
import { AccountPasswordSection } from './AccountPasswordSection';
import { AccountEmailSection } from './AccountEmailSection';
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
  const { t } = useTranslation();
  const { navigationView, setNavigationView } = useNavigationStore();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('pages.user.settings')}</h1>
        <p className="text-muted-foreground">{t('pages.user.settingsDescription')}</p>
      </div>

      <Tabs defaultValue="basic-info">
        <TabsList className="mb-6">
          <TabsTrigger value="basic-info">
            {t('pages.user.settingsTabs.basicInfo')}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            {t('pages.user.settingsTabs.preferences')}
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            {t('pages.user.settingsTabs.subscriptions')}
          </TabsTrigger>
          <TabsTrigger value="passwords">
            {t('pages.user.settingsTabs.passwords')}
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic-info">
          <form onSubmit={onSubmit} className="space-y-6">
            <AvatarUploadSection
              avatar={formData.avatar}
              userName={[formData.firstName, formData.lastName].filter(Boolean).join(' ')}
              isUploading={isUploading}
              onUpload={onAvatarUpload}
            />

            <BasicInformationSection
              firstName={formData.firstName}
              lastName={formData.lastName}
              subtitle={formData.subtitle}
              onFirstNameChange={value => onFieldChange('firstName', value)}
              onLastNameChange={value => onFieldChange('lastName', value)}
              onSubtitleChange={value => onFieldChange('subtitle', value)}
            />

            <VisibilityInput value={formData.visibility} onChange={v => onFieldChange('visibility', v)} />

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

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                {t('common.actions.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('pages.user.settingsTabs.saving')}
                  </>
                ) : (
                  t('pages.user.settingsTabs.saveProfile')
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="mb-1 text-sm font-medium">
                {t('pages.user.preferences.theme')}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                {t('pages.user.preferences.themeDescription')}
              </p>
              <ThemeToggle />
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-1 text-sm font-medium">
                {t('pages.user.preferences.language')}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                {t('pages.user.preferences.languageDescription')}
              </p>
              <LanguageToggle side="bottom" />
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-1 text-sm font-medium">
                {t('pages.user.preferences.navigationStyle')}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                {t('pages.user.preferences.navigationStyleDescription')}
              </p>
              <StateToggle currentState={navigationView} onStateChange={setNavigationView} />
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-1 text-sm font-medium">
                {t('pages.create.preferences.formStyle')}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                {t('pages.create.preferences.formStyleDescription')}
              </p>
              <FormStyleSelector />
            </div>
          </div>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <div className="space-y-6">
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
          </div>
        </TabsContent>

        {/* Passwords Tab */}
        <TabsContent value="passwords">
          <div className="space-y-6">
            <AccountPasswordSection />
            <AccountEmailSection />
            <VotingPasswordTab userId={userId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
