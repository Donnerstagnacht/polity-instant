import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEventData } from './useEventData';
import { useEventMutations } from './useEventMutations';

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
  const router = useRouter();

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

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { event, isLoading } = useEventData(eventId);
  const { updateEvent } = useEventMutations(eventId);

  // Initialize form data when event loads
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
    }
  }, [event]);

  // Update a single field
  const updateField = <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Tag management
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
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
        location: formData.location,
        startDate: new Date(formData.startDate),
        imageURL: formData.imageURL,
        isPublic: formData.isPublic,
        tags: formData.tags,
      };

      if (formData.endDate) {
        updateData.endDate = new Date(formData.endDate);
      }

      if (formData.capacity) {
        updateData.capacity = parseInt(formData.capacity, 10);
      }

      await updateEvent(updateData);

      setTimeout(() => {
        router.push(`/event/${eventId}`);
      }, 500);
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
}
