/**
 * Utility functions to seed sample user data into Instant DB
 * Use these functions to populate the database with test data
 */

import { db, tx, id } from '../../../../db';

/**
 * Create a sample user with all related data
 * @param userId - The ID of the $users record (from auth)
 * @param userData - The user data
 */
export async function seedUser(
  userId: string,
  userData: {
    name: string;
    subtitle: string;
    avatar?: string;
    about?: string;
    handle?: string;
    contactEmail?: string;
    contactTwitter?: string;
    contactWebsite?: string;
    contactLocation?: string;
    whatsapp?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    snapchat?: string;
  }
) {
  // Update user with user data
  await db.transact([
    tx.$users[userId].update({
      ...userData,
      updatedAt: new Date(),
    }),
  ]);

  return userId;
}

/**
 * Add stats to a user
 */
export async function seedUserStats(
  userId: string,
  stats: {
    label: string;
    value: number;
    unit?: string;
  }[]
) {
  const transactions = stats.map(stat =>
    tx.stats[id()].update({
      ...stat,
      user: userId,
    })
  );

  await db.transact(transactions);
}

/**
 * Add statements to a user
 */
export async function seedUserStatements(
  userId: string,
  statements: {
    text: string;
    tag: string;
  }[]
) {
  const transactions = statements.map(statement =>
    tx.statements[id()].update({
      ...statement,
      user: userId,
    })
  );

  await db.transact(transactions);
}

/**
 * Add blogs to a user
 */
export async function seedUserBlogs(
  userId: string,
  blogs: {
    title: string;
    date: string;
    likes: number;
    comments: number;
  }[]
) {
  const transactions = blogs.map(blog =>
    tx.blogs[id()].update({
      ...blog,
      user: userId,
    })
  );

  await db.transact(transactions);
}

/**
 * Add amendments to a user
 */
export async function seedUserAmendments(
  userId: string,
  amendments: {
    title: string;
    subtitle?: string;
    status: string;
    supporters: number;
    date: string;
    code?: string;
    tags?: any;
  }[]
) {
  const transactions = amendments.map(amendment =>
    tx.amendments[id()].update({
      ...amendment,
      user: userId,
    })
  );

  await db.transact(transactions);
}

/**
 * Complete seed function - creates a full user  with all data
 */
export async function seedCompleteUser(userId: string) {
  await seedUser(userId, {
    name: 'Sarah Johnson',
    subtitle: 'Constitutional Law Expert',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    about:
      'Political scientist specializing in comparative constitutional design. Worked on constitutional reforms in 7 countries across Europe and Africa. Passionate about democratic innovations and citizen participation.',
    handle: 'sarahjconst',
    contactEmail: 'sarah.johnson@politics.org',
    contactTwitter: '@sarahjconst',
    contactWebsite: 'sarahjohnson.policy.org',
    contactLocation: 'Brussels, Belgium',
    whatsapp: 'https://wa.me/123456789',
    instagram: 'https://instagram.com/sarahjohnson',
    twitter: 'https://x.com/sarahjconst',
    facebook: 'https://facebook.com/sarahjohnson',
    snapchat: 'https://snapchat.com/add/sarahjlaw',
  });

  // Add stats
  await seedUserStats(userId, [
    { label: 'Amendments', value: 143 },
    { label: 'Followers', value: 2500 },
    { label: 'Following', value: 328 },
    { label: 'Network', value: 78 },
    { label: 'Reputation', value: 4.8 },
  ]);

  // Add statements
  await seedUserStatements(userId, [
    {
      text: "Constitutional courts should be more representative of society's diversity.",
      tag: 'Judiciary',
    },
    {
      text: 'Digital democracy tools can increase citizen participation in policymaking.',
      tag: 'Participation',
    },
    {
      text: 'Federalism offers the best balance between unity and autonomy.',
      tag: 'Structure',
    },
    {
      text: 'Term limits are essential for preventing power concentration.',
      tag: 'Governance',
    },
  ]);

  // Add blogs
  await seedUserBlogs(userId, [
    {
      title: 'Reimagining Parliamentary Oversight',
      date: 'Mar 15, 2023',
      likes: 324,
      comments: 47,
    },
    {
      title: "The Case for Citizens' Assemblies",
      date: 'Feb 2, 2023',
      likes: 521,
      comments: 83,
    },
    {
      title: 'Digital Constitutionalism',
      date: 'Jan 10, 2023',
      likes: 187,
      comments: 32,
    },
  ]);

  // Add amendments
  await seedUserAmendments(userId, [
    {
      code: 'CON-27',
      title: 'Article 27 Reform Proposal',
      subtitle: 'Increasing judicial diversity through appointment reform',
      status: 'Under Review',
      supporters: 1243,
      date: 'Apr 5, 2023',
      tags: ['judicial', 'diversity', 'reform', 'appointments'],
    },
    {
      code: 'ELC-14',
      title: 'Electoral System Amendment',
      subtitle: 'Moving from first-past-the-post to proportional representation',
      status: 'Passed',
      supporters: 2789,
      date: 'Dec 15, 2022',
      tags: ['electoral', 'voting', 'democracy', 'representation'],
    },
  ]);
}
