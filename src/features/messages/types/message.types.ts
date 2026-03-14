import type { ConversationWithRelationsRow } from '@/zero/messages/queries';

export type Conversation = ConversationWithRelationsRow;
export type Message = Conversation['messages'][number];
export type ConversationParticipant = Conversation['participants'][number];

export interface ConversationDisplay {
  name: string;
  avatar: string | null | undefined;
  handle: string | null | undefined;
  isGroup: boolean;
  participantCount?: number;
}
