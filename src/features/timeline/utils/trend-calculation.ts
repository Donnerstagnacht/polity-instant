/**
 * Trend calculation utilities for the Decision Terminal
 * Calculates support/oppose trends and volatility
 */

import type { TrendData, TrendDirection } from '../ui/terminal/TrendIndicator';
import type { VoteData } from '../ui/terminal/VoteProgressBar';

export interface HistoricalVoteSnapshot {
  timestamp: Date;
  votes: VoteData;
}

/**
 * Calculate trend from current votes vs historical snapshot
 * Returns direction and percentage change in support
 */
export function calculateTrend(
  currentVotes: VoteData,
  historicalVotes: VoteData | null
): TrendData {
  // If no historical data, return stable
  if (!historicalVotes) {
    return { direction: 'stable', percentage: 0 };
  }

  const currentTotal = currentVotes.support + currentVotes.oppose + currentVotes.abstain;
  const historicalTotal =
    historicalVotes.support + historicalVotes.oppose + historicalVotes.abstain;

  // Avoid division by zero
  if (currentTotal === 0 || historicalTotal === 0) {
    return { direction: 'stable', percentage: 0 };
  }

  const currentSupportPct = (currentVotes.support / currentTotal) * 100;
  const historicalSupportPct = (historicalVotes.support / historicalTotal) * 100;

  const percentageChange = currentSupportPct - historicalSupportPct;

  // Determine direction
  let direction: TrendDirection;
  if (Math.abs(percentageChange) < 1) {
    direction = 'stable';
  } else if (percentageChange > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }

  return {
    direction,
    percentage: Math.round(percentageChange),
  };
}

/**
 * Detect volatility based on recent vote changes
 * Volatile if direction has changed multiple times recently
 */
export function detectVolatility(snapshots: HistoricalVoteSnapshot[]): boolean {
  if (snapshots.length < 3) {
    return false;
  }

  // Calculate trends between consecutive snapshots
  let directionChanges = 0;
  let lastDirection: TrendDirection = 'stable';

  for (let i = 1; i < snapshots.length; i++) {
    const trend = calculateTrend(snapshots[i].votes, snapshots[i - 1].votes);

    if (trend.direction !== 'stable' && trend.direction !== lastDirection) {
      directionChanges++;
    }

    if (trend.direction !== 'stable') {
      lastDirection = trend.direction;
    }
  }

  // Volatile if direction changed more than twice in recent snapshots
  return directionChanges >= 2;
}

/**
 * Get trend with volatility detection
 */
export function getTrendWithVolatility(
  currentVotes: VoteData,
  snapshots: HistoricalVoteSnapshot[]
): TrendData {
  const isVolatile = detectVolatility(snapshots);

  if (isVolatile) {
    // Calculate overall trend for percentage
    const oldestSnapshot = snapshots[0]?.votes;
    const trend = calculateTrend(currentVotes, oldestSnapshot);
    return {
      direction: 'volatile',
      percentage: trend.percentage,
    };
  }

  // Get most recent snapshot for comparison
  const mostRecent = snapshots[snapshots.length - 1]?.votes || null;
  return calculateTrend(currentVotes, mostRecent);
}

/**
 * Calculate support percentage from vote data
 */
export function calculateSupportPercentage(votes: VoteData): number {
  const total = votes.support + votes.oppose + votes.abstain;
  if (total === 0) return 0;
  return Math.round((votes.support / total) * 100);
}

/**
 * Calculate turnout percentage
 */
export function calculateTurnout(votedCount: number, totalMembers: number): number {
  if (totalMembers === 0) return 0;
  return Math.round((votedCount / totalMembers) * 100);
}

/**
 * Check if quorum is reached
 */
export function isQuorumReached(turnout: number, requiredQuorum: number = 50): boolean {
  return turnout >= requiredQuorum;
}
