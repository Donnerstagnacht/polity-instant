/**
 * Event Edit Component
 *
 * Complete event editing UI with authorization checks,
 * loading states, and form management.
 */

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEventUpdate } from '../hooks/useEventUpdate';

interface EventEditProps {
  eventId: string;
}

export function EventEdit({ eventId }: EventEditProps) {
  const router = useRouter();
  const {
    formData,
    tagInput,
    setTagInput,
    updateField,
    handleAddTag,
    handleRemoveTag,
    handleSubmit,
    isSubmitting,
    event,
    isLoading,
  } = useEventUpdate(eventId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading event data...</p>
      </div>
    );
  }

  // Not found state
  if (!event) {
    return (
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
    );
  }

  // Main edit form
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground">Update event information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Image Section */}
        <ImageUpload
          currentImage={formData.imageURL}
          onImageChange={(url: string) => updateField('imageURL', url)}
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
                onChange={e => updateField('title', e.target.value)}
                placeholder="Event title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
                placeholder="Describe the event and its purpose..."
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={checked => updateField('isPublic', checked)}
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
                  onChange={e => updateField('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={e => updateField('endDate', e.target.value)}
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
                onChange={e => updateField('location', e.target.value)}
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
                onChange={e => updateField('capacity', e.target.value)}
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
            onClick={() => router.push(`/event/${eventId}`)}
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
  );
}
