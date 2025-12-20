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
import { Switch } from '@/components/ui/switch';
import db from '../../../../db/db';
import { useEventData } from '@/features/events/hooks/useEventData';
import { useEventMutations } from '@/features/events/hooks/useEventMutations';

export default function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user: authUser } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    capacity: '',
    imageURL: '',
    isPublic: true,
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Fetch event data using hook
  const { event, isLoading } = useEventData(resolvedParams.id);
  
  // Initialize mutations hook
  const { updateEvent } = useEventMutations(resolvedParams.id);

  // Initialize form data when event data loads
  useEffect(() => {
    if (event) {
      // Format dates for datetime-local input
      const formatDateForInput = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
      };

      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        startDate: formatDateForInput(event.startDate),
        endDate: formatDateForInput(event.endDate),
        capacity: event.capacity?.toString() || '',
        imageURL: event.imageURL || '',
        isPublic: event.isPublic ?? true,
        tags: Array.isArray(event.tags) ? event.tags : [],
      });

      // Check if current user is an admin or the organizer
      const adminParticipants = event.participants?.filter((p: any) => p.status === 'admin') || [];
      const userIsAdmin = adminParticipants.some(
        (p: any) => p.user?.id === authUser?.id
      );
      const userIsOrganizer = event.organizer?.id === authUser?.id;

      setIsAuthorized(userIsAdmin || userIsOrganizer);
    }
  }, [event, authUser?.id]);

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
      if (!event) {
        toast.error('No event data to update');
        return;
      }

      // Prepare update data
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: new Date(formData.startDate),
        imageURL: formData.imageURL,
        isPublic: formData.isPublic,
        tags: formData.tags,
      };

      // Add endDate if provided
      if (formData.endDate) {
        updateData.endDate = new Date(formData.endDate);
      }

      // Add capacity if provided
      if (formData.capacity) {
        updateData.capacity = parseInt(formData.capacity, 10);
      }

      // Update the event using hook
      await updateEvent(updateData);

      // Wait a moment for the DB to update, then navigate
      setTimeout(() => {
        router.push(`/event/${resolvedParams.id}`);
      }, 500);
    } catch (error) {
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
            <p className="text-muted-foreground">Loading event data...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  // Check if event data exists after loading
  if (!event) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-lg font-semibold">Event not found</p>
              <p className="text-muted-foreground">No event data exists for this ID</p>
              <div className="mt-6">
                <Button onClick={() => router.push(`/calendar`)} variant="default">
                  Back to Calendar
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
                You must be an event admin or organizer to edit this event
              </p>
              <Button
                variant="outline"
                onClick={() => router.push(`/event/${resolvedParams.id}`)}
                className="mt-4"
              >
                View Event
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
            <h1 className="text-3xl font-bold">Edit Event</h1>
            <p className="text-muted-foreground">Update event information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Image Section */}
            <ImageUpload
              currentImage={formData.imageURL}
              onImageChange={(url: string) => setFormData({ ...formData, imageURL: url })}
              label="Event Image"
              description="Upload an event image or provide a URL"
            />

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Public event information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Event title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the event and its purpose..."
                    rows={6}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={checked => setFormData({ ...formData, isPublic: checked })}
                  />
                  <Label htmlFor="isPublic">Public Event</Label>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time Information */}
            <Card>
              <CardHeader>
                <CardTitle>Date & Time</CardTitle>
                <CardDescription>When is this event happening?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Capacity */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Capacity</CardTitle>
                <CardDescription>Where is this event and how many can attend?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Event location or venue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (optional)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="Maximum number of participants"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to categorize this event</CardDescription>
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
                onClick={() => router.push(`/event/${resolvedParams.id}`)}
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
