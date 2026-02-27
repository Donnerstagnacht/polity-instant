import {
  Bell,
  Calendar,
  MessageSquare,
  UserPlus,
  Users,
  UserMinus,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ShieldX,
  FileText,
  File,
  FilePlus,
  FileX,
  Link,
  LinkIcon,
  Unlink,
  Settings,
  Star,
  Vote,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Workflow,
  GitBranch,
  Copy,
  Target,
  CreditCard,
  Briefcase,
  Edit,
  Trash2,
  Radio,
  Hash,
  Megaphone,
  BookOpen,
  PenTool,
  type LucideIcon,
} from 'lucide-react';
import { NotificationType } from '../types/notification.types';

// ── Icon Mapping ─────────────────────────────────────────────────────

const NOTIFICATION_ICON_MAP: Record<string, LucideIcon> = {
  // Legacy
  group_invite: Users,
  event_invite: Calendar,
  message: MessageSquare,
  follow: UserPlus,
  mention: Bell,
  event_update: Calendar,
  group_update: Users,

  // Group — Membership
  membership_request: UserPlus,
  membership_approved: UserCheck,
  membership_rejected: UserX,
  membership_invite: UserPlus,
  membership_withdrawn: UserMinus,
  member_removed: UserMinus,
  group_invitation_accepted: UserCheck,
  group_invitation_declined: UserX,
  group_request_withdrawn: UserMinus,

  // Group — Content
  group_new_event: Calendar,
  group_new_amendment: FileText,
  group_profile_updated: Edit,
  group_new_subscriber: Star,
  group_link_added: LinkIcon,
  group_link_removed: Unlink,
  group_document_added: FilePlus,
  group_document_removed: FileX,

  // Group — Admin
  group_admin_promoted: ShieldCheck,
  group_admin_demoted: ShieldX,
  group_role_created: Shield,
  group_role_deleted: Shield,
  group_role_updated: Shield,

  // Group — Todos
  group_todo_assigned: CheckCircle,
  group_todo_updated: Edit,

  // Group — Payments
  group_payment_created: CreditCard,
  group_payment_deleted: CreditCard,

  // Group — Relationships
  group_relationship_request: Link,
  group_relationship_approved: Link,
  group_relationship_rejected: Unlink,

  // Group — Positions & Elections
  group_position_created: Briefcase,
  group_position_assigned: Briefcase,
  group_position_vacated: Briefcase,
  group_election_created: Vote,
  group_election_results: Vote,

  // Event — Participation
  participation_request: UserPlus,
  participation_approved: UserCheck,
  participation_rejected: UserX,
  participation_invite: UserPlus,
  participation_withdrawn: UserMinus,
  participant_removed: UserMinus,
  event_invitation_accepted: UserCheck,
  event_invitation_declined: UserX,
  event_request_withdrawn: UserMinus,

  // Event — Content
  event_profile_updated: Edit,
  event_new_subscriber: Star,
  event_organizer_promoted: ShieldCheck,
  event_organizer_demoted: ShieldX,
  event_agenda_item_created: FileText,
  event_agenda_item_deleted: FileX,
  event_schedule_changed: Calendar,

  // Event — Elections & Positions
  event_candidate_added: UserPlus,
  event_election_started: Vote,
  event_election_ended: Vote,
  event_position_created: Briefcase,
  event_position_deleted: Briefcase,
  event_delegates_finalized: Users,
  event_delegate_nominated: UserCheck,

  // Event — Meetings & Speakers
  event_meeting_booked: Calendar,
  event_meeting_cancelled: XCircle,
  event_speaker_added: Megaphone,

  // Amendment — Collaboration
  collaboration_request: UserPlus,
  collaboration_approved: UserCheck,
  collaboration_rejected: UserX,
  collaboration_invite: UserPlus,
  collaboration_withdrawn: UserMinus,
  collaborator_removed: UserMinus,
  collaboration_invitation_accepted: UserCheck,
  collaboration_invitation_declined: UserX,
  collaboration_request_withdrawn: UserMinus,

  // Amendment — Content
  amendment_profile_updated: Edit,
  amendment_new_subscriber: Star,
  amendment_owner_promoted: ShieldCheck,
  amendment_owner_demoted: ShieldX,
  amendment_workflow_changed: Workflow,
  amendment_path_advanced: GitBranch,
  amendment_cloned: Copy,
  amendment_group_support: Users,
  amendment_target_set: Target,
  amendment_comment_added: MessageSquare,

  // Amendment — Change Requests
  change_request_created: FilePlus,
  change_request_accepted: CheckCircle,
  change_request_rejected: XCircle,
  change_request_vote_cast: Vote,
  amendment_version_created: File,

  // Amendment — Voting
  voting_session_started: Vote,
  voting_session_completed: Vote,
  amendment_vote_cast: Vote,
  amendment_rejected: XCircle,

  // Blog
  blog_new_subscriber: Star,
  blog_vote_cast: Vote,
  blog_updated: Edit,
  blog_published: BookOpen,
  blog_deleted: Trash2,
  blog_writer_joined: UserPlus,
  blog_role_changed: Shield,
  blog_comment_added: MessageSquare,
  blog_writer_request: UserPlus,
  blog_writer_invite: UserPlus,
  blog_writer_removed: UserMinus,
  blog_role_created: Shield,
  blog_role_deleted: Shield,
  blog_invitation_accepted: UserCheck,
  blog_invitation_declined: UserX,
  blog_request_withdrawn: UserMinus,
  blog_writer_left: UserMinus,

  // Todos
  todo_assigned: CheckCircle,
  todo_updated: Edit,
  todo_completed: CheckCircle,
  todo_due_soon: Clock,
  todo_overdue: AlertTriangle,

  // Statements
  statement_response: MessageSquare,
  statement_mention: Bell,

  // Social
  new_follower: UserPlus,
  profile_mention: Bell,
  direct_message: MessageSquare,
  conversation_request: MessageSquare,
  conversation_accepted: MessageSquare,

  // Additional
  position_assigned: Briefcase,
  position_removed: Briefcase,
  election_results_published: Vote,
  subscription_status_changed: Bell,
  payment_succeeded: CreditCard,
  payment_failed: CreditCard,
  file_shared: File,
  hashtag_mentioned: Hash,
  recurring_event_updated: Calendar,
};

// ── Color Mapping ────────────────────────────────────────────────────

const NOTIFICATION_COLOR_MAP: Record<string, string> = {
  // Legacy
  group_invite: 'text-blue-500',
  event_invite: 'text-purple-500',
  message: 'text-green-500',
  follow: 'text-pink-500',
  mention: 'text-orange-500',
  event_update: 'text-indigo-500',
  group_update: 'text-cyan-500',

  // Group — Membership (blue tones)
  membership_request: 'text-blue-500',
  membership_approved: 'text-green-500',
  membership_rejected: 'text-red-500',
  membership_invite: 'text-blue-400',
  membership_withdrawn: 'text-slate-500',
  member_removed: 'text-red-500',
  group_invitation_accepted: 'text-green-500',
  group_invitation_declined: 'text-red-500',
  group_request_withdrawn: 'text-slate-500',

  // Group — Content (cyan tones)
  group_new_event: 'text-purple-500',
  group_new_amendment: 'text-amber-500',
  group_profile_updated: 'text-cyan-500',
  group_new_subscriber: 'text-yellow-500',
  group_link_added: 'text-cyan-400',
  group_link_removed: 'text-slate-500',
  group_document_added: 'text-cyan-400',
  group_document_removed: 'text-slate-500',

  // Group — Admin (slate tones)
  group_admin_promoted: 'text-emerald-500',
  group_admin_demoted: 'text-orange-500',
  group_role_created: 'text-slate-500',
  group_role_deleted: 'text-slate-500',
  group_role_updated: 'text-slate-500',

  // Group — Todos
  group_todo_assigned: 'text-blue-500',
  group_todo_updated: 'text-blue-400',

  // Group — Payments
  group_payment_created: 'text-emerald-500',
  group_payment_deleted: 'text-red-500',

  // Group — Relationships
  group_relationship_request: 'text-blue-500',
  group_relationship_approved: 'text-green-500',
  group_relationship_rejected: 'text-red-500',

  // Group — Positions & Elections
  group_position_created: 'text-violet-500',
  group_position_assigned: 'text-violet-500',
  group_position_vacated: 'text-slate-500',
  group_election_created: 'text-violet-500',
  group_election_results: 'text-violet-500',

  // Event — Participation (purple tones)
  participation_request: 'text-purple-500',
  participation_approved: 'text-green-500',
  participation_rejected: 'text-red-500',
  participation_invite: 'text-purple-400',
  participation_withdrawn: 'text-slate-500',
  participant_removed: 'text-red-500',
  event_invitation_accepted: 'text-green-500',
  event_invitation_declined: 'text-red-500',
  event_request_withdrawn: 'text-slate-500',

  // Event — Content (indigo tones)
  event_profile_updated: 'text-indigo-500',
  event_new_subscriber: 'text-yellow-500',
  event_organizer_promoted: 'text-emerald-500',
  event_organizer_demoted: 'text-orange-500',
  event_agenda_item_created: 'text-indigo-400',
  event_agenda_item_deleted: 'text-slate-500',
  event_schedule_changed: 'text-indigo-500',

  // Event — Elections & Positions
  event_candidate_added: 'text-violet-500',
  event_election_started: 'text-violet-500',
  event_election_ended: 'text-violet-500',
  event_position_created: 'text-violet-500',
  event_position_deleted: 'text-slate-500',
  event_delegates_finalized: 'text-violet-500',
  event_delegate_nominated: 'text-violet-400',

  // Event — Meetings & Speakers
  event_meeting_booked: 'text-purple-500',
  event_meeting_cancelled: 'text-red-500',
  event_speaker_added: 'text-purple-400',

  // Amendment — Collaboration (amber tones)
  collaboration_request: 'text-amber-500',
  collaboration_approved: 'text-green-500',
  collaboration_rejected: 'text-red-500',
  collaboration_invite: 'text-amber-400',
  collaboration_withdrawn: 'text-slate-500',
  collaborator_removed: 'text-red-500',
  collaboration_invitation_accepted: 'text-green-500',
  collaboration_invitation_declined: 'text-red-500',
  collaboration_request_withdrawn: 'text-slate-500',

  // Amendment — Content (amber/orange tones)
  amendment_profile_updated: 'text-amber-500',
  amendment_new_subscriber: 'text-yellow-500',
  amendment_owner_promoted: 'text-emerald-500',
  amendment_owner_demoted: 'text-orange-500',
  amendment_workflow_changed: 'text-amber-400',
  amendment_path_advanced: 'text-amber-400',
  amendment_cloned: 'text-amber-400',
  amendment_group_support: 'text-blue-500',
  amendment_target_set: 'text-amber-500',
  amendment_comment_added: 'text-green-500',

  // Amendment — Change Requests
  change_request_created: 'text-amber-500',
  change_request_accepted: 'text-green-500',
  change_request_rejected: 'text-red-500',
  change_request_vote_cast: 'text-violet-500',
  amendment_version_created: 'text-amber-400',

  // Amendment — Voting
  voting_session_started: 'text-violet-500',
  voting_session_completed: 'text-violet-500',
  amendment_vote_cast: 'text-violet-500',
  amendment_rejected: 'text-red-500',

  // Blog (rose tones)
  blog_new_subscriber: 'text-yellow-500',
  blog_vote_cast: 'text-violet-500',
  blog_updated: 'text-rose-500',
  blog_published: 'text-rose-500',
  blog_deleted: 'text-red-500',
  blog_writer_joined: 'text-rose-400',
  blog_role_changed: 'text-slate-500',
  blog_comment_added: 'text-green-500',
  blog_writer_request: 'text-rose-500',
  blog_writer_invite: 'text-rose-400',
  blog_writer_removed: 'text-red-500',
  blog_role_created: 'text-slate-500',
  blog_role_deleted: 'text-slate-500',
  blog_invitation_accepted: 'text-green-500',
  blog_invitation_declined: 'text-red-500',
  blog_request_withdrawn: 'text-slate-500',
  blog_writer_left: 'text-slate-500',

  // Todos (blue tones)
  todo_assigned: 'text-blue-500',
  todo_updated: 'text-blue-400',
  todo_completed: 'text-green-500',
  todo_due_soon: 'text-orange-500',
  todo_overdue: 'text-red-500',

  // Statements
  statement_response: 'text-green-500',
  statement_mention: 'text-orange-500',

  // Social (pink tones)
  new_follower: 'text-pink-500',
  profile_mention: 'text-orange-500',
  direct_message: 'text-green-500',
  conversation_request: 'text-blue-500',
  conversation_accepted: 'text-green-500',

  // Additional
  position_assigned: 'text-violet-500',
  position_removed: 'text-slate-500',
  election_results_published: 'text-violet-500',
  subscription_status_changed: 'text-yellow-500',
  payment_succeeded: 'text-emerald-500',
  payment_failed: 'text-red-500',
  file_shared: 'text-cyan-500',
  hashtag_mentioned: 'text-orange-500',
  recurring_event_updated: 'text-indigo-500',
};

// ── Public API ───────────────────────────────────────────────────────

/** @deprecated Use getNotificationIcon() instead */
export const notificationIcons: Partial<Record<NotificationType, LucideIcon>> = {
  group_invite: Users,
  event_invite: Calendar,
  message: MessageSquare,
  follow: UserPlus,
  mention: Bell,
  event_update: Calendar,
  group_update: Users,
};

/** @deprecated Use getNotificationColor() instead */
export const notificationColors: Partial<Record<NotificationType, string>> = {
  group_invite: 'text-blue-500',
  event_invite: 'text-purple-500',
  message: 'text-green-500',
  follow: 'text-pink-500',
  mention: 'text-orange-500',
  event_update: 'text-indigo-500',
  group_update: 'text-cyan-500',
};

/**
 * Get the icon for a notification type. Falls back to Bell.
 */
export function getNotificationIcon(type: NotificationType): LucideIcon {
  return NOTIFICATION_ICON_MAP[type] ?? Bell;
}

/**
 * Get the color class for a notification type. Falls back to text-slate-500.
 */
export function getNotificationColor(type: NotificationType): string {
  return NOTIFICATION_COLOR_MAP[type] ?? 'text-slate-500';
}
