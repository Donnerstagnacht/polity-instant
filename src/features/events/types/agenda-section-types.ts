/**
 * Types for agenda item section components
 */

export interface UserInfo {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface SpeakerListItem {
  id: string;
  order: number;
  time: number;
  completed: boolean;
  title?: string;
  user?: UserInfo;
}

export interface ElectionCandidate {
  id: string;
  userId: string;
  user?: UserInfo;
  status: 'nominated' | 'accepted' | 'withdrawn';
}

export interface ElectionVote {
  id: string;
  candidateId: string;
  isIndication?: boolean;
  voter?: { id: string; name?: string };
}

export interface VoteEntry {
  id: string;
  vote: 'yes' | 'no' | 'abstain';
  isIndication?: boolean;
  voter?: { id: string; name?: string };
}

export interface ChangeRequest {
  id: string;
  title: string;
  description?: string;
  characterCount?: number;
  votingOrder?: number;
  status: 'proposed' | 'voting' | 'accepted' | 'rejected';
  activatedAt?: number;
  completedAt?: number;
}

export interface AgendaItemInfo {
  id: string;
  title: string;
  description?: string;
  type: 'discussion' | 'election' | 'vote' | 'speech' | 'amendment';
  status: string;
  duration?: number;
  scheduledTime?: string;
  startTime?: Date;
  endTime?: Date;
  activatedAt?: Date;
  completedAt?: Date;
}

export interface PositionInfo {
  id: string;
  title: string;
  description?: string;
  group?: { id: string; name: string };
}

export interface AmendmentInfo {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  workflowStatus?: string;
  imageURL?: string;
  group?: { id: string; name: string };
}
