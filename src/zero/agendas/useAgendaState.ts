import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

/**
 * Reactive state hook for agenda data.
 * Returns all query-derived state — no mutations.
 *
 * Options:
 * - eventId: single event agenda items (ordered by order_index)
 * - eventIds: multiple events agenda items with event/election/amendment relations
 * - includeElectionsWithDetails: all elections with candidates/votes/agenda_item/position
 * - includeElectionsForSearch: elections with position(+group)/candidates/agenda_item(+event)
 */
export function useAgendaState(options: {
  eventId?: string
  eventIds?: string[]
  includeElectionsWithDetails?: boolean
  includeElectionsForSearch?: boolean
  includePendingElections?: boolean
} = {}) {
  const { eventId, eventIds, includeElectionsWithDetails, includeElectionsForSearch, includePendingElections } = options

  // ── Single-event agenda items ──────────────────────────────────────
  const [singleEventItems, singleEventResult] = useQuery(
    eventId ? queries.agendas.byEvent({ event_id: eventId }) : undefined
  )

  // ── Multi-event agenda items with relations ────────────────────────
  const [multiEventItems, multiEventResult] = useQuery(
    eventIds && eventIds.length > 0
      ? queries.agendas.byEventIds({ event_ids: eventIds })
      : undefined
  )

  // ── Elections with full details (opt-in) ───────────────────────────
  const [electionsDetailed, electionsDetailedResult] = useQuery(
    includeElectionsWithDetails
      ? queries.agendas.electionsWithDetails({})
      : undefined
  )

  // ── Elections for search (opt-in) ──────────────────────────────────
  const [electionsSearch, electionsSearchResult] = useQuery(
    includeElectionsForSearch
      ? queries.agendas.electionsForSearch({})
      : undefined
  )

  // ── Pending elections (opt-in) ─────────────────────────────────────
  const [pendingElections, pendingElectionsResult] = useQuery(
    includePendingElections
      ? queries.agendas.pendingElections({})
      : undefined
  )

  const agendaItems = useMemo(
    () => (eventId ? singleEventItems : multiEventItems) ?? [],
    [eventId, singleEventItems, multiEventItems]
  )

  const isLoading =
    (eventId ? singleEventResult.type === 'unknown' : false) ||
    (eventIds && eventIds.length > 0 ? multiEventResult.type === 'unknown' : false) ||
    (includeElectionsWithDetails ? electionsDetailedResult.type === 'unknown' : false) ||
    (includeElectionsForSearch ? electionsSearchResult.type === 'unknown' : false) ||
    (includePendingElections ? pendingElectionsResult.type === 'unknown' : false)

  return {
    agendaItems,
    electionsWithDetails: electionsDetailed ?? [],
    electionsForSearch: electionsSearch ?? [],
    pendingElections: pendingElections ?? [],
    isLoading,
  }
}
