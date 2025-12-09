import { init, tx } from '@instantdb/admin';
import { EntitySeeder, SeedContext, SeedOptions } from './types/seeder.types';

/**
 * Seed orchestrator that manages dependency resolution and selective execution
 */
export class SeedOrchestrator {
  private seeders = new Map<string, EntitySeeder>();
  private db: any;

  constructor(appId: string, adminToken: string) {
    this.db = init({
      appId,
      adminToken,
    });
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
      tx,
      userIds: [],
      groupIds: [],
      eventIds: [],
      amendmentIds: [],
      blogIds: [],
      positionIds: [],
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
      { label: 'Amendments', count: context.amendmentIds?.length || 0 },
      { label: 'Blogs', count: context.blogIds?.length || 0 },
      { label: 'Positions', count: context.positionIds?.length || 0 },
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
