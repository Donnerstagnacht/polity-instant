/**
 * Pure functions for computing agenda statistics from agenda items.
 */

export interface AgendaStats {
  electionsCount: number;
  amendmentsCount: number;
  openChangeRequestsCount: number;
}

export function computeAgendaStats(agendaItems: any[]): AgendaStats {
  const electionsCount = agendaItems.filter((item: any) => item.election).length;
  const amendmentsCount = agendaItems.filter((item: any) => item.amendmentVote).length;
  const openChangeRequestsCount = agendaItems.reduce(
    (count: number, item: any) =>
      count +
      (item.amendmentVote?.changeRequests?.filter((cr: any) => cr.status === 'open' || !cr.status)
        .length || 0),
    0
  );

  return { electionsCount, amendmentsCount, openChangeRequestsCount };
}
