import type { User } from '../types/user.types';

/**
 * Transform raw Zero user profile data into the User domain type.
 * Pure function — no React or side effects.
 */
export function transformUserData(userData: any): User {
  const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
  const collaborationsData = userData?.amendment_collaborations || [];

  return {
    id: userData.id,
    name: fullName,
    firstName: userData.first_name || '',
    lastName: userData.last_name || '',
    subtitle: userData.bio || '',
    avatar: userData.avatar || '',

    stats:
      userData?.stats?.map((stat: any) => ({
        label: stat.label,
        value: stat.value,
        unit: stat.unit,
      })) || [],

    contact: {
      email: userData.email || '',
      twitter: userData.x || '',
      website: userData.website || '',
      location: userData.location || '',
    },

    socialMedia: {
      twitter: userData.x,
    },

    about: userData.about || '',

    statements:
      userData?.statements?.map((statement: any) => {
        const supportVotes = statement.support_votes ?? [];
        const survey = statement.surveys?.[0];
        return {
          id: statement.id,
          text: statement.text,
          imageUrl: statement.image_url,
          videoUrl: statement.video_url,
          groupName: statement.group?.name,
          groupAvatar: statement.group?.avatar,
          groupId: statement.group_id,
          supportCount: supportVotes.filter((v: any) => v.vote === 1).length,
          opposeCount: supportVotes.filter((v: any) => v.vote === -1).length,
          commentCount: statement.comment_count ?? 0,
          surveyQuestion: survey?.question,
          surveyOptions: survey?.options?.map((o: any) => ({
            label: o.label,
            voteCount: o.votes?.length ?? 0,
          })),
          hashtags: statement.statement_hashtags?.map((jn: any) => ({
            id: jn.hashtag?.id ?? jn.id,
            tag: jn.hashtag?.tag,
          })).filter((h: any) => h.tag) || [],
        };
      }) || [],

    blogs:
      userData?.blogger_relations
        ?.filter((relation: any) => {
          const hasUpdateRight = relation.role?.action_rights?.some(
            (right: any) => right.resource === 'blogs' && right.action === 'update'
          );
          return hasUpdateRight && relation.blog;
        })
        ?.reduce((acc: any[], relation: any) => {
          const existingIndex = acc.findIndex(b => b.id === relation.blog.id);
          if (existingIndex === -1) {
            acc.push({
              id: relation.blog.id,
              title: relation.blog.title,
              date: relation.blog.date,
              description: relation.blog.description,
              imageURL: relation.blog.image_url,
              commentCount: relation.blog.comment_count || 0,
              hashtags: (relation.blog.blog_hashtags ?? []).map((j: any) => j.hashtag).filter(Boolean),
              authorName: fullName,
              authorAvatar: userData.avatar || '',
            });
          }
          return acc;
        }, []) || [],

    groups:
      userData?.group_memberships
        ?.filter((membership: any) => membership.group)
        ?.reduce((acc: any[], membership: any) => {
          const group = Array.isArray(membership.group) ? membership.group[0] : membership.group;
          if (!group) return acc;
          const existingIndex = acc.findIndex(g => g.id === membership.id);
          if (existingIndex === -1) {
            acc.push({
              id: membership.id,
              groupId: group.id,
              name: group.name,
              members: group.member_count,
              role: Array.isArray(membership.role)
                ? membership.role[0]?.name || 'Member'
                : membership.role?.name || 'Member',
              description: group.description,
              amendments: group.amendments?.length,
              events: group.events?.length,
            });
          }
          return acc;
        }, []) || [],

    amendments:
      collaborationsData?.reduce((acc: any[], collab: any) => {
        if (!collab.amendment) return acc;
        const existingIndex = acc.findIndex(a => a.id === collab.amendment.id);
        if (existingIndex === -1) {
          acc.push({
            id: collab.amendment.id,
            title: collab.amendment.title,
            subtitle: collab.amendment.subtitle,
            status: collab.amendment.status,
            supporters: collab.amendment.supporters,
            date: collab.amendment.date,
            code: collab.amendment.code,
            tags:
              (collab.amendment?.amendment_hashtags ?? []).map((j: any) => j.hashtag?.tag).filter(Boolean) || collab.amendment?.tags,
            groupId: collab.amendment?.group?.id,
            groupName: collab.amendment?.group?.name,
          });
        }
        return acc;
      }, []) || [],

    hashtags:
      (userData?.user_hashtags ?? []).reduce((acc: any[], junction: any) => {
        const h = junction.hashtag;
        if (h && !acc.some((x: any) => x.id === h.id)) {
          acc.push({ id: h.id, tag: h.tag });
        }
        return acc;
      }, []) || [],

    amendmentCollaborationsCount:
      collaborationsData?.filter(
        (collab: any) => collab.status === 'admin' || collab.status === 'collaborator'
      )?.length || 0,
  };
}
