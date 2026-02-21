import { useAgendaItemDetail as useFacadeAgendaItemDetail } from '@/zero/events/useEventState';

export function useAgendaItemDetail(agendaItemId: string) {
  return useFacadeAgendaItemDetail(agendaItemId);
}
