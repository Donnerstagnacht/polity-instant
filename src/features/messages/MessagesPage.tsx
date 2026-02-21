'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { useMessagesPage } from './hooks/useMessagesPage';
import { ConversationList } from './ui/ConversationList';
import { MessageView } from './ui/MessageView';
import { NewConversationDialog } from './ui/NewConversationDialog';
import { GroupMembersDialog } from './ui/GroupMembersDialog';
import { DeleteConversationDialog } from './ui/DeleteConversationDialog';

export default function MessagesPage() {
  const mp = useMessagesPage();

  if (mp.isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <div className="flex h-[600px] items-center justify-center">
            <p className="text-muted-foreground">{mp.t('features.messages.loading')}</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="min-h-screen">
        <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 md:grid md:h-[calc(100vh-3rem)] md:grid-cols-3">
          <ConversationList
            conversations={mp.filteredConversations}
            selectedConversationId={mp.selectedConversationId}
            onSelectConversation={mp.setSelectedConversationId}
            searchQuery={mp.searchQuery}
            onSearchChange={mp.setSearchQuery}
            currentUserId={mp.currentUserId}
            onNewConversationClick={mp.openNewConversationDialog}
          />

          <MessageView
            conversation={mp.selectedConversation}
            currentUserId={mp.currentUserId}
            onBack={() => mp.setSelectedConversationId(null)}
            onTogglePin={mp.togglePin}
            onDeleteClick={mp.openDeleteDialog}
            onMembersClick={() => mp.setMemberListDialogOpen(true)}
            onSendMessage={mp.handleSendMessage}
            onAcceptConversation={mp.handleAcceptConversation}
            onRejectConversation={mp.handleRejectConversation}
          />
        </div>

        <NewConversationDialog
          open={mp.userSearchDialogOpen}
          onOpenChange={mp.setUserSearchDialogOpen}
          currentUserId={mp.currentUserId}
          initialSearchQuery={mp.newConversationSearch}
          onUserSelect={mp.handleCreateConversationRequest}
          existingConversationUserIds={mp.existingConversationUserIds}
        />

        <GroupMembersDialog
          open={mp.memberListDialogOpen}
          onOpenChange={mp.setMemberListDialogOpen}
          conversation={mp.selectedConversation}
        />

        <DeleteConversationDialog
          open={mp.deleteDialogOpen}
          onOpenChange={mp.setDeleteDialogOpen}
          onConfirm={mp.handleDeleteConversation}
        />
      </PageWrapper>
    </AuthGuard>
  );
}
