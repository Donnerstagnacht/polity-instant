import type { User, UserBlog, UserGroup, UserAmendment, UserHashtag } from '../types/user.types';
import type { FullProfileRow } from '@/zero/users/useUserState';

/**
 * Transform raw Zero user profile data into the User domain type.
 * Pure function — no React or side effects.
 */
export function transformUserData(userData: FullProfileRow): User {
  const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
  const collaborationsData = userData?.amendment_collaborations || [];
  const userStats = [
    { label: 'Subscribers', value: userData?.subscriber_count ?? 0 },
    { label: 'Groups', value: userData?.group_count ?? 0 },
    { label: 'Amendments', value: userData?.amendment_count ?? 0 },
  ];

  return {
    id: userData.id,
    name: fullName,
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    subtitle: userData.bio || '',
    avatar: userData.avatar || '',

    stats: userStats,

    contact: {
      email: userData.email || '',
      twitter: userData.x || '',
      website: userData.website || '',
      location: userData.location || '',
    },

    socialMedia: {
      twitter: userData.x ?? undefined,
    },

    about: userData.about || '',

    statements:
      userData?.statements?.map((statement) => {
        const supportVotes = statement.support_votes ?? [];
        const survey = statement.surveys?.[0];
        return {
          id: statement.id,
          text: statement.text ?? '',
          imageUrl: statement.image_url ?? undefined,
          videoUrl: statement.video_url ?? undefined,
          groupName: statement.group?.name ?? undefined,
          groupAvatar: statement.group?.image_url ?? undefined,
          groupId: statement.group_id ?? undefined,
          supportCount: supportVotes.filter((v) => v.vote === 1).length,
          opposeCount: supportVotes.filter((v) => v.vote === -1).length,
          commentCount: statement.comment_count ?? 0,
          surveyQuestion: survey?.question,
          surveyOptions: survey?.options?.map((o) => ({
            label: o.label,
            voteCount: o.votes?.length ?? 0,
          })),
          hashtags: statement.statement_hashtags?.map((jn) => ({
            id: jn.hashtag?.id ?? jn.id,
            tag: jn.hashtag?.tag ?? '',
          })).filter((h) => h.tag) || [],
        };
      }) || [],

    blogs:
      userData?.blogger_relations
        ?.filter((relation): relation is typeof relation & { blog: NonNullable<typeof relation.blog> } => !!relation.blog)
        ?.reduce((acc: UserBlog[], relation) => {
          const existingIndex = acc.findIndex(b => b.id === relation.blog.id);
          if (existingIndex === -1) {
            acc.push({
              id: relation.blog.id,
              title: relation.blog.title ?? '',
              date: relation.blog.date ?? '',
              description: relation.blog.description ?? undefined,
              imageURL: relation.blog.image_url ?? undefined,
              commentCount: relation.blog.comment_count || 0,
              groupId: relation.blog.group_id || null,
              hashtags: (relation.blog.blog_hashtags ?? []).map((j) => j.hashtag).filter((h): h is NonNullable<typeof h> => !!h),
              authorName: fullName,
              authorAvatar: userData.avatar || '',
            });
          }
          return acc;
        }, []) || [],

    groups:
      userData?.group_memberships
        ?.filter((membership) => membership.group)
        ?.reduce((acc: UserGroup[], membership) => {
          const group = membership.group;
          if (!group) return acc;
          const existingIndex = acc.findIndex(g => g.id === membership.id);
          if (existingIndex === -1) {
            acc.push({
              id: membership.id,
              groupId: group.id,
              name: group.name ?? '',
              members: group.member_count ?? 0,
              role: membership.role?.name || 'Member',
              description: group.description ?? undefined,
              amendments: group.amendment_count ?? group.amendments?.length,
              events: group.event_count ?? group.events?.length,
            });
          }
          return acc;
        }, []) || [],

    amendments:
      collaborationsData?.reduce((acc: UserAmendment[], collab) => {
        if (!collab.amendment) return acc;
        const existingIndex = acc.findIndex(a => a.id === Number(collab.amendment!.id));
        if (existingIndex === -1) {
          const hashtagTags = (collab.amendment?.amendment_hashtags ?? []).map((j) => j.hashtag?.tag).filter((t): t is string => !!t);
          const rawTags = collab.amendment.tags;
          acc.push({
            id: Number(collab.amendment.id),
            title: collab.amendment.title ?? '',
            subtitle: collab.amendment.reason ?? undefined,
            status: (collab.amendment.status as UserAmendment['status']) ?? 'Drafting',
            supporters: collab.amendment.supporters ?? 0,
            date: String(collab.amendment.created_at),
            code: collab.amendment.code ?? undefined,
            tags: hashtagTags.length > 0
              ? hashtagTags
              : Array.isArray(rawTags) ? rawTags.filter((t): t is string => typeof t === 'string') : undefined,
            groupId: collab.amendment?.group?.id,
            groupName: collab.amendment?.group?.name ?? undefined,
          });
        }
        return acc;
      }, []) || [],

    hashtags:
      (userData?.user_hashtags ?? []).reduce((acc: UserHashtag[], junction) => {
        const h = junction.hashtag;
        if (h?.id && h?.tag && !acc.some((x) => x.id === h.id)) {
          acc.push({ id: h.id, tag: h.tag });
        }
        return acc;
      }, []) || [],

    amendmentCollaborationsCount:
      collaborationsData?.filter(
        (collab) => collab.status === 'admin' || collab.status === 'collaborator'
      )?.length || 0,
  };
}
