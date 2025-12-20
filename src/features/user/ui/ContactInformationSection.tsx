import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>How people can reach you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => onEmailChange(e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter/X</Label>
          <Input
            id="twitter"
            value={twitter}
            onChange={e => onTwitterChange(e.target.value)}
            placeholder="@yourusername"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="text"
            value={website}
            onChange={e => onWebsiteChange(e.target.value)}
            placeholder="https://yourwebsite.com"
          />
          <p className="text-xs text-muted-foreground">
            Enter a valid URL (e.g., https://example.com)
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={e => onLocationChange(e.target.value)}
            placeholder="City, Country"
          />
        </div>
      </CardContent>
    </Card>
  );
}
