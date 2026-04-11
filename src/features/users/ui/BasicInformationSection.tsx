import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface BasicInformationSectionProps {
  firstName: string;
  lastName: string;
  subtitle: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
}

export function BasicInformationSection({
  firstName,
  lastName,
  subtitle,
  onFirstNameChange,
  onLastNameChange,
  onSubtitleChange,
}: BasicInformationSectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pages.user.settingsForm.basicInfo.title')}</CardTitle>
        <CardDescription>{t('pages.user.settingsForm.basicInfo.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('pages.user.settingsForm.basicInfo.firstNameLabel')}</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={e => onFirstNameChange(e.target.value)}
              placeholder={t('pages.user.settingsForm.basicInfo.firstNamePlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('pages.user.settingsForm.basicInfo.lastNameLabel')}</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={e => onLastNameChange(e.target.value)}
              placeholder={t('pages.user.settingsForm.basicInfo.lastNamePlaceholder')}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">{t('pages.user.settingsForm.basicInfo.subtitleLabel')}</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={e => onSubtitleChange(e.target.value)}
            placeholder={t('pages.user.settingsForm.basicInfo.subtitlePlaceholder')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
