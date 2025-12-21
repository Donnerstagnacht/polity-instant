/**
 * Document Editor Component
 *
 * Complete document editor with PlateEditor, auto-save, and presence.
 */

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { DocumentHeader } from './DocumentHeader';
import { useDocumentEditor } from '../hooks/useDocumentEditor';
import { useDocumentPresence } from '../hooks/useDocumentPresence';
import { useSuggestionIdAssignment } from '@/hooks/use-suggestion-id-assignment';

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
  // Document editor hook
  const {
    document,
    title,
    content,
    discussions,
    setTitle,
    setContent,
    setDiscussions,
    isSavingTitle,
  } = useDocumentEditor({ documentId, userId });

  // Presence hook
  const { onlinePeers } = useDocumentPresence({
    documentId,
    userId,
    userName: userName || userEmail || 'Anonymous',
    userAvatar,
  });

  // Auto-assign suggestion IDs
  useSuggestionIdAssignment({
    documentId,
    discussions,
    onDiscussionsUpdate: setDiscussions,
  });

  // Build users map for the editor
  const editorUsers = useMemo(() => {
    const users: Record<string, { id: string; name: string; avatarUrl: string }> = {};

    if (userId) {
      users[userId] = {
        id: userId,
        name: userName || userEmail || 'Anonymous',
        avatarUrl: userAvatar || `https://api.dicebear.com/9.x/glass/svg?seed=${userId}`,
      };
    }

    return users;
  }, [userId, userName, userEmail, userAvatar]);

  // Current user for editor
  const currentUser = userId
    ? {
        id: userId,
        name: userName || userEmail || 'Anonymous',
        avatar: userAvatar,
      }
    : undefined;

  const isOwner = document?.owner?.id === userId;

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
            currentUser={currentUser}
            users={editorUsers}
            discussions={discussions}
            onDiscussionsChange={setDiscussions}
          />
        </div>
      </CardContent>
    </Card>
  );
}
