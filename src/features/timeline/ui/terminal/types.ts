import type { TrendData } from './TrendIndicator';
import type { VoteData } from './VoteProgressBar';

/**
 * Type of decision: vote on an amendment or leadership election
 */
export type DecisionType = 'vote' | 'election';

/**
 * Status of a decision for display purposes
 */
export type DecisionDisplayStatus =
  | 'open'
  | 'closing_soon'
  | 'last_hour'
  | 'final_minutes'
  | 'passed'
  | 'failed'
  | 'tied'
  | 'elected';

/**
 * Decision item for the terminal
 */
export interface DecisionItem {
  /** Unique identifier (e.g., V-204, E-88) */
  id: string;

  /** Type of decision */
  type: DecisionType;

  /** Title of the decision */
  title: string;

  /** Body/category (e.g., "Transport", "Finance", "Urban Development") */
  body: string;

  /** When the decision ends/ended */
  endsAt: Date;

  /** Display status */
  status: DecisionDisplayStatus;

  /** Is this a closed decision? */
  isClosed: boolean;

  /** Is this closing soon (< 24 hours)? */
  isClosingSoon: boolean;

  /** Is this urgent (< 1 hour)? */
  isUrgent: boolean;

  /** Trend data (support/oppose shift) */
  trend: TrendData;

  /** Vote counts (for votes) */
  votes?: VoteData;

  /** Voter turnout percentage */
  turnout?: number;

  /** Total members eligible to vote */
  totalMembers?: number;

  /** Number of members who voted */
  votedCount?: number;

  /** Winner name (for elections) */
  winnerName?: string;

  /** Support percentage (for closed votes) */
  supportPercentage?: number;

  /** Link to full decision page */
  href: string;

  /** Summary of the decision */
  summary?: string;

  /** Problem statement */
  problem?: string;

  /** Proposal details */
  proposal?: string;

  /** Related entity (amendment, group, etc.) */
  entity?: {
    id: string;
    name: string;
    type: string;
    href: string;
  };

  /** Related agenda item (for votes/elections) */
  agendaItem?: {
    id: string;
    name: string;
    href: string;
  };

  /** Candidates (for elections) */
  candidates?: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    votes?: number;
    isWinner?: boolean;
  }>;
}

/**
 * Configuration for terminal display
 */
export interface TerminalConfig {
  /** Refresh interval in ms */
  refreshInterval: number;

  /** Show sound alerts for urgent items */
  soundAlerts: boolean;

  /** Display density: compact or comfortable */
  density: 'compact' | 'comfortable';

  /** Flash threshold: minimum percentage change to flash */
  flashThreshold: number;
}

export const DEFAULT_TERMINAL_CONFIG: TerminalConfig = {
  refreshInterval: 30000, // 30 seconds
  soundAlerts: false,
  density: 'comfortable',
  flashThreshold: 2, // 2% change triggers flash
};
