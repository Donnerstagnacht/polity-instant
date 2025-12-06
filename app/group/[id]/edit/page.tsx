'use client';

import { use, useState, useEffect } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import db, { tx } from '../../../../db';
import { syncGroupNameToConversation } from '@/utils/groupConversationSync';

export default function GroupEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user: authUser } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    region: '',
    country: '',
    imageURL: '',
    whatsapp: '',
    instagram: '',
    twitter: '',
    facebook: '',
    snapchat: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Fetch group data
  const { data, isLoading } = db.useQuery({
    groups: {
      $: { where: { id: resolvedParams.id } },
      memberships: {
        $: { where: { role: 'admin' } },
        user: {},
      },
    },
  });

  const group = data?.groups?.[0];

  // Initialize form data when group data loads
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || '',
        description: group.description || '',
        location: group.location || '',
        region: group.region || '',
        country: group.country || '',
        imageURL: group.imageURL || '',
        whatsapp: group.whatsapp || '',
        instagram: group.instagram || '',
        twitter: group.twitter || '',
        facebook: group.facebook || '',
        snapchat: group.snapchat || '',
      });

      // Check if current user is an admin
      const adminMemberships = group.memberships || [];
      const userIsAdmin = adminMemberships.some(
        (m: any) => m.user?.id === authUser?.id && m.role === 'admin'
      );

      setIsAuthorized(userIsAdmin);
    }
  }, [group, authUser?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!group) {
        toast.error('No group data to update');
        return;
      }

      // Check if name changed
      const nameChanged = formData.name !== group.name;

      // Update the group in Instant DB
      await db.transact([
        tx.groups[resolvedParams.id].update({
          name: formData.name,
          description: formData.description,
          location: formData.location,
          region: formData.region,
          country: formData.country,
          imageURL: formData.imageURL,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram,
          twitter: formData.twitter,
          facebook: formData.facebook,
          snapchat: formData.snapchat,
          updatedAt: new Date(),
        }),
      ]);

      // Sync name to group conversation if it changed
      if (nameChanged) {
        await syncGroupNameToConversation(resolvedParams.id, formData.name);
      }

      toast.success('Group updated successfully');

      // Wait a moment for the DB to update, then navigate
      setTimeout(() => {
        router.push(`/group/${resolvedParams.id}`);
      }, 500);
    } catch (error) {
      toast.error('Failed to update group');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading group data...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  // Check if group data exists after loading
  if (!group) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold">Group not found</p>
              <p className="text-muted-foreground">No group data exists for this ID</p>
              <div className="mt-6">
                <Button onClick={() => router.push(`/groups`)} variant="default">
                  Back to Groups
                </Button>
              </div>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  // Check authorization only after we have the data
  if (!isAuthorized) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold text-red-500">Unauthorized</p>
              <p className="text-muted-foreground">You must be a group admin to edit this group</p>
              <Button
                variant="outline"
                onClick={() => router.push(`/group/${resolvedParams.id}`)}
                className="mt-4"
              >
                View Group
              </Button>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper>
        <div className="container mx-auto max-w-4xl p-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Edit Group</h1>
            <p className="text-muted-foreground">Update group information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Image Section */}
            <ImageUpload
              currentImage={formData.imageURL}
              onImageChange={(url: string) => setFormData({ ...formData, imageURL: url })}
              label="Group Image"
              description="Upload a group image or provide a URL"
            />

            {/* Basic Information */}
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
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Group name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the group and its purpose..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
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
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City or specific location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={e => setFormData({ ...formData, region: e.target.value })}
                    placeholder="State, province, or region"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media Links */}
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
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="WhatsApp number or link"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username or user URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={e => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="@username or user URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="User or page URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snapchat">Snapchat</Label>
                  <Input
                    id="snapchat"
                    value={formData.snapchat}
                    onChange={e => setFormData({ ...formData, snapchat: e.target.value })}
                    placeholder="Username"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/group/${resolvedParams.id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
