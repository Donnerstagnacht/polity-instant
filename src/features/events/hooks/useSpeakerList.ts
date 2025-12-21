import { useState } from 'react';
import { db, id, tx } from '../../../../db/db';

export function useSpeakerList(agendaItemId?: string) {
  const { user } = db.useAuth();
  const [addingSpeaker, setAddingSpeaker] = useState(false);
  const [removingSpeaker, setRemovingSpeaker] = useState<string | null>(null);

  const handleAddToSpeakerList = async (speakerList: any[] = []) => {
    if (!user?.id || !agendaItemId) return;

    setAddingSpeaker(true);
    try {
      const maxOrder =
        speakerList.length > 0 ? Math.max(...speakerList.map((s: any) => s.order || 0)) : 0;

      const speakerId = id();
      await db.transact([
        tx.speakerList[speakerId].update({
          title: 'Speaker',
          time: 3,
          completed: false,
          order: maxOrder + 1,
          createdAt: new Date(),
        }),
        tx.speakerList[speakerId].link({
          user: user.id,
          agendaItem: agendaItemId,
        }),
      ]);
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
      await db.transact([tx.speakerList[speakerId].delete()]);
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
