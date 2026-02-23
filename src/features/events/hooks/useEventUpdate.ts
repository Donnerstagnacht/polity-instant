import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useEventData } from './useEventData';
import { useEventMutations } from './useEventMutations';
import { useCommonState, useCommonActions } from '@/zero/common';

export interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: string;
  imageURL: string;
  isPublic: boolean;
  tags: string[];
}

/**
 * Hook for event update functionality
 */
export function useEventUpdate(eventId: string) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    capacity: '',
    imageURL: '',
    isPublic: true,
    tags: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { event, isLoading } = useEventData(eventId);
  const { updateEvent } = useEventMutations(eventId);
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
      // Format dates for datetime-local input
      const formatDateForInput = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
      };

      setFormData({
        title: event.title || '',
        description: event.description || '',
        location: event.location_name || '',
        startDate: formatDateForInput(event.start_date),
        endDate: formatDateForInput(event.end_date),
        capacity: event.capacity?.toString() || '',
        imageURL: event.image_url || '',
        isPublic: event.is_public ?? true,
        tags: [],
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
      if (!event) {
        toast.error('No event data to update');
        return;
      }

      const updateData: any = {
        title: formData.title,
        description: formData.description,
        location_name: formData.location,
        start_date: new Date(formData.startDate).getTime(),
        is_public: formData.isPublic,
        image_url: formData.imageURL || null,
      };

      if (formData.endDate) {
        updateData.end_date = new Date(formData.endDate).getTime();
      }

      if (formData.capacity) {
        updateData.capacity = parseInt(formData.capacity, 10);
      }

      await updateEvent(updateData);

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
      console.error('Update error:', error);
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
  };
}
