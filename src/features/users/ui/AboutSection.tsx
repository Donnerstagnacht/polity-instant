import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import { Label } from '@/features/shared/ui/ui/label';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface AboutSectionProps {
  about: string;
  onAboutChange: (value: string) => void;
}

export function AboutSection({ about, onAboutChange }: AboutSectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pages.user.settingsForm.about.title')}</CardTitle>
        <CardDescription>{t('pages.user.settingsForm.about.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="about">{t('pages.user.settingsForm.about.bioLabel')}</Label>
          <Textarea
            id="about"
            value={about}
            onChange={e => onAboutChange(e.target.value)}
            placeholder={t('pages.user.settingsForm.about.bioPlaceholder')}
            rows={6}
          />
        </div>
      </CardContent>
    </Card>
  );
}
