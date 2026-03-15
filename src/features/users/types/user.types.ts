import type { UserFullProfileRow } from '@/zero/users/queries'

/**
 * Re-export the zero-derived user profile row as the canonical type.
 * All consumers should use `UserProfile` (a.k.a. `UserFullProfileRow`) directly,
 * accessing snake_case fields from the Zero sync engine.
 */
export type UserProfile = UserFullProfileRow

/** Derived sub-relation types from the fullProfile query */
export type ProfileStatement = UserProfile['statements'][number]
export type ProfileGroupMembership = UserProfile['group_memberships'][number]
export type ProfileBloggerRelation = UserProfile['blogger_relations'][number]
export type ProfileAmendmentCollaboration = UserProfile['amendment_collaborations'][number]
export type ProfileUserHashtag = UserProfile['user_hashtags'][number]

export interface TabSearchState {
  blogs: string;
  groups: string;
  amendments: string;
}
