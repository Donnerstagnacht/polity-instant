import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EntitySeeder, SeedContext, SeedOptions } from './types/seeder.types';

/**
 * Seed orchestrator that manages dependency resolution and selective execution
 */
export class SeedOrchestrator {
  private seeders = new Map<string, EntitySeeder>();
  private db: SupabaseClient;

  constructor(supabaseUrl: string, serviceRoleKey: string) {
    this.db = createClient(supabaseUrl, serviceRoleKey);
  }

  /**
   * Register a seeder
   */
  register(seeder: EntitySeeder): void {
    this.seeders.set(seeder.name, seeder);
  }

  /**
   * Register multiple seeders
   */
  registerAll(seeders: EntitySeeder[]): void {
    seeders.forEach(seeder => this.register(seeder));
  }

  /**
   * Topological sort of seeders based on dependencies
   */
  private topologicalSort(seedersToRun: Set<string>): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving: ${name}`);
      }

      visiting.add(name);

      const seeder = this.seeders.get(name);
      if (!seeder) {
        throw new Error(`Seeder not found: ${name}`);
      }

      // Visit dependencies first
      for (const dep of seeder.dependencies) {
        if (!seedersToRun.has(dep)) {
          // Auto-include dependencies
          seedersToRun.add(dep);
          console.log(`  ℹ️  Auto-including dependency: ${dep} (required by ${name})`);
        }
        visit(dep);
      }

      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
    };

    // Visit all requested seeders
    for (const name of seedersToRun) {
      visit(name);
    }

    return sorted;
  }

  /**
   * Determine which seeders to run based on options
   */
  private determineSeedersToRun(options: SeedOptions = {}): Set<string> {
    const allSeeders = Array.from(this.seeders.keys());

    if (options.only && options.only.length > 0) {
      // Only run specified seeders (and their dependencies)
      const seedersToRun = new Set<string>();
      for (const name of options.only) {
        if (!this.seeders.has(name)) {
          throw new Error(`Unknown seeder: ${name}`);
        }
        seedersToRun.add(name);
      }
      return seedersToRun;
    }

    if (options.skip && options.skip.length > 0) {
      // Run all seeders except skipped ones
      const seedersToRun = new Set(allSeeders);
      for (const name of options.skip) {
        if (!this.seeders.has(name)) {
          console.warn(`  ⚠️  Unknown seeder to skip: ${name}`);
        }
        seedersToRun.delete(name);
      }
      return seedersToRun;
    }

    // Default: run all seeders
    return new Set(allSeeders);
  }

  /**
   * Run seeders based on options
   */
  async run(options: SeedOptions = {}): Promise<void> {
    console.log('\n🌱 Starting seed process...\n');

    // Determine which seeders to run
    const seedersToRun = this.determineSeedersToRun(options);

    if (seedersToRun.size === 0) {
      console.log('No seeders to run.');
      return;
    }

    // Sort seeders by dependencies
    const sortedSeederNames = this.topologicalSort(seedersToRun);

    console.log(`\n📋 Execution plan (${sortedSeederNames.length} seeders):`);
    sortedSeederNames.forEach((name, index) => {
      const seeder = this.seeders.get(name);
      if (!seeder) return;
      const deps =
        seeder.dependencies.length > 0 ? ` (depends on: ${seeder.dependencies.join(', ')})` : '';
      console.log(`  ${index + 1}. ${name}${deps}`);
    });
    console.log('');

    // Initialize context
    let context: SeedContext = {
      db: this.db,
      userIds: [],
      groupIds: [],
      eventIds: [],
      amendmentIds: [],
      blogIds: [],
      positionIds: [],
      eventPositionIds: [],
      statementIds: [],
      agendaItemIds: [],
      electionCandidateIds: [],
      changeRequestIds: [],
      commentIds: [],
      commentVoteIds: [],
      voteIds: [],
      notificationIds: [],
      messageIds: [],
      conversationIds: [],
      participantIds: [],
      paymentIds: [],
      hashtagIds: [],
      documentIds: [],
      todoIds: [],
      reactionIds: [],
      linkCounts: {},
    };

    // Execute seeders in order
    const startTime = Date.now();
    for (const name of sortedSeederNames) {
      const seeder = this.seeders.get(name);
      if (!seeder) continue;
      try {
        context = await seeder.seed(context);
      } catch (error) {
        console.error(`\n❌ Error in seeder "${name}":`, error);
        throw error;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ Seed process completed successfully!');
    console.log(`   Duration: ${duration}s`);
    this.printSummary(context);
  }

  /**
   * Print summary of seeded entities
   */
  private printSummary(context: SeedContext): void {
    console.log('\n📊 Summary:');
    const stats = [
      { label: 'Users', count: context.userIds?.length || 0 },
      { label: 'Groups', count: context.groupIds?.length || 0 },
      { label: 'Events', count: context.eventIds?.length || 0 },
      { label: 'Amendments (all with targets & paths)', count: context.amendmentIds?.length || 0 },
      { label: 'Blogs', count: context.blogIds?.length || 0 },
      { label: 'Positions', count: context.positionIds?.length || 0 },
      { label: 'Event Positions', count: context.eventPositionIds?.length || 0 },
      { label: 'Statements', count: context.statementIds?.length || 0 },
      { label: 'Agenda Items', count: context.agendaItemIds?.length || 0 },
      { label: 'Elections', count: context.electionCandidateIds?.length || 0 },
      { label: 'Change Requests', count: context.changeRequestIds?.length || 0 },
      { label: 'Comments', count: context.commentIds?.length || 0 },
      { label: 'Comment Votes', count: context.commentVoteIds?.length || 0 },
      { label: 'Votes', count: context.voteIds?.length || 0 },
      { label: 'Notifications', count: context.notificationIds?.length || 0 },
      { label: 'Messages', count: context.messageIds?.length || 0 },
      { label: 'Conversations', count: context.conversationIds?.length || 0 },
      { label: 'Participants', count: context.participantIds?.length || 0 },
      { label: 'Payments', count: context.paymentIds?.length || 0 },
      { label: 'Hashtags', count: context.hashtagIds?.length || 0 },
      { label: 'Documents', count: context.documentIds?.length || 0 },
      { label: 'Todos', count: context.todoIds?.length || 0 },
      { label: 'Links', count: context.linkIds?.length || 0 },
      { label: 'Follows', count: context.followIds?.length || 0 },
      { label: 'Subscriptions', count: context.subscriptionIds?.length || 0 },
      { label: 'Invitations', count: context.invitationIds?.length || 0 },
      { label: 'Requests', count: context.requestIds?.length || 0 },
      { label: 'Roles', count: context.roleIds?.length || 0 },
      { label: 'Action Rights', count: context.actionRightIds?.length || 0 },
      { label: 'Bloggers', count: context.bloggerIds?.length || 0 },
      { label: 'Meeting Slots', count: context.meetingSlotIds?.length || 0 },
      { label: 'Bookings', count: context.bookingIds?.length || 0 },
      { label: 'Stripe Customers', count: context.stripeCustomerIds?.length || 0 },
      { label: 'Stripe Subscriptions', count: context.stripeSubscriptionIds?.length || 0 },
      { label: 'Stripe Payments', count: context.stripePaymentIds?.length || 0 },
      { label: 'Timeline Events', count: context.timelineEventIds?.length || 0 },
      { label: 'Reactions', count: context.reactionIds?.length || 0 },
      { label: 'Amendment Paths', count: context.amendmentPathIds?.length || 0 },
      { label: 'Amendment Votes', count: context.amendmentVoteIds?.length || 0 },
      { label: 'Group Relationships', count: context.groupRelationshipIds?.length || 0 },
    ];

    stats.forEach(({ label, count }) => {
      if (count > 0) {
        console.log(`   ${label}: ${count}`);
      }
    });

    const total = stats.reduce((sum, { count }) => sum + count, 0);
    console.log(`   Total: ${total} entities`);

    // Print link statistics
    if (context.linkCounts) {
      console.log('\n🔗 Link Statistics:');
      const linkStats = [
        // Amendments
        { label: 'Amendments → Users', count: context.linkCounts.amendmentsToUsers },
        { label: 'Amendments → Groups', count: context.linkCounts.amendmentsToGroups },
        // Blogs
        { label: 'Blogs → Users', count: context.linkCounts.blogsToUsers },
        { label: 'Blogs → Groups', count: context.linkCounts.blogsToGroups },
        // Events
        { label: 'Events → Organizers', count: context.linkCounts.eventsToOrganizers },
        { label: 'Events → Groups', count: context.linkCounts.eventsToGroups },
        { label: 'Participants → Events', count: context.linkCounts.participantsToEvents },
        { label: 'Participants → Users', count: context.linkCounts.participantsToUsers },
        // Follows
        { label: 'Follows → Followers', count: context.linkCounts.followsToFollowers },
        { label: 'Follows → Followees', count: context.linkCounts.followsToFollowees },
        // Groups
        { label: 'Groups → Owners', count: context.linkCounts.groupsToOwners },
        { label: 'Group Memberships → Users', count: context.linkCounts.groupMembershipsToUsers },
        { label: 'Group Memberships → Groups', count: context.linkCounts.groupMembershipsToGroups },
        { label: 'Group Memberships → Roles', count: context.linkCounts.groupMembershipsToRoles },
        { label: 'Roles → Groups', count: context.linkCounts.rolesToGroups },
        { label: 'Action Rights → Roles', count: context.linkCounts.actionRightsToRoles },
        { label: 'Action Rights → Groups', count: context.linkCounts.actionRightsToGroups },
        { label: 'Conversations → Groups', count: context.linkCounts.conversationsToGroups },
        {
          label: 'Conversations → RequestedBy',
          count: context.linkCounts.conversationsToRequestedBy,
        },
        {
          label: 'Conversation Participants → Conversations',
          count: context.linkCounts.conversationParticipantsToConversations,
        },
        {
          label: 'Conversation Participants → Users',
          count: context.linkCounts.conversationParticipantsToUsers,
        },
        { label: 'Messages → Conversations', count: context.linkCounts.messagesToConversations },
        { label: 'Messages → Senders', count: context.linkCounts.messagesToSenders },
        // Invitations
        { label: 'Group Invitations → Users', count: context.linkCounts.groupInvitationsToUsers },
        { label: 'Group Invitations → Groups', count: context.linkCounts.groupInvitationsToGroups },
        { label: 'Group Requests → Users', count: context.linkCounts.groupRequestsToUsers },
        { label: 'Group Requests → Groups', count: context.linkCounts.groupRequestsToGroups },
        { label: 'Event Invitations → Users', count: context.linkCounts.eventInvitationsToUsers },
        { label: 'Event Invitations → Events', count: context.linkCounts.eventInvitationsToEvents },
        { label: 'Event Requests → Users', count: context.linkCounts.eventRequestsToUsers },
        { label: 'Event Requests → Events', count: context.linkCounts.eventRequestsToEvents },
        { label: 'Event Admins → Users', count: context.linkCounts.eventAdminsToUsers },
        { label: 'Event Admins → Events', count: context.linkCounts.eventAdminsToEvents },
        {
          label: 'Amendment Invitations → Users',
          count: context.linkCounts.amendmentInvitationsToUsers,
        },
        {
          label: 'Amendment Invitations → Amendments',
          count: context.linkCounts.amendmentInvitationsToAmendments,
        },
        { label: 'Amendment Requests → Users', count: context.linkCounts.amendmentRequestsToUsers },
        {
          label: 'Amendment Requests → Amendments',
          count: context.linkCounts.amendmentRequestsToAmendments,
        },
        { label: 'Amendment Admins → Users', count: context.linkCounts.amendmentAdminsToUsers },
        {
          label: 'Amendment Admins → Amendments',
          count: context.linkCounts.amendmentAdminsToAmendments,
        },
        // Positions
        { label: 'Positions → Groups', count: context.linkCounts.positionsToGroups },
        { label: 'Positions → Holders', count: context.linkCounts.positionsToHolders },
        { label: 'Event Positions → Events', count: context.linkCounts.eventPositionsToEvents },
        { label: 'Event Position Holders', count: context.linkCounts.eventPositionHoldersCount },
        // Stripe
        { label: 'Stripe Customers → Users', count: context.linkCounts.stripeCustomersToUsers },
        {
          label: 'Stripe Subscriptions → Customers',
          count: context.linkCounts.stripeSubscriptionsToCustomers,
        },
        {
          label: 'Stripe Payments → Subscriptions',
          count: context.linkCounts.stripePaymentsToSubscriptions,
        },
        // Direct Conversations
        {
          label: 'Direct Conversations → RequestedBy',
          count: context.linkCounts.directConversationsToRequestedBy,
        },
        {
          label: 'Direct Participants → Conversations',
          count: context.linkCounts.directParticipantsToConversations,
        },
        {
          label: 'Direct Participants → Users',
          count: context.linkCounts.directParticipantsToUsers,
        },
        {
          label: 'Direct Messages → Conversations',
          count: context.linkCounts.directMessagesToConversations,
        },
        { label: 'Direct Messages → Senders', count: context.linkCounts.directMessagesToSenders },

        // Group Relationships
        {
          label: 'Group Relationships → Parent Groups',
          count: context.linkCounts.groupRelationshipsToParentGroups,
        },
        {
          label: 'Group Relationships → Child Groups',
          count: context.linkCounts.groupRelationshipsToChildGroups,
        },

        // Payments
        { label: 'Payments → Payer Groups', count: context.linkCounts.paymentsToPayerGroups },
        {
          label: 'Payments → Receiver Groups',
          count: context.linkCounts.paymentsToReceiverGroups,
        },
        { label: 'Payments → Payer Users', count: context.linkCounts.paymentsToPayerUsers },
        { label: 'Payments → Receiver Users', count: context.linkCounts.paymentsToReceiverUsers },

        // Todos
        { label: 'Todos → Creators', count: context.linkCounts.todosToCreators },
        { label: 'Todos → Groups', count: context.linkCounts.todosToGroups },

        // Documents
        { label: 'Documents → Owners', count: context.linkCounts.documentsToOwners },

        // Links
        { label: 'Links → Groups', count: context.linkCounts.linksToGroups },

        // Notifications
        {
          label: 'Notifications → Recipients',
          count: context.linkCounts.notificationsToRecipients,
        },
        { label: 'Notifications → Senders', count: context.linkCounts.notificationsToSenders },
        {
          label: 'Notifications → Related Groups',
          count: context.linkCounts.notificationsToRelatedGroups,
        },
        {
          label: 'Notifications → Related Events',
          count: context.linkCounts.notificationsToRelatedEvents,
        },
        {
          label: 'Notifications → Related Amendments',
          count: context.linkCounts.notificationsToRelatedAmendments,
        },
        {
          label: 'Notifications → Related Users',
          count: context.linkCounts.notificationsToRelatedUsers,
        },

        // Subscriptions
        {
          label: 'Subscriptions → Subscribers',
          count: context.linkCounts.subscriptionsToSubscribers,
        },
        {
          label: 'Subscriptions → Subscribed Users',
          count: context.linkCounts.subscriptionsToSubscribedUsers,
        },
        {
          label: 'Subscriptions → Subscribed Groups',
          count: context.linkCounts.subscriptionsToSubscribedGroups,
        },
        {
          label: 'Subscriptions → Subscribed Events',
          count: context.linkCounts.subscriptionsToSubscribedEvents,
        },
        {
          label: 'Subscriptions → Subscribed Amendments',
          count: context.linkCounts.subscriptionsToSubscribedAmendments,
        },

        // Meeting Slots
        { label: 'Meeting Slots → Owners', count: context.linkCounts.meetingSlotsToOwners },
        { label: 'Meeting Bookings → Slots', count: context.linkCounts.meetingBookingsToSlots },
        { label: 'Meeting Bookings → Bookers', count: context.linkCounts.meetingBookingsToBookers },

        // Users
        { label: 'Stats → Users', count: context.linkCounts.statsToUsers },
        { label: 'Statements → Users', count: context.linkCounts.statementsToUsers },
        { label: 'Hashtags → Users', count: context.linkCounts.hashtagsToUsers },

        // Timeline Events
        { label: 'Timeline Events → Actors', count: context.linkCounts.timelineEventsToActors },
        {
          label: 'Timeline Events → Amendments',
          count: context.linkCounts.timelineEventsToAmendments,
        },
        { label: 'Timeline Events → Events', count: context.linkCounts.timelineEventsToEvents },
        { label: 'Timeline Events → Blogs', count: context.linkCounts.timelineEventsToBlogs },
        { label: 'Timeline Events → Groups', count: context.linkCounts.timelineEventsToGroups },
        { label: 'Timeline Events → Users', count: context.linkCounts.timelineEventsToUsers },

        // Reactions
        { label: 'Reactions → Users', count: context.linkCounts.reactionsToUsers },
        {
          label: 'Reactions → Timeline Events',
          count: context.linkCounts.reactionsToTimelineEvents,
        },

        // Tobias Subscriptions
        { label: 'Tobias Subscribers → Users', count: context.linkCounts.tobiasSubscribersToUsers },
        {
          label: 'Tobias Subscribers → Groups',
          count: context.linkCounts.tobiasSubscribersToGroups,
        },
        {
          label: 'Tobias Subscribers → Amendments',
          count: context.linkCounts.tobiasSubscribersToAmendments,
        },
        {
          label: 'Tobias Subscribers → Events',
          count: context.linkCounts.tobiasSubscribersToEvents,
        },
        { label: 'Tobias Subscribers → Blogs', count: context.linkCounts.tobiasSubscribersToBlogs },

        // Blog Comments
        { label: 'Comments → Blogs', count: context.linkCounts.commentsToBlogs },
        { label: 'Comments → Creators', count: context.linkCounts.commentsToCreators },
        { label: 'Comments → Parent Comments', count: context.linkCounts.commentsToParentComments },
        { label: 'Comment Votes → Comments', count: context.linkCounts.commentVotesToComments },
        { label: 'Comment Votes → Users', count: context.linkCounts.commentVotesToUsers },

        // RBAC
        { label: 'Roles → Events', count: context.linkCounts.rolesToEvents },
        { label: 'Roles → Amendments', count: context.linkCounts.rolesToAmendments },
        { label: 'Roles → Blogs', count: context.linkCounts.rolesToBlogs },
        { label: 'Action Rights → Events', count: context.linkCounts.actionRightsToEvents },
        { label: 'Action Rights → Amendments', count: context.linkCounts.actionRightsToAmendments },
        { label: 'Action Rights → Blogs', count: context.linkCounts.actionRightsToBlogs },
        {
          label: 'Event Participants → Events',
          count: context.linkCounts.eventParticipantsToEvents,
        },
        { label: 'Event Participants → Users', count: context.linkCounts.eventParticipantsToUsers },
        { label: 'Event Participants → Roles', count: context.linkCounts.eventParticipantsToRoles },
        { label: 'Blog Bloggers → Blogs', count: context.linkCounts.blogBloggersToBlogs },
        { label: 'Blog Bloggers → Users', count: context.linkCounts.blogBloggersToUsers },
        { label: 'Blog Bloggers → Roles', count: context.linkCounts.blogBloggersToRoles },

        // Amendment Targets
        {
          label: 'Amendment Targets Agenda Items → Events',
          count: context.linkCounts.amendmentTargetsAgendaItemsToEvents,
        },
        {
          label: 'Amendment Targets Agenda Items → Creators',
          count: context.linkCounts.amendmentTargetsAgendaItemsToCreators,
        },
        {
          label: 'Amendment Targets Agenda Items → Amendments',
          count: context.linkCounts.amendmentTargetsAgendaItemsToAmendments,
        },
        {
          label: 'Amendment Targets Amendment Votes → Agenda Items',
          count: context.linkCounts.amendmentTargetsAmendmentVotesToAgendaItems,
        },
        {
          label: 'Amendment Targets Amendment Votes → Creators',
          count: context.linkCounts.amendmentTargetsAmendmentVotesToCreators,
        },
        {
          label: 'Amendment Targets Amendment Vote Entries → Amendment Votes',
          count: context.linkCounts.amendmentTargetsAmendmentVoteEntriesToAmendmentVotes,
        },
        {
          label: 'Amendment Targets Amendment Vote Entries → Voters',
          count: context.linkCounts.amendmentTargetsAmendmentVoteEntriesToVoters,
        },
        {
          label: 'Amendment Paths → Amendments',
          count: context.linkCounts.amendmentPathsToAmendments,
        },

        // Agenda and Voting
        { label: 'Agenda Items → Creators', count: context.linkCounts.agendaItemsToCreators },
        { label: 'Agenda Items → Events', count: context.linkCounts.agendaItemsToEvents },
        { label: 'Agenda Items → Amendments', count: context.linkCounts.agendaItemsToAmendments },
        { label: 'Elections → Agenda Items', count: context.linkCounts.electionsToAgendaItems },
        { label: 'Elections → Positions', count: context.linkCounts.electionsToPositions },
        {
          label: 'Election Candidates → Elections',
          count: context.linkCounts.electionCandidatesToElections,
        },
        {
          label: 'Election Candidates → Users',
          count: context.linkCounts.electionCandidatesToUsers,
        },
        { label: 'Election Votes → Elections', count: context.linkCounts.electionVotesToElections },
        { label: 'Election Votes → Voters', count: context.linkCounts.electionVotesToVoters },
        {
          label: 'Election Votes → Candidates',
          count: context.linkCounts.electionVotesToCandidates,
        },
        {
          label: 'Agenda Amendment Votes → Agenda Items',
          count: context.linkCounts.agendaAmendmentVotesToAgendaItems,
        },
        {
          label: 'Change Requests → Amendment Votes',
          count: context.linkCounts.changeRequestsToAmendmentVotes,
        },
        { label: 'Change Requests → Creators', count: context.linkCounts.changeRequestsToCreators },
        {
          label: 'Change Request Votes → Change Requests',
          count: context.linkCounts.changeRequestVotesToChangeRequests,
        },
        {
          label: 'Change Request Votes → Voters',
          count: context.linkCounts.changeRequestVotesToVoters,
        },
        {
          label: 'Agenda Amendment Vote Entries → Amendment Votes',
          count: context.linkCounts.agendaAmendmentVoteEntriesToAmendmentVotes,
        },
        {
          label: 'Agenda Amendment Vote Entries → Voters',
          count: context.linkCounts.agendaAmendmentVoteEntriesToVoters,
        },
      ];

      linkStats.forEach(({ label, count }) => {
        if (count && count > 0) {
          console.log(`   ${label}: ${count}`);
        }
      });

      const totalLinks = linkStats.reduce((sum, { count }) => sum + (count || 0), 0);
      console.log(`   Total Links: ${totalLinks}`);
    }
  }

  /**
   * List all registered seeders
   */
  listSeeders(): void {
    console.log('\n📦 Available seeders:\n');
    const seeders = Array.from(this.seeders.values());
    seeders.forEach(seeder => {
      const deps =
        seeder.dependencies.length > 0
          ? ` (depends on: ${seeder.dependencies.join(', ')})`
          : ' (no dependencies)';
      console.log(`  • ${seeder.name}${deps}`);
    });
    console.log('');
  }
}
