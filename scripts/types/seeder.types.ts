/**
 * Type definitions for the seeding system
 */

/**
 * Context object passed between seeders
 * Contains database instance, transaction builder, and arrays of created entity IDs
 */
export interface SeedContext {
  db: any;
  tx: any;
  userIds: string[];
  groupIds: string[];
  eventIds: string[];
  amendmentIds: string[];
  blogIds: string[];
  positionIds: string[];
  eventPositionIds?: string[];
  statementIds: string[];
  agendaItemIds: string[];
  electionCandidateIds: string[];
  changeRequestIds: string[];
  commentIds: string[];
  commentVoteIds: string[];
  voteIds: string[];
  notificationIds: string[];
  messageIds: string[];
  conversationIds: string[];
  participantIds: string[];
  paymentIds: string[];
  hashtagIds: string[];
  documentIds: string[];
  todoIds: string[];
  linkIds?: string[];
  followIds?: string[];
  subscriptionIds?: string[];
  invitationIds?: string[];
  requestIds?: string[];
  roleIds?: string[];
  blogRoleIds?: string[];
  actionRightIds?: string[];
  bloggerIds?: string[];
  meetingSlotIds?: string[];
  bookingIds?: string[];
  stripeCustomerIds?: string[];
  stripeSubscriptionIds?: string[];
  stripePaymentIds?: string[];
  timelineEventIds?: string[];
  reactionIds?: string[];
  amendmentPathIds?: string[];
  amendmentVoteIds?: string[];
  electionIds?: string[];
  groupRelationshipIds?: string[];
  eventOrganizers?: Map<string, string>;
  eventRoleMappings?: Map<string, { organizerId: string; participantId: string }>;
  groupMemberships?: Map<string, Set<string>>;

  // Link counters
  linkCounts?: {
    // Amendments
    amendmentsToUsers?: number;
    amendmentsToGroups?: number;

    // Blogs
    blogsToUsers?: number;
    blogsToGroups?: number;

    // Events
    eventsToOrganizers?: number;
    eventsToGroups?: number;
    participantsToEvents?: number;
    participantsToUsers?: number;

    // Follows
    followsToFollowers?: number;
    followsToFollowees?: number;

    // Groups
    groupsToOwners?: number;
    groupMembershipsToUsers?: number;
    groupMembershipsToGroups?: number;
    groupMembershipsToRoles?: number;
    rolesToGroups?: number;
    actionRightsToRoles?: number;
    actionRightsToGroups?: number;
    conversationsToGroups?: number;
    conversationsToRequestedBy?: number;
    conversationParticipantsToConversations?: number;
    conversationParticipantsToUsers?: number;
    messagesToConversations?: number;
    messagesToSenders?: number;

    // Invitations
    groupInvitationsToUsers?: number;
    groupInvitationsToGroups?: number;
    groupRequestsToUsers?: number;
    groupRequestsToGroups?: number;
    eventInvitationsToUsers?: number;
    eventInvitationsToEvents?: number;
    eventRequestsToUsers?: number;
    eventRequestsToEvents?: number;
    eventAdminsToUsers?: number;
    eventAdminsToEvents?: number;
    amendmentInvitationsToUsers?: number;
    amendmentInvitationsToAmendments?: number;
    amendmentRequestsToUsers?: number;
    amendmentRequestsToAmendments?: number;
    amendmentAdminsToUsers?: number;
    amendmentAdminsToAmendments?: number;

    // Positions
    positionsToGroups?: number;
    positionsToHolders?: number;
    eventPositionsToEvents?: number;
    eventPositionHoldersCount?: number;

    // Stripe
    stripeCustomersToUsers?: number;
    stripeSubscriptionsToCustomers?: number;
    stripePaymentsToSubscriptions?: number;

    // Conversations
    directConversationsToRequestedBy?: number;
    directParticipantsToConversations?: number;
    directParticipantsToUsers?: number;
    directMessagesToConversations?: number;
    directMessagesToSenders?: number;
    // Group Relationships
    groupRelationshipsToParentGroups?: number;
    groupRelationshipsToChildGroups?: number;

    // Payments
    paymentsToPayerGroups?: number;
    paymentsToReceiverGroups?: number;
    paymentsToPayerUsers?: number;
    paymentsToReceiverUsers?: number;

    // Todos
    todosToCreators?: number;
    todosToGroups?: number;

    // Documents
    documentsToOwners?: number;

    // Links
    linksToGroups?: number;

    // Notifications
    notificationsToRecipients?: number;
    notificationsToSenders?: number;
    notificationsToRelatedGroups?: number;
    notificationsToRelatedEvents?: number;
    notificationsToRelatedAmendments?: number;
    notificationsToRelatedUsers?: number;

    // Subscriptions
    subscriptionsToSubscribers?: number;
    subscriptionsToSubscribedUsers?: number;
    subscriptionsToSubscribedGroups?: number;
    subscriptionsToSubscribedEvents?: number;
    subscriptionsToSubscribedAmendments?: number;
    subscriptionsToSubscribedBlogs?: number;

    // Meeting Slots
    meetingSlotsToOwners?: number;
    meetingBookingsToSlots?: number;
    meetingBookingsToBookers?: number;

    // Users
    statsToUsers?: number;
    statementsToUsers?: number;
    hashtagsToUsers?: number;

    // Timeline Events
    timelineEventsToActors?: number;
    timelineEventsToAmendments?: number;
    timelineEventsToEvents?: number;
    timelineEventsToBlogs?: number;
    timelineEventsToGroups?: number;
    timelineEventsToUsers?: number;
    timelineEventsToStatements?: number;
    timelineEventsToElections?: number;
    timelineEventsToAmendmentVotes?: number;

    // Reactions
    reactionsToUsers?: number;
    reactionsToTimelineEvents?: number;

    // Tobias Subscriptions
    tobiasSubscribersToUsers?: number;
    tobiasSubscribersToGroups?: number;
    tobiasSubscribersToAmendments?: number;
    tobiasSubscribersToEvents?: number;
    tobiasSubscribersToBlogs?: number;

    // RBAC
    rolesToEvents?: number;
    rolesToAmendments?: number;
    rolesToBlogs?: number;
    actionRightsToEvents?: number;
    actionRightsToAmendments?: number;
    actionRightsToBlogs?: number;
    eventParticipantsToEvents?: number;
    eventParticipantsToUsers?: number;
    eventParticipantsToRoles?: number;
    blogBloggersToBlogs?: number;
    blogBloggersToUsers?: number;
    blogBloggersToRoles?: number;

    // Amendment Targets
    amendmentTargetsAgendaItemsToEvents?: number;
    amendmentTargetsAgendaItemsToCreators?: number;
    amendmentTargetsAgendaItemsToAmendments?: number;
    amendmentTargetsAmendmentVotesToAgendaItems?: number;
    amendmentTargetsAmendmentVotesToCreators?: number;
    amendmentTargetsAmendmentVoteEntriesToAmendmentVotes?: number;
    amendmentTargetsAmendmentVoteEntriesToVoters?: number;
    amendmentPathsToAmendments?: number;

    // Blog Comments
    commentsToBlogs?: number;
    commentsToCreators?: number;
    commentsToParentComments?: number;
    commentVotesToComments?: number;
    commentVotesToUsers?: number;

    // Agenda and Voting
    agendaItemsToCreators?: number;
    agendaItemsToEvents?: number;
    agendaItemsToAmendments?: number;
    electionsToAgendaItems?: number;
    electionsToPositions?: number;
    electionCandidatesToElections?: number;
    electionCandidatesToUsers?: number;
    electionVotesToElections?: number;
    electionVotesToVoters?: number;
    electionVotesToCandidates?: number;
    agendaAmendmentVotesToAgendaItems?: number;
    changeRequestsToAmendmentVotes?: number;
    changeRequestsToCreators?: number;
    changeRequestVotesToChangeRequests?: number;
    changeRequestVotesToVoters?: number;
    agendaAmendmentVoteEntriesToAmendmentVotes?: number;
    agendaAmendmentVoteEntriesToVoters?: number;
  };
}

/**
 * Interface for entity seeders
 */
export interface EntitySeeder {
  /**
   * Name of the entity being seeded
   */
  name: string;

  /**
   * List of entity names this seeder depends on
   */
  dependencies: string[];

  /**
   * Seed function that creates entities and returns updated context
   */
  seed(context: SeedContext): Promise<SeedContext>;
}

/**
 * Configuration for selective seeding
 */
export interface SeedOptions {
  /**
   * Only run these seeders (and their dependencies)
   */
  only?: string[];

  /**
   * Skip these seeders
   */
  skip?: string[];

  /**
   * Run all seeders (default)
   */
  all?: boolean;
}
