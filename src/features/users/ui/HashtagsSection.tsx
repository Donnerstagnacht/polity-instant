import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HashtagEditor } from '@/components/ui/hashtag-editor';

interface HashtagsSectionProps {
  hashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
}

export function HashtagsSection({ hashtags, onHashtagsChange }: HashtagsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hashtags</CardTitle>
        <CardDescription>Add hashtags to help others find you</CardDescription>
      </CardHeader>
      <CardContent>
        <HashtagEditor
          value={hashtags}
          onChange={onHashtagsChange}
          placeholder="Add hashtags (e.g., developer, activist)"
        />
      </CardContent>
    </Card>
  );
}
