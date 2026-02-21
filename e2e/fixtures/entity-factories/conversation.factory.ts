/**
 * Conversation Factory
 *
 * Creates conversations, participants, and messages for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminUpsert } from '../admin-db';

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
    const now = new Date().toISOString();

    // Create conversation
    await adminUpsert('conversation', {
      id: conversationId,
      type: overrides.type ?? 'direct',
      name,
      status: overrides.status ?? 'accepted',
      group_id: overrides.groupId ?? null,
      requested_by_id: requestedById,
      created_at: now,
      last_message_at: now,
    });
    this.trackEntity('conversation', conversationId);

    // Add all participants (including the requester)
    const allParticipants = [requestedById, ...participantIds.filter(id => id !== requestedById)];
    const participants = allParticipants.map(memberId => {
      const participantId = this.generateId();
      this.trackEntity('conversation_participant', participantId);
      return {
        id: participantId,
        conversation_id: conversationId,
        user_id: memberId,
        joined_at: now,
        last_read_at: now,
      };
    });
    await adminUpsert('conversation_participant', participants);

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
    const now = new Date().toISOString();

    await adminUpsert('message', {
      id: messageId,
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      is_read: false,
      created_at: now,
      updated_at: now,
    });
    this.trackEntity('message', messageId);
    return messageId;
  }
}
