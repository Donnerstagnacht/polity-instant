import { useState, useMemo, useCallback } from 'react';
import type { Value } from 'platejs';
import { filterDocumentToSuggestions } from '../logic/filterDocumentToSingleSuggestion';
import type { EditorViewMode } from '../ui/EditorViewModeToggle';

interface ChangeRequestInfo {
  id: string;
  crId: string;
  title: string;
  type: string;
}

/**
 * Hook that manages the dual editor view state (all suggestions vs. single suggestion).
 *
 * When mode is 'all', returns the original document content.
 * When mode is 'single', filters the document to show only the selected CR's suggestion.
 *
 * @param documentContent - The original plate-js document JSON
 * @param changeRequests - List of open change requests with their IDs
 * @param initialSelectedId - Optional initial CR to select (e.g. currently voted CR)
 */
export function useSuggestionPreview(
  documentContent: Value | undefined,
  changeRequests: ChangeRequestInfo[],
  initialSelectedId?: string | null
) {
  const [viewMode, setViewMode] = useState<EditorViewMode>('all');
  const [selectedCRId, setSelectedCRId] = useState<string | null>(initialSelectedId ?? null);

  // When switching to single mode, auto-select first CR if none selected
  const handleModeChange = useCallback(
    (mode: EditorViewMode) => {
      setViewMode(mode);
      if (mode === 'single' && !selectedCRId && changeRequests.length > 0) {
        setSelectedCRId(changeRequests[0].id);
      }
    },
    [selectedCRId, changeRequests]
  );

  const handleSelectedCRChange = useCallback((crId: string | null) => {
    setSelectedCRId(crId);
  }, []);

  // Compute the filtered document content for single-suggestion view
  const previewContent = useMemo(() => {
    if (!documentContent) return undefined;
    if (viewMode === 'all' || !selectedCRId) return documentContent;

    return filterDocumentToSuggestions(documentContent, new Set([selectedCRId]));
  }, [documentContent, viewMode, selectedCRId]);

  // Map change requests to the format expected by EditorViewModeToggle
  const crOptions = useMemo(
    () =>
      changeRequests.map(cr => ({
        id: cr.id,
        crId: cr.crId,
        title: cr.title,
        type: cr.type,
      })),
    [changeRequests]
  );

  return {
    viewMode,
    setViewMode: handleModeChange,
    selectedCRId,
    setSelectedCRId: handleSelectedCRChange,
    previewContent,
    crOptions,
  };
}
