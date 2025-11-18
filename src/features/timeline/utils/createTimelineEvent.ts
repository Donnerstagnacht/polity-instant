import { tx, id } from '../../../../db';

interface CreateTimelineEventParams {
  eventType:
    | 'created'
    | 'updated'
    | 'comment_added'
    | 'vote_started'
    | 'participant_joined'
    | 'status_changed'
    | 'published'
    | 'member_added';
  entityType: 'user' | 'group' | 'amendment' | 'event' | 'blog';
  entityId: string;
  actorId: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a timeline event transaction
 * Use this in your transact calls to create timeline events
 *
 * @example
 * ```ts
 * import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';
 *
 * await db.transact([
 *   // Your other transactions...
 *   createTimelineEvent({
 *     eventType: 'created',
 *     entityType: 'amendment',
 *     entityId: amendmentId,
 *     actorId: userId,
 *     title: 'New amendment created',
 *     description: 'A new amendment proposal has been drafted',
 *   }),
 * ]);
 * ```
 */
export function createTimelineEvent({
  eventType,
  entityType,
  entityId,
  actorId,
  title,
  description,
  metadata,
}: CreateTimelineEventParams) {
  const eventId = id();

  return tx.timelineEvents[eventId]
    .update({
      eventType,
      entityType,
      title,
      description,
      metadata,
      createdAt: new Date(),
    })
    .link({
      actor: actorId,
      [entityType]: entityId,
    });
}
