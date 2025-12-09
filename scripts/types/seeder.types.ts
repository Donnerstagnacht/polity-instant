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
  actionRightIds?: string[];
  bloggerIds?: string[];
  meetingSlotIds?: string[];
  bookingIds?: string[];
  stripeCustomerIds?: string[];
  stripeSubscriptionIds?: string[];
  stripePaymentIds?: string[];
  timelineEventIds?: string[];
  amendmentPathIds?: string[];
  amendmentVoteIds?: string[];
  groupRelationshipIds?: string[];
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
