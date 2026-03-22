import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

export function useAccreditationState(options: {
  eventId?: string
  agendaItemId?: string
  userId?: string
} = {}) {
  const { eventId, agendaItemId, userId } = options

  const [accreditationsByEvent, accreditationsByEventResult] = useQuery(
    eventId ? queries.accreditation.accreditationsByEvent({ event_id: eventId }) : undefined
  )

  const [userAccreditation, userAccreditationResult] = useQuery(
    eventId && userId
      ? queries.accreditation.userAccreditation({ event_id: eventId, user_id: userId })
      : undefined
  )

  const [accreditationsByAgendaItem, accreditationsByAgendaItemResult] = useQuery(
    agendaItemId
      ? queries.accreditation.accreditationsByAgendaItem({ agenda_item_id: agendaItemId })
      : undefined
  )

  const isAccredited = useMemo(() => !!userAccreditation, [userAccreditation])
  const accreditedCount = useMemo(
    () => accreditationsByEvent?.length ?? 0,
    [accreditationsByEvent]
  )

  const isLoading = useMemo(() =>
    (eventId ? accreditationsByEventResult.type === 'unknown' : false) ||
    (eventId && userId ? userAccreditationResult.type === 'unknown' : false) ||
    (agendaItemId ? accreditationsByAgendaItemResult.type === 'unknown' : false),
    [eventId, userId, agendaItemId, accreditationsByEventResult.type, userAccreditationResult.type, accreditationsByAgendaItemResult.type]
  )

  return {
    accreditationsByEvent: accreditationsByEvent ?? [],
    accreditationsByAgendaItem: accreditationsByAgendaItem ?? [],
    userAccreditation: userAccreditation ?? null,
    isAccredited,
    accreditedCount,
    isLoading,
  }
}
