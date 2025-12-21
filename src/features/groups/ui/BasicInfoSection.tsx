/**
 * Basic Info Section Component
 *
 * Form section for editing basic group information (name and description).
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { GroupFormData } from '../hooks/useGroupUpdate';

interface BasicInfoSectionProps {
  formData: GroupFormData;
  onChange: (field: keyof GroupFormData, value: string) => void;
}

export function BasicInfoSection({ formData, onChange }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Public group information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Group Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => onChange('name', e.target.value)}
            placeholder="Group name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => onChange('description', e.target.value)}
            placeholder="Describe the group and its purpose..."
            rows={6}
          />
        </div>
      </CardContent>
    </Card>
  );
}
