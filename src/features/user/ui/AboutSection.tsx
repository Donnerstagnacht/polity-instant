import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AboutSectionProps {
  about: string;
  onAboutChange: (value: string) => void;
}

export function AboutSection({ about, onAboutChange }: AboutSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
        <CardDescription>Tell others about yourself</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="about">Bio</Label>
          <Textarea
            id="about"
            value={about}
            onChange={e => onAboutChange(e.target.value)}
            placeholder="Write a brief description about yourself..."
            rows={6}
          />
        </div>
      </CardContent>
    </Card>
  );
}
