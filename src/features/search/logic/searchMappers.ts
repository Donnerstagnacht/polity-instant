import type { SearchContentItem } from '../types/search.types';

export function toTags(hashtags?: Array<{ tag?: string | null }>): string[] {
  if (!hashtags) return [];
  return hashtags.map(tag => tag?.tag).filter((tag): tag is string => Boolean(tag));
}

export function toDate(value?: string | Date | null): Date {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
}

/**
 * Maps raw mosaic search results (with `_type` discriminator) into a flat
 * `SearchContentItem[]` that the UI can render uniformly.
 */
export function mapMosaicToContentItems(
  mosaicResults: any[],
  agendaItemsByEventId: Map<string, Array<{ election?: unknown; amendmentVote?: unknown }>>,
): SearchContentItem[] {
  if (!mosaicResults || mosaicResults.length === 0) return [];

  return mosaicResults.reduce<SearchContentItem[]>((acc, item: any) => {
    switch (item._type) {
      case 'group':
        acc.push({
          id: item.id,
          type: 'group',
          title: item.name,
          description: item.description,
          createdAt: toDate(item.createdAt),
          tags: toTags(item.hashtags),
          groupId: item.id,
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
          createdAt: toDate(item.createdAt || item.startDate),
          startDate: item.startDate ? new Date(item.startDate) : undefined,
          endDate: item.endDate ? new Date(item.endDate) : undefined,
          location: item.location || item.locationName,
          city: item.city,
          postcode: item.postalCode,
          attendeeCount: item.participants?.length,
          electionsCount:
            item.eventPositions?.filter((position: any) => Boolean(position?.election)).length ??
            item.scheduledElections?.length ??
            agendaItemsByEventId
              .get(item.id)
              ?.filter((agendaItem: any) => Boolean(agendaItem?.election)).length ??
            item.votingSessions?.filter((session: any) => Boolean(session?.election)).length,
          amendmentsCount: item.targetedAmendments?.length,
          tags: toTags(item.hashtags),
          groupId: item.group?.id,
          groupName: item.group?.name,
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
          tags: toTags(item.hashtags),
          status: item.workflowStatus || item.status,
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
        const blogAuthor = (item.blogRoleBloggers || [])
          .map((relation: any) => relation?.user)
          .find(Boolean);
        acc.push({
          id: item.id,
          type: 'blog',
          title: item.title,
          description: item.description,
          imageUrl: item.imageURL || item.imageUrl,
          createdAt: toDate(item.createdAt),
          tags: toTags(item.hashtags),
          authorId: blogAuthor?.id,
          authorName: blogAuthor?.name,
          authorAvatar: blogAuthor?.avatarUrl,
          commentCount: item.comments?.length,
          stats: {
            reactions: item.votes?.length,
            comments: item.comments?.length,
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
          createdAt: toDate(item.createdAt),
          tags: toTags(item.hashtags),
          authorId: item.user?.id,
          authorName: item.user?.name,
          authorAvatar: item.user?.avatarUrl,
          groupName: item.tag || item.type,
          stats: {
            comments: item.comments?.length,
            reactions: item.reactions?.length,
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
          title: item.name || '',
          description: item.bio,
          createdAt: toDate(item.createdAt || item.joinedAt),
          tags: toTags(item.hashtags),
          authorId: item.id,
          authorName: item.name,
          authorAvatar: item.imageURL || item.avatarUrl,
          handle: item.handle,
          subtitle: item.subtitle,
          location: item.contactLocation,
          groupCount: item.memberships?.length,
          amendmentCount: item.collaborations?.length,
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
            reactions: item.votes?.filter((v: any) => v.vote === 'accept')?.length || 0,
            comments: item.votes?.filter((v: any) => v.vote === 'reject')?.length || 0,
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
