/**
 * Location Info Section Component
 *
 * Form section for editing group location information.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GroupFormData } from '../hooks/useGroupUpdate';

interface LocationInfoSectionProps {
  formData: GroupFormData;
  onChange: (field: keyof GroupFormData, value: string) => void;
}

export function LocationInfoSection({ formData, onChange }: LocationInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Information</CardTitle>
        <CardDescription>Where is this group based?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={e => onChange('location', e.target.value)}
            placeholder="City or specific location"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            value={formData.region}
            onChange={e => onChange('region', e.target.value)}
            placeholder="State, province, or region"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={e => onChange('country', e.target.value)}
            placeholder="Country"
          />
        </div>
      </CardContent>
    </Card>
  );
}
