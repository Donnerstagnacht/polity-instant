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
          title: item.name,
          description: item.description,
          createdAt: toDate(item.createdAt),
          tags: extractHashtagTags(item.group_hashtags),
          groupName: item.name,
          memberCount: item.memberCount ?? item.memberships?.length,
          eventCount: item.events?.length,
          amendmentCount: item.amendments?.length,
          stats: {
            members: item.memberCount ?? item.memberships?.length,
          },
        });
        break;
      case 'event':
        acc.push({
          id: item.id,
          type: 'event',
          title: item.title,
          description: item.description,
          createdAt: toDate(item.created_at || item.createdAt),
          startDate: (item.start_date != null && item.start_date !== 0) ? new Date(item.start_date) : (item.startDate ? new Date(item.startDate) : undefined),
          endDate: (item.end_date != null && item.end_date !== 0) ? new Date(item.end_date) : (item.endDate ? new Date(item.endDate) : undefined),
          location: item.location || item.location_name || item.locationName,
          city: item.city,
          postcode: item.postal_code || item.postalCode,
          attendeeCount: item.participants?.length,
          electionsCount:
            item.eventPositions?.filter((position: { election?: unknown }) => Boolean(position?.election)).length ??
            item.scheduledElections?.length ??
            agendaItemsByEventId
              .get(item.id)
              ?.filter((agendaItem) => Boolean(agendaItem?.election)).length ??
            item.votingSessions?.filter((session: { election?: unknown }) => Boolean(session?.election)).length,
          amendmentsCount: item.targetedAmendments?.length,
          tags: extractHashtagTags(item.event_hashtags),
          groupName: item.group?.name,
          isRecurring: Boolean(item.is_recurring || item.isRecurring),
          recurrencePattern: item.recurrence_pattern || item.recurrencePattern,
          stats: {
            members: item.participants?.length,
          },
        });
        break;
      case 'amendment':
        acc.push({
          id: item.id,
          type: 'amendment',
          title: item.title,
          description: item.subtitle || item.description,
          createdAt: toDate(item.createdAt),
          tags: extractHashtagTags(item.amendment_hashtags),
          groupId: item.groups?.[0]?.id,
          groupName: item.groups?.[0]?.name,
          collaboratorCount: item.amendmentRoleCollaborators?.length,
          supportingGroupsCount: item.groupSupporters?.length,
          changeRequestCount: item.changeRequests?.length,
          stats: {
            reactions: item.votes?.length,
            comments: item.comments?.length,
          },
        });
        break;
      case 'blog': {
        const blogRelations = item.bloggers || item.blogRoleBloggers || [];
        const blogOwnerRelation = blogRelations
          .find((relation: { status?: string | null }) => relation?.status === 'owner')
          || blogRelations.find((relation: { user?: unknown; user_id?: string | null }) => Boolean(relation?.user || relation?.user_id));
        const blogAuthor = blogOwnerRelation?.user
          || blogRelations
            .map((relation: { user?: unknown }) => relation?.user)
            .find(Boolean);
        acc.push({
          id: item.id,
          type: 'blog',
          title: item.title,
          description: item.description,
          imageUrl: item.image_url || item.imageURL || item.imageUrl,
          createdAt: toDate(item.created_at || item.createdAt),
          tags: extractHashtagTags(item.blog_hashtags),
          authorId: blogAuthor?.id || blogOwnerRelation?.user_id,
          authorName: blogAuthor?.name,
          authorAvatar: blogAuthor?.avatar || blogAuthor?.avatarUrl,
          groupId: item.group_id || item.group?.id,
          commentCount: item.comment_count ?? item.comments?.length,
          stats: {
            reactions: item.support_votes?.length ?? item.votes?.length,
            comments: item.comment_count ?? item.comments?.length,
          },
        });
        break;
      }
      case 'statement':
        acc.push({
          id: item.id,
          type: 'statement',
          title: item.text,
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
          upvotes: item.support_votes?.filter((v: { vote: number }) => v.vote === 1).length ?? item.upvotes ?? 0,
          downvotes: item.support_votes?.filter((v: { vote: number }) => v.vote === -1).length ?? item.downvotes ?? 0,
          surveyQuestion: item.surveys?.[0]?.question,
          surveyOptions: item.surveys?.[0]?.options?.map((o: { label: string; votes?: unknown[] }) => ({
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
          title: item.title,
          description: item.description,
          createdAt: toDate(item.createdAt),
          updatedAt: item.updatedAt ? toDate(item.updatedAt) : undefined,
          dueDate: item.dueDate ? toDate(item.dueDate) : undefined,
          isCompleted: item.status === 'completed',
          groupId: item.group?.id,
          groupName: item.group?.name,
          authorId: item.creator?.id,
          authorName: item.creator?.name,
          authorAvatar: item.creator?.avatarUrl,
          assigneeCount: item.assignments?.length,
          tags: Array.isArray(item.tags) ? item.tags : [],
        });
        break;
      case 'user':
        acc.push({
          id: item.id,
          type: 'user',
          title: getUserDisplayName(item),
          description: item.bio,
          createdAt: toDate(item.created_at || item.createdAt || item.joinedAt),
          tags: extractHashtagTags(item.user_hashtags),
          authorId: item.id,
          authorName: getUserDisplayName(item),
          authorAvatar: getUserAvatar(item),
          handle: item.handle,
          subtitle: item.subtitle,
          location: item.location || item.contactLocation,
          groupCount: item.group_count ?? item.groupCount ?? item.group_memberships?.length ?? item.memberships?.length,
          amendmentCount:
            item.amendment_count ??
            item.amendmentCount ??
            item.amendment_collaborations?.length ??
            item.collaborations?.length,
        });
        break;
      case 'election':
        acc.push({
          id: item.id,
          type: 'election',
          title: item.title || '',
          description: item.description,
          createdAt: toDate(item.createdAt),
          updatedAt: item.updatedAt ? toDate(item.updatedAt) : undefined,
          status: item.status,
          groupId: item.position?.group?.id,
          groupName: item.position?.group?.name,
          startDate: item.votingStartTime ? toDate(item.votingStartTime) : undefined,
          endDate: item.votingEndTime ? toDate(item.votingEndTime) : undefined,
          candidates: item.candidates || [],
          totalCandidates: item.candidates?.length || 0,
          agendaEventId: item.agendaItem?.event?.id,
          agendaItemId: item.agendaItem?.id,
        } as SearchContentItem);
        break;
      case 'vote':
        acc.push({
          id: item.id,
          type: 'vote',
          title: item.event?.title || item.votingType || 'Vote',
          description: item.targetEntityType
            ? `${item.votingType} - ${item.targetEntityType}`
            : undefined,
          createdAt: toDate(item.createdAt),
          eventId: item.event?.id,
          eventName: item.event?.title,
          status: item.phase,
          votingType: item.votingType,
          phase: item.phase,
          result: item.result,
          stats: {
            reactions: item.votes?.filter((v: { vote: string }) => v.vote === 'accept')?.length || 0,
            comments: item.votes?.filter((v: { vote: string }) => v.vote === 'reject')?.length || 0,
          },
          agendaEventId:
            item.election?.agendaItem?.event?.id || item.amendment?.agendaItems?.[0]?.event?.id,
          agendaItemId: item.election?.agendaItem?.id || item.amendment?.agendaItems?.[0]?.id,
        });
        break;
      case 'video':
        acc.push({
          id: item.id,
          type: 'video',
          title: item.title || '',
          description: item.description,
          imageUrl: item.videoThumbnailURL || item.imageURL,
          videoUrl: item.videoURL,
          createdAt: toDate(item.createdAt),
          authorId: item.actor?.id,
          authorName: item.actor?.name,
          authorAvatar: item.actor?.avatarUrl,
          groupId: item.group?.id,
          groupName: item.group?.name,
          stats: {
            views: item.views,
            reactions: item.likes,
          },
        });
        break;
      case 'image':
        acc.push({
          id: item.id,
          type: 'image',
          title: item.title || '',
          description: item.description,
          imageUrl: item.imageURL,
          createdAt: toDate(item.createdAt),
          authorId: item.actor?.id,
          authorName: item.actor?.name,
          authorAvatar: item.actor?.avatarUrl,
          groupId: item.group?.id,
          groupName: item.group?.name,
          location: item.location,
          stats: {
            reactions: item.likes,
            comments: item.comments,
          },
        });
        break;
      default:
        break;
    }

    return acc;
  }, []);
}
