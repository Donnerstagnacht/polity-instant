export interface UserStat {
  label: string;
  value: number;
  unit?: string;
}

export interface UserContact {
  email: string;
  twitter: string;
  website: string;
  location: string;
}

export interface UserSocialMedia {
  whatsapp?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  snapchat?: string;
}

export interface UserStatement {
  id: number;
  text: string;
  tag: string;
}

export interface UserBlog {
  id: number;
  title: string;
  date: string;
  description?: string;
  imageURL?: string;
  commentCount?: number;
  comments?: number; // Legacy support
  supporters?: number; // Legacy support
  likes?: number; // Legacy support
  hashtags?: { id: string; tag: string }[];
  authorName?: string;
  authorAvatar?: string;
}

export interface UserGroup {
  id: number | string; // Membership ID for unique keys
  groupId?: string; // Actual group ID for navigation
  name: string;
  members: number;
  role: string;
  description?: string;
  tags?: string[];
  amendments?: number;
  events?: number;
  abbr?: string;
}

export interface UserAmendment {
  id: number;
  title: string;
  subtitle?: string;
  status: 'Passed' | 'Rejected' | 'Under Review' | 'Drafting';
  supporters: number;
  date: string;
  code?: string;
  tags?: string[];
  groupId?: string;
  groupName?: string;
}

export interface UserHashtag {
  id: string;
  tag: string;
}

export interface User {
  id: string; // Add the user ID
  name: string;
  subtitle: string;
  avatar: string;
  stats: UserStat[];
  about: string;
  contact: UserContact;
  socialMedia: UserSocialMedia;
  statements: UserStatement[];
  blogs: UserBlog[];
  groups: UserGroup[];
  amendments: UserAmendment[];
  hashtags: UserHashtag[];
  amendmentCollaborationsCount?: number;
}

export interface TabSearchState {
  blogs: string;
  groups: string;
  amendments: string;
}
