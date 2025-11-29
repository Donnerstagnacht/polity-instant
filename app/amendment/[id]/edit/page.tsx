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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import db, { tx } from '../../../../db';

export default function AmendmentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user: authUser } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    code: '',
    imageURL: '',
    status: 'Drafting',
    date: '',
    supporters: 0,
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Fetch amendment data
  const { data, isLoading } = db.useQuery({
    amendments: {
      $: { where: { id: resolvedParams.id } },
      amendmentRoleCollaborators: {
        $: { where: { status: 'admin' } },
        user: {},
      },
    },
  });

  const amendment = data?.amendments?.[0];

  // Initialize form data when amendment data loads
  useEffect(() => {
    if (amendment) {
      setFormData({
        title: amendment.title || '',
        subtitle: amendment.subtitle || '',
        code: amendment.code || '',
        imageURL: amendment.imageURL || '',
        status: amendment.status || 'Drafting',
        date: amendment.date || new Date().toLocaleDateString(),
        supporters: amendment.supporters || 0,
        tags: Array.isArray(amendment.tags) ? amendment.tags : [],
      });

      // Check if current user is an admin collaborator
      const adminCollaborators = amendment.amendmentRoleCollaborators || [];
      const userIsAdmin = adminCollaborators.some(
        (c: any) => c.user?.id === authUser?.id && c.status === 'admin'
      );

      setIsAuthorized(userIsAdmin);
    }
  }, [amendment, authUser?.id]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!amendment) {
        toast.error('No amendment data to update');
        return;
      }

      // Update the amendment in Instant DB
      await db.transact([
        tx.amendments[resolvedParams.id].update({
          title: formData.title,
          subtitle: formData.subtitle,
          code: formData.code,
          imageURL: formData.imageURL,
          status: formData.status,
          date: formData.date,
          supporters: formData.supporters,
          tags: formData.tags,
        }),
      ]);

      toast.success('Amendment updated successfully');

      // Wait a moment for the DB to update, then navigate
      setTimeout(() => {
        router.push(`/amendment/${resolvedParams.id}`);
      }, 500);
    } catch (error) {
      toast.error('Failed to update amendment');
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
            <p className="text-muted-foreground">Loading amendment data...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  // Check if amendment data exists after loading
  if (!amendment) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold">Amendment not found</p>
              <p className="text-muted-foreground">No amendment data exists for this ID</p>
              <div className="mt-6">
                <Button onClick={() => router.push(`/`)} variant="default">
                  Back to Home
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
              <p className="text-muted-foreground">
                You must be an amendment admin or author to edit this amendment
              </p>
              <Button
                variant="outline"
                onClick={() => router.push(`/amendment/${resolvedParams.id}`)}
                className="mt-4"
              >
                View Amendment
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
            <h1 className="text-3xl font-bold">Edit Amendment</h1>
            <p className="text-muted-foreground">Update amendment information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amendment Image Section */}
            <ImageUpload
              currentImage={formData.imageURL}
              onImageChange={(url: string) => setFormData({ ...formData, imageURL: url })}
              label="Amendment Image"
              description="Upload an amendment image or provide a URL"
            />

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Amendment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Amendment title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Amendment Code/Text</Label>
                  <Textarea
                    id="code"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Enter the full amendment text..."
                    rows={10}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status & Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Metadata</CardTitle>
                <CardDescription>Track the amendment progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Drafting">Drafting</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Passed">Passed</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g., March 15, 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supporters">Supporters</Label>
                  <Input
                    id="supporters"
                    type="number"
                    min="0"
                    value={formData.supporters}
                    onChange={e =>
                      setFormData({ ...formData, supporters: parseInt(e.target.value, 10) || 0 })
                    }
                    placeholder="Number of supporters"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to categorize this amendment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1 text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/amendment/${resolvedParams.id}`)}
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
