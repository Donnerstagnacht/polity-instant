import type { SearchContentItem, SearchResultItem } from '../types/search.types';
import { extractHashtagTags } from '@/zero/common/hashtagHelpers';
import { getUserAvatar, getUserDisplayName } from '../utils/searchUtils';

export function toTags(hashtags?: Array<{ tag?: string | null }>): string[] {
  if (!hashtags) return [];
  return hashtags.map(tag => tag?.tag).filter((tag): tag is string => Boolean(tag));
}

export function toDate(value?: string | number | Date | null): Date {
  if (!value && value !== 0) return new Date();
  return value instanceof Date ? value : new Date(value);
}

/**
 * Maps raw mosaic search results (with `_type` discriminator) into a flat
 * `SearchContentItem[]` that the UI can render uniformly.
 */
export function mapMosaicToContentItems(
  mosaicResults: readonly SearchResultItem[],
  agendaItemsByEventId: Map<string, Array<{ election?: { id?: string } | null; amendment?: { id?: string } | null }>>,
): SearchContentItem[] {
  if (!mosaicResults || mosaicResults.length === 0) return [];

  return mosaicResults.reduce<SearchContentItem[]>((acc, item) => {
    switch (item._type) {
      case 'group':
        acc.push({
          id: item.id,
          type: 'group',
          title: item.name ?? '',
          description: item.description,
          createdAt: toDate(item.created_at),
          tags: extractHashtagTags(item.group_hashtags),
          groupName: item.name,
          memberCount: item.member_count ?? item.memberships?.length,
          eventCount: item.events?.length,
          amendmentCount: item.amendments?.length,
          stats: {
            members: item.member_count ?? item.memberships?.length,
          },
        });
        break;
      case 'event':
        acc.push({
          id: item.id,
          type: 'event',
          title: item.title ?? '',
          description: item.description,
          createdAt: toDate(item.created_at),
          startDate: item.start_date ? new Date(item.start_date) : undefined,
          endDate: item.end_date ? new Date(item.end_date) : undefined,
          location: item.location_name,
          attendeeCount: item.participants?.length,
          electionsCount:
            item.scheduled_elections?.length ??
            item.agenda_items?.filter(ai => Boolean(ai?.election)).length ??
            agendaItemsByEventId
              .get(item.id)
              ?.filter(agendaItem => Boolean(agendaItem?.election)).length ??
            item.voting_sessions?.length,
          amendmentsCount: item.agenda_items?.filter(ai => Boolean(ai?.amendment)).length,
          tags: extractHashtagTags(item.event_hashtags),
          groupName: item.group?.name,
          isRecurring: Boolean(item.is_recurring),
          recurrencePattern: item.recurrence_pattern,
          stats: {
            members: item.participants?.length,
          },
        });
        break;
      case 'amendment':
        acc.push({
          id: item.id,
          type: 'amendment',
          title: item.title ?? '',
          description: item.reason || item.preamble,
          createdAt: toDate(item.created_at),
          tags: extractHashtagTags(item.amendment_hashtags),
          groupId: item.group?.id,
          groupName: item.group?.name,
          collaboratorCount: item.collaborators?.length,
          changeRequestCount: item.change_requests?.length,
          stats: {
            reactions: item.votes?.length,
            comments: item.comment_count,
          },
        });
        break;
      case 'blog': {
        const blogRelations = item.bloggers ?? [];
        const blogOwnerRelation = blogRelations
          .find(relation => relation.status === 'owner')
          || blogRelations.find(relation => Boolean(relation.user || relation.user_id));
        const blogAuthor = blogOwnerRelation?.user
          || blogRelations
            .map(relation => relation.user)
            .find(Boolean);
        acc.push({
          id: item.id,
          type: 'blog',
          title: item.title ?? '',
          description: item.description,
          imageUrl: item.image_url,
          createdAt: toDate(item.created_at),
          tags: extractHashtagTags(item.blog_hashtags),
          authorId: blogAuthor?.id || blogOwnerRelation?.user_id,
          authorName: getUserDisplayName(blogAuthor),
          authorAvatar: blogAuthor?.avatar,
          groupId: item.group_id,
          commentCount: item.comment_count,
          stats: {
            reactions: item.support_votes?.length,
            comments: item.comment_count,
          },
        });
        break;
      }
      case 'statement':
        acc.push({
          id: item.id,
          type: 'statement',
          title: item.text ?? '',
          description: item.text,
          imageUrl: item.image_url,
          videoUrl: item.video_url,
          createdAt: toDate(item.created_at),
          tags: extractHashtagTags(item.statement_hashtags),
          authorId: item.user?.id,
          authorName: item.user ? `${item.user.first_name ?? ''} ${item.user.last_name ?? ''}`.trim() || item.user.handle : undefined,
          authorAvatar: item.user?.avatar,
          groupId: item.group?.id,
          groupName: item.group?.name,
          groupImageUrl: item.group?.image_url,
          commentCount: item.comment_count,
          upvotes: item.support_votes?.filter(v => v.vote === 1).length ?? item.upvotes ?? 0,
          downvotes: item.support_votes?.filter(v => v.vote === -1).length ?? item.downvotes ?? 0,
          surveyQuestion: item.surveys?.[0]?.question,
          surveyOptions: item.surveys?.[0]?.options?.map(o => ({
            label: o.label,
            voteCount: o.votes?.length ?? 0,
          })),
          stats: {
            comments: item.comment_count,
            reactions: (item.upvotes ?? 0) + (item.downvotes ?? 0),
          },
        });
        break;
      case 'todo':
        acc.push({
          id: item.id,
          type: 'todo',
          title: item.title ?? '',
          description: item.description,
          createdAt: toDate(item.created_at),
          updatedAt: item.updated_at ? toDate(item.updated_at) : undefined,
          dueDate: item.due_date ? toDate(item.due_date) : undefined,
          isCompleted: item.status === 'completed',
          groupId: item.group?.id,
          groupName: item.group?.name,
          authorId: item.creator?.id,
          authorName: getUserDisplayName(item.creator),
          authorAvatar: item.creator?.avatar,
          assigneeCount: item.assignments?.length,
          tags: Array.isArray(item.tags) ? [...item.tags] : [],
        });
        break;
      case 'user':
        acc.push({
          id: item.id,
          type: 'user',
          title: getUserDisplayName(item),
          description: item.bio,
          createdAt: toDate(item.created_at),
          tags: extractHashtagTags(item.user_hashtags),
          authorId: item.id,
          authorName: getUserDisplayName(item),
          authorAvatar: getUserAvatar(item),
          handle: item.handle,
          location: item.location,
          groupCount: item.group_count ?? item.group_memberships?.length,
          amendmentCount: item.amendment_count ?? item.amendment_collaborations?.length,
        });
        break;
      case 'election':
        acc.push({
          id: item.id,
          type: 'election',
          title: item.title || '',
          description: item.description,
          createdAt: toDate(item.created_at),
          updatedAt: item.updated_at ? toDate(item.updated_at) : undefined,
          status: item.status,
          groupId: item.position?.group?.id,
          groupName: item.position?.group?.name,
          startDate: item.voting_start_time ? toDate(item.voting_start_time) : undefined,
          endDate: item.voting_end_time ? toDate(item.voting_end_time) : undefined,
          candidates: item.candidates as unknown as Record<string, unknown>[],
          totalCandidates: item.candidates?.length || 0,
          agendaEventId: item.agenda_item?.event?.id,
          agendaItemId: item.agenda_item?.id,
        });
        break;
      case 'vote':
        acc.push({
          id: item.id,
          type: 'vote',
          title: item.event?.title || item.voting_type || 'Vote',
          description: item.description,
          createdAt: toDate(item.created_at),
          eventId: item.event?.id,
          eventName: item.event?.title,
          status: item.status,
          votingType: item.voting_type,
          phase: item.status,
          stats: {
            reactions: item.votes?.filter(v => v.vote === 'accept')?.length || 0,
            comments: item.votes?.filter(v => v.vote === 'reject')?.length || 0,
          },
          agendaEventId: item.agenda_item?.event?.id,
          agendaItemId: item.agenda_item?.id,
        });
        break;
      case 'video':
        acc.push({
          id: item.id,
          type: 'video',
          title: item.title || '',
          description: item.description,
          imageUrl: item.video_thumbnail_url || item.image_url,
          videoUrl: item.video_url,
          createdAt: toDate(item.created_at),
          authorId: item.actor?.id,
          authorName: getUserDisplayName(item.actor),
          authorAvatar: item.actor?.avatar,
          groupId: item.group?.id,
          groupName: item.group?.name,
        });
        break;
      case 'image':
        acc.push({
          id: item.id,
          type: 'image',
          title: item.title || '',
          description: item.description,
          imageUrl: item.image_url,
          createdAt: toDate(item.created_at),
          authorId: item.actor?.id,
          authorName: getUserDisplayName(item.actor),
          authorAvatar: item.actor?.avatar,
          groupId: item.group?.id,
          groupName: item.group?.name,
        });
        break;
      default:
        break;
    }

    return acc;
  }, []);
}
