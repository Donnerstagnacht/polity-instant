/**
 * Conversation Factory
 *
 * Creates conversations, participants, and messages for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminTransact, tx } from '../admin-db';

export interface CreateConversationOptions {
  id?: string;
  type?: 'group' | 'direct';
  name?: string;
  status?: string;
  groupId?: string;
}

export interface CreatedConversation {
  id: string;
  name: string;
}

export class ConversationFactory extends FactoryBase {
  private _counter = 0;

  /**
   * Create a conversation with participants.
   */
  async createConversation(
    requestedById: string,
    participantIds: string[],
    overrides: CreateConversationOptions = {}
  ): Promise<CreatedConversation> {
    this._counter++;
    const conversationId = overrides.id ?? this.generateId();
    const name = overrides.name ?? `E2E Conversation ${this._counter}`;
    const now = new Date();
    const txns: any[] = [];

    // Create conversation
    const convTx = tx.conversations[conversationId].update({
      type: overrides.type ?? 'direct',
      name,
      status: overrides.status ?? 'accepted',
      createdAt: now,
      lastMessageAt: now,
    });

    if (overrides.groupId) {
      txns.push(convTx.link({ group: overrides.groupId, requestedBy: requestedById }));
      this.trackLink('conversations', conversationId, 'group', overrides.groupId);
    } else {
      txns.push(convTx.link({ requestedBy: requestedById }));
    }
    this.trackEntity('conversations', conversationId);
    this.trackLink('conversations', conversationId, 'requestedBy', requestedById);

    // Add all participants (including the requester)
    const allParticipants = [requestedById, ...participantIds.filter(id => id !== requestedById)];
    for (const memberId of allParticipants) {
      const participantId = this.generateId();
      txns.push(
        tx.conversationParticipants[participantId]
          .update({ joinedAt: now, lastReadAt: now })
          .link({ conversation: conversationId, user: memberId })
      );
      this.trackEntity('conversationParticipants', participantId);
    }

    await adminTransact(txns);
    return { id: conversationId, name };
  }

  /**
   * Add a message to a conversation.
   */
  async addMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<string> {
    const messageId = this.generateId();
    await adminTransact([
      tx.messages[messageId]
        .update({
          content,
          isRead: false,
          createdAt: new Date(),
          updatedAt: null,
          deletedAt: null,
        })
        .link({ conversation: conversationId, sender: senderId }),
    ]);
    this.trackEntity('messages', messageId);
    return messageId;
  }
}
