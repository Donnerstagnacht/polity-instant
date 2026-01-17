/**
 * All notification types supported by the system
 * Organized by entity category
 */
export type NotificationType =
  // Legacy types (for backwards compatibility)
  | 'group_invite'
  | 'event_invite'
  | 'message'
  | 'follow'
  | 'mention'
  | 'event_update'
  | 'group_update'
  // Group Notifications (1.x)
  | 'membership_request'           // 1.1: User requests to join
  | 'membership_approved'          // 1.2: Request approved
  | 'membership_rejected'          // 1.2: Request rejected
  | 'membership_invite'            // 1.3: User invited
  | 'membership_withdrawn'         // Member left/withdrew
  | 'member_removed'               // 1.4: Member removed
  | 'group_new_event'              // 1.5: New event created
  | 'group_new_amendment'          // 1.6: New amendment linked
  | 'group_profile_updated'        // 1.7: Profile updated
  | 'group_new_subscriber'         // 1.8: New subscriber
  | 'group_link_added'             // 1.9: Link added
  | 'group_link_removed'           // 1.9: Link removed
  | 'group_document_added'         // 1.10: Document added
  | 'group_document_removed'       // 1.10: Document removed
  | 'group_admin_promoted'         // 1.11: Member promoted to admin
  | 'group_admin_demoted'          // 1.12: Admin demoted to member
  | 'group_role_created'           // 1.13: Role created
  | 'group_role_deleted'           // 1.13: Role deleted
  | 'group_role_updated'           // 1.14: Role action rights changed
  | 'group_todo_assigned'          // 1.15: Todo assigned
  | 'group_todo_updated'           // 1.15: Todo updated
  | 'group_payment_created'        // 1.16: Payment created
  | 'group_payment_deleted'        // 1.16: Payment deleted
  | 'group_relationship_request'   // 1.17: Relationship requested
  | 'group_relationship_approved'  // 1.17: Relationship approved
  | 'group_relationship_rejected'  // 1.17: Relationship rejected
  | 'group_position_created'       // 1.18: Position created
  | 'group_position_assigned'      // 1.19: Position assigned
  | 'group_position_vacated'       // 1.20: Position vacated
  | 'group_election_created'       // 1.21: Election created
  | 'group_election_results'       // 1.22: Election results
  | 'group_invitation_accepted'    // 1.23: Invitation accepted
  | 'group_invitation_declined'    // 1.24: Invitation declined
  | 'group_request_withdrawn'      // 1.25: Request withdrawn
  // Event Notifications (2.x)
  | 'participation_request'        // 2.1: User requests participation
  | 'participation_approved'       // 2.2: Request approved
  | 'participation_rejected'       // 2.2: Request rejected
  | 'participation_invite'         // 2.3: User invited
  | 'participation_withdrawn'      // Participant left/withdrew
  | 'participant_removed'          // 2.4: Participant removed
  | 'event_profile_updated'        // 2.5: Profile updated
  | 'event_new_subscriber'         // 2.6: New subscriber
  | 'event_organizer_promoted'     // 2.7: Promoted to organizer
  | 'event_organizer_demoted'      // 2.8: Demoted from organizer
  | 'event_agenda_item_created'    // 2.9: Agenda item created
  | 'event_agenda_item_deleted'    // 2.9: Agenda item deleted
  | 'event_schedule_changed'       // 2.10: Schedule changed
  | 'event_candidate_added'        // 2.11: Election candidate added
  | 'event_election_started'       // 2.11: Election started
  | 'event_election_ended'         // 2.11: Election ended
  | 'event_position_created'       // 2.12: Position created
  | 'event_position_deleted'       // 2.12: Position deleted
  | 'event_delegates_finalized'    // 2.13: Delegates finalized
  | 'event_delegate_nominated'     // 2.13: Delegate nominated
  | 'event_meeting_booked'         // 2.14: Meeting booked
  | 'event_meeting_cancelled'      // 2.14: Meeting cancelled
  | 'event_speaker_added'          // 2.15: Speaker added
  | 'event_invitation_accepted'    // 2.16: Invitation accepted
  | 'event_invitation_declined'    // 2.17: Invitation declined
  | 'event_request_withdrawn'      // 2.18: Request withdrawn
  // Amendment Notifications (3.x)
  | 'collaboration_request'        // 3.1: Collaboration requested
  | 'collaboration_approved'       // 3.2: Collaboration approved
  | 'collaboration_rejected'       // 3.2: Collaboration rejected
  | 'collaboration_invite'         // 3.3: Collaborator invited
  | 'collaboration_withdrawn'      // Collaborator left/withdrew
  | 'collaborator_removed'         // 3.4: Collaborator removed
  | 'amendment_profile_updated'    // 3.5: Profile updated
  | 'amendment_new_subscriber'     // 3.6: New subscriber
  | 'amendment_owner_promoted'     // 3.7: Promoted to owner
  | 'amendment_owner_demoted'      // 3.8: Demoted from owner
  | 'amendment_workflow_changed'   // 3.9: Workflow changed
  | 'amendment_path_advanced'      // 3.10: Path advanced
  | 'amendment_cloned'             // 3.11: Amendment cloned
  | 'amendment_group_support'      // 3.12: Group support added
  | 'amendment_comment_added'      // 3.13: Comment added
  | 'change_request_created'       // 3.14: Change request created
  | 'change_request_accepted'      // 3.14: Change request accepted
  | 'change_request_rejected'      // 3.14: Change request rejected
  | 'amendment_version_created'    // 3.15: Version created
  | 'voting_session_started'       // 3.16: Voting session started
  | 'voting_session_completed'     // 3.16: Voting session completed
  | 'amendment_vote_cast'          // Support vote cast
  | 'collaboration_invitation_accepted'   // 3.17: Invitation accepted
  | 'collaboration_invitation_declined'   // 3.18: Invitation declined
  | 'collaboration_request_withdrawn'     // 3.19: Request withdrawn
  // Blog Notifications (4.x)
  | 'blog_new_subscriber'          // 4.1: New subscriber
  | 'blog_vote_cast'               // 4.2: Vote cast
  | 'blog_updated'                 // 4.3: Blog updated
  | 'blog_published'               // 4.3: Blog published
  | 'blog_writer_joined'           // 4.4: Writer joined
  | 'blog_role_changed'            // 4.5: Role changed
  | 'blog_comment_added'           // 4.6: Comment added
  | 'blog_writer_request'          // 4.7: Writer request
  | 'blog_writer_invite'           // 4.8: Writer invitation
  | 'blog_writer_removed'          // 4.9: Writer removed
  | 'blog_role_created'            // 4.10: Role created
  | 'blog_role_deleted'            // 4.11: Role deleted
  | 'blog_invitation_accepted'     // 4.12: Invitation accepted
  | 'blog_invitation_declined'     // 4.13: Invitation declined
  | 'blog_request_withdrawn'       // 4.14: Request withdrawn
  | 'blog_writer_left'             // 4.15: Writer left
  // Todo Notifications (5.x)
  | 'todo_assigned'                // 5.1: Task assigned
  | 'todo_updated'                 // 5.2: Task updated
  | 'todo_completed'               // 5.3: Task completed
  | 'todo_due_soon'                // 5.4: Task due soon
  | 'todo_overdue'                 // 5.5: Task overdue
  // Statement Notifications (6.x)
  | 'statement_response'           // 6.1: Statement response
  | 'statement_mention'            // 6.2: Statement mention
  // User/Social Notifications (7.x)
  | 'new_follower'                 // 7.1: New follower
  | 'profile_mention'              // 7.2: Profile mention
  | 'direct_message'               // 7.3: Direct message
  | 'conversation_request'         // 7.4: Conversation request
  | 'conversation_accepted'        // Conversation accepted
  // Additional Notifications (8.x)
  | 'position_assigned'            // 8.1: Position assigned
  | 'position_removed'             // 8.1: Position removed
  | 'election_results_published'   // 8.2: Election results
  | 'subscription_status_changed'  // 8.3: Subscription changed
  | 'payment_succeeded'            // 8.3: Payment succeeded
  | 'payment_failed'               // 8.3: Payment failed
  | 'file_shared'                  // 8.4: File shared
  | 'hashtag_mentioned'            // 8.5: Hashtag mentioned
  | 'recurring_event_updated';     // 8.6: Recurring event updated

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string | number;
  actionUrl?: string;
  relatedEntityType?: 'group' | 'event' | 'user' | 'message' | 'blog' | 'amendment';
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  recipient?: {
    id: string;
  };
  relatedUser?: {
    id: string;
  };
  relatedGroup?: {
    id: string;
    name?: string;
    imageURL?: string;
  };
  relatedEvent?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  relatedAmendment?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  relatedBlog?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  onBehalfOfGroup?: {
    id: string;
    name?: string;
    imageURL?: string;
  };
  onBehalfOfEvent?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  onBehalfOfAmendment?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  onBehalfOfBlog?: {
    id: string;
    title?: string;
    imageURL?: string;
  };
  recipientGroup?: {
    id: string;
    name?: string;
    imageURL?: string;
    memberships?: Array<{
      role?: {
        actionRights?: Array<{
          resource: string;
          action: string;
        }>;
      };
    }>;
  };
  recipientEvent?: {
    id: string;
    title?: string;
    imageURL?: string;
    participants?: Array<{
      role?: {
        actionRights?: Array<{
          resource: string;
          action: string;
        }>;
      };
    }>;
  };
  recipientAmendment?: {
    id: string;
    title?: string;
    imageURL?: string;
    amendmentRoleCollaborators?: Array<{
      role?: {
        actionRights?: Array<{
          resource: string;
          action: string;
        }>;
      };
    }>;
  };
  recipientBlog?: {
    id: string;
    title?: string;
    imageURL?: string;
    blogRoleBloggers?: Array<{
      role?: {
        actionRights?: Array<{
          resource: string;
          action: string;
        }>;
      };
    }>;
  };
}

export interface NotificationFilters {
  all: Notification[];
  unread: Notification[];
  read: Notification[];
  personal: Notification[];
  entity: Notification[];
}
