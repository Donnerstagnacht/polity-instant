'use client';

/**
 * Inline Amendment Editor
 *
 * A compact interactive editor for embedding in CR card previews.
 * Uses useEditor internally for state management and persistence.
 * Renders PlateEditor in suggest_event mode with the toolbar.
 */

import { useMemo, useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PlateEditor } from '@/features/shared/ui/kit-platejs/plate-editor';
import { useEditor } from '../hooks/useEditor';
import { useEditorOperations } from '../hooks/useEditorOperations';
import { useSuggestionIdAssignment } from '@/features/documents/hooks/use-suggestion-id-assignment';
import { SuggestionViewToggle } from './SuggestionViewToggle';
import type { ResolvedSuggestion } from '@/features/shared/ui/ui-platejs/block-suggestion';
import type { EditorUser, TDiscussion } from '../types';

interface InlineAmendmentEditorProps {
  amendmentId: string;
  userId?: string;
  userRecord?: {
    id: string;
    name?: string;
    email?: string | null;
    avatar?: string;
  };
  agendaItemId?: string;
  /** Editor mode to use — defaults to 'suggest_event' */
  editingMode?: string | null;
}

export function InlineAmendmentEditor({
  amendmentId,
  userId,
  userRecord,
  agendaItemId,
  editingMode,
}: InlineAmendmentEditorProps) {
  const resolvedMode = (editingMode === 'vote_event' ? 'vote_event' : 'suggest_event') as 'suggest_event' | 'vote_event';
  const {
    entity,
    isLoading,
    content,
    discussions,
    mode,
    selectedCrIds,
    setContent,
    setDiscussions,
    setSelectedCrIds,
  } = useEditor({
    entityType: 'amendment',
    entityId: amendmentId,
    userId,
    agendaItemId,
  });

  const contentEntityId = entity?.id ?? '';
  const amendmentIdFromEntity = entity?.metadata?.amendmentId;

  const editorOps = useEditorOperations('amendment', contentEntityId);

  const currentUser: EditorUser | undefined = useMemo(() => {
    if (!userId) return undefined;
    return {
      id: userId,
      name: userRecord?.name || userRecord?.email || 'Anonymous',
      email: userRecord?.email ?? undefined,
      avatarUrl: userRecord?.avatar,
    };
  }, [userId, userRecord]);

  const editorUsers = useMemo(() => {
    if (!currentUser) return {};
    return {
      [currentUser.id]: {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl || '',
      },
    };
  }, [currentUser]);

  const handleChangeRequestCreate = useCallback(
    ({ crId, changeRequestEntityId }: { crId: string; discussionId: string; changeRequestEntityId: string }) => {
      if (!amendmentIdFromEntity) return;
      editorOps.handleSuggestionCreated({
        id: changeRequestEntityId,
        crId,
        amendmentId: amendmentIdFromEntity,
      });
    },
    [amendmentIdFromEntity, editorOps],
  );

  useSuggestionIdAssignment({
    documentId: contentEntityId,
    discussions,
    onDiscussionsUpdate: setDiscussions,
    onChangeRequestCreate: handleChangeRequestCreate,
  });

  const onSuggestionAccepted = useCallback(
    async (suggestion: ResolvedSuggestion) => {
      if (!contentEntityId || !userId || !content) return;
      const { updatedDiscussions } = await editorOps.handleSuggestionAccepted(
        userId, content, discussions, suggestion, mode, amendmentIdFromEntity,
      );
      setDiscussions(updatedDiscussions);
    },
    [contentEntityId, userId, content, discussions, mode, amendmentIdFromEntity, setDiscussions, editorOps],
  );

  const onSuggestionDeclined = useCallback(
    async (suggestion: ResolvedSuggestion) => {
      if (!contentEntityId || !userId || !content) return;
      const { updatedDiscussions } = await editorOps.handleSuggestionDeclined(
        userId, content, discussions, suggestion, mode, amendmentIdFromEntity,
      );
      setDiscussions(updatedDiscussions);
    },
    [contentEntityId, userId, content, discussions, mode, amendmentIdFromEntity, setDiscussions, editorOps],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!entity) return null;

  return (
    <div className="space-y-2">
      {discussions.length > 0 && (
        <SuggestionViewToggle
          discussions={discussions}
          selectedCrIds={selectedCrIds}
          onSelectedCrIdsChange={setSelectedCrIds}
        />
      )}
      <div className="rounded-lg border bg-background">
        <PlateEditor
          key={contentEntityId}
          value={content}
          onChange={setContent}
          documentId={contentEntityId}
          currentMode={resolvedMode}
          isOwnerOrCollaborator={true}
          currentUser={
            currentUser
              ? { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatarUrl }
              : undefined
          }
          users={editorUsers}
          discussions={discussions}
          onDiscussionsChange={setDiscussions}
          onSuggestionAccepted={onSuggestionAccepted}
          onSuggestionDeclined={onSuggestionDeclined}
          selectedCrIds={selectedCrIds}
          onSelectedCrIdsChange={setSelectedCrIds}
        />
      </div>
    </div>
  );
}
