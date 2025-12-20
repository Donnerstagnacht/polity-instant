import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BasicInformationSectionProps {
  name: string;
  subtitle: string;
  onNameChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
}

export function BasicInformationSection({
  name,
  subtitle,
  onNameChange,
  onSubtitleChange,
}: BasicInformationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Your public user information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={e => onSubtitleChange(e.target.value)}
            placeholder="e.g., Constitutional Law Expert"
          />
        </div>
      </CardContent>
    </Card>
  );
}
