/**
 * Extract CRSummary entries from an amendment's discussions and saved change_requests.
 * Used on the agenda item detail page where we have the amendment relation but
 * not the full document content (no text diff parsing).
 */
import type { CRSummary } from './createMockCRTimelineItems';

interface DiscussionEntry {
  id: string;
  crId?: string;
  title?: string;
  description?: string;
  justification?: string;
}

interface SavedChangeRequest {
  id: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
}

/**
 * Merge open CRs from discussions JSON with closed CRs from saved change_request entities.
 * Returns a flat array of CRSummary objects suitable for createMockCRTimelineItems().
 */
export function extractAmendmentCRSummaries(
  discussions: readonly unknown[] | null | undefined,
  savedChangeRequests: readonly SavedChangeRequest[] | null | undefined,
): CRSummary[] {
  const summaries: CRSummary[] = [];
  const processedCrIds = new Set<string>();

  // Open CRs from discussions JSON
  if (Array.isArray(discussions)) {
    for (const entry of discussions as DiscussionEntry[]) {
      if (!entry.crId) continue;

      processedCrIds.add(entry.crId);

      summaries.push({
        id: entry.id,
        crId: entry.crId,
        title: entry.title || entry.crId,
        description: entry.description || '',
        status: 'open',
        justification: entry.justification,
      });
    }
  }

  // Closed CRs from saved change_request entities
  if (Array.isArray(savedChangeRequests)) {
    for (const cr of savedChangeRequests) {
      // Skip if already handled from discussions
      if (cr.title && processedCrIds.has(cr.title)) continue;

      const status = cr.status || 'open';
      summaries.push({
        id: cr.id,
        crId: cr.title || undefined,
        title: cr.title || cr.id,
        description: cr.description || '',
        status,
      });
    }
  }

  return summaries;
}
