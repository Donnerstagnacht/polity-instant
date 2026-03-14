import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';

export function useSpeakerList(agendaItemId?: string) {
  const { user } = useAuth();
  const { addSpeaker, removeSpeaker } = useAgendaActions();
  const [addingSpeaker, setAddingSpeaker] = useState(false);
  const [removingSpeaker, setRemovingSpeaker] = useState<string | null>(null);

  const handleAddToSpeakerList = async (speakerList: { order?: number }[] = []) => {
    if (!user?.id || !agendaItemId) return;

    setAddingSpeaker(true);
    try {
      const maxOrder =
        speakerList.length > 0 ? Math.max(...speakerList.map((s) => s.order || 0)) : 0;

      const speakerId = crypto.randomUUID();
      await addSpeaker({
        id: speakerId,
        title: 'Speaker',
        time: 3,
        completed: false,
        order_index: maxOrder + 1,
        user_id: user.id,
        agenda_item_id: agendaItemId,
      });
    } catch (error) {
      console.error('Error adding to speaker list:', error);
      throw error;
    } finally {
      setAddingSpeaker(false);
    }
  };

  const handleRemoveFromSpeakerList = async (speakerId: string) => {
    if (!user?.id) return;

    setRemovingSpeaker(speakerId);
    try {
      await removeSpeaker(speakerId);
    } catch (error) {
      console.error('Error removing from speaker list:', error);
      throw error;
    } finally {
      setRemovingSpeaker(null);
    }
  };

  return {
    handleAddToSpeakerList,
    handleRemoveFromSpeakerList,
    addingSpeaker,
    removingSpeaker,
  };
}
