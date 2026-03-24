import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'
import type { AgendaItemByEventIdsRow, AgendaItemByEventRow, ChangeRequestTimelineRow } from './queries'

const DEFAULT_AGENDA_DURATION_MINUTES = 30

type AgendaStateBaseItem = AgendaItemByEventRow | AgendaItemByEventIdsRow

export type AgendaStateItem = AgendaStateBaseItem & {
  calculated_start_time?: number
  calculated_end_time?: number
}

function getAgendaDurationMinutes(item: { duration?: number | null }) {
  return typeof item.duration === 'number' && item.duration > 0
    ? item.duration
    : DEFAULT_AGENDA_DURATION_MINUTES
}

function withCalculatedAgendaTimes<T extends AgendaStateBaseItem>(items: T[]): Array<T & {
  calculated_start_time?: number
  calculated_end_time?: number
}> {
  const timingByAgendaItemId = new Map<string, { start: number; end: number }>()
  const agendaItemsByEventId = new Map<string, T[]>()

  for (const item of items) {
    if (!item.event_id) {
      continue
    }

    const existingItems = agendaItemsByEventId.get(item.event_id) ?? []
    existingItems.push(item)
    agendaItemsByEventId.set(item.event_id, existingItems)
  }

  for (const eventItems of agendaItemsByEventId.values()) {
    const sortedEventItems = [...eventItems].sort(
      (left, right) => (left.order_index ?? 0) - (right.order_index ?? 0)
    )

    const eventStartTime = sortedEventItems[0]?.event?.start_date
    if (typeof eventStartTime !== 'number') {
      continue
    }

    let currentStartTime = eventStartTime
    for (const item of sortedEventItems) {
      const durationMinutes = getAgendaDurationMinutes(item)
      const calculatedEndTime = currentStartTime + durationMinutes * 60_000

      timingByAgendaItemId.set(item.id, {
        start: currentStartTime,
        end: calculatedEndTime,
      })

      currentStartTime = calculatedEndTime
    }
  }

  return items.map(item => {
    const timing = timingByAgendaItemId.get(item.id)
    return {
      ...item,
      calculated_start_time: timing?.start,
      calculated_end_time: timing?.end,
    }
  })
}

/**
 * Reactive state hook for agenda data.
 * Returns all query-derived state — no mutations.
 *
 * Options:
 * - eventId: single event agenda items (ordered by order_index)
 * - eventIds: multiple events agenda items with event/election/amendment relations
 */
export function useAgendaState(options: {
  eventId?: string
  eventIds?: string[]
} = {}) {
  const { eventId, eventIds } = options

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

  const agendaItems = useMemo(
    () => withCalculatedAgendaTimes((eventId ? singleEventItems : multiEventItems) ?? []),
    [eventId, singleEventItems, multiEventItems]
  )

  const isLoading =
    (eventId ? singleEventResult.type === 'unknown' : false) ||
    (eventIds && eventIds.length > 0 ? multiEventResult.type === 'unknown' : false)

  return {
    agendaItems,
    isLoading,
  }
}

/**
 * Reactive state hook for the change request voting timeline of an agenda item.
 * Returns ordered CR entries with their vote data for the CR voting UI.
 */
export function useAgendaItemCRTimeline(agendaItemId: string | undefined) {
  const [timelineItems, timelineResult] = useQuery(
    agendaItemId
      ? queries.agendas.changeRequestTimeline({ agenda_item_id: agendaItemId })
      : undefined
  )

  console.log('[useAgendaItemCRTimeline] agendaItemId:', agendaItemId);
  console.log('[useAgendaItemCRTimeline] timelineResult.type:', timelineResult.type);
  console.log('[useAgendaItemCRTimeline] timelineItems:', timelineItems);
  console.log('[useAgendaItemCRTimeline] timelineItems?.length:', timelineItems?.length);

  const crTimeline = useMemo<ChangeRequestTimelineRow[]>(
    () => timelineItems ?? [],
    [timelineItems]
  )

  const currentItem = useMemo(
    () => crTimeline.find(item => item.status === 'voting') ?? null,
    [crTimeline]
  )

  const pendingItems = useMemo(
    () => crTimeline.filter(item => item.status === 'pending'),
    [crTimeline]
  )

  const completedItems = useMemo(
    () => crTimeline.filter(item => item.status === 'completed'),
    [crTimeline]
  )

  const finalVoteItem = useMemo(
    () => crTimeline.find(item => item.is_final_vote) ?? null,
    [crTimeline]
  )

  const progress = crTimeline.length > 0
    ? completedItems.length / crTimeline.length
    : 0

  return {
    crTimeline,
    currentItem,
    pendingItems,
    completedItems,
    finalVoteItem,
    progress,
    isLoading: timelineResult.type === 'unknown',
  }
}

/**
 * Find agenda items associated with an amendment.
 * Used on the change-requests page to locate the agenda item for the CR voting timeline.
 */
export function useAgendaItemByAmendment(amendmentId: string | undefined) {
  const [items, result] = useQuery(
    amendmentId
      ? queries.agendas.byAmendmentId({ amendment_id: amendmentId })
      : undefined
  )

  // Return the first matching agenda item (an amendment typically has one agenda item)
  const agendaItem = useMemo(() => items?.[0] ?? null, [items])

  return {
    agendaItem,
    agendaItemId: agendaItem?.id ?? undefined,
    isLoading: result.type === 'unknown',
  }
}
