import { useState, useEffect, useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useAuth } from '@/providers/auth-provider';
import { useUserState } from '@/zero/users/useUserState';
import { useConversationData } from './useConversationData';
import { useMessageMutations } from './useMessageMutations';
import { useConversationFilters } from './useConversationFilters';
import { useConversationSelection } from './useConversationSelection';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { Conversation } from '../types/message.types';

export function useMessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const searchParams = useSearch({ strict: false }) as Record<string, string>;

  // Dialog state
  const [userSearchDialogOpen, setUserSearchDialogOpen] = useState(false);
  const [newConversationSearch, setNewConversationSearch] = useState('');
  const [memberListDialogOpen, setMemberListDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Current user name for notifications
  const { currentUser: currentUserData } = useUserState();
  const currentUserName =
    `${currentUserData?.first_name ?? ''} ${currentUserData?.last_name ?? ''}`.trim() ||
    'Someone';

  // Data hooks
  const { conversations, isLoading } = useConversationData(user?.id);
  const mutations = useMessageMutations();
  const { searchQuery, setSearchQuery, filteredConversations } =
    useConversationFilters(conversations);
  const { selectedConversationId, setSelectedConversationId, selectedConversation } =
    useConversationSelection(conversations);

  // Existing direct conversation user IDs (for new conversation dialog)
  const existingConversationUserIds = useMemo(() => {
    return conversations
      .filter(conv => conv.type === 'direct')
      .flatMap(conv => conv.participants.map(p => p.user?.id))
      .filter((id): id is string => id !== undefined && id !== user?.id);
  }, [conversations, user?.id]);

  const messageUserId = searchParams.userId;
  const messageUserName = searchParams.name || '';

  // Open new conversation dialog from query params
  useEffect(() => {
    const shouldOpen = searchParams.new === '1';
    const search = searchParams.userSearch || searchParams.search;
    if (shouldOpen) {
      setUserSearchDialogOpen(true);
      setNewConversationSearch(search ?? '');
    }
  }, [searchParams]);

  // Route message intent based on existing conversations
  useEffect(() => {
    if (!messageUserId || !messageUserName || isLoading) return;

    const existingConversation = conversations.find(conv => {
      if (conv.type === 'group') return false;
      return conv.participants.some(p => p.user?.id === messageUserId);
    });

    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
      setSearchQuery('');
      setUserSearchDialogOpen(false);
      setNewConversationSearch('');
    } else {
      setUserSearchDialogOpen(true);
      setNewConversationSearch(messageUserName);
    }
  }, [
    messageUserId,
    messageUserName,
    conversations,
    isLoading,
    setSearchQuery,
    setSelectedConversationId,
  ]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    const unreadMessages = selectedConversation.messages.filter(
      msg => !msg.is_read && msg.sender?.id !== user.id
    );

    if (unreadMessages.length > 0) {
      mutations.markAsRead(unreadMessages);
    }
  }, [selectedConversation?.id, selectedConversation?.messages, user?.id]);

  // Handlers
  const handleCreateConversationRequest = async (otherUserId: string) => {
    if (!user?.id) return;

    const existingConversation = conversations.find(conv => {
      if (conv.type === 'group') return false;
      const participantIds = conv.participants.map(p => p.user?.id);
      return (
        participantIds.length === 2 &&
        participantIds.includes(user.id) &&
        participantIds.includes(otherUserId)
      );
    });

    if (existingConversation) {
      setSelectedConversationId(existingConversation.id);
      setUserSearchDialogOpen(false);
      return;
    }

    const result = await mutations.createConversation('direct', [user.id, otherUserId], undefined, user.id);
    if (result.success) {
      setSelectedConversationId(result.conversationId!);
      setUserSearchDialogOpen(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (conversationToDelete) {
      const conversation = conversations.find(c => c.id === conversationToDelete);
      if (conversation) {
        await mutations.deleteConversation(conversation);
        if (selectedConversationId === conversationToDelete) {
          setSelectedConversationId(null);
        }
      }
      setConversationToDelete(null);
    }
  };

  const handleAcceptConversation = async (conversation: Conversation) => {
    if (!user?.id) return;
    await mutations.acceptConversation(conversation.id, {
      senderId: user.id,
      senderName: currentUserName,
      requesterUserId: conversation.requested_by?.id,
    });
  };

  const handleRejectConversation = (conversation: Conversation) => {
    mutations.rejectConversation(conversation);
    if (selectedConversationId === conversation.id) {
      setSelectedConversationId(null);
    }
  };

  const handleSendMessage = (content: string) => {
    if (selectedConversationId && user?.id) {
      mutations.sendMessage(selectedConversationId, user.id, content);
    }
  };

  const openNewConversationDialog = () => {
    setNewConversationSearch('');
    setUserSearchDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  return {
    t,
    isLoading,
    currentUserId: user?.id,

    // Conversation data
    filteredConversations,
    selectedConversationId,
    setSelectedConversationId,
    selectedConversation,
    searchQuery,
    setSearchQuery,
    existingConversationUserIds,

    // Dialog state
    userSearchDialogOpen,
    setUserSearchDialogOpen,
    newConversationSearch,
    memberListDialogOpen,
    setMemberListDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,

    // Mutations
    togglePin: mutations.togglePin,

    // Handlers
    handleCreateConversationRequest,
    handleDeleteConversation,
    handleAcceptConversation,
    handleRejectConversation,
    handleSendMessage,
    openNewConversationDialog,
    openDeleteDialog,
  };
}
