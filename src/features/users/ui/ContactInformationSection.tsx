import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface ContactInformationSectionProps {
  email: string;
  twitter: string;
  website: string;
  location: string;
  onEmailChange: (value: string) => void;
  onTwitterChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

export function ContactInformationSection({
  email,
  twitter,
  website,
  location,
  onEmailChange,
  onTwitterChange,
  onWebsiteChange,
  onLocationChange,
}: ContactInformationSectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pages.user.settingsForm.contact.title')}</CardTitle>
        <CardDescription>{t('pages.user.settingsForm.contact.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('pages.user.settingsForm.contact.emailLabel')}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => onEmailChange(e.target.value)}
            placeholder={t('pages.user.settingsForm.contact.emailPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">{t('pages.user.settingsForm.contact.twitterLabel')}</Label>
          <Input
            id="twitter"
            value={twitter}
            onChange={e => onTwitterChange(e.target.value)}
            placeholder={t('pages.user.settingsForm.contact.twitterPlaceholder')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">{t('pages.user.settingsForm.contact.websiteLabel')}</Label>
          <Input
            id="website"
            type="text"
            value={website}
            onChange={e => onWebsiteChange(e.target.value)}
            placeholder={t('pages.user.settingsForm.contact.websitePlaceholder')}
          />
          <p className="text-xs text-muted-foreground">
            {t('pages.user.settingsForm.contact.websiteHint')}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">{t('pages.user.settingsForm.contact.locationLabel')}</Label>
          <Input
            id="location"
            value={location}
            onChange={e => onLocationChange(e.target.value)}
            placeholder={t('pages.user.settingsForm.contact.locationPlaceholder')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
