import { tx, id } from '../../../../db/db';

/**
 * Event types for timeline
 */
export type TimelineEventType =
  | 'created'
  | 'updated'
  | 'comment_added'
  | 'vote_started'
  | 'vote_closed'
  | 'vote_passed'
  | 'vote_rejected'
  | 'participant_joined'
  | 'status_changed'
  | 'published'
  | 'member_added'
  | 'video_uploaded'
  | 'image_uploaded'
  | 'statement_posted'
  | 'todo_created'
  | 'blog_published'
  | 'election_nominations_open'
  | 'election_voting_open'
  | 'election_closed'
  | 'election_winner_announced';

/**
 * Content types for timeline filtering
 */
export type TimelineContentType =
  | 'group'
  | 'event'
  | 'amendment'
  | 'vote'
  | 'election'
  | 'video'
  | 'image'
  | 'statement'
  | 'todo'
  | 'blog'
  | 'action'
  | 'user';

/**
 * Media parameters for timeline events
 */
export interface TimelineMediaParams {
  /** URL to an image */
  imageURL?: string;
  /** URL to a video (YouTube, Vimeo, or direct) */
  videoURL?: string;
  /** URL to video thumbnail */
  videoThumbnailURL?: string;
  /** Video duration in seconds */
  videoDuration?: number;
}

/**
 * Status parameters for votes and elections
 */
export interface TimelineStatusParams {
  /** Vote status */
  voteStatus?: 'open' | 'closed' | 'passed' | 'rejected';
  /** Election status */
  electionStatus?: 'nominations' | 'voting' | 'closed' | 'winner';
  /** When the vote/election ends */
  endsAt?: Date;
}

/**
 * Stats for timeline events
 */
export interface TimelineStatsParams {
  /** Like/reaction count */
  likes?: number;
  /** View count */
  views?: number;
  /** Comment count */
  comments?: number;
  /** Share count */
  shares?: number;
}

interface CreateTimelineEventParams {
  eventType: TimelineEventType;
  entityType: TimelineContentType;
  entityId: string;
  actorId: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  /** Topic/category tags */
  tags?: string[];
  /** Content type for filtering (defaults to entityType) */
  contentType?: TimelineContentType;
  /** Media attachments */
  media?: TimelineMediaParams;
  /** Vote/election status */
  status?: TimelineStatusParams;
  /** Engagement stats */
  stats?: TimelineStatsParams;
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
 *
 * @example With media
 * ```ts
 * createTimelineEvent({
 *   eventType: 'video_uploaded',
 *   entityType: 'video',
 *   entityId: videoId,
 *   actorId: userId,
 *   title: 'Amendment Explainer Video',
 *   description: 'Watch this video to understand the proposal',
 *   tags: ['climate', 'transport'],
 *   media: {
 *     videoURL: 'https://youtube.com/watch?v=...',
 *     videoThumbnailURL: 'https://img.youtube.com/...',
 *     videoDuration: 245,
 *   },
 * })
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
  tags,
  contentType,
  media,
  status,
  stats,
}: CreateTimelineEventParams) {
  const eventId = id();

  // Build the update object
  const updateData: Record<string, unknown> = {
    eventType,
    entityType,
    title,
    description,
    createdAt: new Date(),
    // Content type for filtering (defaults to entityType)
    contentType: contentType || entityType,
  };

  // Add tags if provided
  if (tags && tags.length > 0) {
    updateData.tags = tags;
  }

  // Add metadata if provided
  if (metadata) {
    updateData.metadata = metadata;
  }

  // Add media fields if provided
  if (media) {
    if (media.imageURL) updateData.imageURL = media.imageURL;
    if (media.videoURL) updateData.videoURL = media.videoURL;
    if (media.videoThumbnailURL) updateData.videoThumbnailURL = media.videoThumbnailURL;
    if (media.videoDuration) updateData.videoDuration = media.videoDuration;
  }

  // Add status fields if provided
  if (status) {
    if (status.voteStatus) updateData.voteStatus = status.voteStatus;
    if (status.electionStatus) updateData.electionStatus = status.electionStatus;
    if (status.endsAt) updateData.endsAt = status.endsAt;
  }

  // Add stats if provided
  if (stats) {
    updateData.stats = stats;
  }

  return tx.timelineEvents[eventId].update(updateData).link({
    actor: actorId,
    [entityType]: entityId,
  });
}

/**
 * Helper to create a video upload timeline event
 */
export function createVideoUploadEvent({
  videoURL,
  videoThumbnailURL,
  videoDuration,
  title,
  description,
  actorId,
  linkedEntityType,
  linkedEntityId,
  tags,
}: {
  videoURL: string;
  videoThumbnailURL?: string;
  videoDuration?: number;
  title: string;
  description?: string;
  actorId: string;
  linkedEntityType?: TimelineContentType;
  linkedEntityId?: string;
  tags?: string[];
}) {
  return createTimelineEvent({
    eventType: 'video_uploaded',
    entityType: linkedEntityType || 'user',
    entityId: linkedEntityId || actorId,
    actorId,
    title,
    description,
    contentType: 'video',
    tags,
    media: {
      videoURL,
      videoThumbnailURL,
      videoDuration,
    },
  });
}

/**
 * Helper to create an image upload timeline event
 */
export function createImageUploadEvent({
  imageURL,
  title,
  description,
  actorId,
  linkedEntityType,
  linkedEntityId,
  tags,
}: {
  imageURL: string;
  title: string;
  description?: string;
  actorId: string;
  linkedEntityType?: TimelineContentType;
  linkedEntityId?: string;
  tags?: string[];
}) {
  return createTimelineEvent({
    eventType: 'image_uploaded',
    entityType: linkedEntityType || 'user',
    entityId: linkedEntityId || actorId,
    actorId,
    title,
    description,
    contentType: 'image',
    tags,
    media: {
      imageURL,
    },
  });
}
