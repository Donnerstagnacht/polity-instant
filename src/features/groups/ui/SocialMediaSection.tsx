/**
 * Social Media Section Component
 *
 * Form section for editing group social media links.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GroupFormData } from '../hooks/useGroupUpdate';

interface SocialMediaSectionProps {
  formData: GroupFormData;
  onChange: (field: keyof GroupFormData, value: string) => void;
}

export function SocialMediaSection({ formData, onChange }: SocialMediaSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media</CardTitle>
        <CardDescription>Connect your group's social media accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={e => onChange('whatsapp', e.target.value)}
            placeholder="WhatsApp number or link"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={formData.instagram}
            onChange={e => onChange('instagram', e.target.value)}
            placeholder="@username or user URL"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter/X</Label>
          <Input
            id="twitter"
            value={formData.twitter}
            onChange={e => onChange('twitter', e.target.value)}
            placeholder="@username or user URL"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            value={formData.facebook}
            onChange={e => onChange('facebook', e.target.value)}
            placeholder="User or page URL"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="snapchat">Snapchat</Label>
          <Input
            id="snapchat"
            value={formData.snapchat}
            onChange={e => onChange('snapchat', e.target.value)}
            placeholder="Username"
          />
        </div>
      </CardContent>
    </Card>
  );
}
