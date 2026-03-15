import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    if (!url) {
      throw new Error('[Timeline] SUPABASE_URL is not configured');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

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

/**
 * Creates a timeline event via Supabase insert
 *
 * @example
 * ```ts
 * import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';
 *
 * await createTimelineEvent({
 *   eventType: 'created',
 *   entityType: 'amendment',
 *   entityId: amendmentId,
 *   actorId: userId,
 *   title: 'New amendment created',
 *   description: 'A new amendment proposal has been drafted',
 * });
 * ```
 */
const createTimelineEventSchema = z.object({
  eventType: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  actorId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  tags: z.array(z.string()).optional(),
  contentType: z.string().optional(),
  media: z
    .object({
      imageURL: z.string().optional(),
      videoURL: z.string().optional(),
      videoThumbnailURL: z.string().optional(),
      videoDuration: z.number().optional(),
    })
    .optional(),
  status: z
    .object({
      voteStatus: z.enum(['open', 'closed', 'passed', 'rejected']).optional(),
      electionStatus: z.enum(['nominations', 'voting', 'closed', 'winner']).optional(),
      endsAt: z.coerce.date().optional(),
    })
    .optional(),
  stats: z
    .object({
      likes: z.number().optional(),
      views: z.number().optional(),
      comments: z.number().optional(),
      shares: z.number().optional(),
    })
    .optional(),
});

export const createTimelineEvent = createServerFn({ method: 'POST' })
  .validator(createTimelineEventSchema.parse)
  .handler(
    async ({
      data: {
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
      },
    }): Promise<void> => {
      const eventId = crypto.randomUUID();

      const insertData: Record<
        string,
        | string
        | number
        | boolean
        | null
        | string[]
        | Record<string, string | number | boolean | null>
        | Record<string, number>
        | Date
      > = {
        id: eventId,
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        actor_id: actorId,
        title,
        description: description ?? null,
        created_at: new Date().toISOString(),
        content_type: contentType || entityType,
      };

      // Map entity type to specific FK column
      const entityFkKey = `${entityType}_id`;
      insertData[entityFkKey] = entityId;

      if (tags && tags.length > 0) {
        insertData.tags = tags;
      }

      if (metadata) {
        insertData.metadata = metadata;
      }

      if (media) {
        if (media.imageURL) insertData.image_url = media.imageURL;
        if (media.videoURL) insertData.video_url = media.videoURL;
        if (media.videoThumbnailURL) insertData.video_thumbnail_url = media.videoThumbnailURL;
      }

      if (status) {
        if (status.voteStatus) insertData.vote_status = status.voteStatus;
        if (status.electionStatus) insertData.election_status = status.electionStatus;
        if (status.endsAt) insertData.ends_at = status.endsAt;
      }

      if (stats) {
        insertData.stats = stats;
      }

      const { error } = await getSupabase().from('timeline_event').insert(insertData);
      if (error) {
        console.error('[Timeline] Failed to create timeline event:', error);
      }
    }
  );

/**
 * Helper to create a video upload timeline event
 */
export async function createVideoUploadEvent({
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
}): Promise<void> {
  return createTimelineEvent({
    data: {
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
    },
  });
}

/**
 * Helper to create an image upload timeline event
 */
export async function createImageUploadEvent({
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
}): Promise<void> {
  return createTimelineEvent({
    data: {
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
    },
  });
}
