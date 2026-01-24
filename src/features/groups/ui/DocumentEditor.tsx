/**
 * Document Editor Component
 *
 * Complete document editor with PlateEditor, auto-save, and presence.
 * Uses the unified editor system from @/features/editor
 */

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { DocumentHeader } from './DocumentHeader';
import { useSuggestionIdAssignment } from '@/hooks/use-suggestion-id-assignment';

// Unified editor imports
import { useEditor, useEditorPresence, useEditorUsers, type EditorUser } from '@/features/editor';

interface DocumentEditorProps {
  documentId: string;
  groupId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function DocumentEditor({
  documentId,
  groupId,
  userId,
  userName,
  userEmail,
  userAvatar,
}: DocumentEditorProps) {
  // Unified editor hook
  const {
    entity,
    title,
    content,
    discussions,
    isSavingTitle,
    isOwnerOrCollaborator,
    setTitle,
    setContent,
    setDiscussions,
  } = useEditor({
    entityType: 'groupDocument',
    entityId: documentId,
    userId,
    groupId,
  });

  // Presence hook
  const { onlinePeers } = useEditorPresence({
    entityId: documentId,
    userId,
    userName: userName || userEmail || 'Anonymous',
    userAvatar,
    enabled: !!documentId,
  });

  // Auto-assign suggestion IDs
  useSuggestionIdAssignment({
    documentId,
    discussions,
    onDiscussionsUpdate: setDiscussions,
  });

  // Build current user for hooks
  const currentUser: EditorUser | undefined = userId
    ? {
        id: userId,
        name: userName || userEmail || 'Anonymous',
        email: userEmail,
        avatarUrl: userAvatar || `https://api.dicebear.com/9.x/glass/svg?seed=${userId}`,
      }
    : undefined;

  // Build users map for the editor
  const editorUsers = useEditorUsers(entity, currentUser);

  const isOwner = entity?.owner?.id === userId;

  return (
    <Card>
      <CardHeader>
        <DocumentHeader
          title={title}
          onTitleChange={setTitle}
          isSaving={isSavingTitle}
          isOwner={isOwner}
          onlinePeers={onlinePeers}
        />
        <CardDescription>
          Changes are saved automatically as you type. Other users' changes appear in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[600px]">
          <PlateEditor
            key={documentId}
            value={content}
            onChange={setContent}
            documentId={documentId}
            currentUser={
              currentUser
                ? {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatarUrl,
                  }
                : undefined
            }
            users={editorUsers}
            discussions={discussions}
            onDiscussionsChange={setDiscussions}
          />
        </div>
      </CardContent>
    </Card>
  );
}
