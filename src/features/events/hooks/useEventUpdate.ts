import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useEventData } from './useEventData';
import { useEventMutations } from './useEventMutations';
import { useEventActions } from '@/zero/events/useEventActions';
import { useCommonState, useCommonActions } from '@/zero/common';
import { useAuth } from '@/providers/auth-provider';
import { type Visibility } from '@/features/auth/logic/checkEntityAccess';

export interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  capacity: string;
  groupId: string;
  imageURL: string;
  visibility: Visibility;
  tags: string[];
  registrationDeadline: string;
  amendmentDeadline: string;
  candidacyDeadline: string;
}

/**
 * Hook for event create/update functionality
 */
export function useEventUpdate(eventId: string, mode: 'create' | 'edit' = 'edit') {
  const navigate = useNavigate();
  const isCreating = mode === 'create';
  const { user } = useAuth();

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    capacity: '',
    groupId: '',
    imageURL: '',
    visibility: 'public' as Visibility,
    tags: [],
    registrationDeadline: '',
    amendmentDeadline: '',
    candidacyDeadline: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Always call the hook but pass undefined in create mode so no query fires
  const { event, isLoading: editLoading } = useEventData(isCreating ? undefined : eventId);
  const isLoading = isCreating ? false : editLoading;
  const { updateEvent } = useEventMutations(eventId);
  const { createEvent } = useEventActions();
  const commonActions = useCommonActions();
  const { eventHashtags, allHashtags } = useCommonState({
    event_id: eventId,
    loadAllHashtags: true,
  });

  const initializedRef = useRef(false);
  const hashtagsInitializedRef = useRef(false);

  // Initialize hashtags from junction data once available
  useEffect(() => {
    if (eventHashtags && eventHashtags.length > 0 && !hashtagsInitializedRef.current) {
      hashtagsInitializedRef.current = true;
      const tags = eventHashtags.map(j => j.hashtag?.tag).filter((t): t is string => !!t);
      setFormData(prev => ({ ...prev, tags }));
    }
  }, [eventHashtags]);

  // Initialize form data only once when event first loads
  useEffect(() => {
    if (event && !initializedRef.current) {
      initializedRef.current = true;
      // Format dates into separate date and time parts
      const formatDatePart = (date: string | number | null | undefined) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 10); // YYYY-MM-DD
      };
      const formatTimePart = (date: string | number | null | undefined) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(11, 16); // HH:mm
      };

      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location_name || '',
        startDate: formatDatePart(event.start_date),
        startTime: formatTimePart(event.start_date),
        endDate: formatDatePart(event.end_date),
        endTime: formatTimePart(event.end_date),
        capacity: event.capacity?.toString() || '',
        groupId: event.group_id || '',
        imageURL: event.image_url || '',
        visibility: (event.visibility as Visibility) ?? 'public',
        tags: [],
        registrationDeadline: event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : '',
        amendmentDeadline: event.amendment_deadline ? new Date(event.amendment_deadline).toISOString().slice(0, 16) : '',
        candidacyDeadline: event.candidacy_deadline ? new Date(event.candidacy_deadline).toISOString().slice(0, 16) : '',
      });
    }
  }, [event]);

  // Update a single field
  const updateField = <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isCreating) {
        if (!user?.id) {
          toast.error('You must be logged in to create an event');
          return;
        }

        const createData = {
          id: eventId,
          title: formData.title,
          description: formData.description || null,
          location_name: formData.location || null,
          start_date: formData.startDate ? new Date(`${formData.startDate}T${formData.startTime || '00:00'}`).getTime() : null,
          end_date: formData.endDate ? new Date(`${formData.endDate}T${formData.endTime || '00:00'}`).getTime() : null,
          visibility: formData.visibility,
          image_url: formData.imageURL || null,
          capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
          group_id: formData.groupId || null,
          creator_id: user.id,
        };

        await createEvent(createData);
      } else {
        if (!event) {
          toast.error('No event data to update');
          return;
        }

        const updateData = {
          id: eventId,
          title: formData.title,
          description: formData.description,
          location_name: formData.location,
          start_date: formData.startDate ? new Date(`${formData.startDate}T${formData.startTime || '00:00'}`).getTime() : undefined,
          end_date: formData.endDate ? new Date(`${formData.endDate}T${formData.endTime || '00:00'}`).getTime() : undefined,
          visibility: formData.visibility,
          image_url: formData.imageURL || null,
          capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
          group_id: formData.groupId || null,
          registration_deadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).getTime() : undefined,
          amendment_deadline: formData.amendmentDeadline ? new Date(formData.amendmentDeadline).getTime() : undefined,
          candidacy_deadline: formData.candidacyDeadline ? new Date(formData.candidacyDeadline).getTime() : undefined,
        };

        await updateEvent(updateData);
      }

      // Sync hashtags via junction tables
      await commonActions.syncEntityHashtags(
        'event',
        eventId,
        formData.tags,
        eventHashtags ?? [],
        allHashtags ?? []
      );

      navigate({ to: `/event/${eventId}` });
    } catch (error) {
      console.error(isCreating ? 'Create error:' : 'Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    updateField,
    handleSubmit,
    isSubmitting,
    event,
    isLoading,
    isCreating,
  };
}
