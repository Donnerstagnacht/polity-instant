import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Your public user information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={e => onFirstNameChange(e.target.value)}
              placeholder="First name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={e => onLastNameChange(e.target.value)}
              placeholder="Last name"
            />
          </div>
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
