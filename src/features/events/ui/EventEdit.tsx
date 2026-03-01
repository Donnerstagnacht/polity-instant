/**
 * Event Edit Component
 *
 * Complete event editing UI with authorization checks,
 * loading states, and form management.
 */

import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Textarea } from '@/features/shared/ui/ui/textarea';
import { Switch } from '@/features/shared/ui/ui/switch';
import { Loader2, XCircle } from 'lucide-react';
import { ImageUpload } from '@/features/file-upload/ui/ImageUpload.tsx';
import { HashtagEditor } from '@/features/shared/ui/ui/hashtag-editor';
import { Badge } from '@/features/shared/ui/ui/badge';
import { useEventUpdate } from '../hooks/useEventUpdate';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { CancelEventDialog } from './CancelEventDialog';
import { usePermissions } from '@/zero/rbac';
import { useState, useRef } from 'react';
import { CreateReviewCard, SummaryField } from '@/features/shared/ui/ui/create-review-card';

interface EventEditProps {
  eventId: string;
  mode?: 'create' | 'edit';
}

export function EventEdit({ eventId, mode = 'edit' }: EventEditProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { can } = usePermissions({ eventId });
  const canDeleteEvent = mode === 'edit' && can('delete', 'events');

  const {
    formData,
    setFormData,
    updateField,
    handleSubmit,
    isSubmitting,
    event,
    isLoading,
    isCreating,
  } = useEventUpdate(eventId, mode);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('features.events.editPage.loading')}</p>
      </div>
    );
  }

  // Not found state (only in edit mode)
  if (!isCreating && !event) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold">{t('features.events.editPage.notFound')}</p>
          <p className="text-muted-foreground">
            {t('features.events.editPage.notFoundDescription')}
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate({ to: `/calendar` })} variant="default">
              {t('features.events.backToCalendar')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main edit form
  const onFormSubmit = (e: React.FormEvent) => {
    if (isCreating && !showReview) {
      e.preventDefault();
      setShowReview(true);
      return;
    }
    handleSubmit(e);
  };

  const confirmCreate = () => {
    // Trigger the real submit by dispatching a submit event on the form
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  if (isCreating && showReview) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('pages.create.common.review')}</h1>
        </div>
        <div className="max-w-2xl">
          <CreateReviewCard
            badge={t('pages.create.event.reviewBadge')}
            secondaryBadge={formData.isPublic ? t('pages.create.common.public') : t('pages.create.common.private')}
            title={formData.title || 'Untitled Event'}
            subtitle={formData.description || undefined}
            hashtags={formData.tags}
            gradient="from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/50"
          >
            {formData.startDate && <SummaryField label={t('features.events.editPage.dateTime.startDate')} value={formData.startDate} />}
            {formData.endDate && <SummaryField label={t('features.events.editPage.dateTime.endDate')} value={formData.endDate} />}
            {formData.location && <SummaryField label={t('features.events.editPage.locationCapacity.location')} value={formData.location} />}
            {formData.capacity && <SummaryField label={t('features.events.editPage.locationCapacity.capacity')} value={formData.capacity} />}
          </CreateReviewCard>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setShowReview(false)}>
              {t('pages.create.previous')}
            </Button>
            <Button onClick={confirmCreate} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('pages.create.common.creating')}
                </>
              ) : (
                t('pages.create.event.createButton')
              )}
            </Button>
          </div>
        </div>
        {/* Hidden form to allow real submission */}
        <form ref={formRef} onSubmit={handleSubmit} className="hidden" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isCreating ? t('pages.create.event.title') : t('features.events.editPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {isCreating ? t('pages.create.event.description') : t('features.events.editPage.subtitle')}
        </p>
      </div>

      <form ref={formRef} onSubmit={onFormSubmit} className="space-y-6">
        {/* Event Image Section */}
        <ImageUpload
          currentImage={formData.imageURL}
          onImageChange={(url: string) => updateField('imageURL', url)}
          entityType="events"
          entityId={eventId}
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
            {!isCreating && event?.event_type && event.event_type !== 'other' && (
              <div className="space-y-2">
                <Label>{t('pages.create.event.eventType')}</Label>
                <div>
                  <Badge variant="outline">
                    {t(`pages.create.event.eventTypes.${event.event_type === 'delegate_conference' ? 'delegateConference' : event.event_type === 'general_assembly' ? 'generalAssembly' : 'openAssembly'}`)}
                  </Badge>
                </div>
              </div>
            )}
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
          <CardContent>
            <HashtagEditor
              value={formData.tags}
              onChange={(tags) => setFormData({ ...formData, tags })}
              placeholder={t('features.events.editPage.tags.placeholder')}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: isCreating ? '/create' : `/event/${eventId}` })}
            disabled={isSubmitting}
          >
            {t('features.events.cancelLabel')}
          </Button>

          {/* Cancel Event Button - only for users with delete permission in edit mode */}
          {!isCreating && canDeleteEvent && (
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
                {isCreating ? t('pages.create.common.creating') : t('features.events.editPage.saving')}
              </>
            ) : (
              isCreating ? t('pages.create.next') : t('features.events.editPage.saveChanges')
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
