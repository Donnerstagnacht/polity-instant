import { useMemo } from 'react';
import { useAgendaState } from '@/zero/agendas/useAgendaState';
import { useAgendaItemsByEvent } from '@/zero/events/useEventState';

export function useAgendaItems(eventId: string) {
  const { agendaItems: agendaItemsWithRelations, isLoading: isRelationsLoading } =
    useAgendaItemsByEvent(eventId);
  const { agendaItems: agendaItemsWithCalculatedTimes, isLoading: isCalculatedTimesLoading } =
    useAgendaState({ eventId });

  const calculatedTimesByAgendaItemId = useMemo(
    () =>
      new Map(
        agendaItemsWithCalculatedTimes.map(agendaItem => [
          agendaItem.id,
          {
            calculated_start_time: agendaItem.calculated_start_time,
            calculated_end_time: agendaItem.calculated_end_time,
          },
        ])
      ),
    [agendaItemsWithCalculatedTimes]
  );

  const agendaItems = useMemo(
    () =>
      agendaItemsWithRelations.map(agendaItem => {
        const calculatedTimes = calculatedTimesByAgendaItemId.get(agendaItem.id);

        return {
          ...agendaItem,
          calculated_start_time: calculatedTimes?.calculated_start_time,
          calculated_end_time: calculatedTimes?.calculated_end_time,
        };
      }),
    [agendaItemsWithRelations, calculatedTimesByAgendaItemId]
  );

  return {
    agendaItems,
    isLoading: isRelationsLoading || isCalculatedTimesLoading,
    error: undefined,
  };
}
