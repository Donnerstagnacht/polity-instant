'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { useState, useEffect } from 'react';
import { db } from '../../../db/db';
import { useConversationData } from './hooks/useConversationData';
import { useMessageMutations } from './hooks/useMessageMutations';
import { useConversationFilters } from './hooks/useConversationFilters';
import { useConversationSelection } from './hooks/useConversationSelection';
import { ConversationList } from './ui/ConversationList';
import { MessageView } from './ui/MessageView';
import { NewConversationDialog } from './ui/NewConversationDialog';
import { GroupMembersDialog } from './ui/GroupMembersDialog';
import { DeleteConversationDialog } from './ui/DeleteConversationDialog';
import { Conversation } from './types';

export default function MessagesPage() {
  const { user } = db.useAuth();
  const [userSearchDialogOpen, setUserSearchDialogOpen] = useState(false);
  const [memberListDialogOpen, setMemberListDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Query current user's name for notifications
  const { data: userData } = db.useQuery(
    user?.id
      ? {
          $users: {
            $: {
              where: { id: user.id },
              limit: 1,
            },
          },
        }
      : null
  );
  const currentUserName = userData?.$users?.[0]?.name || 'Someone';

  const { conversations, isLoading } = useConversationData(user?.id);
  const {
    sendMessage,
    createConversation,
    markAsRead,
    acceptConversation,
    rejectConversation,
    deleteConversation,
    togglePin,
  } = useMessageMutations();
  const { searchQuery, setSearchQuery, filteredConversations } = useConversationFilters(conversations);
  const { selectedConversationId, setSelectedConversationId, selectedConversation } = useConversationSelection(conversations);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    const unreadMessages = selectedConversation.messages.filter(
      (msg) => !msg.isRead && msg.sender?.id !== user.id
    );

    if (unreadMessages.length > 0) {
      markAsRead(unreadMessages);
    }
  }, [selectedConversation?.id, selectedConversation?.messages, user?.id]);

  // Create a new conversation request
  const handleCreateConversationRequest = async (otherUserId: string) => {
    if (!user?.id) return;

    // Check if direct conversation already exists between these users
    const existingConversation = conversations.find((conv) => {
      if (conv.type === 'group') return false; // Ignore group conversations
      const participantIds = conv.participants.map((p) => p.user?.id);
      return (
        participantIds.length === 2 &&
        participantIds.includes(user.id) &&
        participantIds.includes(otherUserId)
      );
    });

    if (existingConversation) {
      // Select the existing conversation
      setSelectedConversationId(existingConversation.id);
      setUserSearchDialogOpen(false);
      return;
    }

    const result = await createConversation('direct', [user.id, otherUserId]);
    if (result.success) {
      setSelectedConversationId(result.conversationId!);
      setUserSearchDialogOpen(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (conversationToDelete) {
      const conversation = conversations.find((c) => c.id === conversationToDelete);
      if (conversation) {
        await deleteConversation(conversation);
        if (selectedConversationId === conversationToDelete) {
          setSelectedConversationId(null);
        }
      }
      setConversationToDelete(null);
    }
  };

  // Handle accepting a conversation with notification to requester
  const handleAcceptConversation = async (conversation: Conversation) => {
    if (!user?.id) return;
    await acceptConversation(conversation.id, {
      senderId: user.id,
      senderName: currentUserName,
      requesterUserId: conversation.requestedBy?.id,
    });
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-4">
          <div className="flex h-[600px] items-center justify-center">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto min-h-screen p-4">
        <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 md:grid md:h-[calc(100vh-3rem)] md:grid-cols-3">
          <ConversationList
            conversations={filteredConversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentUserId={user?.id}
            onNewConversationClick={() => setUserSearchDialogOpen(true)}
          />

          <MessageView
            conversation={selectedConversation}
            currentUserId={user?.id}
            onBack={() => setSelectedConversationId(null)}
            onTogglePin={togglePin}
            onDeleteClick={(id) => {
              setConversationToDelete(id);
              setDeleteDialogOpen(true);
            }}
            onMembersClick={() => setMemberListDialogOpen(true)}
            onSendMessage={(content) => {
              if (selectedConversationId && user?.id) {
                sendMessage(selectedConversationId, user.id, content);
              }
            }}
            onAcceptConversation={handleAcceptConversation}
            onRejectConversation={(conversation) => {
                rejectConversation(conversation);
                if (selectedConversationId === conversation.id) {
                    setSelectedConversationId(null);
                }
            }}
          />
        </div>

        <NewConversationDialog
          open={userSearchDialogOpen}
          onOpenChange={setUserSearchDialogOpen}
          currentUserId={user?.id}
          onUserSelect={handleCreateConversationRequest}
        />

        <GroupMembersDialog
          open={memberListDialogOpen}
          onOpenChange={setMemberListDialogOpen}
          conversation={selectedConversation}
        />

        <DeleteConversationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConversation}
        />
      </PageWrapper>
    </AuthGuard>
  );
}
