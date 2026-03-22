import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

/**
 * Reactive state hook for election data.
 * Returns query-derived state — no mutations.
 */
export function useElectionState(options: {
  agendaItemId?: string
  electionId?: string
  electorId?: string
  includeElectionsWithDetails?: boolean
  includeElectionsForSearch?: boolean
  includePendingElections?: boolean
} = {}) {
  const {
    agendaItemId,
    electionId,
    electorId,
    includeElectionsWithDetails,
    includeElectionsForSearch,
    includePendingElections,
  } = options

  // ── Election by agenda item ────────────────────────────────────────
  const [electionsByAgendaItem, electionsByAgendaItemResult] = useQuery(
    agendaItemId ? queries.elections.byAgendaItem({ agenda_item_id: agendaItemId }) : undefined
  )

  // ── Single election by ID ─────────────────────────────────────────
  const [electionById, electionByIdResult] = useQuery(
    electionId ? queries.elections.byId({ id: electionId }) : undefined
  )

  const resolvedElectionId = electionId ?? electionById?.id ?? electionsByAgendaItem?.[0]?.id

  // ── Candidates for the election ───────────────────────────────────
  const [candidates, candidatesResult] = useQuery(
    resolvedElectionId
      ? queries.elections.candidatesByElection({ election_id: resolvedElectionId })
      : undefined
  )

  // ── Electors for the election ─────────────────────────────────────
  const [electors, electorsResult] = useQuery(
    resolvedElectionId
      ? queries.elections.electorsByElection({ election_id: resolvedElectionId })
      : undefined
  )

  // ── User's indicative participation ───────────────────────────────
  const [userIndicativeParticipation, userIndicativeResult] = useQuery(
    resolvedElectionId && electorId
      ? queries.elections.userIndicativeParticipation({
          election_id: resolvedElectionId,
          elector_id: electorId,
        })
      : undefined
  )

  // ── User's final participation ────────────────────────────────────
  const [userFinalParticipation, userFinalResult] = useQuery(
    resolvedElectionId && electorId
      ? queries.elections.userFinalParticipation({
          election_id: resolvedElectionId,
          elector_id: electorId,
        })
      : undefined
  )

  // ── Elections with full details (opt-in) ───────────────────────────
  const [electionsDetailed, electionsDetailedResult] = useQuery(
    includeElectionsWithDetails ? queries.elections.electionsWithDetails({}) : undefined
  )

  // ── Elections for search (opt-in) ──────────────────────────────────
  const [electionsSearch, electionsSearchResult] = useQuery(
    includeElectionsForSearch ? queries.elections.electionsForSearch({}) : undefined
  )

  // ── Pending elections (opt-in) ─────────────────────────────────────
  const [pendingElectionsData, pendingElectionsResult] = useQuery(
    includePendingElections ? queries.elections.pendingElections({}) : undefined
  )

  const election = useMemo(
    () => electionById ?? electionsByAgendaItem?.[0] ?? null,
    [electionById, electionsByAgendaItem]
  )

  const candidateRows = candidates ?? election?.candidates ?? []
  const electorRows = electors ?? election?.electors ?? []

  const isLoading =
    (agendaItemId ? electionsByAgendaItemResult.type === 'unknown' : false) ||
    (electionId ? electionByIdResult.type === 'unknown' : false) ||
    (resolvedElectionId ? candidatesResult.type === 'unknown' : false) ||
    (resolvedElectionId ? electorsResult.type === 'unknown' : false) ||
    (resolvedElectionId && electorId ? userIndicativeResult.type === 'unknown' : false) ||
    (resolvedElectionId && electorId ? userFinalResult.type === 'unknown' : false) ||
    (includeElectionsWithDetails ? electionsDetailedResult.type === 'unknown' : false) ||
    (includeElectionsForSearch ? electionsSearchResult.type === 'unknown' : false) ||
    (includePendingElections ? pendingElectionsResult.type === 'unknown' : false)

  return {
    election,
    electionsByAgendaItem: electionsByAgendaItem ?? [],
    candidates: candidateRows,
    electors: electorRows,
    userIndicativeParticipation: userIndicativeParticipation ?? null,
    userFinalParticipation: userFinalParticipation ?? null,
    electionsWithDetails: electionsDetailed ?? [],
    electionsForSearch: electionsSearch ?? [],
    pendingElections: pendingElectionsData ?? [],
    isLoading,
  }
}
