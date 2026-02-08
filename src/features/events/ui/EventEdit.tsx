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
import { Loader2, XCircle } from 'lucide-react';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useEventUpdate } from '../hooks/useEventUpdate';
import { useTranslation } from '@/hooks/use-translation';
import { CancelEventDialog } from './CancelEventDialog';
import { usePermissions } from '@db/rbac';
import { useState } from 'react';

interface EventEditProps {
  eventId: string;
}

export function EventEdit({ eventId }: EventEditProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { can } = usePermissions({ eventId });
  const canDeleteEvent = can('delete', 'events');

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
        <p className="text-muted-foreground">{t('features.events.editPage.loading')}</p>
      </div>
    );
  }

  // Not found state
  if (!event) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold">{t('features.events.editPage.notFound')}</p>
          <p className="text-muted-foreground">
            {t('features.events.editPage.notFoundDescription')}
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push(`/calendar`)} variant="default">
              {t('features.events.backToCalendar')}
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
        <h1 className="text-3xl font-bold">{t('features.events.editPage.title')}</h1>
        <p className="text-muted-foreground">{t('features.events.editPage.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Image Section */}
        <ImageUpload
          currentImage={formData.imageURL}
          onImageChange={(url: string) => updateField('imageURL', url)}
          label={t('features.events.editPage.image.label')}
          description={t('features.events.editPage.image.description')}
        />

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('features.events.editPage.basicInfo.title')}</CardTitle>
            <CardDescription>{t('features.events.editPage.basicInfo.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('features.events.editPage.eventTitle')}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => updateField('title', e.target.value)}
                placeholder={t('features.events.editPage.eventTitlePlaceholder')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('features.events.editPage.eventDescription')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => updateField('description', e.target.value)}
                placeholder={t('features.events.editPage.eventDescriptionPlaceholder')}
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={checked => updateField('isPublic', checked)}
              />
              <Label htmlFor="isPublic">{t('features.events.editPage.publicEvent')}</Label>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('features.events.editPage.dateTime.title')}</CardTitle>
            <CardDescription>{t('features.events.editPage.dateTime.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  {t('features.events.editPage.dateTime.startDate')}
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={e => updateField('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t('features.events.editPage.dateTime.endDate')}</Label>
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
            <CardTitle>{t('features.events.editPage.locationCapacity.title')}</CardTitle>
            <CardDescription>
              {t('features.events.editPage.locationCapacity.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">
                {t('features.events.editPage.locationCapacity.location')}
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={e => updateField('location', e.target.value)}
                placeholder={t('features.events.editPage.locationCapacity.locationPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">
                {t('features.events.editPage.locationCapacity.capacity')}
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={e => updateField('capacity', e.target.value)}
                placeholder={t('features.events.editPage.locationCapacity.capacityPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>{t('features.events.editPage.tags.title')}</CardTitle>
            <CardDescription>{t('features.events.editPage.tags.description')}</CardDescription>
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
                placeholder={t('features.events.editPage.tags.placeholder')}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                {t('features.events.add')}
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
            {t('features.events.cancelLabel')}
          </Button>

          {/* Cancel Event Button - only for users with delete permission */}
          {canDeleteEvent && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setCancelDialogOpen(true)}
              disabled={isSubmitting}
            >
              <XCircle className="mr-2 h-4 w-4" />
              {t('features.events.cancel.cancelEvent', 'Cancel Event')}
            </Button>
          )}

          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('features.events.editPage.saving')}
              </>
            ) : (
              t('features.events.editPage.saveChanges')
            )}
          </Button>
        </div>
      </form>

      {/* Cancel Event Dialog */}
      {canDeleteEvent && (
        <CancelEventDialog
          eventId={eventId}
          open={cancelDialogOpen}
          onOpenChange={setCancelDialogOpen}
        />
      )}
    </div>
  );
}
