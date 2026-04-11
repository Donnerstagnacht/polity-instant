import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { HashtagEditor } from '@/features/shared/ui/ui/hashtag-editor';
import { useTranslation } from '@/features/shared/hooks/use-translation';

interface HashtagsSectionProps {
  hashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
}

export function HashtagsSection({ hashtags, onHashtagsChange }: HashtagsSectionProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pages.user.settingsForm.hashtags.title')}</CardTitle>
        <CardDescription>{t('pages.user.settingsForm.hashtags.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <HashtagEditor
          value={hashtags}
          onChange={onHashtagsChange}
          placeholder={t('pages.user.settingsForm.hashtags.placeholder')}
        />
      </CardContent>
    </Card>
  );
}
